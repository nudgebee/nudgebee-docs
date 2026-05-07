# NudgeBee Documentation

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![CI](https://github.com/nudgebee/nudgebee-docs/actions/workflows/ci.yaml/badge.svg)](https://github.com/nudgebee/nudgebee-docs/actions/workflows/ci.yaml)

Source for the [NudgeBee](https://nudgebee.com) documentation site, published at **[docs.nudgebee.com](https://docs.nudgebee.com)**.

NudgeBee is an AI-powered Kubernetes operations platform. These docs cover the cloud SaaS, self-hosted server installation, the agent, integrations, the Workflow Builder, and the API reference. The site is built with [Docusaurus 3](https://docusaurus.io/).

## Local development

```bash
git clone https://github.com/nudgebee/nudgebee-docs.git
cd nudgebee-docs/doc-server
npm install --legacy-peer-deps
npm start
```

The site will be available at `http://localhost:4000`. Edits to markdown files under `doc-server/docs/` reload automatically.

Before opening a pull request:

```bash
npm run build   # confirm the site builds
npm run lint    # confirm lint passes
```

## Repository layout

```
.
├── doc-server/          # Docusaurus site source
│   ├── docs/            # Markdown documentation
│   ├── src/             # React components and styles
│   ├── static/          # Images and other assets
│   ├── docusaurus.config.js
│   └── sidebars.js
├── deploy/              # Helm chart for self-hosting the docs site
└── .github/             # CI workflow, issue and PR templates
```

## Contributing

Contributions of all sizes are welcome — fix a typo, add a missing page, improve an example.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contribution flow, including the [Developer Certificate of Origin](https://developercertificate.org) sign-off requirement. By participating, you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).

For security vulnerabilities, follow the private disclosure process in [SECURITY.md](./SECURITY.md) — please do not file public issues for security bugs.

## Links

- Product: [nudgebee.com](https://nudgebee.com)
- Documentation: [docs.nudgebee.com](https://docs.nudgebee.com)
- Cloud SaaS: [app.nudgebee.com](https://app.nudgebee.com)
- Container registry: [registry.nudgebee.com](https://registry.nudgebee.com)

## License

Licensed under the [Apache License 2.0](./LICENSE). See [NOTICE](./NOTICE) for attributions and [TRADEMARKS.md](./TRADEMARKS.md) for guidance on the use of the NudgeBee name and logo.
