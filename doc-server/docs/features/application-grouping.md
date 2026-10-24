---
sidebar_position: 14
sidebar_label: Application Grouping
keywords: [application grouping, application group, group workloads, application summary, create grouping]
---

# Application Grouping

**Home → Application Grouping**

Kubernetes knows about workloads and namespaces. It does not know that six Deployments across three namespaces are one application your team is on call for. Application Grouping is where you tell NudgeBee that, so you can see that application's events, errors and optimizations in one place.

<!-- ![Application Grouping list showing named groups and their member workloads](./img/application-grouping.png) -->

## What a group is

A named set of workloads **in one cluster**. Members can come from several namespaces in that cluster. To describe an application that runs in several clusters, create one group per cluster.

## The list

| Column | Meaning |
|---|---|
| **Group name** | Click it to open the group |
| **Total Applications** | How many workloads are in the group |
| **Updated at**, **Created by** | When it was last changed and who created it |
| **Event Count (1 Hour)** | Firing events across the group's workloads in the last hour |
| **Error Rate (1 Hour)** | Error rate across the group in the last hour |

Search with **Search Grouping**, or download the list. Each row's menu has **Edit**. Groups can't be deleted.

## Creating or editing a group

Creating and editing groups needs a **tenant admin**. Other users may see the buttons, but saving fails.

**Create Application Group** opens *Create Grouping* (*Update Grouping* when editing):

| Field | Rules |
|---|---|
| **Grouping Name** | Required. Starts with a letter; letters, numbers and spaces only; must be unique (*Group name already in use*) |
| **Short Description** | Optional |
| **Cluster** | The cluster the group belongs to. Changing it clears the workloads you selected |
| **Namespaces** | Narrows the workload list |
| Workloads | Tick the workloads that make up the application, or select all |

Use the name your team already uses for the application — it's what appears on the group's page.

## The group page

Open a group to see it on its own page. Switch between groups at the top, and use **Edit Application Group** to change it.

| Tab | Shows |
|---|---|
| **Summary** | **Application Summary** — the number of applications, SLO status (last 30 days), events, critical log errors and API failures, and **Optimizations** with links to Right Sizing, Unused Volumes and **Spot Recommendations**. **Events/Errors** — events by type and by application, and trace groups. Charts for HTTP Request, CPU, Memory and Error Calls |
| **Events** (beta) | Events for the group's workloads |
| **Applications** (beta) | The group's workloads |
| **Monitoring** | Not available yet |

A group with no workloads shows *No data available. Please configure application.*

## Choosing what to group

Groups earn their keep when the members fail together or are paid for together. A frontend, its API and its cache belong in one group. Every workload in a namespace does not — that is what the namespace filter is already for.

## Related

- [Home](./home.md)
- [Custom Dashboards](./dashboards.md)
- [Kubernetes workloads and pods](./Kubernetes/workloads-and-pods.md)
