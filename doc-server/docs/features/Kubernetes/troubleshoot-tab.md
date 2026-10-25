---
sidebar_position: 8
sidebar_label: Troubleshoot
keywords: [troubleshoot, events, pod errors, oom killed, image pull backoff, high restarts, cpu throttling, node errors, application errors, api errors, log errors, triage inbox, all events]
---

# Troubleshoot

**Cluster → Troubleshoot.** What went wrong in the cluster in the **last 24 hours** — the counts on Pod Errors, Node Errors, Application Errors and All Events cover that window.

| Sub-tab | Shows |
|---|---|
| **Summary** | Last 24 hours by event type and application, the most recent events, automations and application errors |
| **Triage Inbox** | Events grouped by fingerprint, so repeats of the same problem show once |
| **Events - By Type** | Events grouped by type |
| **Pod Errors** | **OOM Killed**, **Image Pull Backoff**, **High Restarts**, **CPU Throttling**, **Replica Mismatch** or **All**, each with a count |
| **Node Errors** | Node problems |
| **Application Errors** | **Api Errors** (Url, Method, Status) or **Log Errors** (Sample, Namespace, Application), or **All**. Filter by namespace, workload, severity and status; **Create Ticket** files one, and clicking a row opens the investigation |
| **All Events** | Every event, with full filters (below) |
| **Anomaly** (Beta) | See [Anomaly](./anomaly.md) |
| **Triage Rules** | Rules that set priority or suppress events — see [Triage Rules](../troubleshooting/triage-rules.md) |
| **Service Criticality** | Tier each workload — see [Service Criticality](../service-criticality.md) |

## Events table

Columns **Triage Score**, **Source Severity**, **Application**, **Message**, **Alert Status** and **Action**; **Event Type** and **Triage Status** can be shown. Toolbar: **Grouped**, **Show Trend**, **Download**, **Refresh**. Filters include message, alert labels, namespace, workload, event type and name, service, severity, triage priority, status, source and triage status.

Investigations NuBi ran on its own are listed under **Troubleshoot → Investigations** in the sidebar, on the **Auto Investigated** tab — see [Automatic Event Analysis](../ai/event-analysis.md).

## Related

- [Troubleshooting](../troubleshooting/index.md)
- [Automatic Event Analysis](../ai/event-analysis.md)
- [Kubernetes](./index.md)
