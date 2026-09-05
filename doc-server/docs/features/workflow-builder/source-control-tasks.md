---
sidebar_position: 14
sidebar_label: Source Control Tasks
---

# Source Control Tasks

Interact with source control platforms.

## `scm.github.cli`

**Display Name:** GitHub CLI

Run GitHub CLI commands for managing issues, PRs, releases, and more.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | integration | Yes | GitHub integration ID. |
| `command` | string | Yes | GitHub CLI command (e.g., `issue create --title "Bug" --body "Details"`). |
| `account_id` | account | No | NudgeBee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | GitHub CLI response. |

## `scm.gitlab.cli`

**Display Name:** GitLab CLI

Run GitLab CLI (`glab`) commands for managing issues, merge requests, pipelines, and more.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | integration | Yes | GitLab integration ID. |
| `command` | string | Yes | GitLab CLI command (e.g., `issue create --title "Bug" --description "Details"`). |
| `account_id` | account | No | NudgeBee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | GitLab CLI response. |

:::note Self-managed GitLab
The task authenticates `glab` with the host from the selected integration, so self-managed instances work without extra configuration.
:::
