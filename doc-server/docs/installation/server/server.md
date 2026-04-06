---
sidebar_position: 2
---
# Server

The NudgeBee Server is the central control plane of the NudgeBee platform. It hosts the [Semantic Knowledge Graph](../../features/knowledge-graph.md), the [AI-Agentic Workflow Engine](../../features/workflow-builder.md), and the 30+ [pre-built Cloud-Ops agents](../../features/ai/AI.md). It receives data from agents running in your Kubernetes clusters, performs analysis, serves the web UI, manages user authentication, and integrates with external services like notification channels, ticketing systems, and LLM providers. The self-hosted deployment gives you full data control within your own infrastructure while maintaining SOC 2 Type II and ISO 27001 compliance standards.

:::note
**Cloud SaaS users** do not need to install the server — it is fully managed for you. This section is for **self-hosted (on-prem)** deployments only. If you are a SaaS user, skip to the [Agent Installation](../agent/installation/installation.md).
:::

### When Do You Need This?

You need to install the NudgeBee Server if:
- Your organization requires data to stay within your own infrastructure (data residency or compliance requirements).
- You are deploying NudgeBee in an air-gapped or restricted network environment.
- You want full control over the NudgeBee platform, including upgrades and configuration.

### What You Will Find in This Section

- **[Installation](./installation.md)** — Step-by-step guide to deploy the server using Helm, including prerequisites, system requirements, and sample values files.
- **[Configuration](./secret_configs.md)** — Detailed configuration options, secrets, and environment variables.
- **[Helm Values](./helm_values.md)** — Complete reference for all Helm chart values.
- **[Upgrade](./upgrade.md)** — How to upgrade an existing NudgeBee server to a newer version.
- **[AWS Infrastructure Setup](./aws_infra_setup.md)** — Prepare your AWS environment before installation.
- **[Azure Infrastructure Setup](./azure_infra_setup.md)** — Prepare your Azure environment before installation.

## Architecture

![Server Architecture](/img/nb_server_architecture.png)




