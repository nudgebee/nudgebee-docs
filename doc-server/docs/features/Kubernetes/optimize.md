---
sidebar_position: 6
sidebar_label: Optimize
keywords: [right sizing, rightsizing, optimize, deploy fix, create pr, continuous auto optimize, schedule auto optimize, in-place resize, pvc rightsizing, replica rightsizing, spot, abandoned apps, unused volumes, best practices]
---

# Optimize

**Cluster → Optimize.** Cost and reliability recommendations for the cluster. Right Sizing, Unused Volumes, Best Practices, Abandoned Apps, PVC Rightsizing, Replica Rightsizing and Spot Recommendations show how many recommendations they have.

| Sub-tab | Shows |
|---|---|
| **Summary** | All recommendations at a glance |
| **Right Sizing** | CPU and memory requests to change, per workload |
| **Auto Scaler** | Your node autoscaler — see [Auto Scaler](./autoscaler.md) |
| **Unused Volumes** | Volumes nothing uses |
| **Best Practices** | Configuration rules a workload breaks |
| **Abandoned Apps** | Workloads with no network traffic |
| **PVC Rightsizing** | Persistent volume claims to resize |
| **Replica Rightsizing** | Replica counts to change |
| **Spot Recommendations** | Workloads that could run on spot nodes |
| **Recommendation Resolution** | What happened to recommendations you acted on |

The same recommendations for all clusters are under **Optimize → Cost** in the sidebar.

## Right Sizing

Columns **Name**, **Namespace**, **Kind**, **CPU Req/Recommended (Core)**, **Memory Req/Recommended (MB)**, **Updated at** and **Savings**, with totals for recommendations, cost and savings potential. Filter by **Namespace**, **Workload**, **Workload Type** or **Status** (default *Open*); **Download** as CSV or Excel.

### Apply a recommendation

Click **Optimize** on the row (needs write access; it says **Configured** once an autopilot is set up). *Resolve this issue* shows the recommended values per container, which you can adjust. Its footer has:

| Control | What it does |
|---|---|
| **Cancel** | Close without changes |
| **No-restart (in-place)** | On by default. *Resize running pods without a restart on Kubernetes 1.35+. Older clusters automatically fall back to a rolling restart.* |
| **Create Ticket** | File a ticket for the change instead |
| **Create PR** (Beta) | Open a pull request with the new values. The dialog asks for a **Git Integration** and an **In-place resize policy** (*In-place — resize without restart*, *Restart container on memory change*, or *Don't configure*). The repository is detected from the workload's CI or ArgoCD annotations; if none are found it says *No source configuration detected*. |
| **Continuous Auto Optimize** (Beta) | Keep applying recommendations automatically |
| **Schedule Auto Optimize** | Apply them on a schedule |
| **Deploy Fix** | Apply the change now. *Deploy Fix* patches the running pods directly, so on a GitOps-managed workload the change is reverted on the next sync — use **Create PR** instead. |

Continuous and Schedule are alternatives: if one is already active for the workload, its button opens that autopilot. A change of more than 4× up or 75% down asks you to confirm, and recommendations rated Review or Risky need an extra safety acknowledgement.

## Other sub-tabs

- **Unused Volumes** — **Name**, **Last Namespace**, **Last Claim**, **Size**, **Savings/mo**, **Created At**, **Updated At**; download as CSV or Excel.
- **Best Practices** — **Name**, **Severity**, **Object Type**, **Namespaces**, **Object Names**, **Updated At**, **Description**; filter by rule, namespace, severity or status.
- **Abandoned Apps** — **Resource Name**, **Object Type**, **Namespaces**, **Network Traffic (bytes)**, **Observation Duration**, **Savings/mo**, **Updated At**.
- **Spot Recommendations** — **Application**, **Type**, **Namespace**, **Estimated Savings**, **Updated At**; **Download**.
- **PVC Rightsizing** and **Replica Rightsizing** need Prometheus. Without it they show *Prometheus is not connected for this cluster* with a link to [Agent Health](../../installation/agent/operate/agent-health.md).

## Related

- [Optimizations](../optimizations/index.md)
- [Auto Scaler](./autoscaler.md)
- [Workloads & Pods](./workloads-and-pods.md)
