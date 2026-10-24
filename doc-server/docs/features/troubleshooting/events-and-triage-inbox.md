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
| **Analytics** | Whether things are getting better over time — see [Analytics](./analytics.md) |

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

One row per event, with the columns **Triage Score**, **Source Severity**, **Application**, **Message**, **Event Type**, **Alert Status**, **Triage Status** and **Action**. **Event Type** and **Triage Status** are hidden by default.

- **All** shows every firing. **Grouped** folds alerts on the same resource under their leading alert (for example an OOM kill and the CrashLoopBackOff it caused). **Unique** shows one row per issue.
- Filters add **Search by alert labels** (`key:value`, comma-separated), **Subject Type**, **Event Name** and **Sort By** (time or triage score).
- The default range is the **last 24 hours**; you can go back up to 6 months. Your filters are remembered in this browser.
- **Show Trend** adds a sparkline. **Download** exports the list.
- Row menu: **Create Ticket**, and with write access **Classify** and **Create Automation**.

Kubernetes configuration-change events are not listed here.

## Investigations

Two sub-tabs. Both have an **Account** filter, a date range (default: last 24 hours) and **Download**.

- **Auto Investigated** — events NudgeBee analyzed by itself ([which ones](../ai/event-analysis.md#which-events-are-analyzed)). Columns: **Severity**, **Resource/Instance**, **Message**, **Triage Priority** and **Status** — the alert's status (Firing, Resolved, Closed), which you can also filter by. **Investigate** opens the analysis.
- **Manual Investigated** — investigations people started. Columns: **User**, **Query**, **When** and **Status** (Completed, Failed, In Progress, Waiting, Needs User Input, Terminated, Killed). Filter by **Status** or **Search by title**; tenant admins (including read-only) can also filter by **User**. **Check Details** opens the conversation in a new tab.

### Summary cards

| Card | What it shows |
|---|---|
| **Total Investigations** | Investigations in the last 24 hours, with the change against the 24 hours before. On **Auto Investigated** it counts automatic investigations; on **Manual Investigated**, the ones people started. |
| **Total Triage** | Currently shows the same count as Total Investigations. |
| **Total Time Saved** | Engineer time saved in the last 24 hours, and the share of manual effort that was automated |
| **NudgeBee Savings** | Time saved × the engineer hourly rate (labeled with your assistant's brand name). The small badge shows the change in investigation volume. |

The cards always cover the last 24 hours, counted from when you opened the page. They ignore both the date and the **Account** filters and roll up every account you can see.

### How time saved is calculated

1. Only investigations that **completed** count.
2. NudgeBee measures how long its agents were actively working on each one, and takes the average.
3. **Time saved = completed investigations × (manual baseline − average agent time)**, never below zero.
4. **Savings = time saved × engineer hourly rate.**

The default manual baseline is **25 minutes** per investigation and the default rate is **$30 an hour**. Both are set by whoever operates your NudgeBee installation. [Analytics](./analytics.md) shows the same idea for automatic investigations, following its own Account and date filters.

## Related

- [Triage Scoring & Priority](./triage-scoring.md)
- [Triage Rules](./triage-rules.md)
- [Snooze, Suppress & Alert Lifecycle](./alert-state-management.md)
- [Event Lifecycle & Triage](./event-lifecycle.md)
- [Alert Tuning](./alert-tuning.md)
