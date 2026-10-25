---
sidebar_position: 7
sidebar_label: Auto Scaler
keywords: [auto scaler, autoscaler, karpenter, cluster autoscaler, gke autoscaling, node pool, node class, auto scaler is not configured]
---

# Auto Scaler

**Cluster → Optimize → Auto Scaler.** NudgeBee detects the node autoscaler running in the cluster and shows views for it:

| Autoscaler | Views |
|---|---|
| **Karpenter** | Summary, Logs, Node Pool, Node Class, Events |
| **Cluster Autoscaler** | Summary, Logs, Deployment File, Events |
| **GKE autoscaling** | Summary, Logs |

- **Summary** — node trends (and zones, for Karpenter).
- **Logs** — pick the autoscaler's pod to read its logs.
- **Events** — node claim events.
- **Node Pool** and **Node Class** (Karpenter) — view and edit them, and with write access add a node pool with **Create New Node Pool**: instance family, CPU, zone, capacity type, architecture, type and category, consolidation policy, expiry, node budget, labels and taints; for node classes the AMI family and block devices.

## "Auto Scaler is NOT configured"

NudgeBee found no autoscaler in the cluster. The screen links to setup guides for your provider — Karpenter or AWS Auto Scaling on EKS, and the Kubernetes Cluster Autoscaler on AKS, GKE and Civo. See [Cluster Autoscaler](../../installation/agent/operate/cluster-autoscaler/index.md).

## Related

- [Optimize](./optimize.md)
- [Kubernetes](./index.md)
