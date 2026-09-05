# Observability Platform

NudgeBee's Observability Platform connects to your existing monitoring and observability tools — such as Prometheus, Loki, Elasticsearch, OpenTelemetry, Datadog, New Relic, or Dynatrace — to bring together logs, metrics, and traces for faster issue diagnosis and intelligent insights.

NudgeBee does not replace your current observability stack. Instead, it integrates with it to centralize context, automate analysis, and enhance incident response using AI and LLM-powered reasoning.

:::caution
Connecting at least one observability source is **required** for NudgeBee to function. Without this, core features like troubleshooting, SLO tracking, alerting, and AI-powered analysis will not work.
:::

### When Do You Need This?

You need this integration as part of your initial NudgeBee setup. Connect your observability tools so NudgeBee can:

- Pull metrics to power the [Knowledge Graph](../../features/knowledge-graph.md) and [Optimizations](../../features/optimizations/index.md).
- Access logs and traces for [AI-powered troubleshooting](../../features/troubleshooting/).
- Monitor [SLOs](../../features/slo.md) and trigger alerts when thresholds are breached.

:::tip
You can connect multiple observability tools simultaneously. For example, use Prometheus for metrics, Loki for logs, and OpenTelemetry for traces.
:::

---

## Supported Integrations

NudgeBee reads telemetry from the platforms below. Connect any combination — for example Prometheus for metrics, Loki for logs and OpenTelemetry for traces.

| Provider | Signals NudgeBee reads | Setup guide |
|----------|------------------------|-------------|
| Prometheus | Metrics | [Connect Prometheus metrics](../../installation/agent/connect/metrics.md) |
| Grafana Loki | Logs | [Connect Loki](../../installation/agent/connect/logging/loki.md) |
| Elasticsearch / ELK | Logs | [Connect ELK](../../installation/agent/connect/logging/elk.md) |
| SigNoz | Logs | [Connect SigNoz](../../installation/agent/connect/logging/signoz.md) |
| OpenTelemetry (Otel) | Traces | [Connect traces](../../installation/agent/connect/tracing/) |
| Datadog | Metrics, logs, traces | [Datadog](./datadog.md) |
| New Relic | Metrics, logs, traces | [New Relic](./newrelic.md) |
| Dynatrace | Metrics, logs, traces | [Dynatrace](./dynatrace.md) |
| SolarWinds Observability | Metrics, logs, traces | [SolarWinds](./solarwinds.md) |
| Azure Application Insights | Traces | [Azure App Insights](./azure_app_insights.md) |
| Loggly | Logs | [Loggly](./loggly.md) |
| Observe | Logs | [Observe](./observe.md) |
| Splunk Observability Cloud | Metrics | Configure in **Admin** > **Integrations** > **Observability** |
| Apache Pinot | Logs | Configure in **Admin** > **Integrations** > **Observability** |
| Apache Hive | Logs | Configure in **Admin** > **Integrations** > **Observability** |
| Chronosphere | Metrics | [Chronosphere](./chronosphere.md) |
| Last9 | Metrics, logs | [Last9 logs](../../installation/agent/connect/logging/last9.md), [Last9 metrics](../../installation/agent/connect/metrics.md) |
| Jaeger | Traces | Configure in **Admin** > **Integrations** > **Observability** |
| Grafana Tempo | Traces | Configure in **Admin** > **Integrations** > **Observability** |
| OpenObserve | Logs | Configure in **Admin** > **Integrations** > **Observability** |

:::note
Providers without a linked guide are configured directly from **Admin** > **Integrations** > **Observability**, where the configuration form documents each field inline.
:::

### Getting Alerts In

Observability sources supply telemetry; alerts reach NudgeBee separately, through [inbound webhooks](../Webhooks/) or Alertmanager forwarding:

- [Prometheus Alertmanager](../../installation/agent/connect/alertmanager.md) — forward alerts from kube-prometheus-stack, operator-managed, plain or external Alertmanagers
- [Datadog](../Webhooks/datadog_webhook.md), [Dynatrace](../Webhooks/dynatrace_webhook.md), [New Relic](../Webhooks/newrelic_webhook.md), [SolarWinds](../Webhooks/solarwinds_webhook.md), [GCP Cloud Monitoring](../Webhooks/gcp_monitoring_webhook.md), [ServiceNow](../Webhooks/servicenow_webhook.md) and [PagerDuty](../Webhooks/pagerduty_webhook.md) webhooks
- Azure Monitor, Grafana, Elasticsearch and Zenduty webhooks — see the [webhooks overview](../Webhooks/)

---

## Typical Workflow

1. **Integrate Your Observability Tools**
   Connect Prometheus, Elasticsearch, OpenTelemetry, or others via API or agent connectors.

2. **Ingest Telemetry Data**
   NudgeBee securely pulls relevant logs, metrics, and traces on demand or through scheduled syncs.

3. **Correlate & Analyze**
   The platform automatically links related signals (e.g., high CPU → increased latency → service errors).

4. **Troubleshoot with AI Assistance**
   Use NudgeBee's conversational or visual interface to ask natural language questions like:
   > "Why did latency spike on checkout-service at 2:45 PM?"
   > "Show all errors correlated with high memory usage on auth-service."

5. **Resolve & Learn**
   Generate AI summaries, RCA reports, and recommended actions for future prevention.

---

## Example Architecture

```text
[Prometheus / Loki / Elasticsearch / OpenTelemetry / Datadog]
          │
          ▼
     [NudgeBee Integrations Layer]
          │
          ▼
 [Unified Observability Graph + LLM Engine]
          │
          ▼
    [Troubleshooting & Insights UI]
```
