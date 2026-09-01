---
id: k8s-agent-health
title: Kubernetes Agent Health & Subsystem Status
sidebar_label: Kubernetes Agent Health
sidebar_position: 3
keywords: [agent health, k8s agent, relay connection, opencost, node agent, logs provider, traces, jaeger, clickhouse]
intent: inspect
provider: kubernetes
error_codes: [RELAY_DISCONNECTED, PROMETHEUS_UNHEALTHY, LOGS_PROBE_FAILED, TRACES_UNREACHABLE, NODE_AGENT_ZERO]
---

# Kubernetes Agent Health & Subsystem Status

The **Agent Health** view in the NudgeBee Console provides real-time visibility into the internal status of the NudgeBee Kubernetes Agent and all connected cluster datasources.

---

## 1. Agent Health Dashboard Overview

Every 60 seconds (`TELEMETRY_PERIOD`), the agent runner executes local lightweight probes against all configured datasources and reports their state to the NudgeBee backend.

```mermaid
graph LR
    subgraph K8s Cluster [Target Kubernetes Cluster]
        Agent[NudgeBee Agent Runner]
        Prom[Prometheus Server]
        AM[Alertmanager]
        Logs[Loki / ES / SigNoz / Pinot]
        Traces[ClickHouse / Chronosphere / Jaeger]
        Cost[OpenCost]
        NodeAgents[Node Agent DaemonSet]

        Agent -->|1. vector 1 PromQL| Prom
        Agent -->|2. GET api v2 status| AM
        Agent -->|3. GET health / buildinfo| Logs
        Agent -->|4. HTTP ping :8123| Traces
        Agent -->|5. GET allocation compute| Cost
        Agent -->|6. up job=node-agent| NodeAgents
    end

    Agent -->|7. POST /v1/telemetry + Reverse Tunnel| Relay[NudgeBee Relay & Server]
```

---

## 2. Field-by-Field Subsystem Reference

Below is the complete reference of every field displayed on the Agent Health card, how it is probed, and what each status means:

### 1. Relay Connection
* **Purpose**: Maintains a bidirectional WebSocket/gRPC reverse proxy tunnel between the in-cluster agent and NudgeBee Server. Allows NuBi and operators to execute live diagnostic queries, fetch pod logs, or run interactive terminal sessions without opening inbound firewall ports into the cluster.
* **Healthy State**: `Connected` (Green).
* **Probe Mechanism**: Continuous WebSocket keepalive ping.
* **Failure Causes**:
  * Outbound firewall blocks TCP port `443` to the Relay server.
  * `RELAY_SERVER_SECRET_KEY` mismatch between agent and server.
  * Intermediate reverse proxy drops long-lived WebSocket connections (missing `Upgrade: websocket` headers).

---

### 2. Agent URL (`AGENT_HTTP_URL`)
* **Purpose**: The internal ClusterIP service URL used for cluster-local inter-pod communication.
* **Healthy State**: Displays `http://nudgebee-agent.nudgebee.svc.cluster.local:8080` (or custom configured service URL).
* **Verification**:
  ```bash
  kubectl get svc -n nudgebee -l app.kubernetes.io/name=nudgebee-agent
  ```

---

### 3. Prometheus
* **Purpose**: Primary metrics engine for cluster CPU, memory, disk, network usage, and Kubernetes object metrics.
* **Healthy State**: `Connected` (Green), with retention duration displayed (e.g. `15d`).
* **Probe Mechanism**: The agent executes an authenticated instant query: `vector(1)` with a 5-second timeout. If the response is HTTP 200 with `{"status":"success"}`, it is marked Connected.
* **Failure Causes**: Incorrect Prometheus Service URL, missing Bearer token / Basic Auth, or missing multi-tenant headers (`X-Scope-OrgID`).
* **Troubleshooting Guide**: See [Why is Prometheus Disconnected?](../connect/prometheus-troubleshooting.md).

---

### 4. Alertmanager
* **Purpose**: Forwards alert definitions, active firing alerts, and alert silencing rules to NudgeBee's event triage engine.
* **Healthy State**: `Connected` (Green).
* **Probe Mechanism**: Probes `GET /api/v2/status` or Prometheus Alert rules endpoint every `ALERT_RULES_INTERVAL` (default `60s`).
* **Failure Causes**:
  * Alertmanager service not reachable at configured URL.
  * In-cluster Alertmanager webhook receiver not configured to forward alerts to NudgeBee.

---

### 5. Logs Provider
* **Purpose**: Enables live log streaming, container crash logs, and AI log analysis in incident investigations.
* **Supported Providers & Probe Endpoints** (evaluated in strict precedence):
  1. **Apache Pinot**: Probes `GET <PinotURL>/health`
  2. **Elasticsearch / OpenSearch**: Probes `GET <ES_URL>/_cluster/health` (authenticated)
  3. **SigNoz**: Probes `GET <SigNozURL>/api/v1/health` and fetches version from `/api/v1/version`
  4. **Grafana Loki**: Probes `GET <LokiURL>/loki/api/v1/status/buildinfo`
* **Healthy State**: `Connected` (Green), displaying the active provider name (e.g. `Loki`, `Elasticsearch`, `SigNoz`).
* **Failure Causes**:
  * Incorrect log service URL.
  * Elasticsearch credentials missing or index pattern (`ELASTICSEARCH_LOG_INDEX`) does not match.

---

### 6. Traces
* **Purpose**: Provides distributed APM tracing for microservices latency, error spans, and bottleneck analysis.
* **Supported Backends**:
  * **ClickHouse / OTel Collector**: Probes HTTP `/ping` on port `8123` (or `CLICKHOUSE_PORT`).
  * **Chronosphere Traces / Jaeger**: Probes query API endpoint.
* **Healthy State**: `Connected` (Green) or `Disabled` (Gray if tracing is not configured).
* **Failure Causes**: ClickHouse service down, credentials invalid, or `TRACES_ENABLED` set to `false`.

---

### 7. OpenCost
* **Purpose**: Collects real-time container, pod, and node cost allocations and idle waste metrics.
* **Healthy State**: `Connected` (Green).
* **Probe Mechanism**: Probes OpenCost allocation compute API (`/allocation/compute` or `/model/allocation`).
* **Failure Causes**: OpenCost pod not running, or agent lacks RBAC to query OpenCost service.

---

### 8. Node Agent Count
* **Purpose**: Reports the number of healthy NudgeBee Node Agent daemonset pods collecting low-level eBPF / host metrics.
* **Healthy State**: Number matches the total active Kubernetes node count (e.g., `12 / 12 Nodes`).
* **Probe Mechanism**: Evaluates the PromQL query:
  ```promql
  up{job=~"(.+/)?nudgebee(-.*)?-node-agent"}
  ```
* **Failure Causes**:
  * Node Agent DaemonSet has not been deployed.
  * Node taints or tolerations prevent Node Agent from scheduling on specific worker nodes.

---

### 9. Kubernetes Provider & Version
* **Purpose**: Displays the detected cloud provider runtime (`EKS`, `GKE`, `AKS`, `BareMetal`) and Kubernetes server version.
* **Detection Mechanism**: Probed automatically at startup via Kubernetes Discovery API (`ServerVersion()`) and node provider IDs.

---

### 10. Agent Version & Latest Version
* **Purpose**: Displays the currently running agent container image tag compared against the latest stable release published by NudgeBee.
* **Upgrade Recommended**: If the current version is more than 2 minor releases behind, an `Upgrade Available` badge appears.

---

## 3. Subsystem Health Diagnostics & Remediation Matrix

| Subsystem | Symptom in Console | How to Verify via CLI | Corrective Helm Command / Action |
| :--- | :--- | :--- | :--- |
| **Relay** | `Relay: Disconnected` | `kubectl logs -n nudgebee -l app.kubernetes.io/name=nudgebee-agent -c runner \| grep relay` | Verify `config.relayServerEndpoint` and `config.authSecretKey`. Ensure egress on port 443 is open. |
| **Prometheus** | `Prometheus: Disconnected` | `kubectl exec -it -n nudgebee deploy/nudgebee-agent -c runner -- curl -s http://prometheus-k8s:9090/api/v1/query?query=vector(1)` | Update `config.prometheusURL` in `values.yaml`. See [Prometheus Guide](../connect/prometheus-troubleshooting.md). |
| **Alertmanager** | `Alertmanager: Disconnected` | `kubectl get svc -A \| grep alertmanager` | Check `config.alertManagerURL`. Ensure Alertmanager service exists and is reachable. |
| **Logs (Loki/ES)** | `Logs: Disconnected` | `kubectl exec -it -n nudgebee deploy/nudgebee-agent -c runner -- curl -s http://loki:3100/loki/api/v1/status/buildinfo` | Verify `config.lokiURL` or `config.elasticsearchURL` and check authentication credentials. |
| **Traces** | `Traces: Error 500` | `kubectl exec -it -n nudgebee deploy/nudgebee-agent -c runner -- curl -s http://clickhouse:8123/ping` | Verify ClickHouse pod health in namespace and ensure port 8123 HTTP ping returns `Ok.`. |
| **Node Agent** | `Node Agent: 0` | `kubectl get ds -n nudgebee` | Deploy or update Node Agent DaemonSet with appropriate node tolerations. |

---

## 4. NuBi Documentation Search

Ask NuBi in chat for guided subsystem setup and troubleshooting:
- *"How does the Kubernetes agent probe Prometheus and Loki health?"*
- *"What does it mean when Node Agent count shows 0 in Agent Health?"*
