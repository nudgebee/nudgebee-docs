---
sidebar_position: 12
---
# Elasticsearch

## Overview

NudgeBee integrates with Elasticsearch (and OpenSearch) to query and analyze logs, metrics, and traces from your existing deployment. Elasticsearch can be connected either through the NudgeBee Agent (agent-based) or directly via API credentials (SaaS / standalone).

---

## Prerequisites

Before configuring the integration, ensure you have:

- A running **Elasticsearch** or **OpenSearch** instance
- For direct connection: the **base URL** and **credentials** (basic auth or AWS Cognito)
- For agent-based: the NudgeBee **Agent** installed in your Kubernetes cluster

---

## Setup Options

### Option 1: Agent-Based Setup

When the NudgeBee Agent is deployed with Elasticsearch logging enabled, it connects to your Elasticsearch instance automatically.

See the full ELK logging setup guide: **[ELK Configuration](/installation/agent/installation/logging/elk.md)**

In your agent Helm values:

```yaml
logging:
  provider: elasticsearch
  elasticsearch:
    url: https://elasticsearch.monitoring.svc.cluster.local:9200
```

### Option 2: Direct Connection (SaaS / Standalone)

For Elasticsearch instances outside your Kubernetes cluster (e.g., AWS OpenSearch, Elastic Cloud), configure the connection directly in NudgeBee.

Navigate to **Settings** > **Integrations** > **Observability** tab and select **Elasticsearch** to open the configuration form.

---

## Elasticsearch Integration Configuration

### Configuration Fields

* **URL \*** (Required)
    * Base URL of your Elasticsearch or OpenSearch endpoint.
    * Example: `https://my-domain.us-east-1.es.amazonaws.com`

* **Authentication Type \*** (Required)
    * The authentication method to use.
    * Options:
      * `basic` — username and password (default)
      * `cognito` — AWS Cognito User Pool authentication

* **Username \*** (Required)
    * Username for basic authentication, or Cognito User Pool username.

* **Password \*** (Required)
    * Password for the account.
    * This value is stored encrypted in NudgeBee.

#### Cognito-Specific Fields

The following fields are shown when **Authentication Type** is set to `cognito`:

* **Region**
    * AWS region (e.g., `us-east-1`).

* **User Pool ID**
    * Cognito User Pool ID (e.g., `us-east-1_xxxxxx`).

* **Identity Pool ID**
    * Cognito Identity Pool ID (e.g., `us-east-1:xxxxx-xxxx-xxx`).

* **App Client ID**
    * Cognito App Client ID.

#### Additional Options

* **Account ID**
    * Select the target account to link with this Elasticsearch integration.

* **Integration Config Name**
    * A unique name for this integration configuration (e.g., `Production ELK`).

* **Default Log Provider**
    * Set Elasticsearch as the default log source for the linked account.

* **Default Metrics Provider**
    * Set Elasticsearch as the default metrics source (for Elasticsearch-based metrics).

* **Default Traces Provider**
    * Set Elasticsearch as the default traces source (for Elasticsearch-based APM traces).

---

## Capabilities

Once connected, NudgeBee uses Elasticsearch for:

| Capability | Description |
|-----------|-------------|
| **Log Search** | Full-text search across Elasticsearch indices |
| **Metrics Queries** | Query Elasticsearch-based metrics |
| **Trace Analysis** | Analyze APM traces stored in Elasticsearch |
| **AI Troubleshooting** | Include Elasticsearch data in AI-powered root cause analysis |
| **Incident Correlation** | Correlate log entries and traces with alerts and events |

---

## Verify the Integration

1. Save the configuration. NudgeBee will validate the connection using the provided credentials.
2. Navigate to any Kubernetes workload or event in NudgeBee.
3. Open the **Logs** tab and verify that log data from Elasticsearch is available and searchable.

---

## Notes

- Both **Elasticsearch** and **AWS OpenSearch** are supported with the same integration.
- When using the agent-based setup, the integration page in Settings controls default provider settings. The actual connection is managed by the agent.
- For AWS OpenSearch with fine-grained access control, use Cognito authentication for seamless IAM-based access.
- You can have multiple Elasticsearch integrations — for example, one for logs and another for APM traces — linked to different accounts.