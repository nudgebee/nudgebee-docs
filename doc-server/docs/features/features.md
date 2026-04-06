---
sidebar_position: 1
---

# Welcome to NudgeBee

NudgeBee is an **AI Agents & Agentic Workflow Platform for SRE, CloudOps, and Support Teams**. It combines 30+ pre-built Cloud-Ops AI agents with a customizable workflow engine to deliver faster troubleshooting, lower cloud costs, automated operations, and improved team productivity — across AWS, Azure, GCP, and on-premises Kubernetes environments.

NudgeBee's Semantic Knowledge Graph correlates logs, metrics, traces, and code to give your team Cloud-Ops Intelligence that reduces MTTR from hours to minutes. Pre-packaged but not a black box — every agent and workflow is fully extensible, modular, and controllable.

<div style={{position: "relative", paddingBottom: "62.5%", height: 0}}><iframe src="https://www.loom.com/embed/0691f374484541468dcfb6d71fedd817?sid=970a6eb4-c0e9-40a2-b2c9-9ba145231f54" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

---

## Deployment Models

NudgeBee is available in two deployment models. Choose the one that fits your organization's requirements:

| | **Cloud SaaS** | **Self-Hosted (On-Prem)** |
|---|---|---|
| **How it works** | NudgeBee hosts and manages the server for you. You connect your infrastructure to the NudgeBee cloud. | You install the NudgeBee server on your own Kubernetes cluster. |
| **Best for** | SRE, CloudOps, and Support teams that want to get started quickly without managing additional infrastructure. | Organizations with strict data residency, compliance, or air-gapped environment requirements. |
| **Security** | SOC 2 Type II and ISO 27001 certified. | Full data control within your own infrastructure. |
| **Get started** | Sign up at [app.nudgebee.com](https://app.nudgebee.com) | Follow the [Server Installation Guide](../installation/server/installation.md) |

---

## How NudgeBee Connects to Your Infrastructure

NudgeBee monitors your Kubernetes workloads by collecting metrics, events, logs, and traces from your clusters. This data feeds the Semantic Knowledge Graph and powers all of NudgeBee's troubleshooting, optimization, and automation capabilities.

NudgeBee has two components, both packaged as Helm charts that deploy natively on Kubernetes — no separate VMs, custom installers, or complex setup required:

| Component | What it does | Who installs it |
|---|---|---|
| **[NudgeBee Server](../installation/server/installation.md)** | The control plane — hosts the UI, Semantic Knowledge Graph, AI agents, and workflow engine. | **Self-hosted users only.** Cloud SaaS users skip this — NudgeBee hosts it for you. |
| **[NudgeBee Agent](../installation/agent/installation/installation.md)** | Lightweight collector that runs inside each cluster you want to monitor. Collects workload data and sends it to the server. | **Everyone** — both SaaS and self-hosted users. |

:::info
**Self-hosted users**: You need a dedicated Kubernetes cluster (or namespace) to run the NudgeBee Server before connecting your monitored clusters. See the [Server Installation Guide](../installation/server/installation.md) for requirements — typically a 2-node cluster with 16 GB RAM and 4 cores per node is sufficient for up to 400 monitored nodes.
:::

Once the server is running (or you have signed up for SaaS), there are two ways to connect your monitored infrastructure — both take just a few minutes:

### Option 1: Connect a Cloud Account — Fastest Way to Start

Connect your cloud account ([AWS](./Cloud/AWS.md), [Azure](./Cloud/Azure.md), or [GCP](./Cloud/GCP.md)) and NudgeBee automatically discovers all Kubernetes clusters mapped to that account. You get immediate visibility across your entire cloud infrastructure — no need to install anything on individual clusters upfront.

### Option 2: Install the Agent Directly on a Cluster

Install the [NudgeBee Agent](../installation/agent/installation/installation.md) directly into each Kubernetes cluster you want to monitor. The agent is a lightweight Helm chart that takes about 5 minutes to deploy. It collects detailed workload data and sends it to the NudgeBee server for deep monitoring, cost analysis, and AI-powered troubleshooting.

:::tip
**Not sure which to pick?** If you have multiple clusters across cloud accounts, start with the cloud account connection for instant discovery. You can always install agents on specific clusters later for deeper monitoring and automation capabilities.
:::

---

## LLM Configuration Options — BYOM (Bring Your Own Model)

NudgeBee uses flexible AI models — including modular SLMs, LLMs, and specialized agents — for AI-powered troubleshooting, root cause analysis, and agentic automation. You have three options for configuring the LLM:

| Option | Description | Best for |
|---|---|---|
| **NudgeBee-Provided LLM API** | NudgeBee manages the LLM for you. No configuration needed. | Cloud SaaS users who want zero setup. |
| **BYOM — Your Own Licensed LLM Provider** | Connect your own API key from [OpenAI](../integrations/LLM/OpenAI/openai.md), [Azure OpenAI](../integrations/LLM/Azure/azure-openai.md), [AWS Bedrock](../integrations/LLM/Aws/bedrock.md), [Google Vertex AI](../integrations/LLM/Google/vertex-ai.md), or [Gemini](../integrations/LLM/Google/gemini.md). | Teams that already have LLM provider contracts or want to control model selection. |
| **Self-Hosted / Internal LLM** | Use [Ollama](../integrations/LLM/Ollama/nb-ollama.md), [HuggingFace](../integrations/LLM/HuggingFace/nb-hugging-face.md), or [AWS SageMaker](../integrations/LLM/Aws/sagemaker.md) with your own models. | Organizations with data privacy requirements or custom-trained models. |

:::note
SaaS users get a NudgeBee-managed LLM by default. The [LLM integration section](../integrations/LLM/) is primarily for self-hosted users or those who want to use their own LLM provider.
:::

---

## What You Can Do with NudgeBee

NudgeBee ships with 30+ pre-built Cloud-Ops Agents and 30+ integrations. Capabilities grow as you connect more of your stack. The table below shows what each integration unlocks.

| Integration | What It Unlocks | Required? |
|---|---|---|
| **[Kubernetes cluster](../installation/agent/installation/installation.md)** or **[Cloud account](./Cloud/AWS.md)** | Core monitoring, [Semantic Knowledge Graph](./knowledge-graph.md), [cost optimizations](./optimizations.md) | **Required** (one of the two) |
| **[Observability source](../integrations/Observability/)** (Prometheus, Datadog, New Relic, etc.) | Metrics, [SLOs](./slo.md), alerting, [troubleshooting](./troubleshooting/troubleshooting.md) | **Required** |
| **[LLM connection](../integrations/LLM/)** | NuBi AI agent, AI-powered troubleshooting, pre-built agents, [auto-runbooks](./autopilot/auto_runbook/auto_runbook.md) | Recommended |
| **[IM channel](../integrations/Notifications/)** (Slack, Teams, Google Chat) | [Notifications](./notifications.md), interactive alerts, ChatOps | Recommended |
| **Email** | Email notifications and daily reports | Optional |
| **[GitHub](../integrations/GitHub/github-integration.md)** / **[GitLab](../integrations/GitLab/gitlab-integration.md)** | Auto-PRs for optimization recommendations, code-level troubleshooting | Optional |
| **[CI/CD system](../integrations/CICD/argocd-integration.md)** (ArgoCD) | Deployment change correlation, rollback insights | Optional |
| **[Ticketing system](../integrations/Tickets/)** (Jira, ServiceNow, PagerDuty, GitHub Issues, GitLab Issues) | Ticket creation, auto-responses, similar-issue search, runbook references | Optional |
| **[Authentication provider](../integrations/Authentication/)** | SSO / SAML integration (on-prem only) | Optional |

---

## Quick Start: The Fastest Way to Get Started

Follow these steps to go from zero to a working NudgeBee setup. The path differs slightly depending on whether you are using Cloud SaaS or self-hosting.

| Step | Cloud SaaS | Self-Hosted |
|---|---|---|
| **1. Get access** | [Sign up at app.nudgebee.com](https://app.nudgebee.com) — no installation needed, you are ready in seconds. | [Install the NudgeBee Server](../installation/server/installation.md) on a Kubernetes cluster. Takes 15–30 minutes. |
| **2. Connect your clusters** | [Install the Agent](../installation/agent/installation/installation.md) on each cluster, or [connect a cloud account](./Cloud/AWS.md) for auto-discovery. | Same — [install the Agent](../installation/agent/installation/installation.md) or [connect a cloud account](./Cloud/AWS.md). |
| **3. Connect observability** | Connect your existing monitoring tools (Prometheus, Datadog, New Relic, etc.). See [Observability Integrations](../integrations/Observability/). | Same — connect your monitoring tools. |
| **4. Enable AI** | Already included — a managed LLM is provided. Nothing to configure. | [Connect an LLM provider](../integrations/LLM/) (BYOM) to enable NuBi and AI-powered troubleshooting. |
| **5. Set up notifications** | Connect [Slack](../integrations/Notifications/slack.md), [Teams](../integrations/Notifications/msteams.md), or [Google Chat](../integrations/Notifications/google_chat.md). | Same — connect your messaging tool. |
| **6. Explore** | You are ready! Check [Optimizations](./optimizations.md), [Troubleshooting](./troubleshooting/troubleshooting.md), and the [Semantic Knowledge Graph](./knowledge-graph.md). | Same — start exploring the dashboard. |

:::tip
Steps 3–5 can be done in any order. Each integration adds capabilities independently — you do not need to complete everything before you start seeing value.
:::

---

## First Login and Onboarding

### Accessing NudgeBee

After installation or sign-up, access the NudgeBee UI:

- **Cloud SaaS**: Go to [app.nudgebee.com](https://app.nudgebee.com) and log in with your email.
- **Self-hosted with DNS/Ingress**: Navigate to the URL you configured during server installation.
- **Self-hosted without DNS**: Use port-forwarding to access the UI locally:
  ```shell
  kubectl port-forward svc/app 3000:80 -n nudgebee
  ```
  Then open `http://localhost:3000` in your browser.

### Login Options

NudgeBee supports multiple authentication methods:

- **SSO (Single Sign-On)**: Log in with Google, Azure, Okta, or Auth0. Available when [authentication integration](../integrations/Authentication/) is configured.
- **Magic Link**: Enter your email address and receive a one-time login link — no password needed. This is the default method when SSO is not configured.
- **Admin Invite**: If your team admin has added you, you will receive an email invitation with a login link.

:::info
NudgeBee does not store passwords. Authentication is handled through SSO providers or magic email links, keeping your login secure and simple.
:::

### What to Do After Your First Login

Once you are logged in, here is what to explore first:

1. **Start saving on cloud costs** — Go to **Optimizations** to see immediate cost-saving and performance improvement recommendations. The FinOps AI-Assistant has already analyzed your resource utilization and identified right-sizing, scaling, and cleanup opportunities — most teams find actionable savings within minutes.

2. **Resolve incidents faster with AI** — Navigate to **Troubleshoot** to see real-time events across your clusters. If an LLM is connected, NuBi (the SRE AI Agent) can analyze incidents and suggest root causes in plain language — reducing your MTTR from hours to minutes.

3. **Get alerted on what matters** — Configure a [notification channel](../integrations/Notifications/) (Slack, Teams, or Google Chat) so your team receives alerts for critical events, anomalies, and optimization opportunities without needing to check the dashboard.

4. **Automate repetitive operations** — Use the [Workflow Builder](./workflow-builder.md) (AI-Agentic Workflow Engine) to automate common tasks like health checks, scaling, or incident response in minutes. Choose from rule-based workflows or agentic modes with human-in-loop approvals — no coding required.

5. **Understand your infrastructure at a glance** — Navigate to **Troubleshoot > Knowledge Graph** to see how all your services, workloads, and dependencies connect. The Semantic Knowledge Graph correlates logs, metrics, traces, and code into a single visual map — it populates automatically once a cluster or cloud account is connected.

---

## Architecture Overview

```mermaid
graph TB
    subgraph Your Infrastructure
        K8S[Kubernetes Clusters]
        CLOUD[Cloud Accounts<br/>AWS / Azure / GCP]
        OBS[Observability Tools<br/>Prometheus / Datadog / New Relic]
    end

    subgraph NudgeBee Platform
        SERVER[NudgeBee Server]
        AGENT[NudgeBee Agent]
        SKG[Semantic Knowledge Graph]
        LLM_ENGINE[AI Agents & LLM Engine]
        WORKFLOW[AI-Agentic Workflow Engine]
    end

    subgraph Integrations - Optional
        IM[IM Channels<br/>Slack / Teams / Google Chat]
        TICKET[Ticketing<br/>Jira / ServiceNow / PagerDuty]
        REPO[Code Repos<br/>GitHub / GitLab]
        CICD[CI/CD<br/>ArgoCD]
    end

    K8S -->|Agent installed| AGENT
    CLOUD -->|Auto-discovery| SERVER
    OBS -->|Metrics, Logs, Traces| SERVER
    AGENT -->|Data collection| SERVER
    SERVER --> SKG
    SKG <-->|Cloud-Ops Intelligence| LLM_ENGINE
    LLM_ENGINE --> WORKFLOW
    SERVER -->|Notifications| IM
    SERVER -->|Tickets| TICKET
    SERVER -->|Auto-PRs| REPO
    SERVER -->|Deployment data| CICD

    style K8S fill:#e1f5fe
    style CLOUD fill:#e1f5fe
    style OBS fill:#e1f5fe
    style SERVER fill:#e8f5e9
    style AGENT fill:#e8f5e9
    style SKG fill:#e8f5e9
    style LLM_ENGINE fill:#e8f5e9
    style WORKFLOW fill:#e8f5e9
    style IM fill:#fff3e0
    style TICKET fill:#fff3e0
    style REPO fill:#fff3e0
    style CICD fill:#fff3e0
```

---

## What You Will Find in This Section

- **[Troubleshooting](./troubleshooting/troubleshooting.md)** — Resolve incidents faster with AI-powered root cause analysis. NuBi correlates events across metrics, logs, and traces to pinpoint the root cause — so your team spends minutes, not hours, on each incident.

- **[Optimizations](./optimizations.md)** — Lower your cloud costs with actionable recommendations. The FinOps AI-Assistant continuously analyzes resource utilization and identifies right-sizing, scaling, and cleanup opportunities across all your clusters.

- **[AI & Pre-built Agents](./ai/AI.md)** — Get intelligent analysis out of the box with 30+ pre-built Cloud-Ops agents. NuBi (the SRE AI Agent) and specialized agents for logs, metrics, traces, Kubernetes, databases, and code work together to automate investigation and decision-making.

- **[Workflow Builder](./workflow-builder.md)** — Automate any operational process in minutes with the AI-Agentic Workflow Engine. Build visual, multi-step workflows using drag-and-drop — triggered manually, on a schedule, via webhook, or in response to events — with no coding required.

- **[Autopilot](./autopilot/autopilot.md)** — Eliminate repetitive toil with self-healing automation. Configure automated runbooks that detect issues and take corrective action — restarting pods, scaling workloads, creating tickets — before your team even sees the alert.

- **[Notifications](./notifications.md)** — Stay informed without watching dashboards. Route alerts for critical events, anomalies, and recommendations to the right Slack channel, Teams room, or Google Chat space — with rules to suppress noise from non-production environments.

- **[Semantic Knowledge Graph](./knowledge-graph.md)** — See how everything connects across your entire infrastructure. The Semantic Knowledge Graph correlates logs, metrics, traces, and code into a single visual map of services, workloads, and dependencies — powering NudgeBee's AI analysis.

- **[Kubernetes](./Kubernetes/Kubernetes.md)** — Monitor all your connected Kubernetes clusters, workloads, pods, and nodes from a single dashboard. Track cluster health, resource utilization, and workload status in real time.

- **[Cloud](./Cloud/AWS.md)** — Connect your AWS, Azure, or GCP accounts for automatic cluster discovery and unified cloud cost visibility. NudgeBee maps your cloud resources and Kubernetes clusters without manual configuration.

- **[Tickets](./tickets.md)** — Turn incidents into trackable tickets automatically. Create, assign, and manage tickets in Jira, ServiceNow, PagerDuty, or GitHub Issues directly from NudgeBee — or let Autopilot do it for you.

- **[SLO](./slo.md)** — Define and track Service Level Objectives to ensure your services meet reliability targets. Get alerted when SLOs are at risk and use historical data to make informed capacity decisions.

- **[Security](./security.md)** — Enterprise-grade security with SOC 2 Type II and ISO 27001 certification. Includes SSO authentication, role-based access control, approval workflows, and full audit trails for every action.

- **[User Management](./user-management.md)** — Invite team members, assign admin or read-only roles, and control access at both tenant and account level. New users get started instantly via email invite — no password setup needed.
