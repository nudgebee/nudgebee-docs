---
id: events-and-triage-inbox
title: Events & Triage Inbox
sidebar_label: Events & Triage Inbox
sidebar_position: 2.1
keywords: [triage inbox, all events, events list, grouped view, unique view, briefing, investigations, auto investigated, manual investigated, event filters]
intent: inspect
provider: all
---

# Events & Triage Inbox

**Troubleshoot** (left rail) shows events from **all your accounts** — Kubernetes clusters and AWS, Azure and GCP accounts. A single cluster's events are also on that cluster's **Troubleshoot** tab.

| Tab | Sub-tabs |
|---|---|
| **All Events** | **Triage Inbox** (default), **Events**, **Events group by type**, **Events group by app**, **Triage Rules**, **Alert Tuning** |
| **Investigations** | **Auto Investigated**, **Manual Investigated** |
| **Event Resolutions** | See [Event Resolutions](./event-resolutions.md) |
| **Knowledge Graph** | See [Semantic Knowledge Graph](../knowledge-graph/index.md) |
| **Analytics** | Whether things are getting better over time |

A tab you don't have access to is grayed out. **Investigations** needs access to AI conversations and **Knowledge Graph** needs access to the knowledge graph.

## NuBi's briefing

Above the inbox and event lists, a briefing summarizes the selected period:

| Column | Shows |
|---|---|
| **What came in** | Events ingested, repeats collapsed, issues you could see, investigations run |
| **How NuBi ranked it** | How many issues were ranked P0, P1, P2 and P3, coverage, and how many are still firing |
| **Where NuBi disagreed** | Issues ranked below, the same as, or above the source's own severity, and the biggest disagreement |
| **Flagged** | Up to four findings worth acting on: a **coverage gap**, a **backlog**, a **noise source**, or **tuning available** |

Click a tile to open **Events** filtered to exactly those events. If the briefing can't load, the events below are unaffected.

## Triage Inbox

One row per **issue** — all firings of the same alert (same fingerprint) together.

| Column | Shows |
|---|---|
| **Triage Score** | The score and priority — see [Triage Scoring](./triage-scoring.md) |
| **Source Severity** | The severity the source sent |
| **Application** | The workload or resource |
| **Event Type** | The alert or event name |
| **Count** | How many times it fired; "run of N" counts firings in the current run, which continues while the alert keeps re-firing within 24 hours |
| **Triage Status** | Where it is in triage — click to change it ([statuses](./alert-state-management.md#triage-statuses)) |
| **Alert Status** | The source's own status: Firing, Resolved or Closed |
| **Action** | **Investigate** or **View Analysis**, and **Classify** |

Search alert, resource or message, and filter by account, namespace, workload, service, event type, source, severity, status, triage priority, **Issue Type** (all, new or recurring) and triage status. Sort by triage score, last occurred or event count. Expand a row for its **Events** and **Grouped Alerts**.

## Events

One row per event. The columns are the same as above, plus **Message**; **Event Type** and **Triage Status** are hidden by default.

- **All** shows every firing. **Grouped** folds alerts on the same resource under their leading alert (for example an OOM kill and the CrashLoopBackOff it caused). **Unique** shows one row per issue.
- Filters add **Search by alert labels** (`key:value`, comma-separated), **Subject Type**, **Event Name** and **Sort By** (time or triage score).
- The default range is the **last 24 hours**; you can go back up to 6 months. Your filters are remembered in this browser.
- **Show Trend** adds a sparkline. **Download** exports the list.
- Row menu: **Create Ticket**, and with write access **Classify** and **Create Automation**.

Kubernetes configuration-change events are not listed here.

## Investigations

- **Auto Investigated** — events NudgeBee analyzed by itself ([which ones](../ai/event-analysis.md#which-events-are-analyzed)): severity, resource, message, triage priority and status. **Investigate** opens the analysis.
- **Manual Investigated** — investigations people started: user, question, when and status (Completed, Failed, In Progress, Waiting, Needs User Input, Terminated, Killed). Tenant admins can filter by user.
- The cards at the top — **Total Investigations**, **Total Triage**, **Total Time Saved** and savings — always cover the last 24 hours, whatever the date filter says.

## Related

- [Triage Scoring & Priority](./triage-scoring.md)
- [Triage Rules](./triage-rules.md)
- [Snooze, Suppress & Alert Lifecycle](./alert-state-management.md)
- [Event Lifecycle & Triage](./event-lifecycle.md)
- [Alert Tuning](./alert-tuning.md)
