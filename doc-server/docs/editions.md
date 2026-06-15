---
sidebar_position: 2
sidebar_label: Editions & Pricing
---

# Editions

NudgeBee is available in three editions. They share the same codebase and
documentation — this page is the source of truth for what each one includes.

| | **Community** <Community/> | **Enterprise** <Enterprise/> | **Cloud** <Cloud/> |
|---|---|---|---|
| **What it is** | Free, open-source (Apache 2.0), self-hosted. Fully functional. | Self-hosted with a commercial license. Adds enterprise features and support. | Fully managed SaaS, hosted and operated by NudgeBee. |
| **Where it runs** | Your own Kubernetes cluster | Your own Kubernetes cluster | [app.nudgebee.com](https://app.nudgebee.com) |
| **Container images** | Public — `ghcr.io/nudgebee` (no authentication) | Licensed — `registry.nudgebee.com` | Managed for you |
| **License key** | Not required | Required | Not applicable |
| **Cost** | Free | Paid (per-license) | Paid (subscription) |
| **Best for** | Teams that want full control and a zero-cost, self-hosted deployment. | Organizations that need SAML SSO, NudgeBee's managed models, and commercial support while self-hosting. | Teams that want to start in minutes without managing infrastructure. |
| **Support** | Community ([GitHub Issues & Discussions](https://github.com/nudgebee)) | Commercial support (SLA) | Commercial support (SLA) |

:::tip
Not sure where to start? The **Community** edition is fully functional and free
— monitoring, the Semantic Knowledge Graph, cost optimizations, troubleshooting,
the Workflow Builder, and Autopilot all work out of the box. You can move to
Enterprise or Cloud later without losing your configuration.
:::

## What's in the open-source (Community) edition

The Community edition is **fully functional** for self-hosted Kubernetes
operations. It includes:

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

## Trademarks

NudgeBee is open source under the Apache 2.0 license, but the **NudgeBee name
and logo are trademarks**. The Apache license does not grant trademark rights —
in particular, modified builds and forks must be renamed. See the
[trademark policy](https://github.com/nudgebee/nudgebee-docs/blob/main/TRADEMARKS.md)
for what's allowed.
