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
| **Agent Connectivity** | Cluster Health View / `agent` | [Agent Connectivity](../installation/agent/operate/troubleshoot-agent-connectivity.md) | [Architecture](../architecture.md) | [Troubleshoot Connectivity](../installation/agent/operate/troubleshoot-agent-connectivity.md#3-diagnostic-decision-tree) | Docs only (`nudgebee_docs_search`) | **P0** |
| **K8s Subsystems** | Cluster Health View | [K8s Health](../installation/agent/operate/agent-health.md) | [Kubernetes](../installation/agent/index.md) | [Prometheus Disconnected](../installation/agent/connect/prometheus-troubleshooting.md) | Docs only (`nudgebee_docs_search`) | **P0** |
| **Alerting Pipeline** | Alert Ingestion Webhook | [Alerting](./troubleshooting/alerting.md) | [Event Lifecycle](./troubleshooting/event-lifecycle.md) | [Missing Alerts Pipeline](./troubleshooting/alert-pipeline-troubleshooting.md) | Docs only (`nudgebee_docs_search`) | **P0** |
| **Alert State Control** | Event Details / Triage Rules | [Alert State Management](./troubleshooting/alert-state-management.md) | [Triage Rules](./troubleshooting/event-lifecycle.md) | [Snooze & Suppress Guide](./troubleshooting/alert-state-management.md#1-terminology--comparative-action-matrix) | Docs only (`nudgebee_docs_search`) | **P0** |
| **Integrations** | Integrations Dashboard | [Integration Health](../integrations/index.md#integration-health-states--lifecycle) | [Integrations Overview](../integrations/index.md) | [Integration Diagnostics](../integrations/index.md#provider-specific-troubleshooting-guides) | `nudgebee_integrations_list`, `nudgebee_integration_get_status`, `nudgebee_integration_diagnose` | **P0** |
| **Cloud Accounts** | Cloud Accounts Dashboard | [Cloud Fleet Onboarding](./Cloud/cloud-fleet-onboarding.md) | [Cloud Agent Sync](./Cloud/cloud-agent-sync.md) | [Cloud Sync Troubleshooting](./Cloud/troubleshooting.md) | `nudgebee_accounts_list`, `nudgebee_account_get` | **P0** |
| **Event Automations** | Workflow Canvas | [Create Event Automation](./workflow-builder/create-event-automation.md) | [Playbooks vs Workflows](./workflow-builder/automation-architecture-guide.md) | [Workflow Did Not Trigger](./workflow-builder/workflow-did-not-trigger.md) | Planned | **P1** |
| **Optimization Automations** | Optimizations / Autopilot | [Optimization Automation](./workflow-builder/create-optimization-automation.md) | [Recommendations Lifecycle](./optimizations/recommendations-lifecycle.md) | [Dry Run & Validation](./workflow-builder/workflow-dry-run-validation.md) | Planned | **P1** |
| **Workflow Operations** | Workflow Executions | [Workflow Operations](./workflow-builder/workflow-operations-approvals.md) | [Versioning](./workflow-builder/workflow-versioning.md) | [Approval Gates & Replay](./workflow-builder/workflow-operations-approvals.md#1-interactive-human-in-the-loop-approval-gates) | Planned | **P1** |
| **Notifications** | Notification Rules | [Notification Routing](./notifications.md) | [Notification Overview](../integrations/Notifications/index.md) | [Missing Notifications](./notifications.md#7-troubleshooting-why-did-a-notification-not-send) | Planned | **P1** |
| **Ticketing** | Ticket Integrations | [Ticket Integrations](../integrations/Tickets/index.md) | [Tickets Overview](./tickets.md) | [Ticketing Troubleshooting](../integrations/Tickets/ticket-integrations-troubleshooting.md) | Planned | **P2** |
| **SLO Management** | SLOs View | [SLO Operations](./slo-operations.md) | [SLO Overview](./slo.md) | [Burn Rate Triage](./slo-operations.md#4-multi-window-multi-burn-rate-alerting) | Planned | **P2** |
| **RBAC & Security** | Admin Users & Groups | [Security & Authorization](./security.md) | [User Management](./user-management.md) | [Access Control](./security.md#authorization--access-control) | Docs only (`nudgebee_docs_search`) | **P2** |

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
