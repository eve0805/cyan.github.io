---
id: kerberos-ticket-trace-subscriber-logger
title: KerberosTicketTrace 第一阶段：subscriber 和 logger 已经实现了什么
slug: /kerberos-ticket-trace-subscriber-logger
date: 2026-03-24
tags:
  - metasploit
  - kerberos
  - ruby
  - observability
---

# KerberosTicketTrace第一阶段实现

这篇文章只讨论 `KerberosTicketTrace` 的第一阶段实现：底层观测接口和可读输出。这是一次阶段性复盘，重点回答三个问题：`lib/rex/proto/kerberos/kerberos_subscriber.rb` 和 `lib/rex/proto/kerberos/kerberos_logger_subscriber.rb` 目前到底解决了什么问题，它们是怎么接进现有 Kerberos 链路的，以及它们距离提案里那套完整的 Kerberos 可观测性目标还有多远。

## 为什么第一步先做 subscriber 和 logger

如果一开始就直接在各个 Kerberos 模块里手写日志，短期内确实能很快看到输出，但长期会很难维护。不同模块会各自打印不同风格的信息，低层 KDC 往返和高层服务认证之间也很难共用一套事件模型，更不用说后续还要接入离线检查、票据转换和 forge path。这个阶段先做 subscriber 和 logger，搭一层“观测骨架”：谁负责发事件，谁负责消费事件，先把边界划清楚，后面才有空间继续往里填更多语义。

## `kerberos_subscriber.rb` 做了什么

`lib/rex/proto/kerberos/kerberos_subscriber.rb` 的职责很小，但很关键。它定义了三个最小观察接口：`on_request`、`on_response`、`on_credential`。从功能上看，这三类事件正好对应了当前 Kerberos 观测链路里最稳定、最通用的三个切点。

- `on_request` 用来接住发出去的 Kerberos 请求对象。
- `on_response` 用来接住收到的响应对象，包括 KDC 响应、`AP-REP` 和 `KRB-ERROR` 这一类返回值。
- `on_credential` 用来接住已经提取出来、可被展示或存储的凭据对象，例如 TGT、TGS、Delegation TGS 对应的 ccache credential。

这层接口解决“先把什么叫一个可观测事件抽象出来”，它把 Kerberos trace 从“零散日志”变成了“事件接口”。

## `kerberos_logger_subscriber.rb` 已经实现了哪些方面

真正把事件变成可见输出的是 `lib/rex/proto/kerberos/kerberos_logger_subscriber.rb`。它继承前面的 subscriber 接口，把请求、响应和凭据事件打印到模块 logger 上，并尽量保证输出对操作者是可读的。当前实现可以归纳为几个核心方面。

### 1.控制开关与配置集成

trace 的启用方式和外观风格已经接到了 datastore 上。`KerberosTicketTrace` 和 `KerberosTicketTraceColors` 两个选项控制是否输出以及是否带颜色，只有在显式开启时才打印，默认行为保持不变；颜色配置的交互方式复用了已有 `HttpTrace` 的思路。

### 2.消息类型识别与输出美化

logger 能够识别常见的 Kerberos 消息类型，并在输出中显式标记。当前映射覆盖了 `AS-REQ`、`AS-REP`、`TGS-REQ`、`TGS-REP`、`AP-REQ`、`AP-REP` 和 `KRB-ERROR`。在输出格式上，它借助 `lib/rex/proto/kerberos/kerberos_readable_text_presenter.rb` 把结构化数据转换成更适合终端阅读的文本，如 `Message Type: 30 (KRB-ERROR)` 和`Description: Additional pre-authentication required`预认证消息。

![image-20260324171905684](https://gitee.com/mimcyan/figure/raw/master/typora/image-20260324171905684.png)

### 3.数据结构的安全序列化

Kerberos 协议对象包含嵌套结构、数组、集合、哈希以及位标志等复杂类型。logger 对 Kerberos model 做了递归序列化，嵌套对象会继续展开，数组和集合保留结构，`KerberosFlags` 这样的位标志会展开成更可读的形式。时间字段会被转成 ISO8601 格式，错误码对象会被标准化成名称、数值和描述的组合。

对于原始二进制内容，它采取了更温和的展示方式。如果字段是不可打印的二进制数据（例如票据密文、校验和等），它会转成带长度说明的十六进制标记。这对 Kerberos 尤其重要，因为票据、加密字段和部分 token 经常不是纯文本，直接打印会破坏终端显示。

### 4.凭据产物的专门处理

凭据事件已经接入了 `Krb5CcachePresenter`。当代码路径里真正提取出了 TGT、TGS 或 Delegation TGS 对应的 credential 时，logger 能给出相对完整的 ccache 风格摘要。（蒜皮宝宝太可爱了，很难忍住不把它放上来）

![image-20260324172233985](https://gitee.com/mimcyan/figure/raw/master/typora/image-20260324172233985.png)

### 5.异常处理与稳定性

logger 实现了渲染失败时的兜底路径。如果可读文本 presenter 或其他格式化逻辑抛出异常，logger 会返回一条错误占位文本，而不是直接中断模块执行流程。对一个观测功能来说，trace 不应该反过来成为认证流程新的不稳定因素。

## 它们是怎么接进链路的

这套实现已经不只是两个独立文件，而是开始进入 Metasploit 现有 Kerberos 工作流。

首先，在 `lib/msf/core/exploit/remote/kerberos/client.rb` 里，Kerberos 相关 mixin 已经注册了 `KerberosTicketTrace` 和 `KerberosTicketTraceColors` 两个高级选项，并提供了 `kerberos_trace_subscriber` 构造逻辑。这样一来，使用 Kerberos client helper 的模块在不额外改很多代码的情况下，就能拿到一个默认的 logger subscriber。

其次，在 `lib/rex/proto/kerberos/client.rb` 里，低层客户端已经把 subscriber 正式挂进请求和响应往返路径：发送请求时会触发 `on_request`，接收响应时会触发 `on_response`。这部分覆盖的是最基础的 KDC 通信路径，也就是 `AS-REQ/AS-REP` 和 `TGS-REQ/TGS-REP` 这一层。

再次，服务认证路径也开始接入这套机制。在 `lib/msf/core/exploit/remote/kerberos/service_authenticator/base.rb` 里，构造服务端 `AP-REQ` 后会主动调用 `on_request`；在收到 `KRB-ERROR` 时会调用 `on_response`；在提取并生成 TGT、TGS、Delegation TGS 凭据时，会调用 `on_credential`。这说明当前的 trace 开始往服务认证和票据产物层延伸。

可以把当前调用链概括成下面这样：

```text
module / mixin
  -> kerberos_trace_subscriber
  -> Rex::Proto::Kerberos::Client#send_request
  -> subscriber.on_request
  -> Rex::Proto::Kerberos::Client#recv_response
  -> subscriber.on_response
  -> ServiceAuthenticator::Base
     -> subscriber.on_request(AP-REQ)
     -> subscriber.on_response(KRB-ERROR)
     -> subscriber.on_credential(TGT/TGS/Delegation TGS)
```

这里也正好能看出边界在哪里。服务认证侧虽然已经主动 trace 了 `AP-REQ` 和凭据事件，但 `AP-REP` 目前还没有像 `KRB-ERROR` 一样稳定地送进 subscriber，因此它更适合被描述为“部分接入”。

## 当前完成度和提案的对应关系

如果把提案里 `KerberosTicketTrace` 的目标拆开来看，当前实现已经完成了最底层的一层骨架。

已经完成的部分包括：trace 接口抽象、KDC 请求/响应 hook、基础日志输出、以及 trace 选项的暴露。更具体一点说，现在已经可以在不改变默认行为的前提下，打开一个面向 Kerberos 的控制台 trace，并且这份输出经过了消息类型识别、结构化展开、枚举标签补充和二进制安全显示处理。

部分完成的部分包括：服务认证阶段的 AP 交换观测、凭据产物输出，以及配套单元测试补强。这里之所以是“部分完成”，是因为服务认证侧虽然已经能看到 `AP-REQ`、`KRB-ERROR` 和几类 credential，但还没有把 `AP-REP`、更细的 GSS/SPNEGO 上下文以及更多语义事件全部纳入统一 trace。测试方面，`spec/lib/rex/proto/kerberos/kerberos_logger_subscriber_spec.rb` 已经覆盖了颜色配置、消息类型映射、二进制字段展示、枚举格式化、异常兜底等基础行为。

## 下一步要做什么

下一步最自然的工作，是在现有骨架上继续往“语义”和“范围”两个方向扩展。

一方面，需要补上 `KerberosTicketTraceLevel`，把“先看元数据”“再看票据摘要”“是否展开更多 AP/GSS 细节”做成分级输出。另一方面，需要把当前只有基础 request/response/credential 的 trace，扩展成更接近提案描述的语义事件，比如缓存命中、pre-auth 重试、referral 处理、delegation 决策、ticket 持久化写入等。这些信息才是操作者在排查认证问题时最想知道的内容。

再往后，就是扩大覆盖范围：把 offline inspection、`ticket_converter`、forge path 这些链路接进同一套输出模型；补齐服务认证侧 `AP-REP` 和更细的 GSS 细节；最后再用集成测试和文档把这套机制稳定下来。

## 思考

其实开始的时候是只有`msg_type:30`这样的效果的，但是mentor提了一个建议：

> One of the things we did notice though was that on page 10 there's a dump that shows a lot of values but many of them don't really have context that's human readable like the msg_type.

在做的是Trace的功能所以要考虑人类可读性，所以又新改了输出格式，确实美观和清晰了很多【应该大概也许？】。

下个blog见\(\*\^▽\^\*\)！
