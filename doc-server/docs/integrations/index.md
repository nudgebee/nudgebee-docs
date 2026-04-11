---
sidebar_position: 1
---

# Integrations

NudgeBee ships with **30+ integrations** that connect to the tools and platforms you already use — observability systems, notification channels, ticketing systems, code repositories, CI/CD pipelines, and LLM providers. No need to manually code connectors; each integration is ready to configure and extends NudgeBee's Cloud-Ops Intelligence.

You do not need to set up all integrations at once. Start with the essentials (observability and notifications), then add more as needed.

:::info
Some integrations are **required** for NudgeBee to function (Kubernetes cluster and observability source). Others are **optional** and unlock additional capabilities. See the [capability map](../features/) for a full breakdown of what each integration enables.
:::

## Available Integrations

* **[Observability](./Observability/)** — Connect your existing monitoring tools (Prometheus, Datadog, New Relic, Azure Monitor, etc.) so NudgeBee can access metrics, logs, and traces for troubleshooting and analysis. **Required** for core functionality.

* **[Notifications](./Notifications/)** — Configure notification channels ([Slack](./Notifications/slack.md), [Microsoft Teams](./Notifications/msteams.md), [Google Chat](./Notifications/google_chat.md)) to receive alerts, event summaries, and optimization recommendations. **Recommended**.

* **[NudgeBee AI / LLM — BYOM](./LLM/)** — Integrate LLM models to power [NuBi](../features/ai/) and the pre-built AI agents for troubleshooting, root cause analysis, and agentic automation. SaaS users get a managed LLM by default; self-hosted users bring their own model (BYOM). **Recommended**.

* **[Tickets](./Tickets/)** — Connect ticketing systems ([Jira](./Tickets/jira.md), [ServiceNow](./Tickets/servicenow.md), [PagerDuty](./Tickets/pagerduty.md), [GitHub Issues](./Tickets/github_issues.md), [GitLab Issues](./Tickets/gitlab.md)) to create, track, and auto-respond to incidents. **Optional**.

* **[GitHub](./Code%20Repository/GitHub/github-integration.md)** — Connect GitHub for code analysis and automated pull requests for optimization recommendations. **Optional**.

* **[GitLab](./Code%20Repository/GitLab/gitlab-integration.md)** — Connect GitLab for issue tracking and automated merge requests. **Optional**.

* **[CI/CD - ArgoCD](./CICD/argocd-integration.md)** — Connect ArgoCD for deployment change correlation and rollback insights. **Optional**.

* **[Authentication](./Authentication/)** — Integrate NudgeBee with an existing authentication system (Google, Azure, Okta, Auth0). Only applicable for on-prem deployments. **Optional**.

:::tip
**Recommended setup order**: Observability source first, then a notification channel, then an LLM provider. This gives you monitoring, alerts, and AI-powered insights right away.
:::
