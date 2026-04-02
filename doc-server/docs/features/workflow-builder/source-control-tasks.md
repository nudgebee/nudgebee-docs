---
sidebar_position: 13
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
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | GitHub CLI response. |

