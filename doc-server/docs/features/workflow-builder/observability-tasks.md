---
sidebar_position: 11
sidebar_label: Observability Tasks
---

# Observability Tasks

Query logs, metrics, and traces from your observability stack.

## `observability.logs`

**Display Name:** Query Logs

Query logs from connected observability platforms (Loki, CloudWatch, DataDog, Splunk, Elasticsearch, SignOz, Observe, Loggly, New Relic).

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `query` | string | Yes | Log query (syntax depends on the provider). |
| `duration` | string | No | Relative look-back window: `5m`, `15m`, `30m`, `1h`, `3h`, `6h`, `12h`, `24h`. Default `1h`. Overrides `start_time` / `end_time` when set — clear it to use absolute times. |
| `start_time` | timestamp | No | Absolute start time (ignored if `duration` is set). |
| `end_time` | timestamp | No | Absolute end time (ignored if `duration` is set). |
| `limit` | number | No | Max records to return. Default: `1000`. |
| `log_provider` | string | No | Log provider override (for example `loki`, `aws_cloudwatch`, `ES`, `signoz`). Detected from the account when empty. |
| `log_provider_source` | string | No | Provider source override: `agent` or `user`. Detected from the account when empty. |
| `region` | string | No | Cloud region (e.g., `us-east-1`). Dynamic options based on account. |
| `log_group` | string | No | Log group name. Dynamic options based on account and region. |
| `log_analytics_workspace` | string | No | Azure Log Analytics workspace. |
| `index` | string | No | Elasticsearch index pattern (e.g., `app-logs-*`). |
| `query_type` | string | No | Elasticsearch query type. Default `dsl`. |
| `account_id` | account | No | NudgeBee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `logs` | array | Query results. |
| `metadata` | object | Query metadata. |

---

## `observability.metrics`

**Display Name:** Query Metrics

Query metrics from connected monitoring platforms (Prometheus, CloudWatch, Chronosphere, DataDog, New Relic, Elasticsearch).

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `queries` | object | Yes | Metric queries as key-value pairs: `{"label": "promql_query"}`. |
| `start_time` | timestamp | No | Query start time. Defaults to 1 hour before `end_time`. |
| `end_time` | timestamp | No | Query end time. Defaults to now. |
| `metric_provider` | string | No | Provider. Options: `prometheus`, `aws_cloudwatch`, `chronosphere`, `datadog`, `newrelic`, `ES`. |
| `metric_provider_source` | string | No | Provider source. Options: `agent`, `user`. |
| `service_name` | string | No | Cloud service name. |
| `region` | string | No | Cloud region. |
| `resource_ids` | array | No | Resource IDs to filter. |
| `resource_type` | string | No | Resource type (e.g., `instance`, `cluster`). |
| `metric_names` | array | No | Metric names to query. |
| `statistics` | array | No | Statistics to compute. Options: `Average`, `Sum`, `Maximum`, `Minimum`. |
| `metric_namespace` | string | No | Metric namespace (e.g., `AWS/EC2`). |
| `account_id` | account | No | NudgeBee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `metrics` | array | Query results. |
| `metadata` | object | Query metadata. |

---

## `observability.traces`

**Display Name:** Query Traces

Query distributed traces from connected tracing platforms (SignOz, Jaeger, Tempo, DataDog, New Relic).

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `query_mode` | string | No | Query mode. Options: `simple` (field filters), `text` (raw query), `structured` (query builder). Default: `simple`. |
| `workload_name` | string | No | Filter by workload name (Kubernetes deployment, or OTel `service.name`). |
| `workload_namespace` | string | No | Filter by workload namespace. |
| `status` | string | No | Filter by span status: `error` or `ok`. |
| `min_duration_ms` | number | No | Minimum span duration (ms). Useful for finding slow traces. |
| `span_name` | string | No | Filter by span/operation name (pattern match). |
| `span_kind` | string | No | OTel span kind (`SERVER`, `CLIENT`, `INTERNAL`, `PRODUCER`, `CONSUMER`). |
| `resource` | string | No | Filter by span resource, such as a SQL statement or HTTP URL (pattern match). |
| `destination_workload_name`, `destination_workload_namespace` | string | No | Filter by the downstream workload the span calls. |
| `http_status_code` | string | No | HTTP status code as a string (e.g., `"500"`). |
| `trace_id` | string | No | Look up one trace by its ID. |
| `trace_source` | string | No | `otel` (instrumented SDK) or `ebpf` (NudgeBee node agent). |
| `query` | string | No | Trace query in the provider's own language, run as written. Visible in `text` mode. |
| `query_request` | object | No | Structured query builder object. Visible in `structured` mode. |
| `duration` | string | No | Relative lookback window. Options: `5m`, `15m`, `30m`, `1h`, `3h`, `6h`, `12h`, `24h`. Default: `1h`. |
| `start_time` | timestamp | No | Absolute start time (ignored if `duration` is set). |
| `end_time` | timestamp | No | Absolute end time (ignored if `duration` is set). |
| `sort_by` | string | No | Sort order. Options: `timestamp_desc`, `timestamp_asc`, `duration_desc`, `duration_asc`. Default: `timestamp_desc`. |
| `limit` | number | No | Max traces to return. Default: `100`. |
| `offset` | number | No | Pagination offset. Default: `0`. |
| `trace_provider` | string | No | Tracing provider override (for example `signoz`, `jaeger`, `tempo`, `datadog`, `newrelic`). Detected from the account when empty. |
| `trace_provider_source` | string | No | Provider source override: `agent` or `user`. Detected from the account when empty. |
| `account_id` | account | No | NudgeBee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `traces` | array | Trace results. |
| `metadata` | object | Query metadata. |

---

## `observability.log_groups`

**Display Name:** List Log Groups

List available log groups, optionally filtered by namespace or workload.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `duration` | string | No | Relative look-back window (`5m` to `24h`). Default `1h`. Overrides `start_time` / `end_time` when set. |
| `start_time` | timestamp | No | Absolute start time (ignored if `duration` is set). |
| `end_time` | timestamp | No | Absolute end time (ignored if `duration` is set). |
| `namespace` | string | No | Kubernetes namespace filter. Applied by Loki, SigNoz and Elasticsearch providers. |
| `workload` | string | No | Workload name filter; matches pods starting with this name. |
| `log_provider`, `log_provider_source` | string | No | Log provider and source overrides. Detected from the account when empty. |
| `region`, `log_analytics_workspace`, `index`, `query_type` | string | No | Provider-specific options, as for Query Logs. |
| `account_id` | account | No | NudgeBee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `groups` | array | List of log groups. |

## Related

- [Workflow Builder](./index.md)
- [AI Tasks](./ai-tasks.md)
