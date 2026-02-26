---
sidebar_position: 13
---
# Jaeger

## Overview

NudgeBee integrates with Jaeger to query and analyze distributed traces from your existing Jaeger deployment. Once connected, NudgeBee can use Jaeger as a trace source for AI-powered troubleshooting, service map visualization, and correlated incident investigation.

---

## Prerequisites

Before configuring the integration, ensure you have:

- A running **Jaeger** instance with the **Query API** accessible
- The Jaeger Query API URL (typically port `16686`)
- (Optional) A **bearer token** if your Jaeger instance requires authentication

---

## Jaeger Integration Configuration

Navigate to **Settings** > **Integrations** > **Observability** tab and select **Jaeger** to open the configuration form.

### Configuration Fields

* **Jaeger Query URL \*** (Required)
    * The URL of your Jaeger Query API endpoint.
    * Example: `https://jaeger.example.com:16686`
    * This is the same URL you use to access the Jaeger UI.

* **API Token**
    * Bearer token for Jaeger API authentication.
    * Only required if your Jaeger instance is behind an authentication proxy or requires token-based access.
    * This value is stored encrypted in NudgeBee.

* **Account ID**
    * Select the target account to link with this Jaeger integration from the dropdown.

* **Integration Config Name**
    * A unique, descriptive name for this integration (e.g., `Production Jaeger`).

* **Default Trace Provider**
    * Check this box to set Jaeger as the default trace source for the linked account. When enabled, NudgeBee will use Jaeger for all trace queries.

---

## Capabilities

Once connected, NudgeBee uses Jaeger for:

| Capability | Description |
|-----------|-------------|
| **Trace Search** | Search traces by service, operation, tags, and time range |
| **Trace Detail** | View full trace spans, timings, and metadata |
| **Service Map** | Visualize service dependencies from trace data |
| **AI Troubleshooting** | Include trace data in AI-powered root cause analysis |
| **Incident Correlation** | Correlate traces with logs, metrics, alerts, and events |

---

## Verify the Integration

1. Save the configuration. NudgeBee will validate connectivity to the Jaeger Query API.
2. Navigate to any Kubernetes service or event in NudgeBee.
3. Open the **Traces** tab and verify that trace data from Jaeger is available.

---

## Notes

- NudgeBee connects to the Jaeger **Query API** — the same endpoint that serves the Jaeger UI. No additional Jaeger components are required.
- If Jaeger is deployed in the same cluster as NudgeBee, use the internal service URL (e.g., `http://jaeger-query.tracing.svc.cluster.local:16686`).
- For Jaeger deployments behind an ingress or reverse proxy with authentication, provide the bearer token in the API Token field.
- NudgeBee supports both Jaeger's native storage backends (Cassandra, Elasticsearch, etc.) — the integration communicates via the Query API regardless of backend.