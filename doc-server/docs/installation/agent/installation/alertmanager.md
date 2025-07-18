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
- Metrics backend configured (see [Prometheus Metrics Integrations](./metrics.md))

## Installation

### 1. Create Secret for API Token

First, create a Kubernetes secret for your Chronosphere API token:

```bash
kubectl create secret generic chronosphere-secret \
  --from-literal=api-token=YOUR_CHRONOSPHERE_API_TOKEN \
  -n nudgebee-agent
```

### 2. Add Victoria Metrics Helm Repository

```bash
helm repo add vm https://victoriametrics.github.io/helm-charts/
```

### 3. Install CRDs

```bash
kubectl apply -f https://raw.githubusercontent.com/VictoriaMetrics/helm-charts/refs/heads/master/charts/victoria-metrics-operator/charts/crds/crds/crd.yaml
```

### 4. Configure Values File

Create `vm-operator.yaml` with your specific configuration (see below), replacing `YOUR_CHRONOSPHERE_DOMAIN` with your actual domain.

### 5. Install or Upgrade VMAlert

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
      url: "https://YOUR_CHRONOSPHERE_DOMAIN.chronosphere.io/data/metrics"
    notifiers:
    - url: http://vmalertmanager-vma-victoria-metrics-k8s-stack.svc:9093
    remoteRead:
      url: "https://YOUR_CHRONOSPHERE_DOMAIN.chronosphere.io/data/metrics/api/v1/prom/remote/read"
    remoteWrite:
      url: "https://YOUR_CHRONOSPHERE_DOMAIN.chronosphere.io/data/metrics/api/v1/prom/remote/write"
    selectAllByDefault: true
    evaluationInterval: 20s
    extraArgs:
      envflag.enable: "true"
      envflag.prefix: "VM_"
    env:
      - name: VM_datasource_bearerToken
        valueFrom:
          secretKeyRef:
            name: chronosphere-secret
            key: api-token

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

### Manual Configuration Required

**Before deploying, you must update the values file:**

1. Replace `YOUR_CHRONOSPHERE_DOMAIN` with your actual Chronosphere domain in all URL fields
2. Replace `YOUR_CHRONOSPHERE_API_TOKEN` with your actual API token when creating the secret

**Note:** The API token is securely mounted as an environment variable `VM_datasource_bearerToken` from the Kubernetes secret. VictoriaMetrics uses the `-envflag.enable` flag to read configuration from environment variables, and `-envflag.prefix=VM_` to prefix all environment variables with `VM_`.

## Verification

```bash
kubectl get pods -n nudgebee-agent
kubectl get vmalert -n nudgebee-agent
kubectl get vmalertmanager -n nudgebee-agent
```