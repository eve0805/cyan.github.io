import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';

const cards = [
  {
    title: translate({
      id: 'home.card.blog.title',
      message: 'Blog',
    }),
    description: translate({
      id: 'home.card.blog.description',
      message: '时间流文章、周报、功能更新。',
    }),
    cta: translate({
      id: 'home.card.blog.cta',
      message: '进入 Blog',
    }),
    to: '/blog',
  },
  {
    title: translate({
      id: 'home.card.projects.title',
      message: 'Projects',
    }),
    description: translate({
      id: 'home.card.projects.description',
      message: '作品夹、项目总览、阶段整理。',
    }),
    cta: translate({
      id: 'home.card.projects.cta',
      message: '进入 Projects',
    }),
    to: '/projects',
  },
  {
    title: translate({
      id: 'home.card.notes.title',
      message: 'Notes',
    }),
    description: translate({
      id: 'home.card.notes.description',
      message: '知识点、代码路径、协议理解。',
    }),
    cta: translate({
      id: 'home.card.notes.cta',
      message: '进入 Notes',
    }),
    to: '/notes',
  },
] as const;

export default function Home(): JSX.Element {
  return (
    <Layout title="Home" description="Cyan personal site">
      <main style={{maxWidth: 960, margin: '0 auto', padding: '3rem 1rem'}}>
        <h1>Cyan</h1>
        <p>
          <Translate id="home.subtitle">个人博客与项目记录站点。</Translate>
        </p>
        <p style={{maxWidth: 720, color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7}}>
          <Translate id="home.localeNote">
            重点 Projects 已提供英文版本，Blog 和 Notes 的英文内容也在逐步补充中。
          </Translate>
        </p>

        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem'}}>
          {cards.map((card) => (
            <div
              key={card.to}
              style={{flex: '1 1 240px', border: '1px solid #ddd', borderRadius: '12px', padding: '1.2rem'}}>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <Link className="button button--primary" to={card.to}>
                {card.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
