---
id: alert-state-management
title: Snooze, Suppress, Disable, and Resolve Alerts
sidebar_label: Snooze, Suppress & Alert Lifecycle
sidebar_position: 7
keywords: [snooze alert, suppress alert, disable alert rule, acknowledge event, resolve event, mute channel, alert lifecycle, triage rules]
intent: change
provider: all
---

# Snooze, Suppress, Disable, and Resolve Alerts

NudgeBee keeps its triage state separate from the monitoring source's status. A source reporting `firing` or `resolved` is different from the NudgeBee `nb_status` field. Classification and ownership are separate concepts too.

## Choose the control that matches your intent

| Control | Scope and behavior | Recovery |
| --- | --- | --- |
| Snooze event | Sets NudgeBee status to `SNOOZED` with `snoozed_until` | Expired snoozes are processed back to `OPEN` |
| Suppress event / matching events | Uses a suppression classification or rule; available scopes include this event, this fingerprint, and time-limited matching | Review or change the classification/rule |
| Disable notification rule | An inactive (disabled) rule is skipped in notification matching; other rules or defaults can still deliver | Reactivate the rule |
| Resolve event | Sets NudgeBee triage status to `RESOLVED` | Review the event again if the issue recurs |
| Mute in chat client | Changes that user's Slack/Teams notification experience | Unmute in the chat client |

Disabling a notification rule does not stop Prometheus or CloudWatch from evaluating its source alert. Change the source monitoring configuration if that is the intended action.

## Triage statuses

| Status | Meaning | You can change it to |
|---|---|---|
| **Open** | No triage done yet. Awaiting review. | Action Required, Snoozed, Resolved |
| **Action Required** | Triaged. Waiting on action from your team. | Resolved, Snoozed, Open |
| **Snoozed** | Paused for a while; returns to Open when the snooze ends | Open, Action Required, Resolved |
| **Suppressed** | Events from this issue won't trigger alerts | Open, Action Required, Resolved |
| **Dropped** | Dismissed and excluded from triage | Open |
| **Duplicate** | Automatically identified as a repeat | Open |
| **Resolved** | The issue has been resolved | Open, Action Required |

Click the status badge to change it; you can add a note, which goes on the event's timeline. Choosing **Action Required** offers to create a ticket. Changing status needs update access to events.

The API also still accepts `ACKNOWLEDGED` and `INVESTIGATING` for backward compatibility. `IN_PROGRESS` and `CLOSED` are not triage statuses.

**Suppressed** events don't send notifications and aren't [analyzed automatically](../ai/event-analysis.md). **Dropped** events also skip correlation and scoring.

Do not infer that changing a status assigns an engineer or creates a ticket. Inspect ownership and linked tickets separately.

## Snooze an event

Open the event's triage controls and snooze it for **1 hour**, **4 hours**, **1 day** or **1 week**, with an optional note. Expired snoozes go back to **Open** within about five minutes.

## Suppress recurring noise

Classify the event as **False Positive** (see below) or create a [suppression rule](./triage-rules.md). Review the scope before saving:

- **This Event Only** affects the selected event.
- **All Similar Events** — every past and future event with the same fingerprint.
- **Time Limited** — future events with the same fingerprint, until **Expires At** (at most 30 days). Existing events aren't changed.

Use rule preview when available to inspect existing matches. A preview is not a guarantee of future event volume. Review the saved rule when troubleshooting later alerts with the same fingerprint.

## Classify an event

**Classify** sets what the event was, and optionally fixes its priority:

| Classification | Status it gets | Reason codes |
|---|---|---|
| **True Positive** | Action Required | Correct Severity, Wrong Service Tier, Missing Dependency |
| **False Positive** | Suppressed — and, for a wider scope, a suppression rule | Known Noise, Threshold Too Sensitive, Test Alert, Wrong Environment |
| **Benign Positive** | Resolved | Maintenance Window, Expected Behavior, Batch Job, Deployment |
| **Duplicate** | Duplicate — linked to the first event | Duplicate Incident |

**Correct Priority (Optional)** — offered for **True Positive** and **Benign Positive** — sets P0–P3. With **All Similar Events** or **Time Limited**, a corrected priority becomes a **Pin** rule for that alert. Classifying needs update access to events.

## Stop an alert from an investigation

On an event's investigation, **Stop this alert** suppresses future firings:

- **Which alerts** — every alert of that name, or only those on this workload. Each choice shows how many fired in the last 7 days.
- **For how long** — **7 days** (default), **24 hours**, or **Until I unmute**.

This creates suppression rules you can review in [Triage Rules](./triage-rules.md). To change the alert where it's defined instead, use **Edit in Alert Manager**. Slack and Teams alert cards have their own **Suppress…** options.

## Notification silence versus event state

Notification-rule suppression and snoozing are separate from event triage status. Inspect both when delivery is missing. A broad matching suppression rule can silence delivery even if another matching rule specifies a channel. See [Notification Rules](../notifications.md).

The available actions depend on the user's account and configured permissions. Ask an administrator to review access when a required control is unavailable.

## Related

- [Events & Triage Inbox](./events-and-triage-inbox.md)
- [Triage Rules](./triage-rules.md)
- [Event Lifecycle & Triage](./event-lifecycle.md)
