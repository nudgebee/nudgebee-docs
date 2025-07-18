---
sidebar_position: 5
---

# VMAlert and VMAlertmanager Setup

## What is VMAlert?

VMAlert is VictoriaMetrics' implementation of Prometheus alerting rules engine. It evaluates alerting rules against metrics data and fires alerts when conditions are met. VMAlert is a lightweight, efficient alternative to Prometheus' built-in alerting component.

## What is VMAlertmanager?

VMAlertmanager is VictoriaMetrics' version of Prometheus Alertmanager. It handles alert notifications, grouping, inhibition, and routing. It receives alerts from VMAlert and forwards them to various notification channels.

## Why Use VMAlert + VMAlertmanager?

This setup is ideal when:

- **No existing Alertmanager**: Your cluster doesn't have Prometheus Alertmanager installed
- **Centralized Prometheus**: You're using managed Prometheus services like Chronosphere, Grafana Cloud, or other SaaS solutions
- **VictoriaMetrics ecosystem**: You prefer VictoriaMetrics components for better integration
- **Resource efficiency**: VMAlert consumes less resources compared to full Prometheus server
- **Remote datasources**: You need to evaluate rules against remote Prometheus-compatible APIs

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Chronosphere  │◄───┤   VMAlert    │───►│  VMAlertmanager │
│   (Datasource)  │    │(Rules Engine)│    │  (Notifications)│
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │                       │
                              │                       ▼
                              ▼               ┌──────────────┐
                       ┌──────────────┐       │ Nudgebee     │
                       │ Alert Rules  │       │ Agent        │
                       │ Evaluation   │       └──────────────┘
                       └──────────────┘
```

## Prerequisites

- Kubernetes cluster access
- Helm 3.x installed
- kubectl configured

## Installation

### 1. Add Victoria Metrics Helm Repository

```bash
helm repo add vm https://victoriametrics.github.io/helm-charts/
```

### 2. Install CRDs

```bash
kubectl apply -f https://raw.githubusercontent.com/VictoriaMetrics/helm-charts/refs/heads/master/charts/victoria-metrics-operator/charts/crds/crds/crd.yaml
```

### 3. Install or Upgrade VMAlert

```bash
helm upgrade --install vma vm/victoria-metrics-k8s-stack -f vm-operator.yaml -n nudgebee-agent
```

## Configuration

### Minimal Values File (vm-operator.yaml)

```yaml
victoria-metrics-operator:
  enabled: true

defaultDashboards:
  enabled: false

defaultRules:
  create: false

vmsingle:
  enabled: false

vmcluster:
  enabled: false

alertmanager:
  enabled: true
  config:
    route:
      receiver: "blackhole"
      group_by: ["alertname"]
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 12h
      routes:
        - receiver: 'nudgebee-agent'
          group_by: [ '...' ]
          group_wait: 1s
          group_interval: 1s
          matchers:
            - severity =~ ".*"
          repeat_interval: 4h
          continue: true 
    receivers:
      - name: blackhole
      - name: 'nudgebee-agent'
        webhook_configs:
          - url: 'http://nudgebee-agent-runner.nudgebee-agent/api/alerts' 
            send_resolved: true 

vmalert:
  enabled: true
  spec:
    datasource:
      url: "https://${CHRONOSPHERE_DOMAIN}.chronosphere.io/data/metrics"
    notifiers:
    - url: http://vmalertmanager-vma-victoria-metrics-k8s-stack.svc:9093
    remoteRead:
      url: "https://${CHRONOSPHERE_DOMAIN}.chronosphere.io/data/metrics/api/v1/prom/remote/read"
    remoteWrite:
      url: "https://${CHRONOSPHERE_DOMAIN}.chronosphere.io/data/metrics/api/v1/prom/remote/write"
    selectAllByDefault: true
    evaluationInterval: 20s
    extraArgs:
      datasource.bearerToken: "${CHRONOSPHERE_API_TOKEN}"

vmauth:
  enabled: false
vmagent:
  enabled: false
grafana:
  enabled: false
prometheus-node-exporter:
  enabled: false
kube-state-metrics:
  enabled: false
kubelet:
  enabled: false
kubeApiServer:
  enabled: false
kubeControllerManager:
  enabled: false
kubeDns:
  enabled: false
coreDns:
  enabled: false
kubeEtcd:
  enabled: false
kubeScheduler:
  enabled: false
kubeProxy:
  enabled: false
```

### Environment Variables Required

- `CHRONOSPHERE_DOMAIN`: Your Chronosphere domain
- `CHRONOSPHERE_API_TOKEN`: API token for authentication

## Verification

```bash
kubectl get pods -n nudgebee-agent
kubectl get vmalert -n nudgebee-agent
kubectl get vmalertmanager -n nudgebee-agent
```