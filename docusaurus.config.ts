import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Cyan',
  tagline: 'Blog · Projects · Notes',
  favicon: 'img/favicon.ico',

  url: 'https://eve0805.github.io',
  baseUrl: '/cyan.github.io/',

  organizationName: 'eve0805',
  projectName: 'cyan.github.io',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'notes',
          routeBasePath: 'notes',
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          routeBasePath: 'blog',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'projects',
        path: 'projects',
        routeBasePath: 'projects',
        sidebarPath: './sidebarsProjects.ts',
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Cyan',
      items: [
        {to: '/', label: 'Home', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'projectsSidebar',
          docsPluginId: 'projects',
          position: 'left',
          label: 'Projects',
        },
        {
          type: 'docSidebar',
          sidebarId: 'notesSidebar',
          docsPluginId: 'default',
          position: 'left',
          label: 'Notes',
        },
        {
          href: 'https://github.com/eve0805/cyan.github.io',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Cyan`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
