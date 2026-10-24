---
sidebar_position: 7.5
sidebar_label: Troubleshoot
keywords: [cloud events, aws events, azure events, gcp events, triage rules cloud, alert tuning cloud, investigate cloud event]
---

# Troubleshoot (Cloud)

**Infra → Cloud → Troubleshoot** has three sub-tabs: **Events**, **Triage Rules** and **Alert Tuning**.

## Events

The account's events, from the last 7 days by default.

- **Filters:** search by event, **Event Name**, **Source Severity**, **Triage Priority** (P0–P3), **Source**, **Status** and **Triage Status**.
- **Columns:** **Triage Score**, **Source Severity** (with the time), **Application**, **Event** (with the message and any linked ticket), **Alert Status** (with the source) and **Triage Status**.
- **Investigate** starts an analysis; **View Analysis** opens one that exists.
- The row menu has **Create Ticket** (read access is enough), and **Classify** and **Create Automation** (write access).

How scores, priorities and statuses work is explained in [Events & Triage Inbox](../troubleshooting/events-and-triage-inbox.md) and [Triage Scoring](../troubleshooting/triage-scoring.md).

Events from AWS, Azure and GCP arrive in near real time only when real-time events are connected — see [Access modes & real-time events](./access-modes-and-real-time-events.md). Otherwise they arrive with the regular sync.

## Triage Rules

Rules that suppress, score or classify this account's events. You create them here, not on the tenant-wide Troubleshoot page. See [Triage Rules](../troubleshooting/triage-rules.md).

## Alert Tuning

Suggested threshold changes for noisy cloud alarms. See [Alert Tuning](../troubleshooting/alert-tuning.md).

## Related

- [Events & Triage Inbox](../troubleshooting/events-and-triage-inbox.md)
- [Monitoring](./monitoring.md)
- [Cloud Accounts](./index.md)
