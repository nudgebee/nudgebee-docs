---
sidebar_position: 2
---

# Metrics

Nudgebee can integrate with Prometehus compatible metrics systems like Prometheus, VictoriaMetrics, Mimir, Thanos, Last9 etc to collect and display metrics from your Kubernetes clusters. This allows you to use your existing monitoring dashboards and alerting rules with Nudgebee and provides insights into your cluster's performance and health.

This section provides instructions on how to integrate Nudgebee with your existing metrics infrastructure.

## Supported Metrics Providers

Nudgebee supports integration with the following metrics providers:

* **Prometheus:** [Integrate with Prometheus](./prometheus.md)
* **VictoriaMetrics:** [Integrate with VictoriaMetrics](./victoria-metrices.md)
* **Last9:** [Integrate with Last9](./last9.md)

## Alertmanager Configuration

When using existing promethus/victoria-metrices configurations. Please review following additional configurations.

* **Alert Manager:** [Integrate with Alert Manager](./alertmanager-integration.md)
* **Application Failure Alerts**: [Application Failure Alerts](./application-failure-alerts.md)

