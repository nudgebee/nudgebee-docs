---
sidebar_position: 13
sidebar_label: Custom Dashboards
---

# Custom Dashboards

**Dashboards → Dashboard List**

Build your own views over everything NudgeBee already collects — metrics, logs, traces, events, and the databases and queues you have connected — without leaving the product or standing up a separate Grafana.

<!-- ![Dashboard List showing saved dashboards](./img/dashboard-list.png) -->

## Starting a dashboard

Three ways in:

**From a template.** *Start from a template* opens a gallery of role-shaped dashboards — CTO / VP Engineering, CFO / VP Finance, Director SRE, Director Cloud Ops, SRE On-call, DevOps / Platform Engineer, Cloud Ops Engineer, and an Executive Overview. Picking one opens it in the editor with every panel editable before anything is saved. Nothing is created until you save, so opening a template to see how a panel is built costs nothing.

**From the panel library.** Add pre-built panels one at a time to a blank dashboard.

**By import.** Bring in a Grafana dashboard JSON, or a dashboard exported from another NudgeBee tenant.

<!-- ![Template gallery with role dashboards and their panel lists](./img/dashboard-templates.png) -->

## Panels

Each panel pairs a **visualization** with a **data source**.

| Visualization | Good for |
|---|---|
| Time series | Anything that changes over time |
| Stat | A single current number |
| Gauge | A number against a range |
| Table | Rows — resources, events, query results |
| Bar | Comparison across a small set of categories |
| Text | Markdown notes, links, section headers |

| Data source | Reads |
|---|---|
| Metrics | Your metrics backend |
| Logs | Your logs backend |
| Traces | Your tracing backend |
| Nudgebee (events) | The events NudgeBee has ingested |
| PostgreSQL | A connected Postgres instance |
| Redis | A connected Redis instance |
| RabbitMQ | A connected RabbitMQ instance |

Panels resolve their provider per account, so one dashboard can span accounts on different observability backends. Check the provider row on each panel when a dashboard covers a mixed estate — a panel querying an account whose provider does not serve that data source returns nothing rather than erroring.

<!-- ![Panel editor showing visualization type, data source and query](./img/dashboard-panel-editor.png) -->

## Table panels

Table panels have their own settings beyond the query:

- **Column display** — choose and order the columns shown.
- **Custom links** — turn a column into a link, so a row can jump to the resource, the event, or an external system.
- **Search on enter** — searching submits on Enter rather than filtering per keystroke, which keeps large tables responsive.

## Entity queries

Alongside raw queries, a panel can run an **entity query** — a builder over NudgeBee's own tables, so you can chart the platform's inventory (workloads, accounts, recommendations, events) without writing SQL or PromQL.

## Versions

Every save creates a version. The version list lets you see what changed and roll back.

Dashboards warn before you navigate away with unsaved changes. A brand-new dashboard always counts as unsaved, so the prompt appears even if you have not typed anything yet.

## Related

- [Application Grouping](./application-grouping.md) — group workloads so a dashboard can chart them as one application
- [Semantic Knowledge Graph](./knowledge-graph.md)
