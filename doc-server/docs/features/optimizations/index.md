---
sidebar_position: 5
keywords: [optimize, optimization, cost savings, rightsizing, right sizing, recommendations, finops, auto optimize, savings calculation]
---
# Optimize

**Optimize** in the sidebar (`/optimise`) brings together every cost, performance, configuration and security recommendation NudgeBee finds across your Kubernetes clusters, cloud accounts and self-hosted VMs — and the automation that applies them.

:::info
**Prerequisites**: at least one connected [Kubernetes cluster](../../installation/agent/installation/) or [cloud account](../Cloud/index.md). Recommendations appear after the first scan and refresh as usage data accumulates.
:::

## The Optimize tabs

| Tab | What it shows |
|---|---|
| **[Summary](./summary.md)** | NuBi's briefing: potential savings, the findings to fix first, and cost by account |
| **[Cost](./cost-and-configuration.md)** | Right sizing, infra upgrade and spot recommendations with their savings |
| **[Configuration](./cost-and-configuration.md#configuration)** | Configuration checks, grouped by check |
| **[Security](./security.md)** | Image Scan, CIS Scan, VM Vulnerabilities and Cloud Posture |
| **[Resolutions](./resolutions.md)** | Every attempt to resolve a recommendation, and its outcome |
| **[Auto Optimize](./autopilot/auto_optimize/index.md)** | Automations that apply right-sizing for you, and their approvals |
| **[LLM Analyser](../ai/llm-analyser.md)** | NudgeBee's own AI spend (when the AI usage and cost tab is turned on) |
| **[AI Gateway](../ai/ai-gateway.md)** | AI Gateway usage (when the gateway is enabled for your installation) |

Each cluster and cloud account also has its own **Optimize** tab with the same recommendations for that account — see [Kubernetes → Optimize](../Kubernetes/optimize.md).

## Who can see and change what

- Summary, Cost, Configuration, Security and Resolutions need read access to **recommendations**; Auto Optimize needs read access to **auto optimize**. Tenant and account roles include both.
- Applying a fix, dismissing a recommendation and creating or changing an Auto Optimize rule need **write access** to the account.

## How right-sizing recommendations are calculated

For a Kubernetes workload, NudgeBee looks at **14 days** of CPU and memory usage (it needs enough data points before recommending anything):

| Setting | Recommendation |
|---|---|
| **CPU request** | The 99th percentile (P99) of observed CPU usage |
| **CPU limit** | Not set |
| **Memory request** | Peak observed usage plus 15% |
| **Memory limit** | At least the request, and above the container's highest recorded memory plus 15% |
| **After OOM kills** | Memory is raised by a further 25% |
| **Minimums** | 100m CPU and 100 MB memory |

When you apply a recommendation you can choose a different algorithm (**NB Algo**, **P99**, **P97** or **P95**) and add a CPU or memory buffer — see [Kubernetes → Optimize](../Kubernetes/optimize.md#apply-a-recommendation).

**Savings** are the reduction in requested CPU and memory, multiplied by the node's price per unit, the hours in a month and the number of replicas. They are shown in **USD per month**, even when an account is billed in another currency. A **negative** value means the recommendation *raises* cost — usually because a workload is under-provisioned; totals leave these out.

An **unused volume** is a persistent volume that no running pod mounts.

## Raise a pull request instead of patching

To keep Git as the source of truth, open a recommendation and choose **Create PR** in *Resolve this issue*:

1. Connect a [GitHub](../../integrations/Code%20Repository/GitHub/github-integration.md) or [GitLab](../../integrations/Code%20Repository/GitLab/gitlab-integration.md) integration.
2. On **Optimize → Cost** (or a cluster's **Optimize → Right Sizing**), click **Optimize** on the workload's row.
3. Click **Create PR** and choose the **Git Integration** and **In-place resize policy**. The repository is found from the workload's CI or Argo CD annotations — *No source configuration detected* means there are none.
4. NudgeBee's code agent opens the pull request in the background; follow it under [Resolutions](./resolutions.md).

## In this section

- [Summary](./summary.md)
- [Cost & Configuration](./cost-and-configuration.md)
- [Security](./security.md)
- [Resolutions](./resolutions.md)
- [Auto Optimize](./autopilot/auto_optimize/index.md)
- [Recommendations lifecycle](./recommendations-lifecycle.md)

### Watch a Walkthrough

<div style={{position: "relative", paddingBottom: "62.5%", height: 0}}><iframe src="https://www.loom.com/embed/cd617c360cc54fc98fad656bf91e63d0?sid=2b5ab1fb-b413-4c25-97cf-86fa86529e8a" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

## Related

- [Kubernetes → Optimize](../Kubernetes/optimize.md)
- [Cloud accounts](../Cloud/index.md)
- [Optimization-triggered automations](../workflow-builder/create-optimization-automation.md)
