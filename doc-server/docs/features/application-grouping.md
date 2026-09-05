---
sidebar_position: 14
sidebar_label: Application Grouping
---

# Application Grouping

**Dashboards → Application Grouping**

Kubernetes knows about workloads and namespaces. It does not know that six Deployments across three namespaces are one application your team is on call for. Application Grouping is where you tell NudgeBee that.

<!-- ![Application Grouping list showing named groups and their member workloads](./img/application-grouping.png) -->

## What a group is

A named set of workloads. Members can span namespaces and clusters, so a group can describe an application as it actually runs rather than as it happens to be laid out.

Once a group exists, NudgeBee can summarise cost, health and events for the application as a whole instead of workload by workload.

## Creating one

1. Go to **Dashboards → Application Grouping** and create a group.
2. Give it a name — this is what appears everywhere the group is summarised, so use the name your team already uses for the application.
3. Pick an account, then a cluster, then select the workloads. Repeat for each cluster the application spans.
4. Save.

Edit the membership at any time; the group's history is preserved.

## Where groups show up

- **Group summary** — cost, utilisation and event volume rolled up across every member workload.
- **Events grouped by app** — the Troubleshoot events view can group by application, which turns a wall of per-pod alerts into one row per application.
- **Dashboards** — panels can scope to a group rather than a namespace.

## Choosing what to group

Groups earn their keep when the members fail together or are paid for together. A frontend, its API and its cache belong in one group. Every workload in a namespace does not — that is what the namespace filter is already for.

## Related

- [Custom Dashboards](./dashboards.md)
- [Service Criticality](./service-criticality.md) — tiering the workloads inside a group
