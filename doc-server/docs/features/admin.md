---
sidebar_position: 8.5
sidebar_label: Admin
---

# Admin

Open **Admin** on the left rail. It holds the tenant's configuration, in six tabs:

| Tab | What it is for | Page |
|---|---|---|
| **Overview** | Shortcuts to the common admin tasks | below |
| **Access & Users** | **Users**, **Groups**, **Roles**, **Ownership**, **Audit Log** | [Access & Users](./user-management.md) |
| **Integrations** | Connect clouds, clusters, observability, messaging, ticketing, repositories and more | [Integrations](../integrations/index.md#the-integrations-page) |
| **Notification Rules** | **Rules** for where notifications go, and **Delivery history** | [Notification Rules](./notifications.md) |
| **AI & Tools** | Agents, tools, providers, security, budgets, memory policy, RCA format | [AI & Tools](./ai/ai-and-tools.md) |
| **Tenant Settings** | **General**, **Label Mapping**, **Features** | [Tenant Settings](./tenant-settings.md) |

A tab you can't open is greyed out: your role needs read access to its area. Tenant admins and read-only tenant admins can open every tab. **API Tokens** are not under Admin — open them from your avatar menu (see [API Tokens](./api-tokens.md)).

## Overview

Two views: **Overview** and **Connections**. Overview has cards with one-click shortcuts:

- **Access & Users** — invite new users, create a group, configure roles and permissions, assign resource ownership, review the audit log.
- **Integrations** — connect a cloud account, add Kubernetes clusters, add logs, metrics and traces, connect messaging and ticketing, browse all providers.
- **Notification Rules** — route troubleshooting, optimization or SLO alerts to a channel, schedule a weekly digest, see delivery history, manage notification channels.
- **AI & Tools** — add providers and models, add tools and MCPs, create a new agent, create skills, set budgets and limits.
- **Tenant Settings** — view tenant details, edit tenant identity, set up self-onboarding, map labels for logs and alerts, turn features on or off.
