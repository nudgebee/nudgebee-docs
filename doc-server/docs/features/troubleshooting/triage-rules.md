---
id: triage-rules
title: Triage Rules
sidebar_label: Triage Rules
sidebar_position: 2.2
keywords: [triage rules, suppression rule, drop events, scoring rule, classification rule, auto-mark duplicates, create rule missing, rule priority]
intent: change
provider: all
---

# Triage Rules

Triage rules act on events as they arrive: they **suppress** or **drop** noise, **adjust the score** of matching events, or **classify** them automatically.

## Where to find them

| View | Path |
|---|---|
| All accounts (view only) | **Troubleshoot → All Events → Triage Rules** |
| A Kubernetes cluster | Cluster → **Troubleshoot** → **Triage Rules** |
| An AWS, Azure or GCP account | Account → **Troubleshoot** → **Triage Rules** |

:::note Where is **Create Rule**?
A rule always belongs to one account, so **Create Rule** appears only on a cluster's or cloud account's **Triage Rules** tab — not on the all-accounts Troubleshoot page. It also needs write access to events on that account.
:::

## The rules list

| Column | Shows |
|---|---|
| **Account Name** | The account (all-accounts view only) |
| **Name** | The rule, with a **System** chip on built-in rules |
| **Type** | Suppression, Scoring or Classification |
| **Action** | What the rule does |
| **Match Criteria** | The first two criteria, or **Any** |
| **Priority** | Evaluation order — lower runs first |
| **Status** | **Enabled**, **Disabled**, or **Disabled (Override)** for a system rule switched off on this account |
| **Matches** | How many events it has matched |
| **Created** | When it was created |

Expand a row to see the events it matched in the last 30 days. Filter by name, **Rule Type**, **Status**, and turn **System Rules** off to hide built-in rules.

Row menu:

- **Your rules:** **Edit**, **Disable** / **Enable**, **Delete**. Disabling stops the rule matching new events straight away; deleting can't be undone. A rule past its expiry must be edited (extend or clear the expiry) before it can be enabled again.
- **System rules:** **Disable for this Account** / **Enable System Rule**, on a cluster's or cloud account's tab only.

## Create a rule

**Create Rule** opens *Create Triage Rule*:

1. **Basic Information** — **Rule Name** (required), **Description**, **Priority** (default 100; lower numbers are evaluated first).
2. **Rule Type**
   - **Suppression** — suppress or drop matching events.
   - **Scoring** — adjust the priority score of matching events.
   - **Classification** — classify matching events automatically.
3. **Match Criteria** — at least one. An event must match **all** of them.

   | Criterion | Matches |
   |---|---|
   | **Fingerprint** | Exactly one alert's fingerprint |
   | **Alert Name** | The alert name, as a regular expression |
   | **Namespace** | The namespace, exactly |
   | **Service** | The service or workload, as a regular expression |
   | **Source** | Where the event came from — Kubernetes, Prometheus, AWS CloudWatch & EventBridge, Azure Monitor, PagerDuty, Datadog, GCP Metric Alert — from the sources this account actually has |
   | **Priority** | The event's source priority |
   | **Labels** | `key:value` pairs, comma-separated |
   | **Finding Type** | The finding type, exactly |

   Regular expressions match anywhere in the value unless you anchor them (`^…$`). An invalid expression is rejected when you save.
4. **Action**

   | Rule type | Action | Resulting triage status |
   |---|---|---|
   | Suppression | **Suppress** — keep it visible but mark it suppressed | Suppressed |
   | Suppression | **Drop** — hide it completely; no further triage, correlation or scoring | Dropped |
   | Scoring | **Score Adjustment** — a positive number raises the score, a negative lowers it | Unchanged |
   | Classification | **False Positive** | Suppressed |
   | Classification | **Duplicate** | Duplicate |

5. **Apply to Existing Events** — also update matching events that are still open. A preview shows how many events will change and what they become. Events already in **Action Required** are not changed.
6. **Expiration (Optional)** — **Expires At**, a future date after which the rule stops matching.

## How rules combine

- Rules run in **Priority** order, lowest first.
- For **suppression** and **classification**, the first matching rule wins. If both match, suppression wins, and **Drop** beats **Suppress**.
- **Scoring** rules all apply: every matching rule's adjustment is added up. Adjustments still apply to suppressed events, but not to dropped ones.
- A priority you set by hand (see [Triage Scoring](./triage-scoring.md#override-a-priority)) always beats scoring rules.
- Changes take effect within about a minute.

## Built-in and generated rules

| Rule | What it does |
|---|---|
| **System: Auto-mark Duplicates** | Marks repeat firings of the same alert as **Duplicate** (see [Event Lifecycle](./event-lifecycle.md#repeats-and-duplicates)). Can be turned off per account. |
| Service-tier scoring rules | Raise the score of events on ingress and gateway services, on databases, caches and message queues, and slightly on monitoring tools |
| Rules created by **Classify** | When you classify all similar events, or pin a priority, NudgeBee creates a rule matching that alert's fingerprint — named `Auto-…` or `Pin …` |
| Rules created by **Mute** | Stopping an alert from an investigation creates suppression rules for it |

## Permissions

Viewing rules needs read access to events on the account. Creating, editing, deleting and enabling or disabling rules needs **update** access to events.

## Related

- [Events & Triage Inbox](./events-and-triage-inbox.md)
- [Triage Scoring & Priority](./triage-scoring.md)
- [Snooze, Suppress & Alert Lifecycle](./alert-state-management.md)
- [Event Lifecycle & Triage](./event-lifecycle.md)
