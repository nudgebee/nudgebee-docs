---
sidebar_position: 2
---
# GitHub Issues

## Overview

NudgeBee integrates with GitHub Issues for issue tracking and incident management. Events and alerts can automatically create GitHub issues in your repositories. Both personal access tokens and GitHub App authentication are supported.

---

## Video Walkthrough

<div style={{position: "relative", paddingBottom: "55.729166666666664%", height: 0}}><iframe src="https://www.loom.com/embed/89165d3de419458a820a5b98de6b6558?sid=f18a86e0-30ff-4b19-920d-490e4322537b" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

---

## Prerequisites

Before configuring the integration, ensure you have:

- A **GitHub** account (GitHub.com or GitHub Enterprise)
- A **Personal Access Token** with `repo` scope, or a **GitHub App** installation
- Access to the repositories where you want to create issues

---

## Generate a Personal Access Token

1. Navigate to your GitHub account **Settings** > **Developer Settings** > **Personal access tokens**.
2. Click **Generate new token**.
3. Select **`repo`** as the scope — this grants access to create issues and pull requests in your repositories.
4. Click **Generate token**.
5. Copy the token and store it securely — GitHub will only display it once.

:::note
For GitHub App authentication, you will need the **Installation ID** instead of a personal access token. See the [GitHub App Authentication](#github-app-authentication) section below.
:::

---

## GitHub Issues Integration Configuration

Navigate to **Settings** > **Integrations** > **Tickets** tab and select **GitHub** to open the configuration form.

### Configuration Fields

* **URL**
    * GitHub API URL. Default: `https://github.com`.
    * Only change this if you are using **GitHub Enterprise** with a custom domain.

* **Username \*** (Required)
    * Your GitHub username or organization name.

* **Token \*** (Required)
    * For **token** authentication: your Personal Access Token.
    * For **application** authentication: the GitHub App Installation ID.
    * This value is stored encrypted in NudgeBee.

* **Authentication Type**
    * The authentication method to use. Default: `token`.
    * Options: `token` (Personal Access Token) or `application` (GitHub App).

**Credential validation**: on save, NudgeBee tests the connection by verifying the GitHub user. If authentication fails, verify your username and token are correct and that the token has the `repo` scope.

---

## GitHub App Authentication

For organizations that prefer GitHub App authentication over personal access tokens:

1. Install the NudgeBee GitHub App in your organization (or create your own GitHub App).
2. Note the **Installation ID** from the app's installation page.
3. Set **Authentication Type** to `application` and enter the Installation ID in the Token field.
4. Ensure the following environment variables are configured on your NudgeBee server:
   - `GITHUB_APP_ID` — your GitHub App's ID
   - `GITHUB_PRIVATE_KEY` — the GitHub App's private key (PEM format)

---

## Capabilities

Once configured, NudgeBee can perform the following operations with GitHub:

| Operation | Description |
|-----------|-------------|
| **Create Issue** | Create issues in any accessible repository |
| **Add Comment** | Add comments to existing issues |
| **Query Metadata** | Fetch available repositories and collaborators for form population |

### Supported Issue Fields

| Field | Description |
|-------|-------------|
| **Title** | Issue title |
| **Body** | Detailed issue description with event context |
| **Repository** | Target GitHub repository |
| **Assignee** | Assign to a repository collaborator |

---

## Creating Issues

Issues can be created from NudgeBee in two ways:

- **Automatically** — from events, alerts, or autopilot runbook actions
- **Manually** — from the NudgeBee event detail view by clicking the ticket icon

Each issue includes:
- A title derived from the event title
- A markdown body with full event context and a link back to NudgeBee

---

## Verify the Integration

1. Save the configuration. If credentials are valid, the integration is created without errors.
2. Navigate to any event in NudgeBee.
3. Click the ticket creation option and select **GitHub**.
4. Select a repository and optionally assign it, then create the issue.
5. Verify the issue appears in your GitHub repository.

---

## Notes

- NudgeBee uses the GitHub REST API v3 for all operations.
- Both **GitHub.com** and **GitHub Enterprise** are supported.
- Repositories are synced from your GitHub account and cached for quick access when creating issues.
- The `repo` scope on the personal access token grants access to both public and private repositories.