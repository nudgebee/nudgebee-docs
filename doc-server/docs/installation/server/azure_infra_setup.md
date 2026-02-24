---
sidebar_position: 9
---

# Azure Infrastructure Setup

This guide covers the Azure setup required for on-prem NudgeBee deployments to enable Azure Event Grid integration for real-time resource event monitoring.

## Prerequisites

Before enabling Azure Event Grid integration, complete the following steps in the NudgeBee Azure subscription (not the customer's subscription).

### 1. Create an Azure Service Bus Namespace and Queue

NudgeBee uses Azure Service Bus as the message broker for receiving Event Grid events from customer Azure subscriptions. This is analogous to the SQS queue used for AWS EventBridge.

#### Create via Azure CLI

```bash
# Create a resource group (if you don't have one)
az group create --name nudgebee-infra --location eastus

# Create a Service Bus namespace
az servicebus namespace create \
  --resource-group nudgebee-infra \
  --name nudgebee-azure-service-bus \
  --location eastus \
  --sku Standard

# Create the queue for receiving events
az servicebus queue create \
  --resource-group nudgebee-infra \
  --namespace-name nudgebee-azure-service-bus \
  --name azure-resource-events \
  --max-size 1024 \
  --default-message-time-to-live P14D \
  --max-delivery-count 3 \
  --enable-dead-lettering-on-message-expiration true
```

#### Parameters

| Parameter | Recommended Value | Description |
|-----------|-------------------|-------------|
| Namespace name | `nudgebee-azure-service-bus` | Service Bus namespace |
| Queue name | `azure-resource-events` | Queue for receiving Event Grid events |
| Max size | `1024` MB | Maximum queue size |
| Message TTL | `P14D` (14 days) | How long messages are retained |
| Max delivery count | `3` | Attempts before dead-lettering |
| Dead-lettering | `true` | Enable DLQ for failed messages |

### 2. Get the Connection String

```bash
az servicebus namespace authorization-rule keys list \
  --resource-group nudgebee-infra \
  --namespace-name nudgebee-azure-service-bus \
  --name RootManageSharedAccessKey \
  --query primaryConnectionString -o tsv
```

This returns a connection string like:
```
Endpoint=sb://nudgebee-azure-service-bus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=<key>
```

### 3. Get the Service Bus Queue Resource ID

```bash
az servicebus queue show \
  --resource-group nudgebee-infra \
  --namespace-name nudgebee-azure-service-bus \
  --name azure-resource-events \
  --query id -o tsv
```

This returns a resource ID like:
```
/subscriptions/<sub-id>/resourceGroups/nudgebee-infra/providers/Microsoft.ServiceBus/namespaces/nudgebee-azure-service-bus/queues/azure-resource-events
```

### 4. Configure in Helm

Set the following values in your Helm configuration:

```yaml
nudgebee_secret:
  # Service Bus connection string
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_CONNECTION_STRING: "<connection-string-from-step-2>"

  # Service Bus namespace name
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_NAMESPACE: "nudgebee-azure-service-bus"

  # Queue name
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_QUEUE_NAME: "azure-resource-events"

  # Full resource ID of the Service Bus queue (used by ARM template)
  AZURE_SERVICE_BUS_RESOURCE_ID: "<resource-id-from-step-3>"

  # URL to the ARM template deployed in customer subscriptions
  AZURE_ARM_TEMPLATE_URL: "https://registry.nudgebee.com/downloads/templates/latest/nudgebee-azure-arm-template.json"
```

---

## How It Works

### Architecture

```
Customer Azure Subscription                    NudgeBee Infrastructure
┌─────────────────────────────┐               ┌────────────────────────────┐
│                             │               │                            │
│  Event Grid System Topic    │               │  Azure Service Bus Queue   │
│  (subscription-level)       │──────────────>│  (azure-resource-events)   │
│                             │  events via   │                            │
│  Event Subscription         │  Service Bus  │  cloud-collector service   │
│  (filtered by provider)     │  delivery     │  (polls queue)             │
│                             │               │                            │
└─────────────────────────────┘               └────────────────────────────┘
```

### Event Flow

1. A customer deploys the ARM template from the NudgeBee UI into their Azure subscription
2. The ARM template creates an **Event Grid System Topic** (subscription-level) and an **Event Subscription**
3. The Event Subscription filters resource events by provider (Compute, Sql, Storage, Web, AKS, etc.) and sends them to the NudgeBee Service Bus queue
4. Each event includes a `nudgebeeAccountToken` delivery attribute for secure tenant-aware routing
5. The cloud-collector service polls the Service Bus queue and processes events

### What the ARM Template Creates (in customer subscription)

| Resource | Description |
|----------|-------------|
| **Managed Identity** | Used by the deployment script to detect existing system topics |
| **Role Assignment** | EventGridContributor role for the managed identity |
| **Deployment Script** | Detects if a system topic already exists (Azure allows only one per subscription) |
| **Event Grid System Topic** | Captures subscription-level resource events (created only if none exists) |
| **Event Subscription** | Filters events and routes them to the NudgeBee Service Bus queue |

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
| **Message Broker** | SQS Queue | Service Bus Queue |
| **Event Source** | EventBridge rules (per service) | Event Grid System Topic (subscription-level) |
| **Cross-Account Auth** | IAM role assumption + external ID | Service Bus delivery attributes |
| **Account Token** | `nudgebeeAccountToken` in event detail via InputTransformer | `nudgebeeAccountToken` in Service Bus ApplicationProperties |
| **Event Filtering** | Per-service EventBridge rules (EC2, RDS, etc.) | Advanced filters by resource provider |
| **Dead Letter** | SQS DLQ (3 retries) | Service Bus DLQ (3 delivery attempts) |
| **Retry Policy** | SQS visibility timeout | 30 attempts over 24 hours |
| **Customer Template** | CloudFormation (requires S3 URL) | ARM Template (any HTTPS URL) |

---

## Complete Configuration Reference

After completing all setup steps, your Helm values should include:

```yaml
nudgebee_secret:
  # Service Bus connection (required for Azure Event Grid)
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_CONNECTION_STRING: "<connection-string>"
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_NAMESPACE: "<namespace-name>"
  CLOUD_COLLECTOR_AZURE_SERVICE_BUS_QUEUE_NAME: "<queue-name>"
  AZURE_SERVICE_BUS_RESOURCE_ID: "<service-bus-queue-resource-id>"

  # ARM template URL (required for Azure Event Grid onboarding UI)
  AZURE_ARM_TEMPLATE_URL: "https://registry.nudgebee.com/downloads/templates/latest/nudgebee-azure-arm-template.json"
```

For full configuration reference, see [NudgeBee Configurations](./secret_configs.md#cloud-integration).
