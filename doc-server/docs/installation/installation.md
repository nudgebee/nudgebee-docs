---
sidebar_position: 1
---

# Installation

This section walks you through installing NudgeBee. NudgeBee supports flexible deployment — **cloud SaaS** or **self-hosted** — across AWS, Azure, GCP, and on-premises Kubernetes environments. The platform is **SOC 2 Type II** and **ISO 27001** certified. The installation process depends on your deployment model and has two main components: the **Server** and the **Agent**.

## What Gets Installed

NudgeBee has two main components:

- **[NudgeBee Server](./server/server.md)** — The central control plane that receives data from agents, performs analysis, serves the web UI, and manages integrations. **Self-hosted users** install this on a Kubernetes cluster. **Cloud SaaS users** can skip this — the server is managed for you at [app.nudgebee.com](https://app.nudgebee.com).

- **[NudgeBee Agent](./agent/agent.md)** — A lightweight agent that runs inside each Kubernetes cluster you want to monitor. It collects metrics, events, and workload data, and sends it to the NudgeBee server. **All users** (both SaaS and self-hosted) install agents on the clusters they want to monitor.

:::info
If you are a **Cloud SaaS** user, you only need to install the Agent. Skip directly to the [Agent Installation Guide](./agent/installation/installation.md).
:::

## Installation Order

For self-hosted deployments, install in this order:

1. **[Install the Server](./server/installation.md)** — Deploy the NudgeBee control plane on a Kubernetes cluster.
2. **[Install the Agent](./agent/installation/installation.md)** — Deploy agents on each Kubernetes cluster you want to monitor.
3. **[Configure Integrations](../integrations/integrations.md)** — Connect observability tools, notification channels, LLMs, and other services.

:::tip
Estimated time: Server installation typically takes 15–30 minutes. Agent installation takes 5–10 minutes per cluster.
:::

## What You Will Find in This Section

- **[Server](./server/server.md)** — Architecture, system requirements, and installation instructions for the NudgeBee control plane.
  - [Server Installation](./server/installation.md) — Step-by-step server deployment guide.
  - [Server Configuration](./server/secret_configs.md) — Configuration options and secrets management.
  - [Helm Values Reference](./server/helm_values.md) — Full list of Helm chart configuration values.
  - [Server Upgrade](./server/upgrade.md) — How to upgrade an existing server installation.
  - [AWS Infrastructure Setup](./server/aws_infra_setup.md) — AWS-specific infrastructure preparation.
  - [Azure Infrastructure Setup](./server/azure_infra_setup.md) — Azure-specific infrastructure preparation.

- **[Agent](./agent/agent.md)** — Architecture, components, and installation instructions for the NudgeBee agent.
  - [Agent Installation](./agent/installation/installation.md) — Step-by-step agent deployment guide.
  - [Helm Values Reference](./agent/installation/helm_values.md) — Agent Helm chart configuration values.
  - [Upgrade](./agent/installation/upgrade.md) — How to upgrade an existing agent installation.
  - [Proxy Agent](./agent/proxy-agent/overview.md) — Deploy agents through a proxy for restricted environments.
  - [Local Setup](./agent/local-setup.md) — Run NudgeBee locally for development and testing.
  - [On-Prem Setup](./agent/onprem-setup.md) — Additional setup for air-gapped or on-premises environments.
