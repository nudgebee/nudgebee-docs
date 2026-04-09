---
sidebar_position: 2
---
# Dynatrace

NudgeBee integrates with **Dynatrace** as a full-stack observability platform, querying **logs**, **distributed traces**, and **metrics** directly from your Dynatrace Grail storage using DQL (Dynatrace Query Language). This enables NudgeBee to surface correlated telemetry signals during incident investigation — without moving data out of your Dynatrace environment.

---

## Prerequisites

Before configuring the integration, ensure you have:

- A **Dynatrace SaaS** environment with **Grail** storage enabled (Platform tier)
- Your **Environment URL** in the format: `https://{env-id}.apps.dynatrace.com`
- A **Platform Bearer Token** with the required scopes (see Step 1 below)

> **Note:** The integration uses the Dynatrace Platform API (`/platform/storage/`), which requires the `.apps.dynatrace.com` URL. If you enter a `.live.dynatrace.com` URL, NudgeBee converts it automatically.

---

## Step 1: Create a Dynatrace Access Token

NudgeBee uses a single Platform Bearer Token to query all three signal types (logs, traces, metrics).

1. In your Dynatrace environment, search for **Access Tokens** in the top navigation bar (or go to **Settings** > **Access Tokens**)
2. Click **Generate new token**
3. Give it a descriptive name — e.g., `nudgebee-integration`
4. Enable the following scopes:

| Scope | Required For |
|-------|-------------|
| `storage:logs:read` | Log queries via Grail DQL |
| `storage:spans:read` | Distributed trace queries via Grail DQL |
| `storage:metrics:read` | Metric queries via Grail DQL |
| `environment-api:problems:read` | *(Optional)* Richer enrichment when using the [Dynatrace Webhook](./dynatrace_webhook.md) |

5. Click **Generate token** and copy the value — you won't be able to see it again.

> **Reference:** [Create and manage Dynatrace access tokens](https://docs.dynatrace.com/docs/manage/access-control/access-tokens)

---

## Step 2: Configure the Integration in NudgeBee

Navigate to **Integrations** > **Observability** tab and select **Dynatrace** to open the configuration form.

### Configuration Fields

* **Integration Config Name**
    * A descriptive label for this integration (e.g., `Production Dynatrace`).
    * Useful when managing multiple Dynatrace integrations.

* **Account Id**
    * Select the NudgeBee account to link with this Dynatrace integration from the dropdown.

* **API Token \*** *(Required)*
    * The Platform Bearer Token you generated in Step 1.
    * NudgeBee validates connectivity on save by running `fetch logs | limit 1` against Grail.
    * **401** = token is invalid or expired. **403** = token is missing one or more required scopes.

* **Base URL \*** *(Required)*
    * Your Dynatrace environment URL: `https://{env-id}.apps.dynatrace.com`
    * Example: `https://abc12345.apps.dynatrace.com`
    * Find your environment ID in the Dynatrace browser URL, or under **Settings** > **Environment**.

* **Default Log Provider**
    * Toggle on to make Dynatrace the default log source for all NudgeBee queries.

* **Default Metrics Provider**
    * Toggle on to make Dynatrace the default metrics source.

* **Default Traces Provider**
    * Toggle on to make Dynatrace the default distributed trace source.

---

## What Gets Connected

Once configured, NudgeBee queries Dynatrace Grail using async DQL (`/platform/storage/query/v1/query:execute`):

| Signal | DQL Keyword | Example Query |
|--------|------------|---------------|
| Logs | `fetch logs` | `fetch logs \| filter k8s.namespace.name == "production" \| sort timestamp desc \| limit 100` |
| Traces | `fetch spans` | `fetch spans \| filter k8s.workload.name == "checkout" \| sort start_time desc \| limit 100` |
| Metrics | `timeseries` | `timeseries val = avg(container_memory_working_set_bytes), by: {k8s.pod.name}` |

> **Reference:** [Dynatrace Query Language (DQL) guide](https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language/dql-guide)

### Log Field Mappings

NudgeBee maps standard log filter fields to Dynatrace OTel semantic conventions in Grail:

| NudgeBee Filter Field | Dynatrace Grail Field |
|-----------------------|----------------------|
| `message` | `content` |
| `severity` | `status` (fallback: `loglevel`) |
| `service` | `service.name` |
| `namespace` | `k8s.namespace.name` |
| `pod` | `k8s.pod.name` |
| `container` | `k8s.container.name` |
| `host` | `host.name` |

Supported DQL filter operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `matches`, `in`, `not(in)`

### Trace Field Mappings

| NudgeBee Field | Dynatrace Grail Field |
|----------------|----------------------|
| `trace_id` | `trace.id` (uid type — handled automatically) |
| `span_id` | `span.id` |
| `span_name` | `span.name` |
| `workload_name` | `k8s.workload.name` |
| `namespace` | `k8s.namespace.name` |
| `http_status_code` | `http.response.status_code` |
| `duration_ns` | `duration` |

### Metrics Available

NudgeBee queries these metric families, which are forwarded to Grail via the Dynatrace OTel collector:

| Category | Metric |
|----------|--------|
| CPU | `node_namespace_pod_container_container_cpu_usage_seconds_total_sum_irate` |
| Memory | `container_memory_working_set_bytes` |
| Network | `container_network_receive_bytes_total`, `container_network_transmit_bytes_total` |
| K8s Resource Requests/Limits | `kube_pod_container_resource_requests`, `kube_pod_container_resource_limits` |
| HTTP (Istio/Envoy) | `container_http_requests_total`, `container_http_request_duration_seconds` |

---

## Kubernetes Data Collection Setup

For NudgeBee to query your Kubernetes telemetry from Grail, your cluster must forward data to Dynatrace using the **Dynatrace Operator** and an **OTel Collector**.

**Data flow:**
```
Kubernetes pods
      │
      ▼
Dynatrace OTel Collector
      │
      ▼
Dynatrace Grail  ←──  NudgeBee queries via DQL
```

**Setup steps:**

1. Install the [Dynatrace Operator for Kubernetes](https://docs.dynatrace.com/docs/setup-and-configuration/setup-on-k8s)
2. Apply a `DynaKube` custom resource with:
   - `apiUrl`: your environment's API endpoint
   - `oneAgent.cloudNativeFullStack`: enabled (pod-level telemetry)
   - `activeGate`: enabled (routing and metric ingestion)
3. Configure OTel metric scraping for:
   - **kube-state-metrics (KSM)** — pod/node resource requests and limits
   - **cAdvisor** — CPU and memory usage
   - **Istio/Envoy sidecars** — HTTP throughput, error rate, latency
4. Enable **Log Monitoring** in the DynaKube spec to forward pod logs.
5. Verify data flows into Grail — typically visible within 5 minutes of deployment.

> **Reference:** [Set up Dynatrace on Kubernetes](https://docs.dynatrace.com/docs/setup-and-configuration/setup-on-k8s)

---

## Verify the Integration

1. **Save the configuration.** A validation query (`fetch logs | limit 1`) runs automatically. If you see a 401 or 403 error, revisit your token scopes.
2. Navigate to any **Kubernetes workload** in NudgeBee.
3. Open the **Logs** tab — confirm pod logs from Dynatrace appear.
4. Open the **Traces** tab — confirm distributed traces appear.
5. Open the **Metrics** tab — confirm CPU, memory, and HTTP metrics are populated.

---

## Notes

- **Token validation** on save: 401 = invalid token, 403 = missing required scope.
- **URL normalization**: `.live.dynatrace.com` is automatically converted to `.apps.dynatrace.com`.
- **Query timeout**: DQL queries are async-polled for up to 120 seconds. Use filters to narrow time ranges and avoid timeouts.
- **Trace IDs**: Grail stores trace IDs as a `uid` type. NudgeBee handles the `touid()` conversion automatically.
- **Metric discovery**: available metrics and dimensions are discovered dynamically via the DQL autocomplete API — no static catalog required.
- To receive **Dynatrace Problems as NudgeBee incidents**, see the [Dynatrace Webhook integration](./dynatrace_webhook.md).

---

## Helpful Links

- [Create and manage Dynatrace access tokens](https://docs.dynatrace.com/docs/manage/access-control/access-tokens)
- [Dynatrace Query Language (DQL) guide](https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language/dql-guide)
- [Dynatrace Grail — storage and querying](https://docs.dynatrace.com/docs/platform/grail)
- [Set up Dynatrace on Kubernetes](https://docs.dynatrace.com/docs/setup-and-configuration/setup-on-k8s)
