---
sidebar_position: 1
sidebar_label: Installation Overview
---

# Installation Guide

Before you install anything, pick your deployment model. It decides which pages
you need — and, just as important, which ones you can skip.

## What NudgeBee Monitors

NudgeBee monitors **Kubernetes workloads**. It collects metrics, events, logs,
and traces from your clusters and feeds them into the
[Semantic Knowledge Graph](../features/knowledge-graph.md). One agent runs per
monitored cluster.

Two consequences worth knowing up front:

- **No Kubernetes clusters yet?** There is nothing for the agent to collect, so
  there is nothing to install. Come back once you have a cluster to monitor.
- **Non-Kubernetes resources** (databases on VMs, servers reachable over SSH,
  managed services like RDS or Cloud SQL) are reached through the
  [Proxy Agent](./proxy-agent/index.md), not the K8s Agent.

---

## Choose Your Deployment Model

There are two models. Both use the same Helm charts — "cloud vs on-prem" is not
a third path for the server, only a question of who runs it.

### Cloud SaaS

NudgeBee hosts and manages the server for you. You **only install the Agent** on
each cluster you want monitored. Sign up at
[app.nudgebee.com](https://app.nudgebee.com), generate your agent auth key in the
app, and go straight to [Agent Installation](./agent/installation/index.md).

### Self-Hosted

You run the server in your own Kubernetes cluster (or namespace), then connect
your monitored clusters to it. Install the
[Server](./server/index.md) **first**, then the
[Agent](./agent/installation/index.md) on each monitored cluster. Self-hosted
comes in two editions — free open-source **Community** and licensed
**Enterprise**; see [Editions](../editions.md).

:::info
The self-hosted server needs a Kubernetes cluster of its own to run on. If you
have no clusters at all, self-hosting is not an option — use Cloud SaaS.
:::

### Which One Is Mine?

| Your situation | Model | Where to go |
|---|---|---|
| Want the fastest start, don't want to run extra infrastructure | **Cloud SaaS** | [Agent Installation](./agent/installation/index.md) only |
| Data must stay inside your environment (residency, compliance, air-gapped) | **Self-Hosted** | [Server](./server/index.md) → then [Agent](./agent/installation/index.md) |
| Want a free, fully-functional deployment you control | **Self-Hosted** (Community) | [Editions](../editions.md) → [Server](./server/index.md) → [Agent](./agent/installation/index.md) |
| No Kubernetes clusters yet | **Cloud SaaS** | Nothing to monitor yet — add clusters first |

---

## Components

* [Server](./server/index.md) — The control plane: UI, Semantic Knowledge Graph, AI agents, and workflow engine. **Self-hosted only.**
* [K8s Agent](./agent/index.md) — Collector that runs in each Kubernetes cluster you want monitored. **Everyone installs this.**
* [Proxy Agent](./proxy-agent/index.md) — Bridge to datasources outside Kubernetes (VM databases, SSH servers, private networks). **Optional.**
