---
sidebar_position: 2
---

# MS Teams

NudgeBee works in Microsoft Teams through **Nubi**, its Teams app. Nubi posts alerts, recommendations and workflow approvals to the channels you choose, and answers questions when you mention it.

:::tip Only need alerts in one Teams channel?
A [webhook target](./webhook_targets.md) posts notifications through the channel's incoming webhook. It needs no app install, but it is one-way: no buttons and no questions to Nubi.
:::

## Set up Microsoft Teams

Setup has three steps. The first is done once per workspace; the second once per team.

### Step 1. Connect your Microsoft tenant

1. In NudgeBee, go to **Admin → Integrations → Microsoft Teams** and click **Connect**.
2. Sign in with your Microsoft work account. NudgeBee asks only to sign you in and read your basic profile (`openid`, `profile`, `User.Read`). It gets no access to your directory, chats or channels.

This links your Microsoft 365 tenant to your NudgeBee workspace. A Microsoft tenant can be connected to one NudgeBee workspace at a time.

### Step 2. Add Nubi to your teams

1. In Teams, open **Apps**, search for **Nubi**, and click **Add**.
2. Choose **Add to a team** and pick the team and channel. Nubi posts a welcome card there.
3. Repeat for each team that should get notifications.

If your organization manages which apps people can add, a Teams admin allows Nubi once in the **Teams admin center → Teams apps → Manage apps**.

### Step 3. Choose where notifications go

1. In NudgeBee, go to **Admin → Integrations → Microsoft Teams → Channel-Account Mappings**.
2. Map each channel to the cloud accounts whose alerts it should get. Only teams that have Nubi are listed.
3. Click **Test Notification** to check delivery.

Use [Notification Rules](../../features/notifications.md) to fine-tune which alerts go where.

:::info
**Expected outcome**: The Teams integration shows as connected in NudgeBee, the team appears in the channel picker, and the test notification arrives as a card from Nubi.
:::

## Using Nubi in Teams

- **Ask a question.** Mention `@Nubi` in a channel or a thread, or message Nubi directly. If you have access to more than one account, Nubi asks which one to use. In a channel mapped to an account, or in an alert's thread, it uses that account straight away.
- **Act on alerts.** Alert cards have **Ask Nubi**, which posts an analysis in the card's thread, and **Suppress…**, which creates a suppression rule. Suppressing needs an account admin role.
- **Approve workflows.** An approval card has one button per option the automation offers (a choice list and **Submit** when there are more than three). You need edit access to the account. An already-answered request shows *This approval was already answered.*; an expired one shows *This approval request has expired.*
- **Suppress durations.** **Suppress…** offers this alert for 1 h, 4 h, 24 h or 7 days, or every alert of the type for 4 h, 24 h or 7 days.
- **Rate answers** with **👍 Helpful** / **👎 Not helpful**. Very long analyses are cut, with a link to the full one in NudgeBee.
- **Cards expire.** Buttons on a card more than 7 days old no longer work; open the alert in NudgeBee instead.

Nubi recognizes you by the email address of your Teams account, which must belong to a user in your NudgeBee workspace.

### What Nubi can access

- Only messages that mention Nubi or are sent to it directly.
- Only the teams it has been added to.
- Standard channels. Private and shared channels aren't supported.

## Set up Microsoft Teams in on-prem NudgeBee

On-prem NudgeBee needs its own Teams bot: an app registration, an Azure Bot that uses it, and a Teams app package for that bot.

Throughout the steps below, replace `https://www.your-nudgebee-server.com` with the base URL of your NudgeBee server. Microsoft must be able to reach it over HTTPS.

### Step 1. Register an application in Microsoft Entra ID

If you are new to Azure app registrations, see Microsoft's guide: [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).

1. Go to the [Azure Portal](https://portal.azure.com) and open **Microsoft Entra ID → App registrations → New registration**.
2. Give the app a name (for example `NudgeBee`).
3. Under **Supported account types**, choose **Accounts in any organizational directory (multi-tenant)**.
4. Under **Redirect URI**, select **Web** and enter:

```
https://www.your-nudgebee-server.com/api/integrations/ms-teams/callback
```

5. Click **Register**, and note the **Application (client) ID** and the **Directory (tenant) ID**.
6. Under **API permissions**, keep only the delegated Microsoft Graph permissions `openid`, `profile` and `User.Read`.
7. Under **Certificates & secrets → Client secrets**, create a secret and copy its **Value**. It is shown only once.

### Step 2. Create an Azure Bot

1. In the Azure Portal, create an **Azure Bot** resource.
2. Under **Type of App**, choose **Single Tenant**, and select **Use existing app registration** with the Application (client) ID from Step 1.
3. After it is created, open **Configuration** and set the **Messaging endpoint** to:

```
https://www.your-nudgebee-server.com/api/webhooks/msteams/events
```

4. Open **Channels**, add **Microsoft Teams**, and accept the terms of service.

### Step 3. Add your credentials to NudgeBee secrets

Add the following to your NudgeBee server [secrets](../../installation/server/secret_configs.md):

```
MS_TEAMS_CLIENT_ID: The Application (client) ID from Step 1.
MS_TEAMS_CLIENT_SECRET: The client secret value from Step 1.
MS_TEAMS_BOT_TENANT_ID: The Directory (tenant) ID from Step 1, the bot's home tenant.
MS_TEAMS_ACTION_SIGNING_KEY: A random string that signs the data on card buttons, for example the output of `openssl rand -hex 32`.
```

Without `MS_TEAMS_ACTION_SIGNING_KEY`, cards are sent without buttons. Restart the NudgeBee server pods after updating the secrets.

### Step 4. Create the Teams app package

Create a Teams app for your bot in the [Teams Developer Portal](https://dev.teams.microsoft.com): add a **Bot** with the Application (client) ID from Step 1 and the `team` and `personal` scopes, then download the app package. Upload it in **Teams admin center → Teams apps → Manage apps → Upload new app**.

Then follow [Set up Microsoft Teams](#set-up-microsoft-teams) above.

## Troubleshooting MS Teams Integration

### 1. Nubi says it can't find your NudgeBee account
* **Symptom**: Nubi replies that it couldn't find a NudgeBee account linked to your email.
* **Root Cause**: The email address of your Teams account isn't a user in the NudgeBee workspace connected to your Microsoft tenant.
* **Remediation**: Ask a NudgeBee admin to invite that email address under **Admin → Access & Users**, and accept the invite.

---

### 2. Connect fails with "This Microsoft tenant is already connected to another workspace"
* **Root Cause**: A Microsoft tenant can be connected to only one NudgeBee workspace.
* **Remediation**: Disconnect Microsoft Teams in the other workspace first, then connect again.

---

### 3. A team or channel is missing from the channel picker
* **Root Cause**: Nubi hasn't been added to that team, or the channel is private or shared.
* **Remediation**: Add Nubi to the team (Step 2), then reload the page. Use a standard channel.

---

### 4. Sign-In Fails with `Redirect URI Mismatch` (AADSTS50011), on-prem
* **Symptom**: Connecting returns `AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application`.
* **Root Cause**: The redirect URI in Microsoft Entra ID doesn't match the public HTTPS base URL of your NudgeBee server.
* **Remediation**: In Entra ID **App registrations → Authentication → Web Redirect URIs**, make sure the URI is exactly `https://<your-nudgebee-server>/api/integrations/ms-teams/callback`, with no trailing slash and the same protocol.

---

### 5. Notifications Stopped Working / Expired Client Secret, on-prem
* **Symptom**: Notifications were working but now fail, and the logs show `401 Unauthorized` from Microsoft.
* **Root Cause**: The app registration's client secret expired.
* **Remediation**:
  1. Go to Entra ID **App registrations → Certificates & secrets** and create a new client secret.
  2. Update `MS_TEAMS_CLIENT_SECRET` in your NudgeBee secrets.
  3. Restart the NudgeBee server pods.
