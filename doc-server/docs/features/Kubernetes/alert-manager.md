---
sidebar_position: 5
sidebar_label: Alert Manager
keywords: [alert manager, alert rules, prometheus rules, create alert, mute alert, disable alert, change this rule where it is defined]
---

# Alert Manager

**Cluster → Monitoring → Alert Manager.** Every alert rule NudgeBee knows about for the cluster.

| Column | Meaning |
|---|---|
| **Name** | The rule |
| **Category**, **Source**, **Severity** | What it is and where it comes from |
| **Status** | **Enabled** / **Disabled**, and *Enabled · Muted* or *Enabled · Muted for N workloads* when muted in NudgeBee |
| **Configured Actions** | Actions that run when it fires |

Filter by **Category**, **Severity**, **Source**, **Status** or name, and **Download** the list.

## Change a rule

The row menu offers only what NudgeBee can actually apply where the rule is evaluated:

- **Disable** / **Enable**
- **Edit** (while the rule is enabled)
- **Mute in NudgeBee** / **Unmute** — stop NudgeBee raising events from it without changing the rule itself

If NudgeBee can't change the rule (for example it is managed in your own Prometheus or GitOps repository), the menu shows **Change this rule where it is defined** instead.

## Create an alert

**Create New Alert** (needs write access): **Alert Name**, **Alert Summary**, **Alert Description**, **Runbook**, **Severity** (Critical or Warning), the time condition (how long it must hold, in minutes or hours), and **Select Action to Add** — drag actions to reorder them.

## Related

- [Alerting](../troubleshooting/alerting.md)
- [Alert Forwarding](../../installation/agent/connect/alertmanager.md)
- [Logs, Traces & Service Map](./logs-traces-service-map.md)
