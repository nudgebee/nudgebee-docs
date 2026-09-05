---
sidebar_position: 1
---

# Traces Integration

NudgeBee reads distributed traces to correlate latency and error spikes with the workloads, deployments and dependencies behind them. Traces are optional — metrics and logs alone cover most troubleshooting — but they are what makes cross-service root cause analysis possible.

## Trace Backends

| Backend | How it connects |
|---------|-----------------|
| OpenTelemetry (Otel) | Point the agent at your OTel collector, or store spans in ClickHouse — see [OTel ClickHouse](./clickhouse-tracing.md). Configure from **Admin** > **Integrations** > **Observability** > **Otel**. |
| ClickHouse (OTel schema) | [OTel ClickHouse setup](./clickhouse-tracing.md) |
| Google Cloud Trace | [Google Cloud Trace setup](./gcp-tracing.md) |
| Jaeger | Configure from **Admin** > **Integrations** > **Observability** > **Jaeger**. |
| Grafana Tempo | Configure from **Admin** > **Integrations** > **Observability** > **Grafana Tempo**. |
| Datadog APM | [Datadog integration](../../../../integrations/Observability/datadog.md) |
| Dynatrace | [Dynatrace integration](../../../../integrations/Observability/dynatrace.md) |
| New Relic APM | [New Relic integration](../../../../integrations/Observability/newrelic.md) |
| SolarWinds APM | [SolarWinds integration](../../../../integrations/Observability/solarwinds.md) |
| Azure Application Insights | [Azure App Insights integration](../../../../integrations/Observability/azure_app_insights.md) |

:::tip
Only one trace source can be the **default trace provider** per cluster. Set it on the integration's configuration form; the current default is shown on the integration card in **Admin** > **Integrations**.
:::

## Verify Traces Are Flowing

1. Open **Clusters** and select a cluster to open **Cluster Details**.
2. Go to **Monitoring** > **Traces**.
3. Confirm spans appear for a service you know is receiving traffic. If the list is empty, check that the integration is enabled and marked as the default trace provider for that cluster.
