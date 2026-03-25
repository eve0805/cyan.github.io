---
id: metasploit-kerberos-certificate-observability-overview
title: Kerberos 与证书认证可观测性项目总览
slug: /metasploit-kerberos-certificate-observability-overview
date: 2026-03-24
tags:
  - metasploit
  - kerberos
  - certificate
  - observability
---

# CertificateTrace and KerberosTicketTrace Support

这篇文章从整体上梳理这个 GSoC 项目的动机、三条主线，以及当前 Kerberos 方向已经落下的基础设施。

## **0. 引言 / 动机**

在 Metasploit 里调试 Kerberos 或证书认证流程时，一个很常见的问题不是“功能做不到”，而是“过程看不见”。拿 Kerberos 来说，我们可以请求 TGT、请求 TGS、再去对 SMB、LDAP、WinRM、MSSQL 等服务做认证；拿证书来说，Metasploit 也已经支持 AD CS 证书申请、PKINIT、以及多种证书驱动的认证路径。但一旦流程失败，或者我们想确认某一步到底发生了什么，现有工作流往往会被打断：先把 `.ccache`、`.kirbi`、`.pem`、`.pfx` 之类的工件导出来，再切到 OpenSSL、Certipy 或其他外部工具里单独分析，最后回到模块里继续排查。这个过程并不只是麻烦，它还会丢失很多运行时语义信息，比如缓存是否命中、是否发生了 pre-auth 重试、票据是怎么被复用的、刚签发出来的证书里到底带了什么 SAN/UPN。

> English version: <a href="/cyan.github.io/en/projects/metasploit-kerberos-certificate-observability-overview" data-noBrokenLinkCheck>Project Overview: Kerberos and Certificate Authentication Observability</a>

GSoC2026 原文：

> Kerberos and certificate-based authentication mechanisms are becoming increasingly prevalent across modern environments, particularly in Active Directory and enterprise deployments. As a result, Metasploit modules that interact with these authentication flows often require operators and developers to inspect Kerberos tickets or certificate material in order to understand behavior, troubleshoot failures, or validate exploitation techniques. Today, this inspection typically requires switching to separate auxiliary modules or exporting artifacts (such as .pfx files) for analysis with external tooling, which interrupts the normal workflow.
>
> This project would introduce CertificateTrace and KerberosTicketTrace functionality to Metasploit, allowing relevant authentication artifacts to be captured and inspected as part of module execution. Similar in concept to the existing HttpTrace capability, these traces would focus specifically on certificate and Kerberos-based authentication, decoding and presenting useful metadata in a consistent, operator-friendly format. Similar to HttpTrace and HttpTraceHeadersOnly, we would expect there to be support for different levels of logging, ex: print only the Certificate Signing Request (CSR).

## 1. 目标

这个项目的目标，就是把这些本来散落在外部工具和离线检查步骤里的信息，重新带回 Metasploit 的执行现场，让认证过程中的关键信息能够“原地”输出，而不是散落在外部工具和导出文件中。

## 2. 划分任务

**第一条主线**是 `KerberosTicketTrace`。它面向 Kerberos 认证链路，目标是统一观察 `AS-REQ`、`AS-REP`、`TGS-REQ`、`TGS-REP`、`AP-REQ`、`AP-REP` 和 `KRB-ERROR` 这些关键消息，同时补上操作者真正关心的上下文：请求使用了哪个 principal、命中了哪个缓存、拿到的是 TGT 还是 TGS、失败发生在 KDC 往返还是服务认证阶段、是否涉及 delegation、是否把票据落到了 ccache 或 loot。Metasploit 目前已经有 [Kerberos 概览文档](https://github.com/rapid7/metasploit-framework/blob/master/docs/metasploit-framework.wiki/kerberos/overview.md)，也提供了像 [get_ticket](https://github.com/rapid7/metasploit-framework/blob/master/modules/auxiliary/admin/kerberos/get_ticket.rb)、[inspect_ticket](https://github.com/rapid7/metasploit-framework/blob/master/modules/auxiliary/admin/kerberos/inspect_ticket.rb)、[ticket_converter](https://github.com/rapid7/metasploit-framework/blob/master/modules/auxiliary/admin/kerberos/ticket_converter.rb) 这样的能力；`KerberosTicketTrace` 想做的是把这些“请求、转换、检查”的节点，用一套统一的事件和输出风格串起来。

**第二条主线**是 `X.509 Certificate Inspector`。它的目标是在 Metasploit 内部提供统一的证书检查入口，让 PEM、DER、PKCS#12/PFX、CSR 这些常见输入都能在一个地方被解析和展示。对操作者来说，最重要的不是 ASN.1 细节本身，而是认证相关信息是否一眼可见，例如 subject 和 issuer、有效期、公钥算法、SAN、EKU、证书策略，以及一个 PFX 里是否真的带了私钥。Metasploit 已经有像 [icpr_cert](https://github.com/rapid7/metasploit-framework/blob/master/modules/auxiliary/admin/dcerpc/icpr_cert.rb) 这样的证书申请模块，但今天如果想验证证书材料本身，往往还得依赖外部工具。这个 inspector 的价值就在于把“证书能不能申请下来”和“申请下来的证书到底适不适合后续认证”这两件事接近到同一个工作台里。

**第三条主线**是 `CertificateTrace`。如果说 `X.509 Certificate Inspector` 解决的是离线或单次输入的证书检查，那么 `CertificateTrace` 解决的就是运行时证书工作流的可见性：模块从哪里加载了证书，怎么做身份映射，什么时候构造了 CSR，什么时候拿到了签发结果，什么时候又把新证书打包成 PFX，最后又是如何交给 PKINIT、LDAP Schannel 或其他认证路径去继续使用的。也就是说，它希望把证书从“静态文件”重新还原成“运行时认证链路中的一个参与者”。

## 3. 怎么实现

从实现方法上看，这三个部分并不是彼此独立的。Kerberos 这边，核心思路是在底层客户端和服务认证链路中引入 subscriber/logger 模式：低层负责把请求、响应、凭据事件抛出来，上层 logger 负责把结构化信息转成终端里真正可读的输出。证书这边，核心思路则是提炼出一个共享的 X.509 解析后端，让离线检查和运行时 trace 不需要各写一份解析逻辑。两边共同依赖的则是统一的配置方式和测试补强：通过可复用的 trace 选项把能力暴露给 Kerberos 或证书相关模块，再通过单元测试和后续集成测试确保这些观测能力本身不会干扰正常认证流程。协议层面上，这部分设计分别参考了 [RFC 4120](https://datatracker.ietf.org/doc/html/rfc4120) 和 [RFC 4121](https://datatracker.ietf.org/doc/html/rfc4121) 所定义的 Kerberos 与 GSS-API 交互模型，但实现目标依然是面向 Metasploit 的实际使用场景，而不是单纯复刻规范结构。

## 4. 当前进展

从当前进展来看，这个项目已经先落下了 Kerberos 方向的一块基础设施：底层 trace 接口、控制台 logger，以及它们在 Kerberos 客户端和服务认证路径里的初步接入已经成形。这意味着后续可以在同一条链路上继续扩展 trace level、语义事件、离线路径接入和 forge path，而不需要每个模块都各写一套临时日志。下一篇文章我会专门聚焦这一阶段，详细拆开 `KerberosTicketTrace` 里 subscriber 和 logger 这一层到底实现了什么、怎么接进现有代码路径，以及它离完整目标还差哪些步骤。
