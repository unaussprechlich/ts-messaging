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
          { text: 'Controller', link: 'controller' },
          { text: 'Endpoint', link: 'endpoint' },
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
              {
                text: 'Installation',
                link: 'installation',
              },
              {
                text: '@Avro.InjectSchema',
                link: 'schema',
                base: '/decorators/schema/',
              },
              {
                text: '@Avro.Record',
                link: 'record',
                base: '/packages/schema-avro/decorators/fields/',
                collapsed: true,
                items: [
                  { text: '@Avro.Int', link: 'int' },
                  { text: '@Avro.String', link: 'string' },
                  { text: '@Avro.Double', link: 'double' },
                  { text: '@Avro.Boolean', link: 'double' },
                  { text: '🚧 @Avro....', link: 'double' },
                ],
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
              {
                text: 'Installation',
                link: 'installation',
              },
              {
                text: '@Confluent.Subject',
                link: '/decorators/inject-subject',
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
              {
                text: 'Installation',
                link: 'installation',
              },
              {
                text: '@Kafka.InjectClient',
                link: 'schema',
                base: '/decorators/inject-client',
              },
              {
                text: '@Kafka.InjectTopic',
                link: 'schema',
                base: '/decorators/inject-topic',
              },
              {
                text: '@Kafka.Controller',
                link: 'schema',
                base: '/decorators/controller/',
              },
              {
                text: '@Kafka.Endpoint',
                link: 'record',
                base: '/packages/client-kafka/decorators/params/',
                collapsed: true,
                items: [
                  { text: '@Kafka.Key', link: 'key' },
                  { text: '@Kafka.Value', link: 'value' },
                  { text: '@Avro.Meta', link: 'meta' },
                ],
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
