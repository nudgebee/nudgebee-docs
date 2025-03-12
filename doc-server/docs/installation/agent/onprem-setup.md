---
sidebar_position: 2
---

# Try On-Prem

## Introduction

Following is example configuration for using Nudgebee-agent with On-Prem Server

## Prerequisute
- Onprem Collector-Server Url
- Onprem Relay-Server Url
- Agent Keys
- Review [Metrics Provider](./installation/metrices/)
- Review [Loggin Providers](./installation/metrices/)


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

existingPrometheus:
  url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

opencost:
  opencost:
    prometheus:
      external:
        url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

nodeAgent:
  enabled: true

opentelemetry-collector:
  enabled: true
 ```