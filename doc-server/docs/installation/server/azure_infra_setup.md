---
sidebar_position: 9
---

# Azure Infrastructure Setup

This guide covers the Azure setup required for NudgeBee deployments to enable Azure Event Grid integration for real-time resource event monitoring.

## Prerequisites

### 1. Configure the Base URL

NudgeBee receives Azure Event Grid events via a webhook endpoint on your NudgeBee instance. Ensure your `BASE_URL` is set correctly in your Helm configuration — this is the publicly accessible URL of your NudgeBee deployment (e.g., `https://app.nudgebee.com`).

The webhook endpoint will be: `{BASE_URL}/api/webhooks/azure-eventgrid`

### 2. Configure the ARM Template URL

Set the URL to the ARM template that will be deployed in customer Azure subscriptions:

```yaml
nudgebee_secret:
  # URL to the ARM template deployed in customer subscriptions
  AZURE_ARM_TEMPLATE_URL: "https://nudgebee-documents-v2.s3.amazonaws.com/nudgebee-azure-arm-template.json"
```

### 3. (Optional) Service Bus for Backward Compatibility

If you have existing Azure accounts using Service Bus delivery, keep the Service Bus configuration. New accounts will use the webhook delivery method automatically.

```yaml
nudgebee_secret:
  # Service Bus connection (only needed for existing accounts using Service Bus delivery)
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_CONNECTION_STRING: "<connection-string>"
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_NAMESPACE: "<namespace-name>"
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_QUEUE_NAME: "<queue-name>"
```

### 4. Ingress Configuration

Ensure your ingress routes `/api/webhooks/azure-eventgrid` to the `services-server` service on port 8000. If you use the NudgeBee Helm chart, this path is included by default.

---

## How It Works

### Architecture

```
Customer Azure Subscription                    NudgeBee Infrastructure
┌─────────────────────────────┐               ┌────────────────────────────┐
│                             │               │                            │
│  Event Grid System Topic    │   HTTPS POST  │  services-server           │
│  (subscription-level)       │──────────────>│  /api/webhooks/            │
│                             │   (webhook)   │    azure-eventgrid         │
│  Event Subscription         │               │         │                  │
│  (filtered by provider)     │               │         ▼                  │
│                             │               │  cloud-collector           │
└─────────────────────────────┘               │  (processes events)        │
                                              └────────────────────────────┘
```

### Event Flow

1. A customer deploys the ARM template from the NudgeBee UI into their Azure subscription
2. The ARM template creates an **Event Grid System Topic** (subscription-level) and an **Event Subscription**
3. The Event Subscription filters resource events by provider and delivers them via **webhook** (HTTPS POST) to the NudgeBee API server
4. The API server validates the Event Grid handshake and forwards events to the cloud-collector service
5. The cloud-collector processes events and updates resource state in the database

### Why Webhook Delivery?

The previous architecture used Azure Service Bus as an intermediary. Webhook delivery was adopted because:

- **Cross-tenant support**: Service Bus delivery requires the Event Grid subscription to have access to the Service Bus queue via ARM `resourceId`. This fails with `LinkedAuthorizationFailed` when the customer subscription is in a different Azure AD tenant. Webhooks work across tenants since they use standard HTTPS.
- **Simpler setup**: No need to create and manage a Service Bus namespace, queue, and connection strings.
- **No cross-subscription RBAC**: Service Bus delivery needs `deliveryWithResourceIdentity` for cross-subscription access, which doesn't work cross-tenant. Webhooks avoid this entirely.

### What the ARM Template Creates (in customer subscription)

| Resource | Description |
|----------|-------------|
| **Managed Identity** | Used by the deployment script to detect existing system topics |
| **Role Assignment** | EventGridContributor role for the managed identity |
| **Deployment Script** | Detects if a system topic already exists (Azure allows only one per subscription) |
| **Event Grid System Topic** | Captures subscription-level resource events (created only if none exists) |
| **Event Subscription** | Filters events and routes them to the NudgeBee webhook endpoint |

### Event Types Captured

| Event Type | Description |
|------------|-------------|
| `Microsoft.Resources.ResourceWriteSuccess` | Resource created or updated |
| `Microsoft.Resources.ResourceDeleteSuccess` | Resource deleted |
| `Microsoft.Resources.ResourceActionSuccess` | Resource action completed |

### Resource Providers Filtered

Events are filtered to the following Azure resource providers:

- `Microsoft.Compute` (VMs, Disks, etc.)
- `Microsoft.Sql` (SQL Databases)
- `Microsoft.Storage` (Storage Accounts)
- `Microsoft.Web` (App Services)
- `Microsoft.ContainerService` (AKS)
- `Microsoft.DBforMySQL` (MySQL Databases)
- `Microsoft.DBforPostgreSQL` (PostgreSQL Databases)
- `Microsoft.KeyVault` (Key Vaults)
- `Microsoft.Network` (Network resources)

---

## Comparison with AWS EventBridge

| Aspect | AWS EventBridge | Azure Event Grid |
|--------|-----------------|------------------|
| **Delivery Method** | SQS Queue | Webhook (HTTPS POST) |
| **Event Source** | EventBridge rules (per service) | Event Grid System Topic (subscription-level) |
| **Cross-Account Auth** | IAM role assumption + external ID | Token in webhook URL query parameter |
| **Event Filtering** | Per-service EventBridge rules (EC2, RDS, etc.) | Advanced filters by resource provider |
| **Retry Policy** | SQS visibility timeout | 30 attempts over 24 hours (Event Grid built-in) |
| **Customer Template** | CloudFormation (requires S3 URL) | ARM Template (any HTTPS URL) |

---

## Complete Configuration Reference

After completing all setup steps, your Helm values should include:

```yaml
nudgebee_secret:
  # ARM template URL (required for Azure Event Grid onboarding UI)
  AZURE_ARM_TEMPLATE_URL: "https://nudgebee-documents-v2.s3.amazonaws.com/nudgebee-azure-arm-template.json"

  # Optional: Service Bus connection (only for backward compatibility with existing accounts)
  # CLOUD_COLLECTOR_AZURE_SERVICE_BUS_CONNECTION_STRING: "<connection-string>"
  # CLOUD_COLLECTOR_AZURE_SERVICE_BUS_NAMESPACE: "<namespace-name>"
  # CLOUD_COLLECTOR_AZURE_SERVICE_BUS_QUEUE_NAME: "<queue-name>"
```

For full configuration reference, see [NudgeBee Configurations](./secret_configs.md#cloud-integration).
