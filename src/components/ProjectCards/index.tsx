import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const items = [
  {
    title: 'Kerberos 与证书认证可观测性项目总览',
    to: '/projects/metasploit-kerberos-certificate-observability-overview',
    description:
      '项目背景、目标拆分、KerberosTicketTrace / CertificateTrace / X.509 Inspector 的整体设计。',
    meta: '2026-03-24 · metasploit · kerberos · certificate · observability',
  },
  {
    title: 'KerberosTicketTrace 第一阶段：subscriber 和 logger 已经实现了什么',
    to: '/projects/kerberos-ticket-trace-subscriber-logger',
    description:
      '拆解 subscriber/logger 的职责、接入链路、当前能力边界，以及后续扩展方向。',
    meta: '2026-03-24 · metasploit · kerberos · ruby · observability',
  },
];

export default function ProjectCards(): JSX.Element {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={styles.card}>
          <div className={styles.body}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className={styles.meta}>{item.meta}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}