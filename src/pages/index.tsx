import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

const copy = {
  zh: {
    eyebrow:'网络安全 / 开源 / GSoC 2026', title:'在不完满中，', accent:'先开始行动。',
    lead:'我是 Cyan，一名网络与信息安全研究生、开源贡献者与安全研究者。关注漏洞挖掘、AI 安全与 Agent 安全。',
    project:'查看 GSoC 项目', github:'GitHub 主页', quote:'每个人都争取一个完满的人生。然而，自古及今，一个百分之百完满的人生是没有的。所以我说，不完满才是人生。',
    aboutLabel:'关于我', aboutTitle:'研究攻击面，也构建更好的安全工具。',
    about:'目前就读于南京理工大学网络空间安全学院，同时在江苏绿盟实习。我的实践聚焦渗透测试、认证协议、漏洞挖掘，以及使用 AI 寻找传统软件与智能 Agent 中的新型安全问题。',
    education:'教育经历', experience:'经历与开源', skills:'技术与工具',
    edu1:'信息安全 · 学士', edu2:'网络与信息安全 · 硕士', present:'至今',
    exp1:'网络安全实习生', exp2:'GSoC 2026 贡献者', exp2desc:'为 Metasploit Framework 构建 Kerberos 与证书认证可观测性能力。',
    workLabel:'近期工作', workTitle:'把研究落实到上游代码。', allPr:'查看全部贡献',
    vulnLabel:'安全研究', vulnTitle:'漏洞记录', vulnText:'仅发布经过匿名化处理的漏洞代号与非敏感元数据，不公开厂商、复现文件或利用细节。', vulnCta:'打开漏洞记录',
    contact:'联系我', contactText:'如果你想讨论开源、安全研究或 GSoC 项目，欢迎通过邮件联系。', cv:'个人简历 · 整理中',
  },
  en: {
    eyebrow:'SECURITY / OPEN SOURCE / GSOC 2026', title:'Embrace imperfection.', accent:'Start anyway.',
    lead:'I am Cyan, a graduate student in cybersecurity, open-source contributor, and security researcher interested in vulnerability research, AI security, and agent security.',
    project:'Explore my GSoC project', github:'GitHub profile', quote:'Imperfection is part of life. Start anyway, even if it is messy.',
    aboutLabel:'ABOUT ME', aboutTitle:'Studying attack surfaces and building better security tools.',
    about:'I am pursuing a master’s degree at Nanjing University of Science and Technology while interning at NSFOCUS Jiangsu. My work focuses on penetration testing, authentication protocols, vulnerability research, and using AI to discover new security issues in conventional software and intelligent agents.',
    education:'Education', experience:'Experience & open source', skills:'Skills & tools',
    edu1:'Information Security · B.Eng.', edu2:'Cyberspace Security · M.Eng.', present:'Present',
    exp1:'Cybersecurity Intern', exp2:'GSoC 2026 Contributor', exp2desc:'Building Kerberos and certificate-authentication observability for the Metasploit Framework.',
    workLabel:'RECENT WORK', workTitle:'Turning research into upstream code.', allPr:'View all contributions',
    vulnLabel:'SECURITY RESEARCH', vulnTitle:'Vulnerability log', vulnText:'Only anonymized identifiers and non-sensitive metadata are published. Vendors, reproduction files, and exploitation details remain private.', vulnCta:'Open vulnerability log',
    contact:'Contact', contactText:'If you would like to discuss open source, security research, or my GSoC project, feel free to reach out.', cv:'CV · Coming soon',
  }
};
const work=[{number:21466,zh:'Kerberos 票据追踪',en:'Kerberos ticket tracing',state:'Merged'},{number:21638,zh:'离线票据检查',en:'Offline ticket inspection',state:'Merged'},{number:21717,zh:'共享 GSS 与 SPNEGO 处理',en:'Shared GSS & SPNEGO handling',state:'Open'}];

export default function Home():React.JSX.Element{
  const {i18n}=useDocusaurusContext(); const lang=i18n.currentLocale==='en'?'en':'zh'; const t=copy[lang];
  return <Layout title="Cyan" description={t.lead}><main>
    <section className={styles.hero}><div className={styles.glow}/><div className={styles.heroInner}><div className={styles.eyebrow}><span/>{t.eyebrow}</div><h1>{t.title}<br/><em>{t.accent}</em></h1><p className={styles.lead}>{t.lead}</p><div className={styles.actions}><Link className={styles.primary} to="/gsoc">{t.project} <span>&#8599;</span></Link><a className={styles.secondary} href="https://github.com/eve0805">{t.github} <span>&#8594;</span></a></div><p className={styles.heroQuote}>{t.quote}</p></div><div className={styles.portrait}><img src="https://github.com/eve0805.png" alt="Cyan"/><div><strong>Cyan</strong><span>GMT+8 · China</span><a href="mailto:mmq_cyan@163.com">mmq_cyan@163.com</a></div></div></section>
    <section className={styles.about} id="about"><div><span className={styles.kicker}>{t.aboutLabel}</span><h2>{t.aboutTitle}</h2></div><div><p>{t.about}</p><div className={styles.skillTags}>{['Python','Ruby','Burp Suite','Wireshark','Reqable','Nmap','Metasploit','AI Security'].map(x=><span key={x}>{x}</span>)}</div></div></section>
    <section className={styles.profileGrid}><article><span>01</span><h2>{t.education}</h2><div className={styles.timeline}><div><time>2024—2027</time><strong>{lang==='zh'?'南京理工大学':'Nanjing University of Science and Technology'}</strong><p>{t.edu2}</p></div><div><time>2020—2024</time><strong>{lang==='zh'?'江苏大学':'Jiangsu University'}</strong><p>{t.edu1}</p></div></div></article><article><span>02</span><h2>{t.experience}</h2><div className={styles.timeline}><div><time>2026—{t.present}</time><strong>{lang==='zh'?'江苏绿盟':'NSFOCUS Jiangsu'}</strong><p>{t.exp1}</p></div><div><time>2026</time><strong>Metasploit Framework</strong><p>{t.exp2} · {t.exp2desc}</p></div></div></article></section>
    <section className={styles.section}><div className={styles.sectionHead}><div><span className={styles.kicker}>{t.workLabel}</span><h2>{t.workTitle}</h2></div><Link to="/contributions">{t.allPr} &#8594;</Link></div><div className={styles.workGrid}>{work.map((x,i)=><a className={styles.workCard} key={x.number} href={`https://github.com/rapid7/metasploit-framework/pull/${x.number}`}><div><span className={styles.index}>0{i+1}</span><span className={x.state==='Merged'?styles.badge:styles.openBadge}>{x.state}</span></div><h3>{x[lang]}</h3><footer><code>rapid7/metasploit-framework #{x.number}</code><span>&#8599;</span></footer></a>)}</div></section>
    <section className={styles.vulnBanner}><div><span className={styles.kicker}>{t.vulnLabel}</span><h2>{t.vulnTitle}</h2><p>{t.vulnText}</p></div><Link to="/vulnerabilities">{t.vulnCta} &#8594;</Link></section>
    <section className={styles.contact}><div><span className={styles.kicker}>{t.contact}</span><h2>Let&rsquo;s talk security.</h2><p>{t.contactText}</p></div><div><a href="mailto:mmq_cyan@163.com">mmq_cyan@163.com &#8599;</a><a href="https://github.com/eve0805">github.com/eve0805 &#8599;</a><span>{t.cv}</span></div></section>
  </main></Layout>
}
