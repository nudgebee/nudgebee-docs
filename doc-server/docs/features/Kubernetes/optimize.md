---
sidebar_position: 6
sidebar_label: Optimize
keywords: [right sizing, rightsizing, optimize, deploy fix, create pr, continuous auto optimize, schedule auto optimize, in-place resize, pvc rightsizing, replica rightsizing, spot, abandoned apps, unused volumes, best practices]
---

# Optimize

**Cluster → Optimize.** Cost and reliability recommendations for the cluster. Each sub-tab shows how many recommendations it has.

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

The same recommendations for all clusters are under **Optimize** in the sidebar.

## Right Sizing

Columns **Name**, **Namespace**, **Kind**, **CPU Req/Recommended (Core)**, **Memory Req/Recommended (MB)**, **Updated at** and **Savings**, with totals for recommendations, cost and savings potential. Filter by **Namespace**, **Workload**, **Workload Type** or **Status** (default *Open*); **Download** as CSV or Excel.

### Apply a recommendation

Click **Optimize** on the row (needs write access; it says **Configured** once an autopilot is set up). *Resolve this issue* shows the recommended values per container, which you can adjust, and four ways to apply them:

| Button | What it does |
|---|---|
| **Create PR** (Beta) | Opens a pull request with the new values in your repository. Pick the Git integration and repository in the dialog. You can also link the workload to its repository with **Git** on its row menu |
| **Deploy Fix** | Applies the change to the cluster now. If the workload is managed by GitOps, the next sync reverts it — use **Create PR** instead. |
| **Continuous Auto Optimize** | Keeps applying recommendations automatically |
| **Schedule Auto Optimize** | Applies them on a schedule |

**No-restart (in-place)** resizes running pods without restarting them, on Kubernetes 1.35 and later. Large changes ask you to confirm.

## Other sub-tabs

- **Best Practices** — **Name**, **Severity**, **Object Type**, **Namespaces**, **Object Names**, **Description**; filter by rule, namespace, severity or status.
- **Abandoned Apps** — **Resource Name**, **Object Type**, **Network Traffic (bytes)**, **Observation Duration**, **Savings/mo**.
- **PVC Rightsizing** and **Replica Rightsizing** need Prometheus. Without it they show *Prometheus is not connected for this cluster* with a link to [Agent Health](../../installation/agent/operate/agent-health.md).

## Related

- [Optimizations](../optimizations/index.md)
- [Auto Scaler](./autoscaler.md)
- [Workloads & Pods](./workloads-and-pods.md)
