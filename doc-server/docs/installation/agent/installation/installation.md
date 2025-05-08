---
sidebar_position: 1
---

# Installation

<div style={{ position: "relative", paddingBottom: "64.86%", height: 0 }}>
  <iframe
    src="https://www.loom.com/embed/c163f9264c714f929ab04e82bf7e792d?sid=eaca9e5c-945c-4368-8564-e17b7baed5ee"
    frameBorder="0"
    webkitAllowFullScreen
    mozAllowFullScreen
    allowFullScreen
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
  />
</div>


### Prerequisites

Before installing the Nudgebee Agent, ensure you have:

#### Software
- **Helm**: [Helm](https://helm.sh/) installed and configured.
- **Kubernetes**: A cluster running **v1.27** or newer.
- **Linux Kernel**: Nodes must run **4.2+** for eBPF support (required by the Node Agent).

#### Network
- **Docker registry access**:  
  - `registry.nudgebee.com`  
  - `https://nudgebee.github.io/k8s-agent/`  
- **Collector/Relay connectivity**: WebSocket and HTTP outbound allowed.
- **Cloud pricing endpoints** (for OpenCost): AWS, Azure, etc., must be reachable.

---

### System Requirements

These recommendations target clusters up to **100 nodes** and assume you already have Prometheus & logging in place. Adjust via the Helm chart as needed.

| Component        | Requests                  | Limits                  | Additional  |
| ---------------- | ------------------------- | ----------------------- | ----------- |
| **Node Agent**   | 100 MiB RAM, 0.1 CPU core | 1 GiB RAM, 0.5 CPU core | –           |
| **Runner**       | 500 MiB RAM, 0.1 CPU core | 2 GiB RAM, 0.5 CPU core | –           |
| **Event Watcher**| 200 MiB RAM, 0.1 CPU core | 1 GiB RAM, 0.5 CPU core | –           |
| **Tracing**      | 1 GiB RAM, 0.1 CPU core   | 2 GiB RAM, 0.5 CPU core | PVC: 50 GiB |
| **Prometheus**   | Depends on your provider  | –                       | –           |
| **Logging**      | Depends on your provider  | –                       | –           |

---

### Permissions

The Nudgebee Agent relies on Kubernetes RBAC. All required roles and bindings are defined in the [runner-service-account.yaml](https://raw.githubusercontent.com/nudgebee/k8s-agent/main/charts/nudgebee-agent/templates/runner-service-account.yaml).

---

## Installation Steps

### 1. Generate Agent Keys

1. Log in to [app.nudgebee.com](https://app.nudgebee.com).  
2. Go to **Kubernetes** → **Connect Cluster**.  
3. Give your cluster a name and copy the **Auth Key**.

### 2. Quick Install (Shell Script)

```bash
wget https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh
chmod +x installation.sh
./installation.sh -a <NUDBGEE_AUTH_KEY>
```

> The script will detect your environment and install dependencies automatically.

---

### 3. Manual Installation

#### a. Install Prometheus (if not present)

```bash
helm upgrade --install nudgebee-prometheus prometheus-community/kube-prometheus-stack \
  --namespace nudgebee-agent --create-namespace \
  --set nodeExporter.enabled=false \
  --set pushgateway.enabled=false \
  --set alertmanager.enabled=true \
  --set kubeStateMetrics.enabled=true \
  -f https://raw.githubusercontent.com/nudgebee/k8s-agent/main/extra-scrape-config.yaml
```

#### c. Install Nudgebee Agent

1. Add & update the Helm repo:

   ```bash
   helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
   helm repo update
   ```

2. Install:

   ```bash
   helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
     --namespace nudgebee-agent --create-namespace \
     --set runner.nudgebee.auth_secret_key="<NUDBGEE_AUTH_KEY>" \
     --set globalConfig.prometheus_url="<PROMETHEUS_URL>" \
     --set opencost.opencost.prometheus.external.url="<PROMETHEUS_URL>"
   ```

> Replace `<NUDBGEE_AUTH_KEY>` and `<PROMETHEUS_URL>` with your values.

---

## Agent Installation for self hosted Nudgebee

If you’re running a self-hosted Nudgebee instance, use a custom `values.yaml`:

```yaml
runner:
  relay_address: "wss://<RELAY_SERVER_URL>/register"
  nudgebee:
    auth_secret_key: "<NUDBGEE_AUTH_KEY>"
    endpoint: "https://<COLLECTOR_SERVER_URL>/"

globalConfig:
  prometheus_url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

opencost:
  opencost:
    prometheus:
      external:
        url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"
```

Then install with:

```bash
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --create-namespace \
  -f values.yaml
```