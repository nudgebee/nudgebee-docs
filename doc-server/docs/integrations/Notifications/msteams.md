---
sidebar_position: 2
---

# MS Teams

## How to configure MS Teams in your NudgeBee Account

- The loom below shows how to configure Microsoft Teams in your account for notifications.

<div style={{position: "relative", paddingBottom: "55.93750000000001%", height: 0}}>
    <iframe src="https://www.loom.com/embed/1384025f3ba64d8781821d22c85595db?sid=73d9c654-586e-4377-a724-1aff0d450260" frameborder="0" allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe>
</div>

## How to configure MS Teams in your on-prem NudgeBee

To use the Microsoft Teams integration in your on-prem NudgeBee, you'll need to create your own app registration in Microsoft Entra ID (Azure AD) and add its credentials to your NudgeBee secrets. NudgeBee then sends notifications to your Teams channels through the Microsoft Graph API.

Throughout the steps below, replace `https://www.your-nudgebee-server.com` with the base URL of your NudgeBee server.

### Step 1. Register an application in Microsoft Entra ID

If you are new to Azure app registrations, see Microsoft's official guide: [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).

1. Go to the [Azure Portal](https://portal.azure.com) and navigate to **Microsoft Entra ID → App registrations → New registration**.
2. Give the app a name (e.g. `NudgeBee`).
3. Under **Supported account types**, choose one of:
    - **Accounts in this organizational directory only (single tenant)** — recommended if only your organization will sign in. With this option you must also set `MS_TEAMS_AUTHORITY` to your tenant (see Step 4).
    - **Accounts in any organizational directory (multi-tenant)** — works with the default NudgeBee configuration (`https://login.microsoftonline.com/common`).
4. Under **Redirect URI**, select platform **Web** and enter:

```
https://www.your-nudgebee-server.com/api/integrations/ms-teams/callback
```

5. Click **Register**. From the app's **Overview** page, note down the **Application (client) ID** and **Directory (tenant) ID**.

### Step 2. Create a client secret

1. In your app registration, navigate to **Certificates & secrets → Client secrets → New client secret**.
2. Add a description, pick an expiry, and click **Add**.
3. Copy the secret **Value** immediately (it is only shown once). This is your `MS_TEAMS_CLIENT_SECRET`.

:::caution
Track the secret's expiry date. When it expires, Teams notifications will stop working until you create a new secret and update your NudgeBee secrets.
:::

### Step 3. Grant Microsoft Graph permissions

NudgeBee uses delegated Microsoft Graph permissions to list teams, channels, and users, and to send messages.

1. In your app registration, navigate to **API permissions → Add a permission → Microsoft Graph → Delegated permissions**.
2. Add the following permissions:

```
User.ReadBasic.All
User.Read.All
Team.ReadBasic.All
Channel.ReadBasic.All
Channel.Create
ChannelMessage.Send
Chat.Create
Chat.ReadWrite
ChatMessage.Send
```

3. Some of these (e.g. `User.Read.All`, `Channel.Create`) require admin consent. Click **Grant admin consent for &lt;your organization&gt;** so the whole set is pre-approved.

### Step 4. Add your credentials to NudgeBee secrets

Add the following to your NudgeBee server [secrets](../../installation/server/secret_configs.md):

```
MS_TEAMS_CLIENT_ID: The Application (client) ID from Step 1.
MS_TEAMS_CLIENT_SECRET: The client secret value from Step 2.
```

Optionally, you can also set:

```
MS_TEAMS_AUTHORITY: The Microsoft login authority URL used for OAuth sign-in and token exchange.
```

`MS_TEAMS_AUTHORITY` is **optional** — it defaults to `https://login.microsoftonline.com/common`, which works for multi-tenant app registrations. It is **required if you registered a single-tenant app** in Step 1: set it to `https://login.microsoftonline.com/<your-tenant-id>`, otherwise Microsoft will reject sign-ins during installation.

Restart the NudgeBee server pods after updating the secrets so the new values are picked up.

### Step 5. Connect Teams in NudgeBee

1. In the NudgeBee UI, navigate to **Integrations → Notifications → Microsoft Teams** and start the installation.
2. You'll be redirected to Microsoft to sign in and authorize the requested permissions. Sign in with a user who is a member of the teams you want to send notifications to — team and channel lists are resolved through this user's access.
3. After authorization completes, pick the default team and channel for notifications.

:::info
**Expected outcome**: The Teams integration shows as connected in NudgeBee, and a test notification arrives in the selected channel. Use [Notification Rules](../../features/notifications.md) to fine-tune the routing.
:::

### Troubleshooting

- **OAuth sign-in fails with a redirect URI error**: The redirect URI registered in Step 1 must exactly match `https://www.your-nudgebee-server.com/api/integrations/ms-teams/callback`, including scheme and host.
- **Sign-in fails for a single-tenant app**: Make sure `MS_TEAMS_AUTHORITY` is set to `https://login.microsoftonline.com/<your-tenant-id>` — the default `common` authority only works with multi-tenant registrations.
- **Consent errors during sign-in**: An admin has not granted consent for the Graph permissions. Re-check Step 3.
- **Notifications stopped after previously working**: The client secret may have expired — create a new one and update `MS_TEAMS_CLIENT_SECRET`.
