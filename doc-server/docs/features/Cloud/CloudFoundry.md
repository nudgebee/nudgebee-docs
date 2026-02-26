---
sidebar_position: 4
---
# Cloud Foundry

## Overview

NudgeBee integrates with **Cloud Foundry** (including Pivotal Cloud Foundry / Tanzu Application Service) to provide visibility into your PaaS applications, spaces, organizations, and services. The integration uses the CF API v3 to discover resources, collect metrics, and surface audit events.

---

## What You Get

### Resource Discovery
NudgeBee automatically discovers and inventories your Cloud Foundry resources:

| Resource Type | Description |
|---------------|-------------|
| **Applications** | All deployed apps with state, lifecycle, buildpack, and metadata |
| **Spaces** | CF spaces with organization relationships |
| **Organizations** | CF orgs including suspension status |
| **Routes** | App routes with host, path, protocol, and destinations |
| **Service Instances** | Managed and user-provided services with plan and status info |

### Application Metrics
For CF applications, NudgeBee collects real-time performance metrics:

| Metric | Description |
|--------|-------------|
| `cpu_usage` | CPU utilization percentage per instance |
| `memory_usage_percent` | Memory usage as a percentage of quota |
| `memory_usage_bytes` | Absolute memory usage in bytes |
| `disk_usage_percent` | Disk usage as a percentage of quota |
| `disk_usage_bytes` | Absolute disk usage in bytes |
| `instance_count` | Number of running instances |

### Audit Events
NudgeBee ingests Cloud Foundry audit events to track operational changes:
- App lifecycle events (start, stop, restart, crash)
- Deployment and scaling events
- Configuration changes
- User and permission changes

### App Operations
NudgeBee supports executing operational commands on CF applications:

| Command | Description |
|---------|-------------|
| **Start** | Start a stopped application |
| **Stop** | Stop a running application |
| **Restart** | Restart an application |
| **Scale** | Scale instances, memory, or disk for an application |

---

## Prerequisites

Before connecting Cloud Foundry, ensure you have:

- A **Cloud Foundry** deployment (PCF, TAS, or open-source CF) with API v3 enabled
- The **CF API URL** (e.g., `https://api.sys.example.com`)
- One of the following authentication credentials:
  - **UAA OAuth2 credentials** — client ID and secret (recommended for production)
  - **Bearer token** — for testing or Kubernetes-based CF (e.g., Korifi)

---

## Configuration

### Add a Cloud Foundry Account

1. Navigate to **Settings** > **Cloud Accounts**.
2. Select **Cloud Foundry** as the provider.
3. Enter the required configuration:

| Field | Description |
|-------|-------------|
| **CF API URL** | Your Cloud Foundry API endpoint (e.g., `https://api.sys.example.com`) |
| **Auth Type** | `uaa` for UAA OAuth2 (production) or `token` for bearer token |
| **Credentials** | UAA client ID/secret or bearer token depending on auth type |
| **Skip SSL** | Enable if your CF instance uses self-signed certificates |

### Authentication Methods

#### UAA OAuth2 (Recommended for Production)
NudgeBee authenticates via the UAA server discovered from your CF API. This method automatically refreshes tokens and is suitable for long-running production integrations.

#### Bearer Token
For testing or Kubernetes-based CF deployments (e.g., Korifi on GKE), you can provide a bearer token directly. Note that bearer tokens may expire and require manual renewal.

---

## Architecture

```text
[Cloud Foundry API v3]
        │
        ▼
[NudgeBee Cloud Collector]
        │
        ├── Resource Discovery (apps, spaces, orgs, routes, services)
        ├── Metrics Collection (CPU, memory, disk per app instance)
        ├── Audit Events (operational change tracking)
        └── App Commands (start, stop, restart, scale)
        │
        ▼
[NudgeBee Platform]
        │
        ├── Unified Cloud Dashboard
        ├── AI-Powered Troubleshooting
        └── Event Correlation
```

---

## Verify the Integration

1. Save the Cloud Foundry account configuration.
2. Navigate to the **Cloud** section in NudgeBee.
3. Verify that your CF organizations, spaces, and applications appear in the resource inventory.
4. Select an application and check that metrics (CPU, memory) are being collected.

---

## Notes

- NudgeBee uses the **Cloud Foundry API v3** for all operations.
- Billing data is not available through the CF API — cost tracking relies on your IaaS provider (AWS, Azure, GCP).
- Resource discovery runs on a scheduled interval to keep your inventory up to date.
- For PCF/TAS deployments on AWS, you can combine Cloud Foundry integration with [AWS integration](./AWS.md) for full stack visibility.