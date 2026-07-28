import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './story.module.css';
import extra from './gsoc.module.css';

const rapid7Posts=[
  {url:'https://www.rapid7.com/blog/post/pt-metasploit-wrap-up-13-06-2026/',date:'2026-06-13',en:'New Kerberos/Certificate tracing options, and multiple new modules',zh:'新的 Kerberos/Certificate 追踪选项与多个新模块',detailEn:'Introduced KerberosTicketTrace and credited PR #21466.',detailZh:'介绍 KerberosTicketTrace，并收录了我的 PR #21466。'},
  {url:'https://www.rapid7.com/blog/post/pt-weekly-metasploit-update-exploits-for-flowiseai-csv-agent-and-macos-package-kit/',date:'2026-07-10',en:'Exploits for FlowiseAI CSV Agent and macOS Package Kit',zh:'FlowiseAI CSV Agent 与 macOS Package Kit 漏洞更新',detailEn:'Featured PR #21637 and the new trace granularity modes.',detailZh:'收录 PR #21637 以及新增的追踪粒度模式。'},
];

const content={
  zh:{
    label:'GSOC 2026 / RAPID7 METASPLOIT',title:'KerberosTicketTrace',accent:'让认证流程不再是黑盒。',
    lead:'我的 GSoC 2026 工作聚焦于 Metasploit Framework 的 KerberosTicketTrace：为在线认证、离线票据、伪造票据以及 GSS/SPNEGO 封装建立一致、可选的可观测能力。',
    overview:'当前项目范围',problem:'专注 Kerberos，从协议消息走向完整工作流。',
    desc:'最初的 proposal 同时覆盖 Kerberos 与证书追踪。项目执行阶段重新划分了职责：我主要负责 KerberosTicketTrace；CertificateTrace 与证书相关工作由另一位 GSoC 参与者 Pushpender Singh Rathore 实现。两条工作流同属 Metasploit 认证可观测性方向，但交付范围彼此独立。',
    scope:'我的工作主线',timeline:'实际进展',team:'项目成员',coverage:'Rapid7 Metasploit Blog',coverageDesc:'Rapid7 官方 Metasploit 周报中直接涉及我的 GSoC 工作的文章。',prs:'查看我的贡献',partner:'查看 CertificateTrace 参与者博客',
    phases:[
      ['在线认证追踪','在 Rex Kerberos 客户端层加入 subscriber 与 presenter，呈现 AS-REQ、AS-REP、TGS-REQ、TGS-REP、KRB-ERROR 和凭据输出。'],
      ['追踪模式与离线制品','将选项演进为 off、metadata、ticket、full 模式，并把相同输出扩展到 ccache、kirbi、klist 和票据转换流程。'],
      ['伪造票据与协议封装','为黄金、白银、钻石和蓝宝石票据加入追踪，并建设共享 GSS/SPNEGO token 处理能力。'],
    ],
    dates:[['2026-05—06','核心 KerberosTicketTrace 设计、实现、测试并合入 #21466'],['2026-07 上旬','完成枚举追踪模式 #21637 与离线票据输出 #21638'],['2026-07 下旬','推进伪造票据追踪 #21691 和共享 GSS/SPNEGO 处理 #21717'],['后续','继续完善 AP 交换、语义事件、兼容性、测试与文档']],
    mentor:'导师',contributor:'CertificateTrace 参与者',me:'KerberosTicketTrace 参与者',official:'官方周报',read:'阅读文章',notes:'技术记录',notesDesc:'原 Projects 栏目的 GSoC 技术文章现已统一归档在这里。',note1:'项目背景与认证可观测性设计',note2:'KerberosTicketTrace Subscriber 与 Logger',openNote:'阅读记录',
  },
  en:{
    label:'GSOC 2026 / RAPID7 METASPLOIT',title:'KerberosTicketTrace',accent:'making authentication flows observable.',
    lead:'My GSoC 2026 work focuses on KerberosTicketTrace for the Metasploit Framework: consistent, opt-in observability across live authentication, offline tickets, forged tickets, and GSS/SPNEGO encapsulation.',
    overview:'CURRENT PROJECT SCOPE',problem:'Focused on Kerberos, from protocol messages to complete workflows.',
    desc:'The original proposal covered both Kerberos and certificate tracing. Responsibilities were refined during the program: I primarily own KerberosTicketTrace, while CertificateTrace and certificate-related work are implemented by fellow GSoC contributor Pushpender Singh Rathore. Both tracks improve Metasploit authentication observability, but their deliverables are distinct.',
    scope:'My workstreams',timeline:'Actual progress',team:'Project team',coverage:'Rapid7 Metasploit Blog',coverageDesc:'Official Rapid7 Metasploit updates that directly feature my GSoC work.',prs:'View my contributions',partner:'Visit the CertificateTrace contributor blog',
    phases:[
      ['Live authentication tracing','A Rex Kerberos client subscriber and presenter expose AS-REQ, AS-REP, TGS-REQ, TGS-REP, KRB-ERROR, and credential output.'],
      ['Trace modes and offline artifacts','The option evolved into off, metadata, ticket, and full modes, with consistent output for ccache, kirbi, klist, and ticket conversion.'],
      ['Forged tickets and protocol wrappers','Tracing extends to golden, silver, diamond, and sapphire tickets, alongside shared GSS/SPNEGO token handling.'],
    ],
    dates:[['May—June 2026','Designed, implemented, tested, and merged the KerberosTicketTrace foundation in #21466'],['Early July 2026','Completed enum trace modes in #21637 and offline ticket output in #21638'],['Late July 2026','Advanced forged-ticket tracing in #21691 and shared GSS/SPNEGO handling in #21717'],['Next','Continue AP exchanges, semantic events, compatibility, tests, and documentation']],
    mentor:'Mentors',contributor:'CertificateTrace contributor',me:'KerberosTicketTrace contributor',official:'Official update',read:'Read post',notes:'Technical notes',notesDesc:'The GSoC technical articles previously listed under Projects now live here.',note1:'Project background and authentication observability design',note2:'KerberosTicketTrace subscriber and logger',openNote:'Read note',
  }
};

export default function Gsoc():React.JSX.Element{
  const {i18n}=useDocusaurusContext(); const lang=i18n.currentLocale==='en'?'en':'zh'; const t=content[lang];
  return <Layout title="GSoC 2026 / KerberosTicketTrace" description={t.lead}><main className={styles.page}>
    <header className={styles.header}><span>{t.label}</span><h1>{t.title}<br/><em>{t.accent}</em></h1><p>{t.lead}</p><div><Link to="/contributions">{t.prs} &#8594;</Link><a href="https://pushpenderrathore.github.io/gsoc.html">{t.partner} &#8599;</a></div></header>
    <section className={styles.content}>
      <div className={styles.intro}><span>{t.overview}</span><h2>{t.problem}</h2><p>{t.desc}</p></div>
      <h2 className={styles.subhead}>{t.team}</h2>
      <div className={extra.teamGrid}>
        <a href="https://github.com/eve0805"><span>{t.me}</span><strong>Cyan / @eve0805</strong><small>KerberosTicketTrace</small></a>
        <a href="https://pushpenderrathore.github.io/gsoc.html"><span>{t.contributor}</span><strong>Pushpender Singh Rathore</strong><small>CertificateTrace</small></a>
        <div><span>{t.mentor}</span><strong>@jheysel-r7</strong><strong>@zeroSteiner</strong></div>
      </div>
      <h2 className={styles.subhead}>{t.scope}</h2>
      <div className={styles.phases}>{t.phases.map((x,i)=><article key={x[0]}><span>0{i+1}</span><div><h3>{x[0]}</h3><p>{x[1]}</p></div></article>)}</div>
      <h2 className={styles.subhead}>{t.timeline}</h2>
      <div className={styles.schedule}>{t.dates.map(x=><div key={x[0]}><time>{x[0]}</time><span>{x[1]}</span></div>)}</div>
      <div className={extra.notesHead}><span>GSOC / RESEARCH</span><h2>{t.notes}</h2><p>{t.notesDesc}</p></div>
      <div className={extra.notesGrid}>
        <Link to="/gsoc/research/metasploit-kerberos-certificate-observability-overview"><span>01</span><h3>{t.note1}</h3><footer>{t.openNote} &#8594;</footer></Link>
        <Link to="/gsoc/research/kerberos-ticket-trace-subscriber-logger"><span>02</span><h3>{t.note2}</h3><footer>{t.openNote} &#8594;</footer></Link>
      </div>
      <div className={extra.pressHead}><div><span>{t.official}</span><h2>{t.coverage}</h2><p>{t.coverageDesc}</p></div></div>
      <div className={extra.pressGrid}>{rapid7Posts.map(post=><a href={post.url} key={post.url}><div><time>{post.date}</time><span>RAPID7</span></div><h3>{post[lang]}</h3><p>{lang==='en'?post.detailEn:post.detailZh}</p><footer>{t.read} &#8599;</footer></a>)}</div>
    </section>
  </main></Layout>
}
