---
sidebar_position: 1
---

# Agent Installation

Install the NudgeBee Agent on each Kubernetes cluster you want to monitor. The agent collects workload data, performance metrics, cost information, and security insights, and sends them to the NudgeBee server — feeding the Semantic Knowledge Graph that powers NudgeBee's AI troubleshooting, optimization recommendations, and automation.

:::tip
**Estimated time**: 5–10 minutes per cluster using the quick install script, or 10–15 minutes for manual Helm installation.
:::

:::info
**Cloud SaaS users**: You only need to install the agent — the server is managed for you. Generate your agent auth key at [app.nudgebee.com](https://app.nudgebee.com) and skip straight to [Install the Agent](#2-install-the-agent).

**Self-hosted users**: Make sure the [NudgeBee Server is installed](../../server/installation.md) first. You will need the Relay Server URL and Collector Server URL from your server setup — see [Self-Hosted Configuration](#4-for-self-hosted-nudgebee).
:::

### Watch the Walkthrough

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

---

## 1. Before You Begin

### Required

| Requirement | Details | Notes |
|---|---|---|
| **Kubernetes cluster** | v1.27 or newer | The cluster you want to monitor |
| **Helm** | v3.x installed and configured | [Install Helm](https://helm.sh/) if you don't have it |
| **Linux Kernel** | v4.2 or newer on all nodes | Required for eBPF-based network metrics collection |
| **NudgeBee Auth Key** | Generated from the NudgeBee UI | See [Step 1](#step-1-generate-your-auth-key) below |
| **Registry access** | Outbound access to `registry.nudgebee.com` and `nudgebee.github.io` | Or mirror images to your internal registry |
| **Prometheus** | A running Prometheus instance in the cluster | If you don't have one, the install script can set it up for you |

:::tip
**Already have Prometheus running?** You just need its URL (e.g., `http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090`). If you don't have Prometheus, don't worry — the quick install script or the manual steps below will install it for you.
:::

### Resource Footprint

The agent is lightweight. Here is what it uses on a cluster with up to 100 nodes:

| Component | Typical Usage | Upper Limit | Notes |
|---|---|---|---|
| **Node Agent** | 100 MiB RAM, 0.1 CPU | 1 GiB RAM, 0.5 CPU | Runs on each node (DaemonSet) |
| **Runner** | 500 MiB RAM, 0.1 CPU | 2 GiB RAM, 0.5 CPU | Central controller — one per cluster |
| **Event Watcher** | 200 MiB RAM, 0.1 CPU | 1 GiB RAM, 0.5 CPU | Monitors K8s events |
| **Tracing** (optional) | 1 GiB RAM, 0.1 CPU | 2 GiB RAM, 0.5 CPU | Requires 50 GiB PVC |

:::info
**Prometheus and logging** are not included in the table above — their resource usage depends on your existing setup. If the installer sets up Prometheus for you, expect an additional 1–2 GiB RAM.
:::

### Network

- **Outbound to NudgeBee** — WebSocket and HTTP to the NudgeBee server (cloud or self-hosted) for data delivery.
- **Outbound to cloud pricing APIs** — AWS, Azure, GCP endpoints for cost data (used by OpenCost).
- **Internal cluster access** — The agent uses Kubernetes RBAC to read workload and event data. All required roles are automatically created by the Helm chart ([see RBAC definition](https://raw.githubusercontent.com/nudgebee/k8s-agent/main/charts/nudgebee-agent/templates/runner-service-account.yaml)).

---

## 2. Install the Agent

### Step 1: Generate Your Auth Key

1. Log in to [app.nudgebee.com](https://app.nudgebee.com) (or your self-hosted NudgeBee UI).
2. Go to **Kubernetes** → **Connect Cluster**.
3. Enter a name for your cluster and click **Connect**.
4. Copy the **Auth Key** that is generated.

:::caution
Keep your Auth Key secure — it authenticates the agent with the NudgeBee server. Do not commit it to version control. Use Kubernetes secrets or a secrets manager in production.
:::

### Step 2: Choose Your Installation Method

Pick one of the two methods below. The quick install script is the fastest option — it detects your environment and handles dependencies automatically.

---

#### Option A: Quick Install Script (Recommended)

The fastest way to get the agent running. The script detects your environment, installs Prometheus if needed, and deploys the agent — all in one step.

```bash
wget https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh
chmod +x installation.sh
./installation.sh -a <YOUR_AUTH_KEY>
```

Replace `<YOUR_AUTH_KEY>` with the auth key you copied in Step 1.

That's it — the script handles everything else. Skip to [Verify the Installation](#3-verify-the-installation).

---

#### Option B: Manual Helm Installation

Use this method if you need more control over the installation, want to customize Helm values, or are in a restricted environment where you can't run external scripts.

**B1. Install Prometheus** (skip if you already have Prometheus running)

```bash
helm upgrade --install nudgebee-prometheus prometheus-community/kube-prometheus-stack \
  --namespace nudgebee-agent --create-namespace \
  --set nodeExporter.enabled=false \
  --set pushgateway.enabled=false \
  --set alertmanager.enabled=true \
  --set kubeStateMetrics.enabled=true \
  -f https://raw.githubusercontent.com/nudgebee/k8s-agent/main/extra-scrape-config.yaml
```

**B2. Add the NudgeBee Helm repo**

```bash
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
helm repo update
```

**B3. Install the agent**

For **Cloud SaaS** users:

```bash
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --create-namespace \
  --set runner.nudgebee.auth_secret_key="<YOUR_AUTH_KEY>" \
  --set globalConfig.prometheus_url="<PROMETHEUS_URL>" \
  --set opencost.opencost.prometheus.external.url="<PROMETHEUS_URL>"
```

Replace:
- `<YOUR_AUTH_KEY>` — the auth key from Step 1
- `<PROMETHEUS_URL>` — your Prometheus endpoint (e.g., `http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090`)

For **self-hosted** users, see the [Self-Hosted Configuration](#4-for-self-hosted-nudgebee) section below — you need additional settings to point the agent to your own server.

---

## 3. Verify the Installation

After installation, check that the agent pods are running:

```bash
kubectl get pods -n nudgebee-agent
```

All pods should show `Running` status within 1–2 minutes.

Then confirm your cluster appears in NudgeBee:

1. Open the NudgeBee UI ([app.nudgebee.com](https://app.nudgebee.com) or your self-hosted URL).
2. Navigate to **Kubernetes**.
3. Your cluster should appear within 2–3 minutes, and workload data starts populating shortly after.

:::tip
**Expected outcome**: You should see your cluster name in the Kubernetes section, with nodes, workloads, and pods populating automatically. If the cluster does not appear after 5 minutes, check the agent pod logs:
```bash
kubectl logs -n nudgebee-agent -l app=nudgebee-runner
```
:::

---

## 4. For Self-Hosted NudgeBee

If you are running a self-hosted NudgeBee instance, the agent needs to know where your server is. Instead of the `--set` flags in the SaaS installation, create a `values.yaml` file that points to your server's Relay and Collector URLs.

:::info
**Where do I find these URLs?** You configured them during [Server Installation](/docs/installation/server/installation/).
- **Without Ingress**: `ws://relay-server.nudgebee.svc:8080` and `http://k8s-collector.nudgebee.svc`
- **With Ingress**: `wss://relay.yourcompany.com` and `https://collector.yourcompany.com`
:::

### Self-Hosted Values File

```yaml
runner:
  relay_address: "wss://<RELAY_SERVER_URL>/register"   # e.g., wss://relay.yourcompany.com/register
  nudgebee:
    auth_secret_key: "<YOUR_AUTH_KEY>"
    endpoint: "https://<COLLECTOR_SERVER_URL>/"          # e.g., https://collector.yourcompany.com/

globalConfig:
  prometheus_url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

opencost:
  opencost:
    prometheus:
      external:
        url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"
```

Replace the placeholder values with your actual server URLs and auth key.

### Install with the Values File

```bash
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
helm repo update

helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --create-namespace \
  -f values.yaml
```

Then follow [Verify the Installation](#3-verify-the-installation) above to confirm it's working.

---

## 5. Advanced Configuration

These options are for specific environments or requirements. You can skip this section for a standard installation.

### Using HTTP Instead of WebSocket

By default, the agent connects to the NudgeBee server via WebSocket. If your agent is publicly accessible and you want the relay to connect to the agent over HTTP instead, add these environment variables to your `values.yaml`:

```yaml
runner:
  additional_env_vars:
    - name: WS_ENABLED
      value: "false"
    - name: AGENT_HTTP_URL
      value: "http://localhost:5000"  # Agent HTTP endpoint
  nudgebee:
    auth_secret_key: "<YOUR_AUTH_KEY>"
    endpoint: "https://<COLLECTOR_SERVER_URL>/"

globalConfig:
  prometheus_url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

opencost:
  opencost:
    prometheus:
      external:
        url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"
```

This disables WebSocket connections and configures the agent to accept HTTP connections from the relay instead.

### Additional Configuration References

- **[Helm Values Reference](./helm_values.md)** — Complete list of all configurable values for the agent Helm chart.
- **[Node Agent Configuration](./node-agent-configs.md)** — Fine-tune the eBPF-based node agent.
- **[Kubernetes Provider Setup](./k8s-provider/k8s-provider.md)** — Provider-specific instructions for GKE, AKS, and other managed Kubernetes services.
- **[Logging Integration](./logging/logging.md)** — Connect log sources (ELK, Loki, etc.) to the agent.
- **[Tracing Integration](./tracing/tracing.md)** — Connect tracing backends for distributed tracing.
- **[Upgrade Guide](./upgrade.md)** — How to upgrade an existing agent to a newer version.

---

## What's Next?

Your agent is installed and sending data to NudgeBee. Here is what to do next:

1. **[Connect an observability source](/docs/integrations/Observability/)** — Connect Prometheus, Datadog, New Relic, or other monitoring tools for metrics, logs, and traces.
2. **[Set up notifications](/docs/integrations/Notifications/)** — Connect Slack, Teams, or Google Chat to receive alerts.
3. **[Connect an LLM provider](/docs/integrations/LLM/)** — Enable NuBi and AI-powered troubleshooting (SaaS users already have this).
4. **[Explore the Getting Started Guide](/docs/features/#quick-start-the-fastest-way-to-get-started)** — See what to do after your first login.
