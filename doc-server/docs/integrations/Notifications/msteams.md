---
sidebar_position: 2
---

# MS Teams

NudgeBee works in Microsoft Teams through **Nubi**, its Teams app. Nubi posts alerts, recommendations and workflow approvals to the channels you choose, and answers questions when you mention it.

:::tip Only need alerts in one Teams channel?
A [webhook target](./webhook_targets.md) posts notifications through the channel's incoming webhook. It needs no app install, but it is one-way: no buttons and no questions to Nubi.
:::

## Set up Microsoft Teams

You connect Microsoft Teams **one team at a time**. Each team belongs to exactly one NudgeBee workspace, and a workspace can connect several teams. Several NudgeBee workspaces can share one Microsoft 365 tenant, each with its own teams; a workspace never sees another workspace's teams, alerts or data.

### Step 1. Add Nubi to the team

1. In Teams, open **Apps**, search for **Nubi**, and click **Add**.
2. Choose **Add to a team** and pick the team and channel. Nubi posts a welcome card there.

If your organization manages which apps people can add, a Teams admin allows Nubi once in the **Teams admin center → Teams apps → Manage apps**.

### Step 2. Connect the team to your workspace

Connecting needs no Microsoft sign-in. Open the link Nubi posts in the team:

- **The person who added Nubi** clicks **Connect Microsoft Teams** on the welcome card.
- **Anyone else**, or once the welcome card's button has expired: a NudgeBee admin @mentions **Nubi** in the team. Nubi replies with a **Connect this team** button for that person.

Then:

1. If NudgeBee asks you to sign in, sign in and open the link again.
2. NudgeBee shows the team and your current workspace. Click **Connect Microsoft Teams**. Nubi posts *This team is now connected to &lt;workspace&gt;, connected by &lt;person&gt;.* in the team.

A link works for 7 days and only for the person it was posted for. That person must be signed in to NudgeBee with the same email address as their Microsoft sign-in name (UPN); an alias or a different SSO email doesn't count, and be a NudgeBee admin or have a role that can manage messaging integrations. Some people get a welcome card without a button: guests, personal Microsoft accounts, and accounts on a public email domain or an `onmicrosoft.com` address. Another admin can @mention Nubi instead.

Repeat Steps 1 and 2 for each team that should get notifications.

### Step 3. Choose where notifications go

1. In NudgeBee, go to **Admin → Integrations → Microsoft Teams**. The page lists the teams connected to this workspace.
2. Under **Channel-Account Mappings**, map channels to the cloud accounts whose alerts they should get. The **Channel** list shows every channel of your connected teams, grouped by team; a chosen channel reads **Team › Channel**. A team's default channel is listed as **General (default channel)**.
3. Click **Test Notification** to check delivery.

Use [Notification Rules](../../features/notifications.md) to fine-tune which alerts go where; their Teams destination uses the same grouped channel list.

:::info
**Expected outcome**: The team appears under connected teams in NudgeBee, its channels appear in the channel list, and the test notification arrives as a card from Nubi.
:::

### Remove, move or disconnect a team

- **Remove Nubi from a team** in Teams to disconnect that team. To connect it again, add Nubi back and open the new link; an old link no longer works.
- **Move a team to another workspace**: remove Nubi from the team, add it back, and open the new link while signed in to the other workspace. Nubi announces the new workspace in the team, and the previous workspace's audit log records that the team is now connected to another workspace. The previous workspace's channel mappings for that team are removed, and its notifications to the team stop.
- **Disconnect** in **Admin → Integrations → Microsoft Teams** disconnects every team connected to this workspace and removes their channel-account mappings. Notification rules that send to those teams stop delivering until the teams are connected again.

## Using Nubi in Teams

- **Ask a question.** Mention `@Nubi` in a channel or a thread, or message Nubi directly. If you have access to more than one account, Nubi asks which one to use. In a channel mapped to an account, it uses that account straight away. In an alert's thread, it always uses the alert's account; if you can't access that account, Nubi tells you instead of answering.
- **Share a thread.** Each message in a thread is answered as the person who wrote it, with that person's access. Someone without access to the thread's account is told so.
- **Act on alerts.** Alert cards have **Ask Nubi**, which posts an analysis in the card's thread, and **Suppress…**, which creates a suppression rule. Suppressing needs an account admin role.
- **When Ask Nubi can't analyze.** If the alert's last analysis failed, **Ask Nubi** runs it again. When it still can't finish, the thread says why and the card shows *Nubi couldn't analyze this alert*:
  - the analysis failed: there's a link to the alert, where **Refresh investigation** runs it again;
  - your workspace's AI budget is used up: see [Budgets and limits](../../features/ai/budgets-and-limits.md#when-a-limit-is-reached);
  - the alert no longer exists;
  - Nubi is busy with other alerts.

  An analysis on hold says what it's waiting for. One that is still running after 20 minutes gets a link to follow it in NudgeBee.
- **Approve workflows.** An approval card has one button per option the automation offers (a choice list and **Submit** when there are more than three). Your click is recorded as you, so you need edit access to the account or permission to run workflows on it. An already-answered request shows *This approval was already answered.*; an expired one shows *This approval request has expired.*
- **Post a message.** Ask Nubi to post a message to a Teams channel. Nubi shows you the exact message to approve first, then posts it signed *Sent by &lt;your name&gt; via Nubi*. These messages appear in [Delivery history](../../features/notifications.md#delivery-history) as sent from Nubi.
- **Suppress durations.** **Suppress…** offers this alert for 1 h, 4 h, 24 h or 7 days, or every alert of the type for 4 h, 24 h or 7 days.
- **Rate answers** with **👍 Helpful** / **👎 Not helpful**. Very long analyses are cut, with a link to the full one in NudgeBee.
- **Cards expire.** Buttons on a card more than 7 days old no longer work; open the alert in NudgeBee instead.

Nubi recognizes you by the email address of your Teams account, which must belong to a user in the NudgeBee workspace the team is connected to. In a direct message, Nubi offers accounts from every workspace you belong to that has a team connected in your Microsoft tenant.

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
3. Under **Supported account types**, choose **Accounts in any organizational directory (multi-tenant)**. No redirect URI is needed.
4. Click **Register**, and note the **Application (client) ID** and the **Directory (tenant) ID**.
5. Under **API permissions**, no Microsoft Graph permissions are needed; you can remove the default `User.Read`.
6. Under **Certificates & secrets → Client secrets**, create a secret and copy its **Value**. It is shown only once.

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
MS_TEAMS_ACTION_SIGNING_KEY: Required. A random string that signs the data on card buttons and Connect links, for example the output of `openssl rand -hex 32`.
```

`MS_TEAMS_ACTION_SIGNING_KEY` is required: without it, cards are sent without buttons and Nubi can't post Connect links, so no team can be connected. Restart the NudgeBee server pods after updating the secrets.

### Step 4. Create the Teams app package

Create a Teams app for your bot in the [Teams Developer Portal](https://dev.teams.microsoft.com): add a **Bot** with the Application (client) ID from Step 1 and the `team` and `personal` scopes, then download the app package. Upload it in **Teams admin center → Teams apps → Manage apps → Upload new app**.

Then follow [Set up Microsoft Teams](#set-up-microsoft-teams) above.

## Upgrading from an earlier version

Connections now belong to teams instead of whole Microsoft tenants. Upgrading removes existing Microsoft Teams connections, so after the upgrade:

1. In each team, a NudgeBee admin @mentions **Nubi** and opens the **Connect this team** link it posts.
2. In **Admin → Integrations → Microsoft Teams**, pick the default channel again.

Channel-account mappings and notification rules are kept, and work again once the same workspace connects the same team. Microsoft sign-in is no longer used to connect Teams.

## Troubleshooting MS Teams Integration

### 1. Nubi says it can't find your NudgeBee account
* **Symptom**: Nubi replies that it couldn't find a NudgeBee account linked to your email.
* **Root Cause**: The email address of your Teams account isn't a user in the NudgeBee workspace the team is connected to.
* **Remediation**: Ask a NudgeBee admin to invite that email address under **Admin → Access & Users**, and accept the invite.

---

### 2. "This team is connected to another NudgeBee workspace"
* **Root Cause**: Each team belongs to one workspace, and this team is connected to a different one.
* **Remediation**: To move it, remove Nubi from the team, add it back, and open the new link while signed in to the workspace you want. See [Remove, move or disconnect a team](#remove-move-or-disconnect-a-team).

---

### 3. A team or channel is missing from the channel list
* **Root Cause**: The team isn't connected to this workspace, or the channel is private or shared.
* **Remediation**: Connect the team (Steps 1 and 2), then reload the page. Use a standard channel.

---

### 4. The Connect link doesn't connect
* **Symptom**: After opening a Connect link, NudgeBee shows one of these:
  * *This link is for the person it was posted for.* Sign in to NudgeBee with that person's account, or @mention Nubi in the team for a link of your own.
  * *Only a NudgeBee admin can connect Microsoft Teams.* Ask a NudgeBee admin to connect, or request a role that can manage messaging integrations.
  * *This link has expired.* @mention Nubi in the team for a new one.
  * *This workspace's Microsoft Teams teams are in another Microsoft tenant.* A workspace's teams must all be in one Microsoft tenant. Disconnect Microsoft Teams in this workspace first, or connect the team to another workspace.
  * *Your workspace changed in another tab.* Open the link from Teams again.
* **No button on the welcome card**: the person who added Nubi is a guest, uses a personal Microsoft account, or uses a public email domain or an `onmicrosoft.com` address. A NudgeBee admin can @mention Nubi in the team instead. On-prem, also check that `MS_TEAMS_ACTION_SIGNING_KEY` is set.

---

### 5. Notifications Stopped Working / Expired Client Secret, on-prem
* **Symptom**: Notifications were working but now fail, and the logs show `401 Unauthorized` from Microsoft.
* **Root Cause**: The app registration's client secret expired.
* **Remediation**:
  1. Go to Entra ID **App registrations → Certificates & secrets** and create a new client secret.
  2. Update `MS_TEAMS_CLIENT_SECRET` in your NudgeBee secrets.
  3. Restart the NudgeBee server pods.
