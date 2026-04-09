---
sidebar_position: 5
---
# SolarWinds

NudgeBee integrates with **SolarWinds Observability SaaS (SWO)** to query **logs**, **metrics**, and **APM traces** from your SolarWinds environment. This lets NudgeBee surface correlated telemetry during incident investigation without moving data out of your SolarWinds account.

---

## Prerequisites

Before configuring the integration, ensure you have:

- A **SolarWinds Observability SaaS** account
- A **SolarWinds API Access Token** (see Step 1 — this is different from an Ingestion token)
- Your account's **data center region**

---

## Step 1: Create a SolarWinds API Access Token

NudgeBee queries SolarWinds using an **API Access Token** (not an Ingestion/OTLP token). Using the wrong token type will result in a 403 permission error.

1. In SolarWinds, go to **Settings** > **API Tokens**
2. Click **Add API Token**
3. Set the token type to **API Access** (not Ingestion)
4. Give it a name — e.g., `nudgebee-integration`
5. Copy the generated token value

> **Reference:** [SolarWinds API Tokens documentation](https://documentation.solarwinds.com/en/success_center/observability/default.htm#cshid=api-tokens)

---

## Step 2: Configure the Integration in NudgeBee

Navigate to **Integrations** > **Observability** tab and select **SolarWinds** to open the configuration form.

### Configuration Fields

* **Integration Config Name**
    * A descriptive label for this integration (e.g., `Production SolarWinds`).
    * Useful when managing multiple SolarWinds integrations.

* **Account Id**
    * Select the NudgeBee account to link with this SolarWinds integration from the dropdown.

* **API Token \*** *(Required)*
    * The **API Access Token** generated in Step 1.
    * NudgeBee validates the token on save by calling `/v1/metrics?pageSize=1`.
    * **401** = token is invalid or expired. **403** = wrong token type (Ingestion instead of API Access).

* **Data Center \*** *(Required)*
    * The region where your SolarWinds account is hosted. Select from the dropdown:

    | Option | Region | API Base URL |
    |--------|--------|-------------|
    | `na-01` | North America 1 *(default)* | `api.na-01.cloud.solarwinds.com` |
    | `na-02` | North America 2 | `api.na-02.cloud.solarwinds.com` |
    | `eu-01` | Europe | `api.eu-01.cloud.solarwinds.com` |
    | `ap-01` | Asia Pacific | `api.ap-01.cloud.solarwinds.com` |

    * To find your region: check the URL in your browser when logged in to SolarWinds (e.g., `na-01.cloud.solarwinds.com`).

* **Default Log Provider**
    * Toggle on to make SolarWinds the default log source for all NudgeBee queries.

* **Default Metrics Provider**
    * Toggle on to make SolarWinds the default metrics source.

* **Default Traces Provider**
    * Toggle on to make SolarWinds the default APM trace source.

---

## What Gets Connected

Once configured, NudgeBee queries three signal types from the SolarWinds API:

| Signal | SolarWinds API | Notes |
|--------|---------------|-------|
| Logs | `GET /v1/logs` | Syslog-format entries with hostname, severity, program |
| Metrics | `GET /v1/metrics/{metricName}/measurements` | Time-series with OTel attribute grouping |
| Traces (APM) | `GET /v1/metrics/trace.service.traced_response_time/measurements` | Per-request response times from APM |

### Log Field Mappings

| NudgeBee Filter Field | SolarWinds Field |
|-----------------------|-----------------|
| `message` | `message` |
| `severity` | `severity` |
| `pod` | `hostname` |
| `container` | `program` |
| `timestamp` | `time` |

> **Note:** SolarWinds logs do not include a native namespace field. NudgeBee resolves namespace context via the Entities API (`/v1/entities?type=KubernetesPod`).

Supported log filter operators: exact match, wildcard (`*value*`), negation (`-`), boolean (`AND`/`OR`), comparison (`>`, `>=`, `<`, `<=`), `IN` lists, `IS EMPTY`, `IS NOT EMPTY`

### Metrics Available

NudgeBee queries these Kubernetes metric families from SolarWinds:

| Category | Metric |
|----------|--------|
| Node CPU | `k8s.node.cpu.usage.seconds.rate` |
| Node Memory | `k8s.node.memory.working_set` |
| Node Capacity | `k8s.node.cpu.allocatable`, `k8s.node.memory.allocatable` |
| Node Filesystem | `k8s.node.fs.usage` |
| Pod CPU | `k8s.pod.cpu.usage.seconds.rate` |
| Pod Memory | `k8s.pod.memory.working_set` |
| Container Requests | `k8s.container.spec.cpu.requests`, `k8s.container.spec.memory.requests` |
| Container Limits | `k8s.container.spec.cpu.limit`, `k8s.container.spec.memory.limit` |
| Cluster Totals | `k8s.cluster.spec.cpu.requests`, `k8s.cluster.spec.memory.requests` |
| APM Throughput | `trace.service.traced_response_time` |

Metrics support aggregations: `AVG` (default), `MAX`, `MIN`, `SUM`, `COUNT`.

### Trace Field Mappings (APM)

SolarWinds traces are accessed through the APM metrics API using per-request `trace.service.traced_response_time` measurements:

| NudgeBee Field | SolarWinds Attribute |
|----------------|---------------------|
| `workload_name` | `service.name` |
| `span_name` | `sw.transaction` |
| `status_code` | `otel.status_code` (`UNSET`, `OK`, `ERROR`) |

> **APM Limitations:**
> - No individual span/trace ID queries — traces are aggregated per service and transaction
> - P95/P99 percentile latency is not available; only AVG, COUNT, MAX are supported
> - Filter operators `OR` and `NOT` are not supported for trace queries

---

## Kubernetes Data Collection Setup

For NudgeBee to query your Kubernetes telemetry from SolarWinds, your cluster must be sending data via the **SolarWinds Kubernetes agent**.

**Data flow:**
```
Kubernetes cluster
      │
      ▼
SolarWinds Kubernetes Agent (OTel-based)
      │
      ▼
SolarWinds Observability SaaS  ←──  NudgeBee queries via API
```

**Setup steps:**

1. Log in to SolarWinds Observability and navigate to **Add Data** > **Kubernetes**
2. Follow the guided setup to deploy the SolarWinds agent via Helm or YAML manifest
3. The agent automatically collects:
   - Node and pod CPU/memory metrics (via kube-state-metrics and cAdvisor)
   - Container logs (forwarded as syslog-format entries)
   - APM traces (if you instrument your services with OpenTelemetry)
4. Verify data appears in SolarWinds under **Infrastructure** > **Kubernetes** within a few minutes

> **Reference:** [SolarWinds Kubernetes Monitoring setup](https://documentation.solarwinds.com/en/success_center/observability/default.htm#cshid=kubernetes)

---

## Verify the Integration

1. **Save the configuration.** A validation call to `/v1/metrics?pageSize=1` runs automatically. Resolve any 401/403 errors before proceeding.
2. Navigate to any **Kubernetes workload** in NudgeBee.
3. Open the **Logs** tab — confirm pod logs from SolarWinds appear.
4. Open the **Metrics** tab — confirm CPU and memory metrics are populated.
5. Open the **Traces** tab — confirm APM response time data appears (requires OTel-instrumented services).

---

## Notes

- **Token type matters**: NudgeBee requires an **API Access** token, not an Ingestion token. A 403 error typically means you used the wrong type.
- **Logs and namespace**: SolarWinds syslog entries do not carry a Kubernetes namespace field. NudgeBee resolves namespace from the Entities API automatically.
- **APM traces**: SolarWinds does not expose individual span queries. NudgeBee uses the `trace.service.traced_response_time` metric for trace grouping and latency data.
- **Pagination**: All queries use cursor-based pagination (`skipToken`) with a maximum of 50 pages per query to prevent runaway requests.
- **Metric aggregations**: Aggregation type names are case-sensitive in the SolarWinds API — always uppercase (e.g., `AVG`, not `avg`).
- To receive **SolarWinds alerts as NudgeBee incidents**, see the [SolarWinds Webhook integration](../Webhooks/solarwinds_webhook.md).

---

## Helpful Links

- [SolarWinds Observability SaaS documentation](https://documentation.solarwinds.com/en/success_center/observability/default.htm)
- [SolarWinds API Tokens](https://documentation.solarwinds.com/en/success_center/observability/default.htm#cshid=api-tokens)
- [SolarWinds Kubernetes Monitoring setup](https://documentation.solarwinds.com/en/success_center/observability/default.htm#cshid=kubernetes)
- [SolarWinds OpenTelemetry APM](https://documentation.solarwinds.com/en/success_center/observability/default.htm#cshid=apm-otel)
