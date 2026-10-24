---
sidebar_position: 3
sidebar_label: Workloads & Pods
keywords: [applications, workloads, pods, nodes, namespace, pvc, restart deployment, scale, delete workload, pod details, debug pod]
---

# Workloads & Pods

**Cluster → Apps & Infra.** Every list expands a row into more tabs.

## Applications (workloads)

| Column | Meaning |
|---|---|
| **Application Name**, **Created At** | The workload |
| **Cost** | Its cost |
| **Replicas** | Running replicas |
| **CPU (all replicas)**, **Memory (all replicas)** | Usage |
| **Error Count (24h)** | Errors in the last day |
| **SLO (24h)** | SLO status |
| **Events (High)** | High-priority events |
| **Optimisations/Autopilots** | Open recommendations and active autopilots |

Filter by **Namespace**, **Workload Type** or name, pick a date range (default last 30 days), or **Download**. A strip above the list counts workloads by kind, errors, events, **Savings Potential (/yr)** and **MTD Cost**.

**Row menu** (needs write access):

- Every workload: **Logs**, **Edit**, **Scan Image**, **SLO**, **Git**.
- Deployments, StatefulSets and Rollouts also: **Auto Optimize** (**Horizontal Rightsizing** or **Vertical Rightsizing**), **Restart**, **Scale** and **Delete**. Restart and Delete ask you to confirm; Delete asks you to type the workload name.
- **Git** links the workload to its repository: **Git Integration**, **Repository**, **Code Repository URL**, **CI repo is same as code repo**, **CI Repository URL**, **Branch** and **Helm Values File Path**. NudgeBee uses this to open fix pull requests.

**Row tabs:** Details, Ownership, Pods, Utilization Trends, Cost Trends, Recent Events, Service Map, Deployments, Security, SLO, Profilers, Traces (last 24 h), Logs (last 60 min), App Dashboard, Recommendations and Log Group.

## Pods

Columns **Pod Name**, **Namespace**, **Created At**, **Cost**, **CPU**, **Memory**, **Status/State**, **Restarts** and **Error Count (24h)**; filter by **Namespace**, **Workload Type**, **State**, **Status** or name. The row menu has **Logs**, and with write access **Delete Pod** and **Debug Pod**. Click a pod to open its page.

### Pod page

Tabs: **Pod Details**, **Utilization Trends**, **Cost Trends**, **Recent Events**, **Yaml**, **Logs**, **Profiler** ([Profiler](./profiler.md)), **Service Map**, **App Dashboard** and **Security**.

## Nodes

Columns **Node Name**, **Type**, **Pods**, **IP**, **Cost**, **CPU (vCPU)**, **Memory (GiB)**, **Status** and **Created**; filter by **State** or name; **Node Trends** charts the node count. Rows expand to Details, Pods, Utilization Trends, Cost Trends, Recent Events, Network, Storage and Disk I/O.

## Namespace

Workloads, pods, CPU, memory and cost per namespace. Rows expand to Ownership, Pods, Utilization Trends, Cost Trends, Recent Events, Network and Service Map.

## Services, PVC, PV, Databases and Queues

- **Services**, **PV** — filter by namespace.
- **PVC** — **Name**, **Namespace**, **Status**, **Capacity**, **StorageClass**, **AccessMode**, **Age**.
- **Databases** and **Queues** (Beta) — databases and message queues found in the cluster, filtered by **Status**; rows open their Service Map and Traces.

## Related

- [Kubernetes](./index.md)
- [Optimize](./optimize.md)
- [Profiler](./profiler.md)
- [Ownership](../user-management.md#ownership)
