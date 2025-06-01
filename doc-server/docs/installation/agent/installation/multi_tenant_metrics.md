---
sidebar_position: 3
---

# 🏷️ Label-based Multitenant Prometheus Setup

To enable **multi-tenant Prometheus access** for Nudgebee, we recommend using the open-source [prom-label-proxy](https://github.com/prometheus-community/prom-label-proxy). This acts as a secure gatekeeper, ensuring that tenants only see the metrics matching their allowed labels.

This guide walks you through setting it up in your Kubernetes cluster and wiring it into Nudgebee.

---

## 🔍 What Is prom-label-proxy?

**prom-label-proxy** is a lightweight HTTP proxy that sits in front of Prometheus (or compatible systems) and transparently injects or enforces label constraints on incoming queries.

For example, if tenant **cluster-dev** should only see metrics with `cluster="dev"`, this proxy ensures any query sent through it **cannot escape** that label boundary.

---

## 📦 Helm Installation of prom-label-proxy

We recommend installing prom-label-proxy using Helm. Here’s how.

### 🛠️ Prerequisites

* A running Prometheus or VictoriaMetrics cluster
* Helm installed on your machine
* Access to the Kubernetes cluster where Nudgebee runs

### ✨ Installation Steps

1️⃣ **Add the Helm Repo**

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

2️⃣ **Install prom-label-proxy with Detailed Config**

Here’s an example using VictoriaMetrics and advanced options:

```bash
helm upgrade --install label-proxy prometheus-community/prom-label-proxy \
  --namespace prometheus \
  --create-namespace \
  --set config.listenAddress=0.0.0.0:8080 \
  --set config.upstream="http://<your-vmselect-service>.<namespace>.svc:<port>/select/multitenant/prometheus" \
  --set config.label=<YOUR_LABEL> \
  --set config.extraArgs[0]=--enable-label-apis=true \
  --set config.extraArgs[1]=--error-on-replace=true \
  --set config.extraArgs[2]=--label-value=<YOUR_LABEL_VALUE>
```

✅ **Explanation:**

* `config.listenAddress`: Where the proxy listens (host\:port).
* `config.upstream`: The upstream Prometheus or VictoriaMetrics endpoint.
* `config.label`: The label key to enforce.
* `config.extraArgs`: Additional flags to control proxy behavior, e.g., enabling label APIs, forcing errors on replace, or hardcoding a specific label value.

3️⃣ **Verify Deployment**

```bash
kubectl get pods -n prometheus -l app.kubernetes.io/name=prom-label-proxy
```

4️⃣ **Expose the Proxy (Optional)**
Create a Kubernetes `Service` or `Ingress` if you need external access.

---

## 🔌 Wire into Nudgebee

Once installed, update Nudgebee’s `prometheus_url` to point to the proxy:

```yaml
globalConfig:
  prometheus_url: "http://label-proxy.prometheus.svc:8080"
```

This ensures all metric queries pass through the label-enforced proxy, isolating tenant access by `vm_account_id` or your chosen label.

---

## ⚙️ Example Multi-Tenant Config

Let’s say you have:

* cluster-dev: `cluster="dev"`
* cluster-test: `cluster="test"`

You’d deploy **two prom-label-proxy instances**, each with its own Helm release and label restriction:

```bash

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install label-proxy-dev prometheus-community/prom-label-proxy \
  --namespace prometheus \
  --set config.upstream=http://prometheus.prometheus.svc:9090 \
  --set config.label=cluster \
  --set config.extraArgs[0]=--label-value=dev

helm upgrade --install label-proxy-test prometheus-community/prom-label-proxy \
  --namespace prometheus \
  --set config.upstream=http://prometheus.prometheus.svc:9090 \
  --set config.label=cluster \
  --set config.extraArgs[0]=--label-value=test
```

Then point each tenant’s Nudgebee instance (or configuration) to the correct proxy endpoint.

---

## 🧩 Benefits

✅ Secure label-based isolation without needing separate Prometheus setups
✅ Lightweight and easy to deploy
✅ Compatible with Prometheus, VictoriaMetrics, and other backends Nudgebee supports

---

## 📚 Additional Resources

* [prom-label-proxy GitHub](https://github.com/prometheus-community/prom-label-proxy)
* [Nudgebee Docs: Prometheus Integrations](../metrics)
