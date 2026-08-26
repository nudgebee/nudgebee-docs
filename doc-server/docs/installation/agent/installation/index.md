---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Agent Installation

Install the NudgeBee Agent on each Kubernetes cluster you want to monitor. The agent runs as a lightweight collector DaemonSet and controller within your cluster. It gathers live workload telemetry, resource utilization, events, logs, and distributed traces, streaming them to the NudgeBee Server to build the **Semantic Knowledge Graph** for real-time AI troubleshooting and cost optimizations.

:::note[Do I need the Agent?]
- **Connecting a Cloud Account** (AWS/Azure/GCP) provides high-level cloud inventory and cluster auto-discovery without installing software upfront.
- **Installing the Agent** inside the cluster is **required for deep in-cluster telemetry**, live pod logs, kernel-level eBPF network metrics, and automated AI incident RCA.
- Both **Cloud SaaS** and **Self-Hosted** deployments install the exact same agent into monitored clusters.
:::

:::tip
**Estimated time**: 5–10 minutes per cluster using the quick install script, or 10–15 minutes for manual Helm installation.
:::

:::info
**Cloud SaaS users**: You only need to install the agent — the server is managed for you. Generate your agent auth key at [app.nudgebee.com](https://app.nudgebee.com) and skip straight to [Install the Agent](#2-install-the-agent).

**Self-hosted users**: Make sure the [NudgeBee Server is installed](../../server/) first. You will need the Relay Server URL and Collector Server URL from your server setup — see [Self-Hosted Configuration](#4-for-self-hosted-nudgebee).
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
| **NudgeBee Auth Key** | Generated from the NudgeBee UI | **Admin → Integrations → Kubernetes Clusters → Add K8s Account** |
| **Registry access** | Outbound access to `nudgebee.github.io` (Helm repo) and `ghcr.io/nudgebee` (agent images) | Air-gapped clusters can mirror images internally |
| **Prometheus** | A running Prometheus instance in the cluster | If omitted, the installer can deploy a bundled instance |

### Resource Footprint

The agent components are designed to be low overhead:

| Component | Sizing Breakdown | Notes |
|---|---|---|
| **Agent Core (without Prometheus)** | **~2 GB RAM, 1-2 CPU cores** | Includes Runner, Node Agent DaemonSet (eBPF), Event Watcher |
| **Agent with Bundled Observability** | **~5 GB RAM, 2-3 CPU cores** | Includes Prometheus, Alertmanager, and Kube-State-Metrics |

---

## 2. Install the Agent

### Step 1: Generate Your Auth Key

1. Log in to [app.nudgebee.com](https://app.nudgebee.com) (or your self-hosted NudgeBee UI).
2. Go to **Admin → Integrations**, open the **Kubernetes Clusters** card, and click **Add K8s Account**.
3. Name the account after the cluster, mark it Production or Non-production, and click **Next**.
4. The **Finish Setup** step gives you the install command with your **Auth Key** (`<YOUR_AUTH_KEY>`) in it. Copy the key.

:::caution Blast Radius of Auth Key
Your Auth Key authorizes your agent to send data to your NudgeBee control plane. Store it securely in a secret manager or Kubernetes Secret — never commit it in cleartext.
:::

### Step 2: Deploy via Helm

Choose your Kubernetes environment:

<Tabs groupId="environment">
<TabItem value="eks" label="AWS EKS" default>

```bash
# 1. Add NudgeBee Helm repository
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
helm repo update

# 2. Install Prometheus (already have one? see the note below - do not just skip)
helm upgrade --install nudgebee-prometheus prometheus-community/kube-prometheus-stack \
  --namespace nudgebee-agent --create-namespace \
  --set nodeExporter.enabled=true \
  --set alertmanager.enabled=true \
  --set kubeStateMetrics.enabled=true \
  -f https://raw.githubusercontent.com/nudgebee/k8s-agent/main/kube-prometheus-stack-values.yaml

# 3. Deploy NudgeBee Agent
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --create-namespace \
  --set runner.nudgebee.auth_secret_key="<YOUR_AUTH_KEY>" \
  --set globalConfig.prometheus_url="http://nudgebee-prometheus-kube-prometheus-prometheus.nudgebee-agent.svc:9090"
```

</TabItem>
<TabItem value="gke" label="GCP GKE">

```bash
# 1. Add NudgeBee Helm repository
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
helm repo update

# 2. Install Prometheus (already have one? see the note below - do not just skip)
helm upgrade --install nudgebee-prometheus prometheus-community/kube-prometheus-stack \
  --namespace nudgebee-agent --create-namespace \
  --set nodeExporter.enabled=true \
  --set alertmanager.enabled=true \
  --set kubeStateMetrics.enabled=true \
  -f https://raw.githubusercontent.com/nudgebee/k8s-agent/main/kube-prometheus-stack-values.yaml

# 3. Deploy NudgeBee Agent
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --create-namespace \
  --set runner.nudgebee.auth_secret_key="<YOUR_AUTH_KEY>" \
  --set globalConfig.prometheus_url="http://nudgebee-prometheus-kube-prometheus-prometheus.nudgebee-agent.svc:9090"
```

</TabItem>
<TabItem value="aks" label="Azure AKS">

```bash
# 1. Add NudgeBee Helm repository
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
helm repo update

# 2. Deploy NudgeBee Agent (Azure Monitor integration enabled)
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --create-namespace \
  --set runner.nudgebee.auth_secret_key="<YOUR_AUTH_KEY>" \
  --set nodeAgent.enabled=true \
  --set nodeAgent.podmonitor.enabled=true \
  --set nodeAgent.podmonitor.azuremanaged=true
```

</TabItem>
<TabItem value="local" label="Local (Kind / Minikube)">

```bash
# 1. Add NudgeBee Helm repository
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
helm repo update

# 2. Deploy NudgeBee Agent with minimal local footprint
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --create-namespace \
  --set runner.nudgebee.auth_secret_key="<YOUR_AUTH_KEY>" \
  --set nodeAgent.resources.requests.cpu="50m" \
  --set nodeAgent.resources.requests.memory="64Mi"
```

</TabItem>
</Tabs>

### Step 3: Send Your Alerts to the Agent

NudgeBee raises alert-driven events only if your Alertmanager posts alerts to the agent. If you installed Prometheus using the values file in Step 2, that receiver is already configured.

:::caution Already running Prometheus? Configure Alertmanager to push alerts
Skipping the Prometheus install is fine—the agent **queries** metrics, so it only needs a reachable URL.

Alerts are different: they are **pushed**, and the values file in Step 2 is what configures Alertmanager to send them. If you skip Step 2 without wiring Alertmanager, NudgeBee gets metrics and traces but never an alert, with nothing reporting an error.

Add this receiver to your existing Alertmanager configuration:

```yaml
route:
  routes:
    - receiver: nudgebee-agent
      group_by: ['...']
      group_wait: 1s
      group_interval: 1s
      repeat_interval: 4h
      continue: true
receivers:
  - name: nudgebee-agent
    webhook_configs:
      - url: http://<release>-runner.<agent-namespace>.svc/api/alerts
        send_resolved: true
```

- **Receiver URL**: `helm install` prints the exact URL for your release. For default installations in `nudgebee-agent`, this is `http://nudgebee-agent-runner.nudgebee-agent.svc/api/alerts`.
- **`continue: true`**: Keep this enabled so your existing receivers (Slack, PagerDuty, email) continue to receive alerts.
- **`AlertmanagerConfig` CR caveat**: Do not use an unscoped `AlertmanagerConfig` Custom Resource without root routing, as Prometheus Operator scopes them to their own namespace by default.
- **External Alertmanager**: If your Alertmanager runs outside this cluster (Grafana Cloud, Chronosphere, or a central instance), the in-cluster service URL is unreachable—use the [Prometheus Alertmanager webhook integration](/docs/integrations/Webhooks/) instead.
- **Verification**: A `Watchdog` event appearing in NudgeBee proves delivery end to end. If `AlertmanagerFailedToSendAlerts` appears in your Prometheus alerts, the webhook URL is unreachable.
:::

For complete configuration instructions across kube-prometheus-stack, VictoriaMetrics, and standalone setups, see the [Alert Forwarding Guide](../connect/alertmanager.md).

---

## 3. Verify the Installation (Checklist) {#3-verify-the-installation}

After running the install command, verify that the agent is communicating with the server:

### 1. Verify Pod Readiness
```bash
kubectl get pods -n nudgebee-agent
```
**Expected Output** (names follow the release name, `nudgebee-agent` here):
- `nudgebee-agent-runner-*`: `1/1 Running`
- `nudgebee-agent-node-agent-*` (DaemonSet): `1/1 Running` on every worker node
- `nudgebee-agent-forwarder-*` (event watcher): `1/1 Running`

### 2. Inspect Agent Connection Logs
```bash
kubectl logs -n nudgebee-agent -l app=nudgebee-agent-runner --tail=50
```
Look for log confirmation: `Connected to NudgeBee Relay successfully` and `Registration acknowledged`.

### 3. Check the NudgeBee Dashboard
1. Open [app.nudgebee.com](https://app.nudgebee.com) or your self-hosted dashboard.
2. Navigate to **Kubernetes**.
3. Your cluster should display with a **Connected** badge, and nodes and workload pods will start populating within 2 minutes.

### 4. Run Your First Investigation with NuBi (First Successful Outcome)
1. In the NudgeBee dashboard, click the **NuBi AI drawer** on the right side of the screen.
2. **Deterministic Cluster Overview Prompt** (verifies live telemetry on any cluster):
   ```text
   List the namespaces, nodes, and visible workloads in this cluster with their health status and latest telemetry timestamp.
   ```
   **Expected Result**: NuBi identifies the connected cluster and returns current namespaces, nodes, and visible workloads grounded in recent telemetry. Exact formatting may vary depending on the configured model.
3. **Follow-Up Diagnostic Prompt** (for incident triage):
   ```text
   Which workloads in this cluster have restarted, entered CrashLoopBackOff, or experienced OOMKills in the last 24 hours?
   ```
   **Expected Result**: On a healthy cluster, NuBi confirms no active restart anomalies are detected. On clusters with issues, it provides affected workloads with exit codes and recommended remediation steps.
4. **Success Verification**: When you receive responses grounded in your cluster's live workloads and node statuses, your agent telemetry pipeline is verified and fully operational.

---

## 4. Troubleshooting Agent Installation Errors

Use this diagnostic reference to resolve common agent deployment and communication issues.

---

### Diagnostic Quick Reference

| Error Symptom | Cause | Resolution |
|---|---|---|
| **`401 Unauthorized / Invalid API Key`** | Incorrect or revoked Auth Key | Verify the key under **Admin → Integrations → Kubernetes Clusters** and re-run `helm upgrade` with `--set runner.nudgebee.auth_secret_key="<KEY>"`. |
| **`node-agent CrashLoopBackOff` (eBPF load failure)** | Kernel < 4.2 or non-standard distro (Bottlerocket, Talos, GKE COS) | Check kernel with `uname -r` and ensure `/sys/kernel/debug` is accessible. As a last resort, drop the DaemonSet with `--set nodeAgent.enabled=false` (loses eBPF network metrics and profiling). |
| **No alerts in NudgeBee, everything else working** | No Alertmanager receiver points at the agent | Add the receiver. See [Alert Forwarding](../connect/alertmanager.md). Nothing reports this on its own. |
| **`WebSocket Dial Timeout / EOF`** | Outbound firewall or NetworkPolicy blocking TCP 443 | Verify egress to `wss://relay.nudgebee.com` (SaaS) or your relay Ingress. Ensure port 443 is open. |
| **`Prometheus connection refused / empty metrics`** | Wrong Prometheus service URL or missing KSM | Point `globalConfig.prometheus_url` to valid service DNS (e.g. `http://<service>.<namespace>.svc:9090`). |
| **`CRD / Webhook timeout error`** | Prometheus operator CRDs not yet established | Wait 30 seconds and re-run the `helm upgrade` command. |

---

### In-Depth Diagnostic Scenarios

#### 1. Node-Agent eBPF Probe Load Failures
If the `nudgebee-node-agent` DaemonSet pods enter `CrashLoopBackOff` or fail to attach eBPF probes:

**Diagnose:**
```shell
kubectl logs daemonset/nudgebee-agent-node-agent -n nudgebee-agent
```

**Resolution:**
- Verify that your Kubernetes node kernel is version **4.2 or higher** (`uname -r`).
- For container-optimized operating systems (e.g. AWS Bottlerocket or GKE COS), ensure debugfs and bpf filesystems are mounted.
- If running on microVMs or kernels with restricted eBPF, disable the node agent entirely. The rest of the agent (inventory, events, metrics, alerts) keeps working; you lose eBPF network metrics and profiling:
  ```shell
  helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
    --namespace nudgebee-agent \
    --reuse-values \
    --set nodeAgent.enabled=false
  ```

#### 2. Prometheus Metric Discovery & Zero Metrics
If the cluster connects in the UI but workload CPU and memory graphs remain empty:

**Diagnose:**
```shell
# Test Prometheus DNS resolution from inside the agent runner pod
kubectl exec -it deployment/nudgebee-agent-runner -n nudgebee-agent -- wget -qO- http://nudgebee-prometheus-kube-prometheus-prometheus.nudgebee-agent.svc:9090/api/v1/query?query=up
```

**Resolution:**
Ensure `globalConfig.prometheus_url` points to the exact Prometheus service running in your cluster.

#### 3. Egress Firewall & Kubernetes NetworkPolicy
If your cluster enforces default-deny egress NetworkPolicies, the runner will fail with `WebSocket dial timeout`:

**Resolution:**
Apply a NetworkPolicy allowing outbound TCP traffic on port 443 from the `nudgebee-agent` namespace:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-nudgebee-egress
  namespace: nudgebee-agent
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - protocol: TCP
          port: 443
        - protocol: TCP
          port: 53  # Allow DNS resolution
        - protocol: UDP
          port: 53
```


---

## 4. For Self-Hosted NudgeBee

If you are running a self-hosted NudgeBee instance, the agent needs to know where your server is. Instead of the `--set` flags in the SaaS installation, create a `values.yaml` file that points to your server's Relay and Collector URLs.

:::info
**Where do I find these URLs?** You configured them during [Server Installation](/docs/installation/server/).
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

### Access Modes (Read-Only vs Write)

A default install can already delete and evict pods, cordon nodes, restart rollouts, scale workloads, apply rightsizing recommendations, and read Secrets. Two values move that boundary.

To also allow node deletion, workload and namespace creation, and writes to Services, Ingresses, NetworkPolicies and Secrets:

```bash
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --reuse-values \
  --set runner.enableWritePermissions=true
```

To go the other way and leave the agent with `get`, `list`, `watch` and nothing else:

```bash
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --reuse-values \
  --set runner.readOnly=true
```

Setting both fails the install. [Permissions and access mode](../operate/helm_values.md#permissions-and-access-mode) lists exactly what each one changes.

### Additional Configuration References

- **[Alert Forwarding](../connect/alertmanager.md)** — Point your Alertmanager at the agent. Without it NudgeBee gets no alerts.
- **[Helm Values Reference](../operate/helm_values.md)** — Complete list of all configurable values for the agent Helm chart.
- **[Node Agent Configuration](../operate/node-agent-configs.md)** — Fine-tune the eBPF-based node agent.
- **[Kubernetes Provider Setup](./k8s-provider/)** — Provider-specific instructions for GKE, AKS, and other managed Kubernetes services.
- **[Logging Integration](../connect/logging/)** — Connect log sources (ELK, Loki, etc.) to the agent.
- **[Tracing Integration](../connect/tracing/)** — Connect tracing backends for distributed tracing.
- **[Upgrade Guide](./upgrade.md)** — How to upgrade an existing agent to a newer version.

---

## What's Next?

Your agent is installed and sending data to NudgeBee. Here is what to do next:

1. **[Connect an observability source](/docs/integrations/Observability/)** — Connect Prometheus, Datadog, New Relic, or other monitoring tools for metrics, logs, and traces.
2. **[Set up notifications](/docs/integrations/Notifications/)** — Connect Slack, Teams, or Google Chat to receive alerts.
3. **[Connect an LLM provider](/docs/integrations/LLM/)** — Enable NuBi and AI-powered troubleshooting (SaaS users already have this).
4. **[Explore the Getting Started Guide](/docs/features/)** — See what to do after your first login.
