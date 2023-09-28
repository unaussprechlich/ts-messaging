import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'ts-messaging',
  description: 'The documentation for ts-messaging.',
  head: [
    ['link', { rel: 'icon', href: '/ts-messaging/favicon.png' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
  ],
  srcDir: './src',
  base: '/ts-messaging/',
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/guide/about' },
    ],

    sidebar: [
      {
        text: 'Guide',
        base: '/guide/',
        items: [
          {
            text: 'What is ts-messaging?',
            link: 'about',
          },
          { text: 'Quickstart', link: 'quickstart' },
        ],
      },
      {
        text: 'Architecture',
        base: '/architecture/',
        items: [
          { text: 'Schema', link: 'schema' },
          { text: 'Contract', link: 'contract' },
          { text: 'Channel', link: 'channel' },
          { text: 'Registry', link: 'registry' },
          { text: 'Broker', link: 'broker' },
          { text: 'Controller', link: 'controller' },
          { text: 'Endpoint', link: 'endpoint' },
          { text: 'Message', link: 'message' },
        ],
      },
      {
        text: 'Prebuild Packages',
        base: '/packages/',
        items: [
          {
            text: '📦 schema-avro',
            base: '/packages/schema-avro/',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: 'overview',
              },
            ],
          },
          {
            text: '📦 registry-confluent',
            collapsed: true,
            base: '/packages/registry-confluent/',
            items: [
              {
                text: 'Overview',
                link: 'overview',
              },
            ],
          },
          {
            text: '📦 client-kafka',
            collapsed: true,
            base: '/packages/client-kafka/',
            items: [
              {
                text: 'Overview',
                link: 'overview',
              },
            ],
          },
        ],
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/unaussprechlich/ts-messaging',
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © ' + new Date().getFullYear(),
    },
  },
});
