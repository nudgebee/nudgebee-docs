---
sidebar_position: 12
sidebar_label: CI/CD Tasks
---

# CI/CD Tasks

Manage deployments through CI/CD tools.

## `cicd.argocd.cli`

**Display Name:** ArgoCD CLI

Run ArgoCD commands to manage application deployments (sync, rollback, status checks).

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | integration | Yes | ArgoCD integration ID. |
| `command` | string | Yes | ArgoCD command (e.g., `app sync my-app`, `app get my-app`). |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Command response. |

