# Notifications

NudgeBee sends notifications to keep you informed about critical events, anomalies, optimization opportunities, and incident updates. By connecting a notification channel, you enable real-time alerts delivered directly to the tools your team already uses.

### Why Set Up Notifications?

Without a notification channel, you would need to log in to the NudgeBee UI to check for events and alerts. With notifications configured, your team gets immediate, actionable alerts in your existing communication tools — reducing response times and making sure nothing gets missed.

:::tip
Setting up at least one notification channel is highly recommended. Most teams start with Slack or Microsoft Teams.
:::

### What You Can Receive Notifications For

- Kubernetes events and errors (pod crashes, OOM kills, failed deployments)
- Optimization recommendations (right-sizing, cost savings)
- SLO breaches and threshold alerts
- Autopilot actions and runbook execution results
- Custom notification rules you define

Once connected, you can fine-tune which notifications go where using [Notification Rules](../../features/notifications.md) — for example, routing production alerts to a dedicated channel while suppressing notifications from development namespaces.

## Available Notification Channels

NudgeBee currently supports the following notification channels:

*   **[Slack](./slack.md)**: Receive notifications directly in your Slack workspace. Supports bidirectional interaction — you can respond to alerts and trigger actions from Slack.
    *   [Slack Setup for Cloud SaaS](./slack.md#how-to-configure-slack-in-your-nudgebee-account)
    * [Slack Setup for On-Prem](./slack.md#how-to-configure-slack-in-your-on-prem-nudgebee)
*   **[Microsoft Teams](./msteams.md)**: Integrate with Microsoft Teams to receive notifications in your team channels.
*   **[Google Chat](./google_chat.md)**: Get notifications in your Google Chat rooms.

:::info
**Expected outcome**: After connecting a notification channel, you should see a confirmation in NudgeBee. Test notifications typically arrive within 60 seconds.
:::
