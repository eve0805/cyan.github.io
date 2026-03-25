---
id: kerberos-ticket-trace-subscriber-logger
title: "KerberosTicketTrace Phase 1: What the Subscriber and Logger Already Deliver"
slug: /kerberos-ticket-trace-subscriber-logger
date: 2026-03-24
tags:
  - metasploit
  - kerberos
  - ruby
  - observability
---

# KerberosTicketTrace Phase 1 Implementation

This post focuses on the first phase of `KerberosTicketTrace`: the low-level observation interface and the readable output layer. It is a phase review centered on three questions: what `lib/rex/proto/kerberos/kerberos_subscriber.rb` and `lib/rex/proto/kerberos/kerberos_logger_subscriber.rb` already solve, how they plug into the existing Kerberos flow, and how far they still are from the full observability goals described in the proposal.

> Chinese version: <a href="/cyan.github.io/projects/kerberos-ticket-trace-subscriber-logger" data-noBrokenLinkCheck>KerberosTicketTrace 第一阶段：subscriber 和 logger 已经实现了什么</a>

## Why start with the subscriber and logger

If we had started by manually printing logs inside each Kerberos module, we probably would have gotten output quickly, but the result would have been difficult to maintain. Different modules would emit different styles of messages, and it would be hard to share a single event model between low-level KDC round-trips and higher-level service authentication. That becomes even more limiting once offline inspection, ticket conversion, and the forge path enter the picture. Building the subscriber and logger first gives the project an observation skeleton: one side emits events, another consumes them, and the boundary is clear before richer semantics are layered on top.

## What `kerberos_subscriber.rb` does

`lib/rex/proto/kerberos/kerberos_subscriber.rb` has a small but important responsibility. It defines three minimal observation hooks: `on_request`, `on_response`, and `on_credential`. Functionally, those three event types line up with the most stable and reusable cut points in the current Kerberos trace flow.

- `on_request` receives outbound Kerberos request objects.
- `on_response` receives inbound response objects, including KDC responses, `AP-REP`, and `KRB-ERROR` values.
- `on_credential` receives extracted credential objects that can already be displayed or stored, such as ccache credentials for TGT, TGS, or Delegation TGS.

This interface layer answers a foundational question: what should count as an observable event? It turns Kerberos tracing from scattered logs into an event-oriented contract.

## What `kerberos_logger_subscriber.rb` already implements

`lib/rex/proto/kerberos/kerberos_logger_subscriber.rb` is the piece that turns those events into visible output. It implements the subscriber interface, sends request/response/credential events to the module logger, and tries to keep the result readable for operators. The current implementation can be grouped into a few core areas.

### 1. Trace toggles and configuration integration

The trace enablement path and display style are already connected to the datastore. `KerberosTicketTrace` and `KerberosTicketTraceColors` control whether output is emitted and whether it is colorized. Nothing is printed unless the option is explicitly enabled, so the default behavior stays unchanged. The color toggle also reuses the interaction model that already exists for `HttpTrace`.

### 2. Message type recognition and presentation

The logger can identify common Kerberos message types and label them clearly in the output. The current mapping covers `AS-REQ`, `AS-REP`, `TGS-REQ`, `TGS-REP`, `AP-REQ`, `AP-REP`, and `KRB-ERROR`. For formatting, it uses `lib/rex/proto/kerberos/kerberos_readable_text_presenter.rb` to turn structured data into terminal-friendly text, such as `Message Type: 30 (KRB-ERROR)` and `Description: Additional pre-authentication required`.

![image-20260324171905684](https://gitee.com/mimcyan/figure/raw/master/typora/image-20260324171905684.png)

### 3. Safe serialization of complex data structures

Kerberos protocol objects contain nested structures, arrays, sets, hashes, and bit flags. The logger recursively serializes Kerberos models so nested objects keep expanding, arrays and sets preserve their structure, and flag types such as `KerberosFlags` become more readable. Time fields are converted to ISO 8601 strings, and error code objects are normalized into a combination of name, numeric value, and description.

For raw binary content, the logger also chooses a gentler presentation strategy. If a field contains non-printable bytes, such as encrypted ticket data or checksums, it is rendered as a hexadecimal marker with a length hint. That matters a lot for Kerberos, because tickets, encrypted fields, and some tokens are frequently not plain text, and dumping them directly can make terminal output harder to use.

### 4. Credential-specific presentation

Credential events are already wired into `Krb5CcachePresenter`. When the code path extracts a TGT, TGS, or Delegation TGS credential, the logger can emit a fairly complete ccache-style summary.

![image-20260324172233985](https://gitee.com/mimcyan/figure/raw/master/typora/image-20260324172233985.png)

### 5. Error handling and stability

The logger includes a fallback path for render failures. If the readable text presenter or another formatting step raises an exception, the logger returns a placeholder error string instead of interrupting module execution. For an observability feature, trace output should not become a new source of instability in the authentication flow.

## How they plug into the flow

At this point, the implementation is no longer just two standalone files. It has already started to enter Metasploit's existing Kerberos workflow.

First, `lib/msf/core/exploit/remote/kerberos/client.rb` now registers the `KerberosTicketTrace` and `KerberosTicketTraceColors` advanced options and provides the `kerberos_trace_subscriber` constructor path. That means modules using the Kerberos client helper can obtain a default logger subscriber without invasive changes.

Second, in `lib/rex/proto/kerberos/client.rb`, the low-level client now wires the subscriber into the request/response round-trip path directly: `on_request` fires when a request is sent, and `on_response` fires when a response is received. That covers the most basic KDC communication layer, namely `AS-REQ/AS-REP` and `TGS-REQ/TGS-REP`.

Third, the service-authentication path has also started using the same mechanism. In `lib/msf/core/exploit/remote/kerberos/service_authenticator/base.rb`, the code calls `on_request` after constructing the service-side `AP-REQ`, calls `on_response` when a `KRB-ERROR` is received, and calls `on_credential` when it extracts and builds TGT, TGS, or Delegation TGS credentials. That shows the trace flow is already extending into service authentication and ticket artifacts.

The current call chain can be summarized like this:

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

This also makes the current boundary visible. The service-authentication side already traces `AP-REQ` and credential events, but `AP-REP` is not yet fed into the subscriber as consistently as `KRB-ERROR`, so it is still more accurate to describe that part as only partially integrated.

## How this maps to the proposal

If we split the original `KerberosTicketTrace` goals into smaller pieces, the current implementation has already completed the lowest-level skeleton.

The finished pieces include the trace interface abstraction, KDC request/response hooks, baseline logger output, and the public trace options. More concretely, it is already possible to enable a Kerberos-focused console trace without changing default behavior, and the output already includes message-type recognition, structured expansion, enum labeling, and binary-safe display handling.

The partially completed pieces include AP exchange visibility during service authentication, credential artifact output, and supporting test coverage. It is only partial because the service-authentication path can already show `AP-REQ`, `KRB-ERROR`, and several credential types, but it does not yet bring `AP-REP`, more detailed GSS/SPNEGO context, and richer semantic events into one unified trace. On the testing side, `spec/lib/rex/proto/kerberos/kerberos_logger_subscriber_spec.rb` already covers foundational behavior such as color configuration, message-type mapping, binary-field rendering, enum formatting, and fallback handling.

## What should come next

The most natural next step is to extend the current skeleton in two directions: semantics and coverage.

On one side, the project still needs `KerberosTicketTraceLevel` so the output can be layered between "show metadata first," "then show ticket summaries," and "optionally expand deeper AP/GSS details." On the other side, the current request/response/credential trace should grow toward the semantic events described in the proposal, such as cache hits, pre-auth retries, referral handling, delegation decisions, and ticket persistence writes. Those are the details operators usually care about most when debugging authentication behavior.

After that, the scope can broaden further: bring offline inspection, `ticket_converter`, and the forge path into the same output model; complete service-authentication coverage for `AP-REP` and finer GSS details; and finally stabilize the whole mechanism with integration tests and documentation.

## Reflection

At the beginning, the output was much closer to something like `msg_type:30`. My mentor gave an important suggestion:

> One of the things we did notice though was that on page 10 there's a dump that shows a lot of values but many of them don't really have context that's human readable like the msg_type.

Since this is a trace feature, human readability matters as much as raw completeness. After revising the output format with that in mind, the result is much clearer and easier to scan. I plan to keep documenting the next stages in later posts.
