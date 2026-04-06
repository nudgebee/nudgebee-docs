---
sidebar_position: 3
---

# GitLab Issues

## Overview

NudgeBee integrates with GitLab for issue tracking. Events, alerts, and autopilot actions can automatically create or update GitLab issues in your projects.

For the full integration guide including merge request automation and repository setup, see the [GitLab Integration Guide](../Code%20Repository/GitLab/gitlab-integration.md).

---

## Generate a Personal Access Token

1. In GitLab, go to **Settings** > **Access Tokens**.
2. Enter a **Token name** (e.g., `nudgebee-tickets`).
3. Select the **`api`** scope.
4. Click **Create personal access token**.
5. Copy the token — it will not be shown again.

---

## Add GitLab Account in NudgeBee

1. Navigate to **Settings** > **Integrations** > **Repos** tab.
2. Click the **Gitlab** tile, then click **Add GitLab Account**.
3. Fill in:
   - **Name** — Unique name for this configuration
   - **GitLab URL** — `https://gitlab.com` (or your self-hosted URL)
   - **Username** — Your GitLab username
   - **Personal Access Token** — The token from the previous step
4. Click **Save**.

![Add GitLab Account modal](../../../static/img/gitlab_account_modal.png)

NudgeBee validates credentials on save by authenticating against the GitLab API. If validation fails, check that the username matches the PAT owner and the token has `api` scope.

---

## Creating Issues

Once configured, GitLab issues can be created:

- **Automatically** — from events, alerts, or autopilot runbook actions
- **Manually** — from the NudgeBee event detail view

Each issue includes:
- Title and description with event context
- A `nudgebee` label for tracking
- Optional assignee and custom labels

NudgeBee tracks issues by reference ID. Duplicate events add a **comment** to the existing issue rather than opening a new one.

<!-- ![GitLab issue created from NudgeBee event](../../../static/img/gitlab_issue_example.png) -->

---

## Self-Hosted GitLab

Set the **GitLab URL** field to your instance URL (e.g., `https://gitlab.internal.company.com`). All operations use this base URL automatically.
