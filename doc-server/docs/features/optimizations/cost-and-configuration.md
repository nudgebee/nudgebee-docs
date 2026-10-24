---
sidebar_position: 2
sidebar_label: Cost & Configuration
keywords: [optimize cost, right sizing, infra upgrade, spot instance, configuration checks, dismiss recommendation, snooze, reclaim volume, resize volume, gp3, safety]
---
# Optimize → Cost and Configuration

**Optimize → Cost** lists right sizing, infra upgrade and spot recommendations with their savings. **Optimize → Configuration** lists configuration checks. Both work the same way; differences are noted below.

## Cost

The cards at the top act as a category filter — click one, click again to clear: **Total Savings** ($/mo), **All Recommendations** (with Critical and High counts), **Right Sizing**, **Infra Upgrade** and **Spot Instance**, each with a count and $/mo.

### Filters and sorting

| Control | Options |
|---|---|
| **Search resource…** | Press Enter to apply |
| **Account**, **Rules** | Multi-select |
| **Savings** (Cost only) | *Any*, *≥ $1 /mo*, *≥ $5*, *≥ $10*, *≥ $25*, *Cost increase (< $0)* |
| **Last seen** | *Any time*, *Last hour*, *Last 24 hours*, *Last 7 days*, *Last 30 days*, *Not seen in 30+ days* |
| **Status** | *Open*, *In progress*, *Dismissed / snoozed* (empty = Open and In progress) |
| **Severity** chips | Critical, High, Medium, Low, Info — **Critical and High are selected by default** |
| **Safety** chips | *Safe*, *Quick check*, *Plan it*, *Not assessed* |
| **Sort by** | *Most severe*, *Highest savings*, *Last seen* |

**Clear all** resets the filters. The download icon exports the rows on the current page as CSV.

### The table

Columns: **Severity**, **Resource**, **Recommendation**, **Category**, **Safety**, **Savings** and **Last Seen**. Savings are the estimated change per month; a red negative value means applying it raises cost. Some cloud findings show *The cloud provider flags this as a cost finding but gives no savings figure*. See [how savings are calculated](./index.md#how-right-sizing-recommendations-are-calculated).

Row actions:

- **Optimize** (with write access, for workload right-sizing, unused and oversized volumes, abandoned workloads, and gp2 volumes) — opens the fix for that recommendation.
- **Ask NuBi**.
- The **⋮** menu: **Create ticket** (or the existing ticket), **Dismiss / snooze** or **Reactivate**, and **Copy CLI command**.

## Configuration

Configuration has no cards or Savings filter. With no rule or search selected, it groups findings by check — **Check**, **Severity**, **Findings**, **Accounts**. Open a check to see its resources: **Resource**, **Severity**, **Account**, **Last Seen**.

## Recommendation details

Clicking a recommendation opens its details, with the **Projected Savings** (or **Additional Cost**) at the top and tabs **Details**, **Evidence** and **History**. **Details** includes **Ownership** — **Assign owner** or **Change owner**.

The actions depend on the recommendation:

| Action | For | What happens |
|---|---|---|
| **Resolve** | Workload right-sizing | Opens *Resolve this issue* — see [Kubernetes → Optimize](../Kubernetes/optimize.md#apply-a-recommendation) |
| **Reclaim Volume** | Unused volumes | Type the volume name and confirm **Delete Volume**. This can't be undone. |
| **Resize Volume** | Oversized volumes | Enter the **New size** (Gi), pre-filled with the recommended size. Use a maintenance window. |
| **Scale Down Workload** | Abandoned workloads | Type the name and confirm **Scale Down**. Scales to 0 replicas and keeps the manifest. |
| **Upgrade to gp3** | gp2 EBS volumes | Converts the volume in place, with no downtime, in the background |
| **Setup HPA AutoPilot** | Replica right-sizing | Creates a [Horizontal Right Sizing](./autopilot/auto_optimize/index.md) rule |
| **Create Alarm** | Configuration findings that include an alarm | Creates the CloudWatch alarm |
| **Create Ticket**, **Copy Command**, **Ask NuBi** | Any | — |

Volume and workload actions run through the cluster's agent, so they're unavailable while it's disconnected (*Agent not connected*). Each is queued and shows up in [Resolutions](./resolutions.md).

### Dismiss or snooze

**Dismiss / snooze** asks for a **Duration** — *Permanent*, *7 days*, *30 days* or *90 days* — and an optional **Reason**. A snoozed recommendation comes back on its own when the time is up; **Reactivate** brings it back sooner.

## Related

- [Optimize overview](./index.md)
- [Kubernetes → Optimize](../Kubernetes/optimize.md)
- [Resolutions](./resolutions.md)
- [Auto Optimize](./autopilot/auto_optimize/index.md)
