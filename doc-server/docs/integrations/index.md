---
sidebar_position: 1
---

# Integrations

NudgeBee ships with **60+ integration types** that connect to the tools and platforms you already use — Kubernetes and cloud accounts, observability systems, inbound alert webhooks, notification channels, ticketing systems, code repositories, CI/CD pipelines, databases and data stores, knowledge bases, and LLM providers. No need to manually code connectors; each integration is ready to configure and extends NudgeBee's Cloud-Ops Intelligence.

You do not need to set up all integrations at once. Start with the essentials (a Kubernetes cluster and an observability source), then add more as needed.

:::info
Some integrations are **required** for NudgeBee to function (Kubernetes cluster and observability source). Others are **optional** and unlock additional capabilities. See the [capability map](../features/) for a full breakdown of what each integration enables.
:::

All integrations are configured from **Admin** > **Integrations**, where they are grouped into the categories below.

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
* **[GitLab](./Code%20Repository/GitLab/gitlab-integration.md)** — Issue tracking and automated merge requests. Bitbucket is also available in the repositories category. **Optional**.
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
