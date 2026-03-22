import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): JSX.Element {
  return (
    <Layout title="Home" description="Cyan personal site">
      <main style={{maxWidth: 960, margin: '0 auto', padding: '3rem 1rem'}}>
        <h1>Cyan</h1>
        <p>个人博客与项目记录站点。</p>

        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem'}}>
          <div style={{flex: '1 1 240px', border: '1px solid #ddd', borderRadius: '12px', padding: '1.2rem'}}>
            <h2>Blog</h2>
            <p>时间流文章、周报、功能更新。</p>
            <Link className="button button--primary" to="/blog">进入 Blog</Link>
          </div>

          <div style={{flex: '1 1 240px', border: '1px solid #ddd', borderRadius: '12px', padding: '1.2rem'}}>
            <h2>Projects</h2>
            <p>作品夹、项目总览、阶段整理。</p>
            <Link className="button button--primary" to="/projects">进入 Projects</Link>
          </div>

          <div style={{flex: '1 1 240px', border: '1px solid #ddd', borderRadius: '12px', padding: '1.2rem'}}>
            <h2>Notes</h2>
            <p>知识点、代码路径、协议理解。</p>
            <Link className="button button--primary" to="/notes">进入 Notes</Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}