---
sidebar_position: 2
---
# MS Teams

## Overview

NudgeBee integrates with Microsoft Teams to deliver real-time notifications for events, alerts, and incident updates directly to your Teams channels. Notifications are sent as rich Adaptive Cards via the Microsoft Graph API.

---

## Video Walkthrough

<div style={{position: "relative", paddingBottom: "55.93750000000001%", height: 0}}>
    <iframe src="https://www.loom.com/embed/1384025f3ba64d8781821d22c85595db?sid=73d9c654-586e-4377-a724-1aff0d450260" frameborder="0" allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe>
</div>

---

## Prerequisites

Before configuring the integration, ensure you have:

- A **Microsoft 365** organization with Microsoft Teams enabled
- An **Azure AD App Registration** with the following Microsoft Graph API permissions:
  - `Team.ReadBasic.All` — list joined teams
  - `Channel.ReadBasic.All` — list channels in teams
  - `ChannelMessage.Send` — post messages to channels
  - `Chat.Create` — create 1:1 chats (for direct messages)
  - `Chat.ReadWrite` — send messages in chats
  - `User.Read.All` — list organization users (for user mapping)
- An **access token** (OAuth2 bearer token) from the registered application

---

## MS Teams Integration Configuration

Navigate to **Settings** > **Integrations** > **Notifications** tab and select **MS Teams** to open the configuration form.

### Register an Azure AD Application

1. Go to the [Azure Portal](https://portal.azure.com) > **Azure Active Directory** > **App registrations**.
2. Click **New registration**.
3. Enter a name (e.g., `NudgeBee Teams Integration`) and select the appropriate account type.
4. Under **API permissions**, add the Microsoft Graph permissions listed in the prerequisites above. Grant **admin consent** for the organization.
5. Under **Certificates & secrets**, create a new client secret and note the value.
6. Note the **Application (client) ID** and **Directory (tenant) ID** from the app's Overview page.

### Connect MS Teams in NudgeBee

1. In NudgeBee, navigate to the MS Teams integration page.
2. Click **Connect** to initiate the OAuth flow. You will be redirected to Microsoft to authorize the application.
3. Sign in with your Microsoft 365 account and grant the requested permissions.
4. After authorization, NudgeBee will automatically discover your joined teams and channels.

### Select Notification Channels

After connecting, configure which Teams channels should receive notifications:

1. Select a **Team** from the list of your joined teams.
2. Select one or more **Channels** within that team.
3. Save the configuration.

---

## Capabilities

Once configured, NudgeBee can perform the following operations with MS Teams:

| Operation | Description |
|-----------|-------------|
| **Post to Channel** | Send Adaptive Card notifications to selected Teams channels |
| **Reply to Thread** | Post threaded replies to existing notification messages |
| **Direct Message** | Send 1:1 chat messages to specific users |
| **Add Reaction** | React to notification messages (e.g., acknowledge alerts) |
| **List Users** | Retrieve organization users for user mapping and mentions |

---

## Notification Format

Notifications are delivered as **Adaptive Cards** — rich, interactive message cards that display:

- Event or alert title and severity
- Relevant context and details
- Links back to the event in NudgeBee

---

## Verify the Integration

1. Save the configuration. If the OAuth connection is valid, the integration is created without errors.
2. Navigate to any event in NudgeBee.
3. Trigger a notification (or wait for an alert to fire).
4. Verify the Adaptive Card message appears in your selected Teams channel.

---

## Notes

- MS Teams notifications use the **Microsoft Graph API v1.0** endpoint.
- Rate limiting is handled automatically — NudgeBee retries with backoff when the Graph API returns `429 Too Many Requests`.
- The integration requires an active OAuth token. If the token expires, you may need to re-authorize from the integration settings.
- For on-premise deployments, ensure your NudgeBee instance can reach `https://graph.microsoft.com` and `https://login.microsoftonline.com`.