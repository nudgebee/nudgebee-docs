---
sidebar_position: 1
sidebar_label: Installation Overview
---

# Choose Your Deployment Model

Before you install, select the deployment model that matches your organization's requirements:

- **Cloud SaaS** — NudgeBee hosts and manages the server control plane for you. You only install the **NudgeBee Agent** on each Kubernetes cluster you want monitored (or connect a cloud account for instant discovery). Generate your auth key in the UI and go straight to [Agent Installation](./agent/installation/index.md).
- **Self-Hosted** — You run the **NudgeBee Server** inside your own Kubernetes cluster, giving you full data ownership and air-gapped support. Deploy the [Server](./server/index.md) first, then install the [Agent](./agent/installation/index.md) on each monitored cluster.

:::info Scope & Infrastructure Prerequisites
**Kubernetes-Specialized**: NudgeBee monitors Kubernetes workloads.
- **Have Kubernetes clusters to monitor?** Choose either Cloud SaaS or Self-Hosted.
- **No Kubernetes clusters at all?** The self-hosted server requires a Kubernetes cluster (v1.27+) to run on. If you do not have Kubernetes infrastructure, self-hosting is not an option — use **Cloud SaaS**, and add clusters when you are ready to monitor them.
:::

---

## Decision Matrix

Use the table below to determine the exact path for your setup:

| Your Situation | Recommended Model | Where to Go |
|---|---|---|
| **Want fastest start & zero infra management** | **Cloud SaaS** | [Agent Installation](./agent/installation/index.md) (or [Cloud Account Discovery](../features/Cloud/index.md)) |
| **Strict data residency / air-gapped environment** | **Self-Hosted** | [Server Installation](./server/index.md) → then [Agent Installation](./agent/installation/index.md) |
| **Evaluating free open-source edition** | **Self-Hosted (Community)** | [Server Installation](./server/index.md) (select Community edition) |
| **No Kubernetes clusters yet** | **Cloud SaaS** | Sign up at [app.nudgebee.com](https://app.nudgebee.com) — add clusters when ready |

---

## Installation Components

* **[Server Installation](./server/index.md)** — *(Self-hosted only)* Deploy the central control plane, Semantic Knowledge Graph, and workflow engine to your Kubernetes cluster.
* **[K8s Agent Installation](./agent/installation/index.md)** — *(Everyone)* Install the lightweight collector DaemonSet and runner into each Kubernetes cluster you want to monitor.
* **[Proxy Agent](./proxy-agent/index.md)** — *(Optional)* Deploy secure proxy connectivity to private datasources, isolated databases, or internal endpoints.

