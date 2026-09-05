---
sidebar_position: 15
sidebar_label: Tenant Settings
---

# Tenant Settings

**Admin → Tenant Settings**

Tenant-wide configuration: who may join, how NudgeBee reads your telemetry labels, and which features are switched on. Everything here applies to every account in the tenant.

Editing requires `tenants:Write`. Without it the page is readable and the controls are disabled, with a banner naming the missing permission.

<!-- ![Tenant Settings General tab](./img/tenant-settings-general.png) -->

## General

| Setting | What it controls |
|---|---|
| **Tenant Name** | The display name for the tenant. |
| **Allow self-onboarding via domain login** | Whether someone signing in with a matching email domain gets an account automatically, instead of needing an invite. |
| **Allowed Domains** | The email domains self-onboarding accepts. Only meaningful when self-onboarding is on. |
| **Default Auth Role** | The role a self-onboarded user receives. |

:::caution Self-onboarding is a membership decision
Turning it on means anyone who can obtain an email address at an allowed domain can enter the tenant at the default role. Set the default role to a read-only one unless you have a reason not to.
:::

## Label Mapping

NudgeBee has to know which of your labels mean what. Three sub-tabs, one per signal type:

### Logs

Map your logs backend's label keys onto product concepts, plus a **Cluster Label** telling NudgeBee which key carries the cluster name.

### Traces

The same mapping for your tracing backend.

### Webhook alerts

For alerts arriving by webhook, name the labels that carry:

- **Subject Name Labels** — what the alert is about (the workload, host or resource).
- **Namespace Labels** — where it lives.
- **Severity Labels** — how bad it is.

Each accepts several keys, because different alert sources name the same thing differently. NudgeBee takes the first one present.

Getting these wrong is the usual reason a webhook alert arrives with no subject, lands in the wrong account, or shows an unexpected severity. If alerts are arriving but look empty, this is the first place to check.

<!-- ![Tenant Settings Label Mapping tab with webhook alert label fields](./img/tenant-settings-labels.png) -->

## Features

Per-tenant feature flags, grouped by category with a count per group and an **All** view. Toggling one here switches the feature on or off for the whole tenant.

Some product surfaces are gated by a flag here rather than by a permission — the LLM Analyser tab is one — so a feature that seems missing for everyone is worth checking on this tab before anything else.

You can reveal the underlying flag ids, which is what you want when comparing a tenant's configuration against a support request or another environment.

## Related

- [User Management](./user-management.md)
- [Security](./security.md) — authentication and the role model behind Default Auth Role
- [Missing Alerts & Pipeline Triage](./troubleshooting/alert-pipeline-troubleshooting.md) — when label mapping is the reason an alert looks wrong
