---
id: metasploit-kerberos-certificate-observability-overview
title: "Project Overview: Kerberos and Certificate Authentication Observability"
slug: /metasploit-kerberos-certificate-observability-overview
date: 2026-03-24
tags:
  - metasploit
  - kerberos
  - certificate
  - observability
---

# CertificateTrace and KerberosTicketTrace Support

This post gives a project-level overview of the GSoC work: the motivation, the three major workstreams, and the foundational progress already made on the Kerberos side.

## 0. Motivation

When debugging Kerberos or certificate-based authentication flows in Metasploit, the common problem is often not that a feature is impossible, but that the process is invisible. On the Kerberos side, we may request a TGT, request a TGS, and then authenticate to SMB, LDAP, WinRM, MSSQL, or other services. On the certificate side, Metasploit already supports AD CS certificate enrollment, PKINIT, and several certificate-driven authentication paths. But once a flow fails, or once we want to verify exactly what happened at a certain step, the current workflow is often interrupted: export artifacts such as `.ccache`, `.kirbi`, `.pem`, or `.pfx`, switch to OpenSSL, Certipy, or another external tool, inspect them there, and only then return to the module. That is not just inconvenient. It also throws away valuable runtime semantics such as whether a cache was hit, whether a pre-auth retry happened, how a ticket was reused, or what SAN/UPN values were present in a freshly issued certificate.

> Chinese version: <a href="/cyan.github.io/projects/metasploit-kerberos-certificate-observability-overview" data-noBrokenLinkCheck>Kerberos 与证书认证可观测性项目总览</a>

Original GSoC 2026 description:

> Kerberos and certificate-based authentication mechanisms are becoming increasingly prevalent across modern environments, particularly in Active Directory and enterprise deployments. As a result, Metasploit modules that interact with these authentication flows often require operators and developers to inspect Kerberos tickets or certificate material in order to understand behavior, troubleshoot failures, or validate exploitation techniques. Today, this inspection typically requires switching to separate auxiliary modules or exporting artifacts (such as .pfx files) for analysis with external tooling, which interrupts the normal workflow.
>
> This project would introduce CertificateTrace and KerberosTicketTrace functionality to Metasploit, allowing relevant authentication artifacts to be captured and inspected as part of module execution. Similar in concept to the existing HttpTrace capability, these traces would focus specifically on certificate and Kerberos-based authentication, decoding and presenting useful metadata in a consistent, operator-friendly format. Similar to HttpTrace and HttpTraceHeadersOnly, we would expect there to be support for different levels of logging, ex: print only the Certificate Signing Request (CSR).

## 1. Goal

The goal of this project is to bring the information that is currently scattered across external tools and offline inspection steps back into Metasploit's execution path, so the critical details of authentication can be surfaced in place instead of being fragmented across exported files and separate tooling.

## 2. Workstreams

The first workstream is `KerberosTicketTrace`. It focuses on the Kerberos authentication path and aims to observe key messages such as `AS-REQ`, `AS-REP`, `TGS-REQ`, `TGS-REP`, `AP-REQ`, `AP-REP`, and `KRB-ERROR` in a consistent way, while also adding the context operators actually care about: which principal was used, whether a cache was hit, whether the result was a TGT or TGS, whether the failure happened during KDC exchange or service authentication, whether delegation was involved, and whether tickets were persisted to ccache or loot. Metasploit already has a [Kerberos overview document](https://github.com/rapid7/metasploit-framework/blob/master/docs/metasploit-framework.wiki/kerberos/overview.md) and supporting capabilities such as [get_ticket](https://github.com/rapid7/metasploit-framework/blob/master/modules/auxiliary/admin/kerberos/get_ticket.rb), [inspect_ticket](https://github.com/rapid7/metasploit-framework/blob/master/modules/auxiliary/admin/kerberos/inspect_ticket.rb), and [ticket_converter](https://github.com/rapid7/metasploit-framework/blob/master/modules/auxiliary/admin/kerberos/ticket_converter.rb). `KerberosTicketTrace` is intended to connect those request, conversion, and inspection points through one shared event model and output style.

The second workstream is the `X.509 Certificate Inspector`. Its goal is to provide a unified certificate inspection entry point inside Metasploit so that common inputs such as PEM, DER, PKCS#12/PFX, and CSR can all be parsed and displayed in one place. For operators, the most important part is not ASN.1 detail for its own sake, but whether authentication-relevant information is immediately visible: subject, issuer, validity period, public key algorithm, SAN, EKU, certificate policies, and whether a PFX really contains a private key. Metasploit already has certificate enrollment modules such as [icpr_cert](https://github.com/rapid7/metasploit-framework/blob/master/modules/auxiliary/admin/dcerpc/icpr_cert.rb), but validating certificate material itself still often depends on external tooling. The value of the inspector is that it brings "can this certificate be issued?" and "is the issued certificate actually suitable for later authentication?" closer to the same working surface.

The third workstream is `CertificateTrace`. If the `X.509 Certificate Inspector` addresses offline or one-off certificate inspection, `CertificateTrace` addresses visibility into runtime certificate workflows: where a module loaded a certificate, how identity mapping was performed, when a CSR was built, when issuance results were received, when a new certificate was packaged into PFX, and how it was then handed off to PKINIT, LDAP Schannel, or another authentication path. In other words, it tries to restore certificates from static files into active participants in the authentication flow.

## 3. Implementation direction

These three pieces are not independent. On the Kerberos side, the core idea is to introduce a subscriber/logger pattern into the low-level client and service-authentication paths: the lower layers emit request, response, and credential events, while the upper logger layer turns structured data into output that is actually readable in a terminal. On the certificate side, the core idea is to extract a shared X.509 parsing backend so offline inspection and runtime trace do not need to maintain separate parsing logic. Both directions also depend on a common configuration model and stronger test coverage: reusable trace options expose the capability to Kerberos- or certificate-related modules, and unit tests plus future integration tests make sure the observability layer does not interfere with the authentication flow itself. At the protocol level, the design references the Kerberos and GSS-API interaction models defined in [RFC 4120](https://datatracker.ietf.org/doc/html/rfc4120) and [RFC 4121](https://datatracker.ietf.org/doc/html/rfc4121), while still staying focused on Metasploit's practical operator workflows rather than merely mirroring the RFC structures.

## 4. Current progress

At the current stage, the project has already landed a foundational piece on the Kerberos side: the low-level trace interface, the console logger, and their initial integration into the Kerberos client and service-authentication paths are already taking shape. That creates a base on which future work can extend trace levels, semantic events, offline-path integration, and the forge path without forcing each module to invent its own temporary logging layer. In the next post, I focus specifically on that phase and break down what the subscriber and logger layer of `KerberosTicketTrace` already implements, how it plugs into the existing code path, and which steps are still missing before the broader goal is complete.
