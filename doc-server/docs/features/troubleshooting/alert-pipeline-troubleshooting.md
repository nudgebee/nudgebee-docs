---
id: alert-pipeline-troubleshooting
title: "Troubleshooting: Why Am I Not Receiving Alerts?"
sidebar_label: Missing Alerts & Pipeline Triage
sidebar_position: 6
keywords: [no alerts, missing alerts, alert pipeline, alertmanager webhook, slack notification failed, notification rule mismatch, event suppressed]
intent: diagnose
provider: all
---

# Troubleshooting: Why Am I Not Receiving Alerts?

Trace a missing notification from its monitoring source to the destination. An event visible in NudgeBee does not guarantee immediate notification: triage, matching rules, delivery mode, and priority can affect delivery.

## 1. Did the monitoring source produce an alert?

Check the source's alert evaluation, thresholds, timing, and delivery configuration. Confirm the alert was actually sent and record its timestamp and identifier. Use the source-specific [integration guide](../../integrations/index.md) for the endpoint and payload; do not substitute an arbitrary test payload for the provider's webhook format.

## 2. Was the event ingested?

Find the alert in Troubleshoot using its time, source, account, and subject. If it is missing, check source delivery errors, configured webhook destination, authentication, and collector logs. A source alert that never reached NudgeBee cannot be fixed by editing notification rules.

## 3. Was the event suppressed or snoozed?

Inspect the event's NudgeBee triage status and classification, including matching triage rules. Source status and NudgeBee status are separate. See [Alert State Management](./alert-state-management.md).

## 4. Which notification rules apply?

Review all matching active rules for the source category, account, exact namespace/application, aggregation key, and priority. Rules do not use specificity-based precedence.

- Any matching suppression rule can silence delivery.
- Check active notification-rule snooze expiries.
- Check whether a batch-delivery rule prevents immediate delivery.
- `LOW`, `INFO`, and `DEBUG` findings require an explicit matching severity rule with real-time delivery to opt into immediate notifications.
- If no rule destination applies, inspect the integration's default destination. No match does not necessarily mean no delivery.

See [Notification Rules](../notifications.md) for matching and fallback behavior.

## 5. Can the provider deliver to the destination?

Verify the configured integration, credentials, destination IDs, and channel membership. Check provider errors and the notification-server logs for the affected time and account. For Slack private channels, ensure the bot is invited.

PagerDuty incident creation uses its [ticket integration](../../integrations/Tickets/pagerduty.md); inspect the ticket/workflow action separately from chat routing.

## 6. Was the message delivered but overlooked?

Check the existing incident thread and the user's chat-client mute or notification settings. Local client muting does not change the event's NudgeBee status.

## Evidence to collect

Record the event ID, source, account, UTC timestamp, NudgeBee status, priority, applicable rules, delivery mode, destination, and any provider error. Exclude credentials and review logs before sharing them with support.
