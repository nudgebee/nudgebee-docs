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
| Disable notification rule | Removes an inactive rule from notification matching; other rules or defaults can still deliver | Reactivate the rule |
| Resolve event | Sets NudgeBee triage status to `RESOLVED` | Review the event again if the issue recurs |
| Mute in chat client | Changes that user's Slack/Teams notification experience | Unmute in the chat client |

Disabling a notification rule does not stop Prometheus or CloudWatch from evaluating its source alert. Change the source monitoring configuration if that is the intended action.

## NudgeBee status reference

The triage API accepts `OPEN`, `ACTION_REQUIRED`, `SNOOZED`, `SUPPRESSED`, `DROPPED`, `DUPLICATE`, and `RESOLVED`. `ACKNOWLEDGED` and `INVESTIGATING` remain accepted for backward compatibility. `IN_PROGRESS` and `CLOSED` are not values for this field.

Do not infer that changing a status assigns an engineer or creates a ticket. Inspect ownership and linked tickets separately.

## Snooze an event

Open the event's triage controls, choose a snooze expiry, and confirm the change. Verify the status and expiry on the event. Expiry processing returns it to `OPEN`; the change is not an instantaneous client-side timer.

## Suppress recurring noise

Review the classification and scope before saving:

- **This event** affects the selected event.
- **This fingerprint** targets matching occurrences.
- **Time-limited** restricts the matching window.

Use rule preview when available to inspect existing matches. A preview is not a guarantee of future event volume. Review the saved rule when troubleshooting later alerts with the same fingerprint.

## Notification silence versus event state

Notification-rule suppression and snoozing are separate from event triage status. Inspect both when delivery is missing. A broad matching suppression rule can silence delivery even if another matching rule specifies a channel. See [Notification Rules](../notifications.md).

The available actions depend on the user's account and configured permissions. Ask an administrator to review access when a required control is unavailable.
