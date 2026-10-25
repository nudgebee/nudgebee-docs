---
sidebar_position: 3
---
# Google Chat

:::tip Only need alerts in one Google Chat space?
A [webhook target](./webhook_targets.md) posts notifications through the space's incoming webhook. It needs no app install or admin approval, but it is one-way.
:::

## How Google Chat Connects

Google Chat connects through the **NudgeBee Chat app (bot)**, with no user sign-in. You add the bot to a space, and a tenant admin binds that space in NudgeBee. Bound spaces are the destinations your [notification rules](../../features/notifications.md) can send to.

## Connect a Space

1. In Google Chat, add the NudgeBee app to the space that should receive notifications.
2. The bot posts a **Connect** card in the space. Click it to open NudgeBee at **Admin** > **Integrations** > **Messaging & Alerting** > **Google Chat**, where the space shows as **Pending**.
3. Click **Connect**. You need permission to manage messaging platforms; otherwise ask a tenant admin.
4. Optionally use **Set as default** in the space's row menu. The default space receives notifications that don't name a space.

The panel header shows the bot's join permission. If it reads **Join permission: needs admin authorization**, a Google Workspace admin must allow the app: click **Authorize in Google Workspace**, approve the app, then click **Re-check**.

To stop notifications to a space, use **Unbind** in its row menu.

## Configure Google Chat in On-Prem NudgeBee

On a self-hosted install you run your own Chat app:

1. In Google Cloud Console, create a service account and download its JSON key, and enable the Google Chat API in that project.
2. Configure the Chat app (**Google Chat API** > **Configuration**) with an **HTTP endpoint URL** of `https://your-base-url.com/api/webhooks/google-chat/events`, replacing `your-base-url.com` with the domain where NudgeBee is hosted. Set **Authentication Audience** to **Project Number**.
3. Set these keys in the NudgeBee secrets (`nudgebee_secret` in the Helm values):

```
GOOGLE_CHAT_SA_KEY: The service account's JSON key (raw JSON).
GOOGLE_CHAT_PROJECT_NUMBER: The Google Cloud project number of the Chat app, used to verify incoming Chat events.
```

If these are missing, the panel shows **Google Chat is not configured on this deployment**.

---

## Troubleshooting Google Chat Integration

### 1. No Connect card, or clicking it does nothing
* **Symptom**: The bot joins the space but never posts the **Connect** card, or NudgeBee ignores the space's events.
* **Root Cause**: Chat events can't reach or be verified by NudgeBee.
* **Remediation**:
  1. Check the Chat app's HTTP endpoint URL is `https://<your-base-url>/api/webhooks/google-chat/events` and reachable from the internet.
  2. Check `GOOGLE_CHAT_PROJECT_NUMBER` matches the project the Chat app belongs to.
  3. Check the Chat app's **Authentication Audience** is **Project Number**. NudgeBee verifies events with the project number as the audience; with any other setting every event is rejected with `401`.

---

### 2. `403 Forbidden` / Webhook Target Space Access Denied
* **Symptom**: Incoming webhook fails to post message to target Google Chat Space.
* **Root Cause**: Webhook URL revoked or Space restricted by Google Workspace policy.
* **Remediation**:
  1. In Google Chat $\rightarrow$ Space Settings $\rightarrow$ **Apps & integrations** $\rightarrow$ **Manage webhooks**, regenerate the webhook URL.
  2. Test sending a raw test payload:
     ```bash
     curl -X POST -H "Content-Type: application/json" \
       -d '{"text":"NudgeBee integration test"}' \
       "<YOUR_GOOGLE_CHAT_WEBHOOK_URL>"
     ```
  3. Update the webhook URL in the webhook targets section of the **Google Chat** panel under **Admin** > **Integrations** > **Messaging & Alerting**.