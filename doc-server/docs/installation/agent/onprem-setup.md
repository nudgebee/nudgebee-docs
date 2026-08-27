---
sidebar_position: 4
---

# Try On-Prem

## Introduction

Following is example configuration for using NudgeBee-agent with On-Prem Server

## Prerequisute
- Onprem Collector-Server Url
- Onprem Relay-Server Url
- Agent Keys
- Review [Metrics Provider](./connect/metrics.md)
- Review [Loggin Providers](./connect/logging/index.md)


### Installation

Installation steps are similar to SaaS. Only changes are required on Relay/Collector endpoints.


 ```shell
 helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent  --namespace nudgebee-agent --create-namespace -f values.yaml
 ```

### Helm Config

```yaml
runner:
  relay_address: "wss://{relay-server-url}/register"
  clickhouse_enabled: true
  nudgebee:
    auth_secret_key: "{agent_keys}"
    endpoint: "https://{collector-server-url}/"

globalConfig:
  prometheus_url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

nodeAgent:
  enabled: true

opentelemetry-collector:
  enabled: true
```

### Alerts

The values above do not wire up alerts. Add a receiver in your Alertmanager that posts to the agent, otherwise this cluster reports metrics and events but never an alert: [Alert Forwarding](./connect/alertmanager.md).