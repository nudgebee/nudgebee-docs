---
sidebar_position: 3
sidebar_label: Editions & Capabilities
---

# Editions & Capabilities

NudgeBee is available in three editions. They share the same codebase and
documentation — this page is the source of truth for what each one includes.

| | **Community** <Community/> | **Enterprise** <Enterprise/> | **Cloud** <Cloud/> |
|---|---|---|---|
| **What it is** | Free, source-available self-hosted edition. The Server is licensed under **BSL 1.1** (converting to Apache 2.0 on change date); Agents are **Apache 2.0**. | Self-hosted with a commercial license. Adds enterprise features, SAML SSO, and SLA support. | Fully managed SaaS, hosted and operated by NudgeBee. |
| **Where it runs** | Your own Kubernetes cluster | Your own Kubernetes cluster | [app.nudgebee.com](https://app.nudgebee.com) |
| **Container images** | Public — `ghcr.io/nudgebee` (no authentication) | Licensed — `registry.nudgebee.com` | Managed for you |
| **License key** | Not required | Required | Managed in cloud account |
| **Licensing** | Free for internal production & operations | Commercial enterprise license | Commercial SaaS subscription |
| **Best for** | Teams that want full control and a zero-cost, self-hosted deployment. | Organizations that need SAML SSO, NudgeBee's managed models, and commercial support while self-hosting. | Teams that want to start in minutes without managing infrastructure. |
| **Support** | Community ([GitHub Issues & Discussions](https://github.com/nudgebee)) | Commercial support (SLA) | Commercial support (SLA) |

:::tip
Not sure where to start? The **Community** edition is a production-capable self-hosted edition containing the complete core monitoring, troubleshooting, optimization, workflow, and BYOM experience — the Semantic Knowledge Graph, cost optimizations, alerting, the Workflow Builder, and Autopilot all work out of the box. You can move to Enterprise or Cloud later without losing your configuration.
:::

## What's in the Community edition

The Community edition provides a comprehensive foundation for self-hosted Kubernetes operations. It includes:

- The NudgeBee **Server** (control plane, UI, API) and **Agent**
- The **Semantic Knowledge Graph**
- **Cost optimizations** and FinOps recommendations
- **Troubleshooting**, alerting, and the playbook catalog
- The **Workflow Builder** and **Autopilot** auto-runbooks
- **Notifications** (Slack, Teams, Google Chat) and **ticketing** integrations
- **BYOM (Bring Your Own Model)** LLM connectivity — OpenAI, Azure OpenAI,
  AWS Bedrock, Google Vertex AI / Gemini, Ollama, Hugging Face, and SageMaker
- **OAuth SSO** — Google, Okta, OneLogin, Azure AD (and B2C), Auth0 — plus
  magic-link email and built-in credentials login
- **Role-based access control**, approval workflows, and audit trails

The Community edition is **single-tenant by design** — one organization per
install. The chart provisions the tenant at install time and users are invited
into it from the UI.

## What requires Enterprise or Cloud

A small set of capabilities are not part of the free Community edition. Pages
documenting these features are marked with an <Enterprise/> or <Cloud/> badge.

| Feature | Edition | Notes |
|---|---|---|
| **SAML 2.0 SSO** | <Enterprise/> <Cloud/> | Community supports OAuth SSO (Google, Okta, OneLogin, Azure AD / B2C, Auth0), magic-link email, and credentials login — but the SAML 2.0 flow (with IdP-driven user provisioning and group-to-role mapping) is Enterprise-only. See [Authentication](./integrations/Authentication/index.md). |
| **NudgeBee-managed & proprietary LLM/SLM models** (`nb-llm`, `nb-slm`, `nb-text-embeddings`) | <Enterprise/> <Cloud/> | Community users connect their own model via [BYOM](./integrations/LLM/index.md). |
| **Multi-tenant self-signup** | <Cloud/> | Community and Enterprise installs are single-tenant. The self-serve signup flow (creates a new tenant per signup) is exclusive to NudgeBee Cloud. |
| **Cloud-marketplace billing** (AWS / Azure subscriptions) | <Cloud/> | Marketplace purchase callbacks and billing are SaaS-only. |

:::note
This boundary may evolve as the project grows. When it does, this page and the
per-feature badges are updated together so the docs always reflect what's
actually gated.
:::

## Licensing & Trademarks

- **NudgeBee Server**: Licensed under the **Business Source License 1.1 (BSL 1.1)**. Free for non-competing production and internal operations, automatically converting to open source under Apache 2.0 after its change date.
- **NudgeBee Agents & Ecosystem**: The Kubernetes Agent ([k8s-agent](https://github.com/nudgebee/k8s-agent)) and Proxy Agent ([forager](https://github.com/nudgebee/forager)) are licensed under the **Apache 2.0 License**.
- **Trademarks**: The **NudgeBee name and logo are trademarks**. The licenses do not grant trademark rights — modified builds and forks must be renamed. See the [trademark policy](https://github.com/nudgebee/nudgebee-docs/blob/main/TRADEMARKS.md) for what is allowed.

---

## Commercial Inquiries & Pricing

For commercial licensing, enterprise SLAs, volume discounts, and Cloud subscription pricing, visit the [NudgeBee Pricing Page](https://nudgebee.com/pricing) or contact our sales team at [sales@nudgebee.com](mailto:sales@nudgebee.com).
