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
| `start_time` | timestamp | No | Query start time. Defaults to 1 hour before `end_time`. |
| `end_time` | timestamp | No | Query end time. Defaults to now. |
| `limit` | number | No | Max records to return. Default: `1000`. |
| `log_provider` | string | No | Log provider. Options: `loki`, `aws_cloudwatch`, `azure_app_insights`, `ES`, `signoz`, `datadog`, `observe`, `loggly`, `newrelic`. |
| `log_provider_source` | string | No | Provider source. Options: `agent`, `user`. |
| `region` | string | No | Cloud region (e.g., `us-east-1`). Dynamic options based on account. |
| `log_group` | string | No | Log group name. Dynamic options based on account and region. |
| `service_name` | string | No | Cloud service name (e.g., `AWS/EC2`). |
| `resource_id` | string | No | Specific resource ID. |
| `account_id` | account | No | Nudgebee account ID. |

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
| `account_id` | account | No | Nudgebee account ID. |

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
| `service_name` | string | No | Filter by service name. Visible in `simple` mode. |
| `status` | string | No | Filter by span status. Options: `""`, `error`, `ok`, `unset`. Visible in `simple` mode. |
| `min_duration_ms` | number | No | Minimum span duration (ms). Visible in `simple` mode. |
| `span_name` | string | No | Filter by span/operation name. Visible in `simple` mode. |
| `query` | string | No | Raw text query. Visible in `text` mode. |
| `query_request` | object | No | Structured query builder object. Visible in `structured` mode. |
| `duration` | string | No | Relative lookback window. Options: `5m`, `15m`, `30m`, `1h`, `3h`, `6h`, `12h`, `24h`. Default: `1h`. |
| `start_time` | timestamp | No | Absolute start time (ignored if `duration` is set). |
| `end_time` | timestamp | No | Absolute end time (ignored if `duration` is set). |
| `sort_by` | string | No | Sort order. Options: `timestamp_desc`, `timestamp_asc`, `duration_desc`, `duration_asc`. Default: `timestamp_desc`. |
| `limit` | number | No | Max traces to return. Default: `100`. |
| `offset` | number | No | Pagination offset. Default: `0`. |
| `trace_provider` | string | No | Tracing provider. Options: `signoz`, `jaeger`, `tempo`, `datadog`, `newrelic`. |
| `trace_provider_source` | string | No | Provider source. Options: `agent`, `user`. |
| `account_id` | account | No | Nudgebee account ID. |

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
| `start_time` | timestamp | No | Start time. Defaults to 1 hour before `end_time`. |
| `end_time` | timestamp | No | End time. Defaults to now. |
| `namespace` | string | No | Filter by namespace prefix. |
| `workload` | string | No | Filter by workload name. |
| `metric_provider` | string | No | Provider. Options: `prometheus`, `aws_cloudwatch`, `chronosphere`, `datadog`, `newrelic`, `ES`. |
| `metric_provider_source` | string | No | Provider source. Options: `agent`, `user`. |
| `service_name` | string | No | Cloud service name. |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `groups` | array | List of log groups. |
