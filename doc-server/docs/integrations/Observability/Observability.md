# Observability Platform

NudgeBee's **Observability Platform** acts as a unified troubleshooting layer that connects to your existing observability tools — such as Prometheus, Grafana, Elastic, Datadog, New Relic, or Azure Monitor — to bring together **logs, metrics, and traces** for faster issue diagnosis and intelligent insights.

Instead of replacing your current observability stack, NudgeBee integrates with it to **centralize context**, **automate analysis**, and **enhance incident response** using AI and LLM-powered reasoning.

---

## Supported Integrations

NudgeBee supports integration with a wide range of observability tools across logs, metrics, and traces.  
You can connect any combination of the following platforms:

### 📊 **Metrics Integrations**
- Prometheus
- Grafana Cloud
- [Datadog Metrics](./datadog.md)
- [Dynatrace Metrics](./dynatrace.md)
- Azure Monitor
- Google Cloud Monitoring
- [New Relic Metrics](./newrelic.md)

### 🪵 **Logs Integrations**
- Elastic / ELK Stack
- Grafana Loki
- AWS CloudWatch Logs
- Azure Log Analytics
- Google Cloud Logging
- [Dynatrace Logs](./dynatrace.md)
- [New Relic Logs](./newrelic.md)

### 🔍 **Traces Integrations**
- Jaeger
- Tempo
- OpenTelemetry
- [Datadog APM](./datadog.md)
- [Dynatrace APM](./dynatrace.md)
- [Azure Application Insights](./azure_app_insights.md)
- [New Relic APM](./newrelic.md)

### 🚨 **Alert & Incident Platforms**
- [ServiceNow](../Tickets/servicenow.md)
- [PagerDuty](../Tickets/pagerduty.md)
- Opsgenie
- [Slack](../Notifications/slack.md)
- [Microsoft Teams](../Notifications/msteams.md)
- [Dynatrace Webhook](./dynatrace_webhook.md)
- [New Relic Webhook](./newrelic_webhook.md)

---

## Typical Workflow

1. **Integrate Your Observability Tools**  
   Connect Prometheus, Elastic, Jaeger, or others via API or agent connectors.

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
