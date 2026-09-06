// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'NudgeBee',
  tagline: 'AI Agents & Agentic Workflows for SRE, CloudOps, and Support Teams',
  favicon: 'img/favicon.png',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Agent docs were regrouped into install / connect / operate.
        // Keep the old URLs alive: they are linked from the Helm chart's
        // ArtifactHub entry, `helm install` output, and customer bookmarks.
        redirects: [
          { from: '/docs/installation/agent/installation/alertmanager', to: '/docs/installation/agent/connect/alertmanager' },
          { from: '/docs/installation/agent/installation/metrics', to: '/docs/installation/agent/connect/metrics' },
          { from: '/docs/installation/agent/installation/multi_tenant_metrics', to: '/docs/installation/agent/connect/multi_tenant_metrics' },
          { from: '/docs/installation/agent/installation/grafana', to: '/docs/installation/agent/connect/grafana' },
          { from: '/docs/installation/agent/installation/logging', to: '/docs/installation/agent/connect/logging' },
          { from: '/docs/installation/agent/installation/logging/loki', to: '/docs/installation/agent/connect/logging/loki' },
          { from: '/docs/installation/agent/installation/logging/elk', to: '/docs/installation/agent/connect/logging/elk' },
          { from: '/docs/installation/agent/installation/logging/signoz', to: '/docs/installation/agent/connect/logging/signoz' },
          { from: '/docs/installation/agent/installation/logging/last9', to: '/docs/installation/agent/connect/logging/last9' },
          { from: '/docs/installation/agent/installation/logging/logz.io', to: '/docs/installation/agent/connect/logging/logz.io' },
          { from: '/docs/installation/agent/installation/tracing', to: '/docs/installation/agent/connect/tracing' },
          { from: '/docs/installation/agent/installation/tracing/clickhouse-tracing', to: '/docs/installation/agent/connect/tracing/clickhouse-tracing' },
          { from: '/docs/installation/agent/installation/tracing/gcp-tracing', to: '/docs/installation/agent/connect/tracing/gcp-tracing' },
          { from: '/docs/installation/agent/installation/helm_values', to: '/docs/installation/agent/operate/helm_values' },
          { from: '/docs/installation/agent/installation/node-agent-configs', to: '/docs/installation/agent/operate/node-agent-configs' },
          { from: '/docs/installation/agent/installation/cluster-autoscaler', to: '/docs/installation/agent/operate/cluster-autoscaler' },
          { from: '/docs/installation/agent/installation/cluster-autoscaler/aks_kaarpenter_installation', to: '/docs/installation/agent/operate/cluster-autoscaler/aks_kaarpenter_installation' },
          { from: '/docs/features/slo-operations', to: '/docs/features/slo' },
        ],
      },
    ],
  ],

  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").Options} */
      ({
        hashed: true,
      }),
    ],
  ],

  // Set the production url of your site here
  url: process.env.SITE_URL || 'https://docs.nudgebee.com/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  trailingSlash: true,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'NudgeBee', // Usually your GitHub org/user name.
  projectName: 'NudgeBee', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/nudgebee/nudgebee-docs/tree/main/doc-server/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Social card shown when a docs link is shared (Open Graph / Twitter)
      image: 'img/Nudgebee.png',
      navbar: {
        logo: {
          alt: 'NudgeBee Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'datasourceSidebar',
            position: 'left',
            label: 'Docs',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} NudgeBee Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      }
    }),
};

module.exports = config;
