---
id: rbac-permissions-matrix
title: "RBAC & Permissions Matrix: Complete Role Mapping"
sidebar_label: RBAC & Permissions Matrix
sidebar_position: 9
keywords: [rbac matrix, permissions, user roles, tenant admin, sre role, operator role, finops role, api token scopes]
intent: inspect
provider: all
---

# RBAC & Permissions Matrix: Complete Role Mapping

NudgeBee provides role-based access control (RBAC) to enforce least-privilege security across the Web Console, REST APIs, and automated subagent workflows.

---

## 1. Standard Built-in Roles Overview

| Role | Intended Audience | Core Capabilities |
| :--- | :--- | :--- |
| **Tenant Admin** | Platform Lead / Security Administrator | Full read/write access to all tenants, user management, SSO, encryption keys, and integrations. |
| **SRE / Platform Engineer** | Infrastructure & On-Call Engineers | Full operational control over clusters, incident triage, playbook authoring, workflows, and remediation. |
| **Operator / Developer** | Application Developers | View telemetry, acknowledge events, run pre-approved workflows, and inspect application logs/traces. |
| **FinOps / Billing Admin** | Cloud Cost & Finance Teams | Full visibility into spends, cost allocation, and optimization recommendations; cannot mutate cluster infrastructure. |
| **Viewer (Read-Only)** | Auditors / Stakeholders | Read-only access across all dashboards; cannot execute actions, snooze alerts, or view secret credentials. |

---

## 2. Exhaustive Permission Modules Matrix

| Module | Action | Tenant Admin | SRE / Platform | Operator | FinOps Admin | Viewer |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Accounts & Clusters** | View Clusters & Cloud Accounts | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Add / Delete Clusters & Accounts | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Trigger "Sync Now" | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Events & Incident Triage** | View All Events & Timelines | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Acknowledge & Assign Incidents | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Snooze & Unsnooze Events | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Create Suppression Triage Rules | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Close & Resolve Incidents | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Workflows & Automations** | View Workflows & History | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Create & Edit Workflows (Drafts) | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Publish Live Version (`Make Live`) | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Execute Manual / On-Demand Run | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Approve Approval Gates | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Cancel Running Execution | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Optimizations & Autopilot** | View Recommendations & Savings | ✅ | ✅ | ✅ | ✅ | ✅ |
| | One-Click Apply Rightsizing | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Dismiss / Snooze Recommendation | ✅ | ✅ | ❌ | ✅ | ❌ |
| | Configure AutoOptimize Policies | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Notification Rules** | View Rules & Mappings | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Create, Edit & Disable Rules | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Mute Channel Quiet Hours | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Integrations & Secrets** | View Integration Status | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Configure / Rotate API Secrets | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Run Connection Tests | ✅ | ✅ | ❌ | ❌ | ❌ |
| **User & Tenant Management** | Invite Users & Assign Roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Configure SAML / OIDC SSO | ✅ | ❌ | ❌ | ❌ | ❌ |
| | View Audit Trail Logs | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## 3. Scoping & API Token Scopes

- **Tenant-Wide Scopes**: Roles assigned at the Tenant root level inherit permissions across all registered Kubernetes clusters, AWS accounts, Azure subscriptions, and GCP projects.
- **Cluster/Namespace Granular Scopes**: Custom roles can be restricted to specific cluster IDs or namespaces (e.g. *Developer access limited to namespace `payments` in cluster `staging-east`*).
- **API Tokens**: Tokens created under **Settings $\rightarrow$ API Tokens** can be restricted to specific granular permission scopes (e.g. `events:Write`, `workflows:Trigger`).
