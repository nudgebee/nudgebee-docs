---
sidebar_position: 1
---

# Integrations

NudgeBee ships with **60+ integration types** that connect to the tools and platforms you already use — Kubernetes and cloud accounts, observability systems, inbound alert webhooks, notification channels, ticketing systems, code repositories, CI/CD pipelines, databases and data stores, knowledge bases, and LLM providers. No need to manually code connectors; each integration is ready to configure and extends NudgeBee's Cloud-Ops Intelligence.

You do not need to set up all integrations at once. Start with the essentials (a Kubernetes cluster and an observability source), then add more as needed.

:::info
Some integrations are **required** for NudgeBee to function (Kubernetes cluster and observability source). Others are **optional** and unlock additional capabilities. See the [capability map](../features/) for a full breakdown of what each integration enables.
:::

All integrations are configured from **Admin** > **Integrations** — see [The Integrations page](#the-integrations-page) for how it works. The sections below describe what each kind of integration is for.

## The Integrations page

**Admin → Integrations** — *"Connect Nudgebee to your clouds, observability platforms, ticketing, repositories and messaging tools — and see what is already connected."*

Search with **Search integrations…** or pick **All** or a category tab. Each tab splits providers into **Connected** and **Available**. A connected card shows **Active N** and **Inactive N** — how many connections of that type are enabled or disabled; a provider whose connections are all disabled is listed under Available. Greyed-out providers are not available yet.

| Tab | Providers |
|---|---|
| **Kubernetes & Cloud** | Kubernetes clusters (EKS, AKS, GKE, OpenShift…), AWS, Azure, GCP, Cloud Foundry, Self-Hosted VMs |
| **Messaging & Alerting** | Slack, Microsoft Teams, Google Chat, Discord, PagerDuty, ZenDuty |
| **Ticketing** | Jira, ServiceNow, PagerDuty, ZenDuty, Freshdesk, GitHub, GitLab |
| **Webhooks** | Inbound alerts from Prometheus Alertmanager, Datadog, Azure Monitor, Grafana, GCP Monitoring, New Relic, Dynatrace, SolarWinds, Orion, Elasticsearch, OpenObserve, CubeAPM, SigNoz, PagerDuty, ZenDuty, ServiceNow, plus the generic **Event Webhook** and **Automation Webhook** |
| **Databases** | PostgreSQL, MySQL, ClickHouse, SQL Server, Oracle |
| **Observability** | Prometheus, Loki, Elasticsearch, OpenTelemetry, Jaeger, Grafana Tempo, Datadog, Dynatrace, New Relic, SigNoz, OpenObserve, CubeAPM, Observe, Chronosphere, Azure App Insights, Loggly, Splunk Enterprise, SolarWinds, Orion (SolarWinds Platform), Apache Pinot. Last9, Hive and Splunk Observability are listed but greyed out |
| **Repos** | GitHub, GitLab |
| **Messaging Queue** | RabbitMQ |
| **CI/CD** | ArgoCD, GitHub |
| **In-Memory** | Redis |
| **Docs** | Confluence |
| **LLM** | LLM providers, MCP servers, AI Gateway |
| **Servers** | SSH, Proxy Agent |

### Manage a connection

Click a card to open that provider's connections. **Add &lt;Provider&gt; Account** creates one. The list shows **Name**, **Connection Info** (the **URL** for webhooks), **Account**, **Created By**, **Updated By** and **Status**; filter by **Status** or name. Each row's menu offers, depending on the provider:

| Action | Does |
|---|---|
| **Edit** | Change the configuration (also while disabled) |
| **Enable** / **Disable** | Turn the connection on or off without deleting it |
| **Test Connection** | Check that NudgeBee can reach it (enabled connections that support a test) |
| **Activity Log** | Recent deliveries to an inbound webhook |
| **Set as default** | Make an LLM configuration the tenant default |
| **Regenerate Token** | Issue a new token for a Proxy Agent |
| **Delete** | Remove the connection — not offered for some webhook types or for connections installed by an agent |

Slack and Microsoft Teams also have **Channel-Account Mappings** (which channel receives which account's notifications) and **Webhook targets**; Slack also has **Watched Channels** when *Follow chat channels* is on.

Managing integrations needs a tenant admin or a role with **integrations** write access (observability providers can also be granted one by one). Read-only users see connections but not **Add** or the row menu.

## Available Integrations

### Kubernetes & Cloud

* **[Kubernetes clusters](../features/Kubernetes/)** — EKS, AKS, GKE, OpenShift and self-managed clusters, connected through the [NudgeBee agent](../installation/agent/). **Required**.
* **[AWS](../features/Cloud/AWS.md)**, **[Azure](../features/Cloud/Azure.md)**, **[GCP](../features/Cloud/GCP.md)** — Sync cloud accounts for cost, inventory and configuration context. See [Cloud fleet onboarding](../features/Cloud/cloud-fleet-onboarding.md). **Optional**.
* **Self-Hosted VMs** and **[Cloud Foundry](../features/Cloud/CloudFoundry.md)** — Bring non-Kubernetes workloads under the same monitoring and optimization model. **Optional**.

### Observability

* **[Observability](./Observability/)** — Connect your existing monitoring stack (Prometheus, Loki, Elasticsearch, OpenTelemetry, Datadog, New Relic, Dynatrace, SolarWinds, SigNoz and more) so NudgeBee can read metrics, logs and traces for troubleshooting and analysis. **Required** for core functionality.

### Alerts In, Notifications Out

* **[Webhooks](./Webhooks/)** — Inbound endpoints that let external monitoring and alerting tools push alerts into NudgeBee, where they become enriched, trackable events. **Recommended**.
* **[Notifications](./Notifications/)** — Outbound channels ([Slack](./Notifications/slack.md), [Microsoft Teams](./Notifications/msteams.md), [Google Chat](./Notifications/google_chat.md), Discord) for alerts, event summaries, and optimization recommendations. **Recommended**.

### Incident & Change Workflow

* **[Tickets](./Tickets/)** — Ticketing and incident systems ([Jira](./Tickets/jira.md), [ServiceNow](./Tickets/servicenow.md), [PagerDuty](./Tickets/pagerduty.md), [Zenduty](./Tickets/zenduty.md), [GitHub Issues](./Tickets/github_issues.md), [GitLab Issues](./Tickets/gitlab.md), Freshdesk) to create, track, and auto-respond to incidents. **Optional**.
* **[GitHub](./Code%20Repository/GitHub/github-integration.md)** — Code analysis and automated pull requests for optimization recommendations. **Optional**.
* **[GitLab](./Code%20Repository/GitLab/gitlab-integration.md)** — Issue tracking and automated merge requests. Bitbucket is listed in the repositories category but not yet available. **Optional**.
* **[CI/CD — ArgoCD](./CICD/argocd-integration.md)** — Deployment change correlation and rollback insights. **Optional**.

### Data Stores

* **[Databases](./Databases/)** — PostgreSQL, MySQL, ClickHouse, SQL Server and Oracle connections power [database health analysis](../features/ai/use-cases/database-health.md) and the [database tasks](../features/workflow-builder/database-tasks.md) available in workflows. **Optional**.
* **[Messaging Queue — RabbitMQ](./Messaging%20Queue/rabbitmq.md)** and **[In-Memory — Redis](./In-Memory/redis.md)** — Inspect queues, consumers and cache state, and drive them from workflows with the [message queue](../features/workflow-builder/message-queue-tasks.md) and [database](../features/workflow-builder/database-tasks.md) tasks. **Optional**.
* **[Docs — Confluence](./Docs/confluence.md)** — Index a Confluence space so runbooks and internal documentation become retrievable context for NuBi and AI troubleshooting. **Optional**.

### Access & Execution

* **Servers** — **[SSH](./Servers/ssh.md)** credentials for running commands on remote hosts from workflows, and the **[Proxy Agent](../installation/proxy-agent/)** for reaching private, on-prem or air-gapped endpoints. **Optional**.

### AI

* **[NudgeBee AI / LLM — BYOM](./LLM/)** — Integrate LLM models to power [NuBi](../features/ai/) and the pre-built AI agents for troubleshooting, root cause analysis, and agentic automation. SaaS users get a managed LLM by default; self-hosted users bring their own model (BYOM). An **[LLM Gateway](./LLM/Gateway/index.md)** integration is also available for holding several provider credentials side by side, including self-hosted OpenAI-compatible endpoints. **Recommended**.
* **[MCP (Model Context Protocol)](./MCP/)** — Connect external or on-prem MCP servers so their tools become available to NudgeBee AI tasks (`llm.mcp_call`, NuBi). Supports direct HTTP and Forager-proxied (HTTP or stdio) modes. **Optional**.

### Identity

* **[Authentication](./Authentication/)** — Integrate NudgeBee with an existing identity provider — OAuth SSO (Google, Okta, OneLogin, Azure AD / B2C, Auth0), LDAP, Teleport, or SAML 2.0. OAuth SSO and friends are available in every edition; SAML 2.0 is **Enterprise** and **Cloud** only. **Optional**.

:::note
Not every integration has a dedicated setup guide yet. Where a guide is missing, the configuration form in **Admin** > **Integrations** documents each field inline, and support can help with provider-specific requirements.
:::

---

## Verify an Integration After Setup or Credential Rotation

Saving credentials, passing a connection test, and receiving useful data are different checks. The available status indicators and tests vary by provider; there is no shared 15-minute health or 24-hour stale-data threshold for all integrations.

1. Open the configured integration and update the required credential fields.
2. Run its connection test when available, then save.
3. Exercise the capability you need: query observability data, synchronize a cloud account, or send a notification/create a ticket to a test destination.
4. Inspect the result and any provider error. A successful authentication test does not prove permissions for every feature.

Use the provider-specific troubleshooting guides below for the relevant checks.

## Provider-Specific Troubleshooting Guides

For troubleshooting specific integration providers, refer directly to the provider documentation:

- **Observability**: [Datadog](./Observability/datadog.md#troubleshooting-datadog-integration), [New Relic](./Observability/newrelic.md#troubleshooting-new-relic-integration), [Dynatrace](./Observability/dynatrace.md#troubleshooting-dynatrace-integration)
- **Notifications**: [Slack](./Notifications/slack.md#troubleshooting-slack-integration), [MS Teams](./Notifications/msteams.md#troubleshooting-ms-teams-integration), [Google Chat](./Notifications/google_chat.md#troubleshooting-google-chat-integration)
- **Tickets**: [Jira](./Tickets/jira.md#troubleshooting-jira-integration), [ServiceNow](./Tickets/servicenow.md#troubleshooting-servicenow-integration), [PagerDuty](./Tickets/pagerduty.md#troubleshooting-pagerduty-integration), [Ticketing Diagnostic Guide](./Tickets/ticket-integrations-troubleshooting.md)
- **Cloud**: [AWS](../features/Cloud/AWS.md#troubleshooting), [Azure](../features/Cloud/Azure.md#troubleshooting-azure-integration), [GCP](../features/Cloud/GCP.md#troubleshooting-gcp-integration), [Cloud Sync Troubleshooting](../features/Cloud/troubleshooting.md)
- **LLM**: [OpenAI](./LLM/OpenAI/index.md#troubleshooting-openai-integration), [AWS Bedrock](./LLM/Aws/bedrock.md#troubleshooting-amazon-bedrock-integration)

:::tip
**Recommended setup order**: Observability source first, then a notification channel, then an LLM provider. This gives you monitoring, alerts, and AI-powered insights right away.
:::
