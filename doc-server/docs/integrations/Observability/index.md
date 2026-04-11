# Observability Platform

NudgeBee's Observability Platform connects to your existing monitoring and observability tools — such as Prometheus, Grafana, Elastic, Datadog, New Relic, or Azure Monitor — to bring together logs, metrics, and traces for faster issue diagnosis and intelligent insights.

NudgeBee does not replace your current observability stack. Instead, it integrates with it to centralize context, automate analysis, and enhance incident response using AI and LLM-powered reasoning.

:::caution
Connecting at least one observability source is **required** for NudgeBee to function. Without this, core features like troubleshooting, SLO tracking, alerting, and AI-powered analysis will not work.
:::

### When Do You Need This?

You need this integration as part of your initial NudgeBee setup. Connect your observability tools so NudgeBee can:

- Pull metrics to power the [Knowledge Graph](../../features/knowledge-graph.md) and [Optimizations](../../features/optimizations.md).
- Access logs and traces for [AI-powered troubleshooting](../../features/troubleshooting/).
- Monitor [SLOs](../../features/slo.md) and trigger alerts when thresholds are breached.

:::tip
You can connect multiple observability tools simultaneously. For example, use Prometheus for metrics, ELK for logs, and Jaeger for traces.
:::

---

## Supported Integrations

NudgeBee supports integration with a wide range of observability tools across logs, metrics, and traces.  
You can connect any combination of the following platforms:

### 📊 **Metrics Integrations**
- Prometheus
- Grafana Cloud
- [Datadog Metrics](./datadog.md)
- Azure Monitor
- Google Cloud Monitoring
- [New Relic Metrics](./newrelic.md)

### 🪵 **Logs Integrations**
- Elastic / ELK Stack
- Grafana Loki
- AWS CloudWatch Logs
- Azure Log Analytics
- Google Cloud Logging
- [New Relic Logs](./newrelic.md)

### 🔍 **Traces Integrations**
- Jaeger
- Tempo
- OpenTelemetry
- [Datadog APM](./datadog.md)
- [Azure Application Insights](./azure_app_insights.md)
- [New Relic APM](./newrelic.md)

### 🚨 **Alert & Incident Platforms**
- [ServiceNow](../Tickets/servicenow.md)
- [PagerDuty](../Tickets/pagerduty.md)
- Opsgenie
- [Slack](../Notifications/slack.md)
- [Microsoft Teams](../Notifications/msteams.md)
- [Datadog Webhook](../Webhooks/datadog_webhook.md)
- [New Relic Webhook](../Webhooks/newrelic_webhook.md)
- [ServiceNow Webhook](../Webhooks/servicenow_webhook.md)
- [GCP Cloud Monitoring Webhook](../Webhooks/gcp_monitoring_webhook.md)

---

## Typical Workflow

1. **Integrate Your Observability Tools**  
   Connect Prometheus, Elastic, Jaeger, or others via API or agent connectors.

2. **Ingest Telemetry Data**  
   NudgeBee securely pulls relevant logs, metrics, and traces on demand or through scheduled syncs.

3. **Correlate & Analyze**  
   The platform automatically links related signals (e.g., high CPU → increased latency → service errors).

4. **Troubleshoot with AI Assistance**  
   Use NudgeBee’s conversational or visual interface to ask natural language questions like:  
   > “Why did latency spike on checkout-service at 2:45 PM?”  
   > “Show all errors correlated with high memory usage on auth-service.”

5. **Resolve & Learn**  
   Generate AI summaries, RCA reports, and recommended actions for future prevention.

---

## Example Architecture

```text
[Prometheus / Elastic / Jaeger / Datadog / New Relic]
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
