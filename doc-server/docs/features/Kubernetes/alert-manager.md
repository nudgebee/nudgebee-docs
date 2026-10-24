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

The row menu needs write access — without it the menu is empty. It offers only what NudgeBee can actually apply:

- **Disable** / **Enable** — only when the rule can be changed where it is defined.
- **Edit** — only while the rule is enabled and its definition can be edited.
- **Mute in NudgeBee** — when the rule isn't already muted and muting is available. Muting doesn't stop events: new events from the rule are still recorded but marked **Suppressed**, with no notifications. The rule itself is unchanged.
- **Unmute** — for any active mute, including mutes for specific workloads.

If NudgeBee can't change the rule (for example it is managed in your own Prometheus or GitOps repository), the menu shows **Change this rule where it is defined** instead.

## Create an alert

**Create New Alert** (needs write access): **Alert Name**, **Alert Summary**, **Alert Description**, **Runbook**, the PromQL query (with **Validate Query**), **Severity** (Critical or Warning), the time condition (how long it must hold, in minutes or hour), and **Select Action to Add** — drag actions to reorder them.

## Related

- [Alerting](../troubleshooting/alerting.md)
- [Alert Forwarding](../../installation/agent/connect/alertmanager.md)
- [Logs, Traces & Service Map](./logs-traces-service-map.md)
