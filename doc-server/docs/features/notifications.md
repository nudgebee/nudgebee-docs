---
id: notifications
title: Notification Rules, Routing & Channel Management
sidebar_label: Notification Rules & Routing
sidebar_position: 7
keywords: [notification rules, alert routing, slack channel mapping, teams routing, multi-channel notifications, channel watches, rule precedence]
intent: setup
provider: all
---

# Notification Rules, Routing & Channel Management

Notification rules control delivery for platform categories such as Troubleshoot, Optimize, SLO, and Cloud. Configure a [notification integration](../integrations/Notifications/index.md) and its default destinations before adding rules.

![Notification rules](./img/notification-rules.png)

## Configure a rule

Open **Notification Rules**, add a rule, and select the source category and available account, namespace, application, alert, and severity filters. Choose destination channels from your configured providers and save the rule.

| Filter | Matching behavior |
| --- | --- |
| Source | Platform category; raw ingestion sources such as Prometheus and Datadog findings map to Troubleshoot |
| Account | Account identifier, or unscoped when the source/form allows it |
| Namespace / application | Exact match; an unset value is unscoped |
| Alert / aggregation key | Exact match when specified |
| Severity | Finding priority, compared case-insensitively: `HIGH`, `MEDIUM`, `LOW`, `INFO`, `DEBUG` |

Namespace and application filters do not interpret `payments-*` or `test-*` as glob patterns. Arbitrary label/tag matching is not part of this matcher. Use the options in the form rather than entering raw monitoring severity names such as `critical` or `warning`.

## How matching and routing work

The server evaluates all matching active rules. It does **not** rank them by resource or namespace specificity.

- Any matching suppressed rule suppresses delivery.
- A matching rule with an active snooze expiry temporarily silences delivery.
- A matching batch-delivery rule prevents immediate delivery through the real-time path.
- For each platform, channel selection uses the first applicable nonempty rule mapping, with the integration's default destination as fallback. Explicit destinations supplied by the sending operation can also take precedence.
- No matching rule does not automatically mean no notification: default destinations may still be used.

Avoid overlapping rules with conflicting destinations. A broad suppression rule can also silence an event that matches a narrower routing rule. Deactivating a rule removes it from matching; it does not disable the upstream monitoring alert.

## Low-priority findings and batch delivery

`LOW`, `INFO`, and `DEBUG` findings are gated from real-time delivery unless a matching rule explicitly selects the priority with real-time delivery. A rule without a severity filter does not opt these findings into immediate delivery. Check both severity and delivery mode when an event is visible but no immediate message arrives.

## Example: route a production namespace

1. Select the Troubleshoot source and the production cluster/account.
2. Select the exact namespace, such as `payments`, and priority `HIGH`.
3. Choose the destination channel and save an active rule.
4. Check for overlapping suppression, snooze, or batch rules.
5. Verify a matching event's priority and namespace, then confirm delivery in the selected channel.

For PagerDuty incident creation, use the [PagerDuty ticket integration](../integrations/Tickets/pagerduty.md) and the appropriate ticket/workflow action. Do not assume it is interchangeable with a chat-channel mapping.

## Troubleshoot missing delivery

1. Confirm the event exists and inspect its NudgeBee status and priority.
2. Check all matching rules, including suppression, snooze, and delivery mode.
3. Check default destinations if no explicit rule mapping applies.
4. Verify that the provider credentials and channel membership allow posting.
5. Check existing incident threads for follow-up messages and the provider's local notification settings.

See [Alert Pipeline Troubleshooting](./troubleshooting/alert-pipeline-troubleshooting.md) for the complete path.
