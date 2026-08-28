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

| Flag              | Description                     | Default                  |
| ----------------- | ------------------------------- | ------------------------ |
| `SCRAPE_INTERVAL` | How often to gather metrics     | `15s`                    |
| `WAL_DIR`         | Where to store Write-Ahead Logs | `/tmp/coroot-node-agent` |

---

## Other flags

| Flag                   | Description                           | Default                                                                                        |
| ---------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `RESOLVE_DNS`          | Enable DNS resolution                 | `false`                                                                                        |
| `IGNORE_CONTROL_PLANE` | Ignore these control plane components | `karpenter,loki,prometheus,grafana,kubelet,etcd,apiserver,victoria,nudgebee-agent,kube-system` |
| `TRACE_ID_HEADERS`     | Headers to extract trace IDs          | `Traceparent,X-Request-Id`                                                                     |

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
