---
id: coverage-manifest
title: Documentation & NuBi Coverage Manifest
sidebar_label: Coverage Manifest
sidebar_position: 10
keywords: [documentation coverage, nubi tools, api mapping, troubleshooting index, capabilities matrix]
intent: inspect
provider: all
---

# Documentation & NuBi Coverage Manifest

This manifest tracks documentation completeness across NudgeBee's core capability families, mapping each user-facing API and UI surface to its conceptual documentation, operational how-to guides, troubleshooting decision trees, and corresponding **NuBi AI live tools**.

---

## 1. Complete Capabilities & Documentation Matrix

| Capability Family | User-Facing UI / API Surface | How-To Guide | Conceptual Reference | Troubleshooting & Decision Tree | NuBi Live Tool | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Agent Connectivity** | `agents_list_health` | [Agent Connectivity](../installation/agent/operate/troubleshoot-agent-connectivity.md) | [Architecture](../architecture.md) | [Troubleshoot Connectivity](../installation/agent/operate/troubleshoot-agent-connectivity.md#3-diagnostic-decision-tree) | `agents_list_health` | **P0** |
| **K8s Subsystems** | Cluster Health View | [K8s Health](../installation/agent/operate/agent-health.md) | [Kubernetes](../installation/agent/index.md) | [Prometheus Disconnected](../installation/agent/connect/prometheus-troubleshooting.md) | `metrics_query`, `logs_query` | **P0** |
| **Alerting Pipeline** | Alert Ingestion Webhook | [Alerting](./troubleshooting/alerting.md) | [Event Lifecycle](./troubleshooting/event-lifecycle.md) | [Missing Alerts Pipeline](./troubleshooting/alert-pipeline-troubleshooting.md) | `events_list`, `events_summary` | **P0** |
| **Alert State Control** | `events_triage_action` | [Alert State Management](./troubleshooting/alert-state-management.md) | [Triage Rules](./troubleshooting/event-lifecycle.md) | [Snooze & Suppress Guide](./troubleshooting/alert-state-management.md#1-terminology--comparative-action-matrix) | `events_list_triage_rules` | **P0** |
| **Integrations** | `integrations_list` | [Integration Health](../integrations/troubleshooting.md) | [Integrations Overview](../integrations/index.md) | [Integration Diagnostics](../integrations/troubleshooting.md#2-diagnostics-by-integration-family) | `integrations_list`, `integrations_summary` | **P0** |
| **Cloud Sync** | `accounts_list` / `sync` | [Cloud Fleet Onboarding](./Cloud/cloud-fleet-onboarding.md) | [Cloud Agent Sync](./Cloud/cloud-agent-sync.md) | [Cloud Sync Troubleshooting](./Cloud/troubleshooting.md) | `accounts_summary`, `accounts_get` | **P0** |
| **Event Automations** | `workflow_trigger` | [Create Event Automation](./workflow-builder/create-event-automation.md) | [Playbooks vs Workflows](./workflow-builder/automation-architecture-guide.md) | [Workflow Did Not Trigger](./workflow-builder/workflow-did-not-trigger.md) | `workflow_list_executions` | **P1** |
| **Optimization Automations** | `optimizations_apply` | [Optimization Automation](./workflow-builder/create-optimization-automation.md) | [Recommendations Lifecycle](./optimizations/recommendations-lifecycle.md) | [Dry Run & Validation](./workflow-builder/workflow-dry-run-validation.md) | `optimizations_list`, `optimizations_summary` | **P1** |
| **Workflow Operations** | `workflow_approve` | [Workflow Operations](./workflow-builder/workflow-operations-approvals.md) | [Versioning](./workflow-builder/workflow-versioning.md) | [Approval Gates & Replay](./workflow-builder/workflow-operations-approvals.md#1-interactive-human-in-the-loop-approval-gates) | `workflow_approve`, `workflow_replay` | **P1** |
| **Notifications** | `notifications_rules` | [Notification Routing](./notifications.md) | [Notification Overview](../integrations/Notifications/index.md) | [Missing Notifications](./notifications.md#7-troubleshooting-why-did-a-notification-not-send) | `slack_post_message` | **P1** |
| **Ticketing** | `tickets_create` | [Ticket Integrations](../integrations/Tickets/index.md) | [Tickets Overview](./tickets.md) | [Ticketing Troubleshooting](../integrations/Tickets/ticket-integrations-troubleshooting.md) | `tickets_create`, `tickets_comments_list` | **P2** |
| **SLO Management** | `slo_create` / `list` | [SLO Operations](./slo-operations.md) | [SLO Overview](./slo.md) | [Burn Rate Triage](./slo-operations.md#4-multi-window-multi-burn-rate-alerting) | `slo_list`, `slo_get` | **P2** |
| **RBAC & Security** | `auth_roles_list` | [Permissions Matrix](../integrations/Authentication/rbac-permissions-matrix.md) | [User Management](./user-management.md) | [RBAC Troubleshooting](../integrations/Authentication/rbac-permissions-matrix.md#2-exhaustive-permission-modules-matrix) | `auth_users_list`, `auth_roles_list` | **P2** |

---

## 2. NuBi Natural Language Synonym Optimization Index

Every documentation page is indexed with user intent synonyms so NuBi can instantly retrieve exact answers when users ask conversational questions:

```json
{
  "troubleshoot-prometheus-disconnected": [
    "metrics disconnected",
    "Prometheus unavailable",
    "no metrics in cluster",
    "metrics integration unhealthy",
    "Prometheus 401 unauthorized",
    "vector(1) failed"
  ],
  "alert-pipeline-troubleshooting": [
    "why did I not get alert",
    "no alerts coming to Slack",
    "missing notification",
    "alertmanager webhook failed",
    "alert filtered out"
  ],
  "agent-connectivity": [
    "agent disconnected",
    "agent flapping",
    "cluster offline",
    "heartbeat timeout",
    "relay connection failed"
  ],
  "alert-state-management": [
    "how to snooze alert",
    "suppress noisy alert",
    "acknowledge vs resolve",
    "mute channel vs silence alert",
    "unsnooze event"
  ],
  "workflow-did-not-trigger": [
    "why did workflow not run",
    "workflow skipped",
    "event trigger mismatch",
    "cron schedule not firing",
    "workflow stuck in draft"
  ]
}
```
