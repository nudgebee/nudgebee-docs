# Discord

Send NudgeBee notifications to a Discord channel — Kubernetes events, optimization recommendations, SLO breaches and Autopilot results, routed by your [notification rules](../../features/notifications.md).

---

## How Discord Connects

Unlike the webhook-based channels, Discord uses an **authorization flow**: you install the NudgeBee application into your Discord server and grant it permission to post, rather than pasting a URL into a form.

## Step 1: Authorize NudgeBee in Discord

1. Navigate to **Admin** > **Integrations** > **Messaging & Alerting**.
2. Select **Discord**, then click **Add to Discord**.
3. Discord asks which server to add the application to, and which permissions to grant. You must have **Manage Server** permission on the target server to complete this.
4. Approve the authorization. You are returned to NudgeBee and the integration appears as **Enabled**.

:::note
Authorization is per Discord server. Repeat this for each server that should receive notifications.
:::

## Step 2: Route Notifications to a Channel

Once the application is authorized, choose what gets sent where using [Notification Rules](../../features/notifications.md) — for example routing production alerts to a dedicated incident channel while suppressing development namespaces.

---

## Verify the Integration

1. Confirm the NudgeBee application appears in your Discord server's member list.
2. Trigger a notification — the simplest is to run an automation with a [notification task](../../features/workflow-builder/notification-tasks.md) targeting Discord.
3. Confirm the message arrives in the expected channel.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Authorization fails or the server is not listed | You lack **Manage Server** on that Discord server | Ask a server administrator to complete the authorization. |
| Integration is enabled but no messages arrive | The application cannot post in the target channel | Check the channel's permission overrides — the NudgeBee application's role needs **View Channel** and **Send Messages**. |
| Messages arrive in the wrong channel | Notification rules point elsewhere | Adjust the routing in [Notification Rules](../../features/notifications.md). |
| Notifications stopped after a server change | The application was removed or its role was edited | Re-authorize from **Admin** > **Integrations** > **Messaging & Alerting**. |

---

## Helpful Links

- [Notification Rules](../../features/notifications.md)
- [Notifications overview](./index.md)
