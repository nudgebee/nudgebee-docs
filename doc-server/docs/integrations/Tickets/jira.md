---
sidebar_position: 1
---
# Jira

## Overview

NudgeBee integrates with Jira for issue and incident tracking. Events and alerts can automatically create Jira issues, and updates are synced as comments. Both Jira Cloud and Jira Data Center are supported.

---

## Video Walkthrough

<div style={{position: "relative", paddingBottom: "56.25%", height: 0}}><iframe src="https://www.loom.com/embed/5ef4865527ba4bb7a78d506ba53d3db1?sid=e955487f-bdd1-4969-8283-d2f0ed7d3d99" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

---

## Prerequisites

Before configuring the integration, ensure you have:

- A **Jira** account (Cloud or Data Center)
- A Jira **API token** (for Cloud) or **password** (for Data Center)
- The **Jira instance URL** (e.g., `yourcompany.atlassian.net`)
- A user account with permissions to create issues in the target project(s)

---

## Generate a Jira API Token

1. Log in to [https://id.atlassian.com/manage/api-tokens](https://id.atlassian.com/manage/api-tokens).
2. Click **Create API token**.
3. Enter a memorable label for your token (e.g., `NudgeBee Integration`) and click **Create**.
4. Click **Copy** to copy the token to your clipboard.

:::note
For security reasons, you cannot view the token after closing the creation dialog. Store the token securely, just as you would a password.
:::

---

## Jira Integration Configuration

Navigate to **Settings** > **Integrations** > **Tickets** tab and select **Jira** to open the configuration form.

### Configuration Fields

* **URL \*** (Required)
    * Your Jira instance URL (e.g., `yourcompany.atlassian.net`).
    * Do not include `https://` — just the hostname.

* **Username \*** (Required)
    * Your Jira username or the email address associated with your Atlassian account.

* **API Token / Password \*** (Required)
    * For **Jira Cloud**: use the API token generated above.
    * For **Jira Data Center**: use your account password.
    * This value is stored encrypted in NudgeBee.

* **Authentication Type**
    * The authentication method to use. Default: `token`.
    * Options: `token` (API token) or `application`.

**Credential validation**: on save, NudgeBee tests the connection by fetching your Jira projects. If authentication fails, verify your URL, username, and API token are correct.

---

## Capabilities

Once configured, NudgeBee can perform the following operations with Jira:

| Operation | Description |
|-----------|-------------|
| **Create Issue** | Create issues in any accessible Jira project |
| **Add Comment** | Add comments to existing issues |
| **Query Metadata** | Fetch available projects, priorities, and users for form population |

### Supported Issue Fields

| Field | Description |
|-------|-------------|
| **Summary** | Issue title |
| **Description** | Detailed issue body with event context |
| **Project** | Target Jira project |
| **Priority** | Issue priority (fetched from your Jira configuration) |
| **Assignee** | Assign to a team member |

---

## Creating Issues

Issues can be created from NudgeBee in two ways:

- **Automatically** — from events, alerts, or autopilot runbook actions
- **Manually** — from the NudgeBee event detail view by clicking the ticket icon

Each issue includes:
- A summary derived from the event title
- A detailed description with full event context and a link back to NudgeBee

---

## Verify the Integration

1. Save the configuration. If credentials are valid, the integration is created without errors.
2. Navigate to any event in NudgeBee.
3. Click the ticket creation option and select **Jira**.
4. Select a project and priority, then create the issue.
5. Verify the issue appears in your Jira project with the correct fields.

---

## Notes

- NudgeBee uses Jira's REST API v2 for all operations.
- Both **Jira Cloud** (Atlassian-hosted) and **Jira Data Center** (self-hosted) are supported.
- Projects and priorities are synced from your Jira instance and cached for quick access when creating tickets.
- For on-premise NudgeBee deployments connecting to Jira Data Center, ensure network connectivity between the NudgeBee server and your Jira instance.