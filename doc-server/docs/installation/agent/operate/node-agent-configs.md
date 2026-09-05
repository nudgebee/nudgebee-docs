---
sidebar_position: 2
---

# Node Agent Configuration

The node agent reads its configuration from environment variables, which you set through `nodeAgent.env` in your values file.

Some of these have a dedicated chart value and are easier to set that way: `nodeAgent.scrapeInterval`, `nodeAgent.apiKey`, `nodeAgent.tracesEndpoint`, `nodeAgent.logsEndpoint`, `nodeAgent.metricsEndpoint`, `nodeAgent.profilesEndpoint`. The chart also passes `--cgroupfs-root /host/sys/fs/cgroup` as a command-line flag, which wins over `CGROUPFS_ROOT`, so leave that one alone.

---

## Network and listening

| Flag                   | Description                                         | Default          |
| ---------------------- | --------------------------------------------------- | ---------------- |
| `LISTEN`               | Address the agent listens on (`ip:port` or `:port`) | `0.0.0.0:80`     |
| `CGROUPFS_ROOT`        | Path to cgroup filesystem mount                     | `/sys/fs/cgroup` |
| `EPHEMERAL_PORT_RANGE` | Skip tracking these TCP port ranges                 | `32768-60999`    |
| `TRACK_PUBLIC_NETWORK` | Whitelisted public IP networks to track             | `0.0.0.0/0`      |

---

## Metrics and logs

| Flag                            | Description                                 | Default  |
| ------------------------------- | ------------------------------------------- | -------- |
| `DISABLE_LOG_PARSING`           | Disable container log parsing               | `false`  |
| `DISABLE_L7_TRACING`            | Disable Layer 7 (application-level) tracing | `false`  |
| `DISABLE_PINGER`                | Disable upstream pinging                    | `true`   |
| `LOG_PER_SECOND`                | Max number of logs processed per second     | `10.0`   |
| `LOG_BURST`                     | Max log burst capacity (tokens)             | `100`    |
| `MAX_LABEL_LENGTH`              | Maximum length for any metric label value   | `4096`   |
| `EXCLUDE_HTTP_REQUESTS_BY_PATH` | Skip HTTP metrics by path (comma-separated) | *(none)* |

---

## Redaction

| Flag                            | Description                                                  | Default                                 |
| ------------------------------- | ------------------------------------------------------------ | --------------------------------------- |
| `SANITIZE_HEADERS`              | Enable header sanitization                                   | `true`                                  |
| `SENSITIVE_HEADERS`             | List of sensitive header names to sanitize (comma-separated) | `Authorization, Cookie, X-Action-Token` |
| `DISABLE_SENSITIVE_LOG_PARSING` | Stop parsing log lines that look like they carry secrets | `true` |

---

## Cloud labels

These enrich the `node_cloud_info` metric:

| Flag                  | Description                         |
| --------------------- | ----------------------------------- |
| `PROVIDER`            | Cloud provider name                 |
| `REGION`              | Cloud region                        |
| `AVAILABILITY_ZONE`   | Availability zone                   |
| `ACCOUNT_ID`          | Cloud account ID                    |
| `INSTANCE_TYPE`       | Instance type                       |
| `INSTANCE_LIFE_CYCLE` | Instance lifecycle (spot/on-demand) |

---

## Endpoints

| Flag                   | Description                             |
| ---------------------- | --------------------------------------- |
| `COLLECTOR_ENDPOINT`   | Base endpoint for all telemetry         |
| `API_KEY`              | API key for the endpoints above. Set it with `nodeAgent.apiKey`. |
| `METRICS_ENDPOINT`     | Specific metrics push endpoint          |
| `TRACES_ENDPOINT`      | Specific traces push endpoint           |
| `LOGS_ENDPOINT`        | Specific logs push endpoint             |
| `PROFILES_ENDPOINT`    | Specific profiles push endpoint         |
| `INSECURE_SKIP_VERIFY` | Skip TLS verification (not recommended) |

---

## Scraping and storage

| Flag              | Description                     | Default                    |
| ----------------- | ------------------------------- | -------------------------- |
| `SCRAPE_INTERVAL` | How often to gather metrics     | `15s`                      |
| `WAL_DIR`         | Where to store Write-Ahead Logs | `/tmp/nudgebee-node-agent` |
| `MAX_SPOOL_SIZE`  | Maximum size of the on-disk spool buffer | `500MB`           |

---

## Cardinality and filtering

| Flag                             | Description                                                                                       | Default                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `CONTAINER_ALLOWLIST`            | List of allowed container regex patterns                                                          | *(none)*                                                                                       |
| `CONTAINER_DENYLIST`             | List of denied container regex patterns                                                           | *(none)*                                                                                       |
| `AGGREGATE_EPHEMERAL_WORKLOADS`  | Aggregate metrics for bare pods and standalone Jobs to reduce series cardinality                  | `true`                                                                                         |
| `COLLAPSE_INTERNAL_DESTINATIONS` | Use workload identity instead of raw IP:port for internal destinations to keep series stable      | `true`                                                                                         |
| `HTTP_PATH_NORMALIZATION_RULES`  | Custom HTTP path normalization rules (`pattern1:replacement1,pattern2:replacement2`)              | *(none)*                                                                                       |
| `RESOLVE_DNS`                    | Enable DNS resolution for remote destinations                                                     | `false`                                                                                        |
| `IGNORE_CONTROL_PLANE`           | Ignore control plane components                                                                   | `karpenter,loki,prometheus,grafana,kubelet,etcd,apiserver,victoria,nudgebee-agent,kube-system` |
| `ENABLE_DOTNET_TRACING`          | Enable .NET CLR tracing                                                                           | `false`                                                                                        |
| `DISABLE_GPU_MONITORING`         | Disable GPU monitoring (NVML)                                                                     | `false`                                                                                        |
| `TRACE_ID_HEADERS`               | Headers to extract trace IDs                                                                      | `Traceparent,X-Request-Id`                                                                     |

---

## Applying configuration

Here’s an example `values.yaml` with common flags explicitly set:

:::warning Do not change `LISTEN`
The DaemonSet declares container port 80 and the PodMonitor scrapes the port named `http`, which is that one. Moving the listener to another port leaves Prometheus scraping a port nothing is bound to, and network metrics go quiet with no error.
:::

```yaml
nodeAgent:
  env:
    - name: DISABLE_LOG_PARSING
      value: "true"
    - name: LOG_PER_SECOND
      value: "20"
    - name: SANITIZE_HEADERS
      value: "true"
    - name: SENSITIVE_HEADERS
      value: "Authorization,Proxy-Authorization,Cookie,X-Auth-Token"
    - name: PROVIDER
      value: "aws"
    - name: REGION
      value: "us-east-1"
    - name: ACCOUNT_ID
      value: "123456789"
    - name: SCRAPE_INTERVAL
      value: "30s"
```

To apply these settings, run:

```bash
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent --create-namespace \
  -f values.yaml
```

## Troubleshooting Node Agent Failures

When Agent Health displays **Node Agent: 0** or **Node Agent: Disconnected**, troubleshoot in two layers:
1. **DaemonSet Pod Layer**: Are the node agent pods actually scheduled, privileged, and running?
2. **Prometheus Scrape Layer**: Is Prometheus scraping them and stamping the expected `job` label?

---

### Layer 1: DaemonSet Pod Health & Scheduling

The node agent runs as a privileged DaemonSet on every Linux node. It requires `hostPID: true`, privileged container capabilities, and host mounts for `/sys/fs/cgroup` and `/sys/kernel/debug`.

#### 1. Pod Security Standards (PSA) and OpenShift SCC

If your cluster enforces the `baseline` or `restricted` Pod Security Standard (PSA) on the `nudgebee-agent` namespace, the Kubernetes Admission Controller will **reject** the node-agent pods while allowing the unprivileged runner and forwarder to start.

Check DaemonSet events:
```bash
kubectl describe daemonset -n nudgebee-agent nudgebee-agent-node-agent
```

If you see `FailedCreate` with:
```
Error creating: pods "..." is forbidden: violates PodSecurity "restricted:latest": privileged, hostPID
```

**Fix:** Label the namespace to allow privileged workloads:
```bash
kubectl label namespace nudgebee-agent pod-security.kubernetes.io/enforce=privileged --overwrite
```

On OpenShift, the chart provides an SCC manifest (`templates/openshift-scc-privileged.yaml`). Note that the node-agent DaemonSet intentionally shares the runner's ServiceAccount (`<release-name>-runner-service-account`). Ensure this ServiceAccount is granted the `privileged` SCC:
```bash
oc adm policy add-scc-to-user privileged -z nudgebee-agent-runner-service-account -n nudgebee-agent
```

#### 2. Linux Kernel & eBPF Tracer Compatibility

The node agent attaches eBPF probes to the host Linux kernel to capture Layer 7 protocol events (HTTP, PostgreSQL, MySQL, Redis, Kafka).
- **Kernel Version**: Requires Linux kernel `>= 4.18` (>= 5.4 recommended).
- **BTF / Kernel Headers**: Modern eBPF CO-RE requires BTF support (`/sys/kernel/btf/vmlinux`) or kernel headers installed on the host.
- **Node OS Nuances**: On Google Container-Optimized OS (COS) or AWS Bottlerocket, read-only root filesystems or custom debugfs mount paths can prevent eBPF attachment.

Inspect the node agent container logs for BPF initialization errors:
```bash
kubectl logs -n nudgebee-agent daemonset/nudgebee-agent-node-agent -c node-agent --tail=50
```

Look for:
- `failed to load BPF program` or `BPF verifier failed`
- `cgroupfs root not found` (ensure host has `/sys/fs/cgroup` mounted)
- `permission denied` (indicates missing `privileged: true` or SELinux block)

#### 3. Verify Local Metrics Endpoint

Confirm whether the node agent daemon is actually collecting metrics and serving its Prometheus exporter on port 80:

```bash
NODE_AGENT_POD=$(kubectl get pods -n nudgebee-agent -l app=nudgebee-node-agent -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n nudgebee-agent $NODE_AGENT_POD -c node-agent -- \
  wget -qO- http://localhost:80/metrics | grep -E 'node_info|container_net_tcp_successful_connects_total' | head -n 10
```

- **If metrics are printed**: The node agent is functioning perfectly. The issue is entirely in Prometheus target discovery or scraping.
- **If connection refused or command hangs**: Check pod logs and ensure no other process is conflicting with container port 80.

---

### Layer 2: Prometheus Discovery & Label Matching

Agent Health derives its count by querying Prometheus:

```promql
up{job=~"(.+/)?nudgebee(-.*)?-node-agent"}
```

Run this query directly in the Prometheus configured at `globalConfig.prometheus_url`:

| Result | Root Cause & Resolution |
|---|---|
| **No series** | Prometheus has not discovered the PodMonitor. Check `podMonitorSelector` and `podMonitorNamespaceSelector` on the Prometheus CR. |
| **Series exist with `job="kubernetes-pods"` or `job="coroot-node-agent"`** | The pod is scraped under an alternate job name. See [Fixing Scrape Job Names](../connect/prometheus-troubleshooting.md#scenario-1-node-agent-is-scraped-under-a-different-job-name). |
| **Series exist with value `0`** | Prometheus cannot reach the pod IP on port 80. Inspect NetworkPolicies or firewall rules blocking Prometheus scrape egress. |
| **Fewer series than cluster nodes** | Pods may be missing on tainted nodes (e.g. GPU, Karpenter, or master/control-plane nodes). Add tolerations via `nodeAgent.tolerations`. |
| **Duplicate series per pod with different labels** | Both a static scrape job and PodMonitor are active, scraping the agent twice with conflicting `instance` labels. Disable `nodeAgent.podmonitor.enabled: false`. |

#### Matching Prometheus Operator Selectors

Compare what your `Prometheus` resource selects against the rendered `PodMonitor`:

```bash
kubectl get prometheus -A -o yaml | grep -A8 -E 'podMonitorSelector:|podMonitorNamespaceSelector:'
kubectl get podmonitor -n nudgebee-agent -o yaml
```

If `podMonitorSelector` requires a specific label, add it in `values.yaml`:

```yaml
prometheusStack:
  selectorLabels:
    release: kube-prometheus-stack # Or your Prometheus release name
```

If your deployment runs offline (GitOps with Argo CD or Flux), ensure `enablePrometheusStack: true` is set so Helm renders the `PodMonitor` CR without relying on live cluster capability inspection. See [Why is Prometheus Disconnected?](../connect/prometheus-troubleshooting.md) for full step-by-step resolution.
