---
sidebar_position: 4
---

# Playbook Catalog

Reference for every action you can attach to an event playbook. Each action runs when its event fires, and its output is attached to the event as an evidence card the LLM uses for root-cause analysis. For the conceptual model, see [Event Playbooks vs Workflows](./event-playbooks-vs-workflows.md).

The catalog applies to events from **any source** — Prometheus / AlertManager rules, Datadog monitors, New Relic alert policies, Signoz, Chronosphere, AWS CloudWatch / GCP Cloud Monitoring / Azure Monitor alarms, PagerDuty incidents, generic webhooks, and workflows that mint events via [`events.store`](../workflow-builder/event-tasks.md).

## Conventions

Actions are grouped by **category**. The category is matched against the event subject — `Pod` actions surface in the alert UI when the subject is a Kubernetes pod, `Service` actions when the subject is a cloud resource or service. Actions in category `All` always surface.

Common conventions:

- Every action accepts an optional `title` to override the evidence card title. Setting a title also adds it as an alias key in `outputs` / `extracted_labels`, which makes referencing the action's output from a later step much more readable.
- Action parameters accept template expressions (`{{ alert.labels.namespace }}`, `{{ extracted_labels['logs_0']['_series'] }}`) so values can be derived from the event payload or earlier actions. See [Templating & Best Practices](./templating.md) for the full context, filters, and patterns.
- Every action also supports the control parameters [`if`, `for_each`, `for_each_limit`, `for_each_on_limit_exceeded`](#conditional--iterative-control).
- **Source `nudgebee`** = action runs in the Nudgebee server (no agent required). **Source `prometheus`** = action runs in the in-cluster Kubernetes agent.

---

## Pod

Surfaced when the event subject is a Kubernetes pod.

### `pod_enricher`

Adds structured pod metadata (containers, restarts, status). Useful for Jinja templating in conditional actions. Takes only the standard `title`.

### `logs_enricher`

Streams logs from the alerting pod.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `container_name` | string | No | — | Specific container; defaults to the alerting one. |
| `tail_lines` | int | No | `1000` | Lines to tail from the end of the log. |
| `previous` | bool | No | `false` | Fetch logs from the *previous* container instance (useful after a restart). |

### `pod_events_enricher`

Adds Kubernetes events scoped to the pod.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `max_events` | int | No | `8` | Cap on number of events. |
| `included_types` | string[] | No | `["Normal","Warning"]` | Event types to include. |

### `report_crash_loop`

Reports pods in `CrashLoopBackOff`. Takes only `title`.

### `pod_issue_investigator`

Built-in heuristic investigator covering common pod failure modes. Takes only `title`.

### `pod_profiler`

CPU or memory profile of a container.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `profile_type` | string | **Yes** | `cpu` | One of `cpu`, `memory`. |
| `duration` | int | **Yes** | `60` | Profile duration in seconds. |

### `pod_bash_enricher`

Runs a bash command in the alerting pod.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `bash_command` | string | **Yes** | — | The command to execute. |

### `pod_graph_enricher_cpu` / `pod_graph_enricher_memory`

Pod-level resource graph.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `display_limits` | bool | No | `false` | Overlay the pod's resource limit on the graph. |
| `graph_duration_minutes` | int | **Yes** | `60` | Window length. |

### `pod_metric_enricher_cpu` / `pod_metric_enricher_memory`

Same as the graph enrichers above, plus metric-derived insights (peaks, throttling). Same parameters.

### `oom_killer_enricher`

Recent OOMKills with surrounding memory metrics.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `new_oom_kills_duration_in_sec` | int | **Yes** | `1200` | Lookback window for OOMKills (seconds). |
| `metrics_duration_in_secs` | int | **Yes** | `1200` | Window for memory metrics (seconds). |

### `impacted_services_enricher`

Identifies downstream services impacted by a crashing pod.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `delay_s` | int | No | `30` | Wait this many seconds before analysis to allow propagation. |

---

## Deployment

### `deployment_events_enricher`

Events for the Deployment, optionally for its pods.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `dependent_pod_mode` | bool | No | `false` | When true, fetch events for the deployment's pods instead of the deployment itself. |
| `max_pods` | int | No | `1` | When `dependent_pod_mode` is true, cap on pods inspected. |

---

## Node

### `node_cpu_enricher`

Per-pod CPU breakdown for the node. Takes only `title`.

### `node_disk_analyzer`

Disk usage across the node, sorted by pod.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `show_pods` | bool | No | `true` | Include pod-level breakdown. |
| `show_containers` | bool | No | `false` | Include container-level breakdown. |

### `node_running_pods_enricher`

Pods running on the node and their `Ready` status. Takes only `title`.

### `node_allocatable_resources_enricher`

Allocatable CPU / memory / pods on the node. Takes only `title`.

### `node_status_enricher`

Node conditions and overall status. Takes only `title`.

### `node_pods_capacity_enricher`

Node pod-capacity and scheduling-constraint analysis. Takes only `title`.

### `cpu_overcommited_enricher` / `memory_overcommited_enricher`

CPU / memory overcommit analysis on the node.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `default_query_duration` | int | No | `600` | Lookback window for overcommit calculation, in seconds. |

### `cluster_cpu_requests_enricher`

Cluster-wide CPU requests over a duration.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `default_query_duration` | int | No | `600` | Lookback window in seconds. |

### `target_down_dns_silencer`

Silences DNS-related target-down alerts. Takes only `title`.

### `node_semantic_version_mismatch_enricher`

Detects mismatched Kubernetes versions across nodes. Takes only `title`. (Category: `All` — included here for grouping.)

---

## Cluster

### `cluster_memory_requests_enricher`

Cluster-wide memory requests over a duration.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `default_query_duration` | int | No | `600` | Lookback window in seconds. |

---

## Job

### `job_events_enricher`

Events for the Job.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `max_events` | int | No | `8` | Cap on number of events. |
| `included_types` | string[] | No | `["Normal","Warning"]` | Event types to include. |

### `job_pod_enricher`

Adds the Job's pod, optionally with logs and events.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `events` | bool | No | `true` | Include the pod's events. |
| `logs` | bool | No | `true` | Include the pod's logs. |

### `job_info_enricher`

Detailed Job execution information. Takes only `title`.

---

## DaemonSet / StatefulSet / PVC

### `daemonset_status_enricher`

Pod distribution and health for the DaemonSet. Takes only `title`.

### `daemonset_misscheduled_analysis_enricher`

Reports DaemonSet scheduling failures. Takes only `title`.

### `statefulset_replicas_enricher`

Replica count and status for the StatefulSet. Takes only `title`.

### `prometheus_pvc_event_enricher`

Recent PVC events from Prometheus. Takes only `title`.

---

## Service (Cloud / APM)

Surfaced for events whose subject is a service or cloud resource. Use these for AWS / GCP / Azure alerts as well as APM-based alerts.

### `cloud_resource`

Look up a resource on AWS / GCP / Azure.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `service_name` | string | **Yes** | — | e.g. `EC2`, `RDS`, `Lambda`, `S3`. |
| `resource_type` | string | **Yes** | — | Resource type to look up. |
| `region` | string | **Yes** | — | Cloud region. |
| `resource_id` / `resource_ids[]` | string / string[] | No | — | Specific resource(s) to fetch. |
| `instance_id` / `instance_ids[]` | string / string[] | No | — | For instance-scoped lookups. |
| `account_id` | string | No | — | Cloud account override. |

### `cloud_metrics`

Query CloudWatch / Cloud Monitoring / Azure Monitor metrics.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `service_name` | string | **Yes** | — | Provider service (e.g. `EC2`, `RDS`). |
| `region` | string | **Yes** | — | Cloud region. |
| `metric_name` / `metric_names[]` | string / string[] | No | — | Specific metric(s). |
| `metric_namespace` | string | No | — | e.g. `AWS/RDS`. |
| `resource_id` / `resource_ids[]` | string / string[] | No | — | Filter to specific resource(s). |
| `query` | string | No | — | Provider-native query expression. |
| `statistic` | string | No | `Average` | `Average`, `Sum`, `Maximum`, `Minimum`. |
| `statistics[]` | string[] | No | — | Multiple statistics. |
| `dimension` / `dimensions[]` | object / object[] | No | — | Dimension filter(s). |
| `step` | string | No | — | Resolution (e.g. `60s`, `5m`). |
| `start_time` / `end_time` | string | No | event window | RFC3339 timestamps. |
| `account_id` | string | No | — | Cloud account override. |

### `cloud_logs`

Query cloud-provider logs (CloudWatch Logs / Cloud Logging / Azure Logs). **Alert type:** `log`.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `query` | string | No | — | Provider-native log query. |
| `service_name` | string | No | — | e.g. `RDS`. |
| `resource_id` | string | No | — | ARN or resource name. |
| `log_group_name` | string | No | — | Log group / log scope. |
| `region` | string | No | — | Cloud region. |
| `start_time` / `end_time` | string | No | event window | RFC3339 timestamps. |
| `account_id` | string | No | — | Cloud account override. |

### `cloud_service_map`

Service map for a cloud resource.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `service_name` | string | **Yes** | — | Provider service. |
| `resource_id` | string | No | — | ARN or resource name. |
| `region` | string | No | — | Cloud region. |
| `account_id` | string | No | — | Cloud account override. |

### `cloud_cli`

Run an AWS / GCP / Azure CLI command on a configured cloud account.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `account_id` | string | **Yes** | — | Cloud account (rendered as a dropdown of configured accounts). |
| `command` | string | **Yes** | — | The CLI invocation, e.g. `aws ec2 describe-instances --filters Name=instance-state-name,Values=running`. |

### `ssh`

Run a CLI command over SSH using a configured SSH integration.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `command` | string | **Yes** | — | Shell command to execute. |
| `host_name` | string | **Yes** | — | Target host. |
| `integration_name` | string | **Yes** | — | Configured SSH integration. |
| `user_name` | string | No | integration default | Override the integration's default user. |
| `account_id` | string | No | — | Account override. |

### `metric_anomaly_enricher`

Detects anomalies in a metric by comparing current values to a historical baseline.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `namespace` | string | **Yes** | — | Workload namespace. |
| `deployment` | string | **Yes** | — | Workload name. |
| `query` | string | **Yes** | — | PromQL query. |
| `historical_window_hours` | int | No | `168` | Baseline window (default = 7 days). |
| `analysis_start_time` / `analysis_end_time` | string | No | event window | Analysis window in RFC3339. |

### `traces_dependency_map`

Builds a service-dependency map from traces.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `service_name` | string | **Yes** | — | Target service. |
| `namespace` | string | No | — | Kubernetes namespace. |
| `duration` | string | No | — | e.g. `30m`, `1h`. Takes priority over start/end. |
| `start_time` / `end_time` | string | No | event window | RFC3339 timestamps. |
| `label_filter[]` | object[] | No | — | `{key, value, operator}` filters to apply. |
| `exclude_filters[]` | object[] | No | — | Same shape, but excludes matches. |
| `upstream_only` | bool | No | `false` | When true, only show callers of the target service. |

---

## Account-Level Logs / Metrics / Traces

These actions resolve the configured observability provider for the event's account and execute against it. Use them when you don't care which provider is wired up — the same config will work whether logs go to Loki, Datadog, CloudWatch, etc.

### `logs`

Query logs from the configured provider. Supports regex / label extraction so extracted values can be used as `for_each` arrays in subsequent actions. **Alert type:** `log`.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `query` | string | No | — | Provider-native log query. |
| `duration` | int | No | `-1` | Window in minutes (default uses the event window). |
| `query_options` | object | No | `{}` | Provider-specific extra parameters. |
| `regex_extractors[]` | object[] | No | — | `{pattern, label_name}` — pull values out of log bodies. |
| `label_extractors[]` | object[] | No | — | `{label_name, placeholder_name}` — promote a log attribute to a label. |
| `account_id` | string | No | — | Account override. |

### `metrics`

Query metrics from the configured provider.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `query` | string | **Yes** | — | Provider-native metrics query. |
| `duration` | number | No | `15` | Window in minutes. |
| `query_options` | object | No | `{}` | Provider-specific extras. |
| `account_id` | string | No | — | Account override. |

### `traces`

Query traces from the configured provider.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `query` | string | **Yes** | — | Trace query. |
| `duration` | number | No | `15` | Window in minutes. |
| `query_options` | object | No | `{}` | Provider-specific extras. |
| `account_id` | string | No | — | Account override. |

### `signoz_logs_enricher`

Signoz logs with optional regex extraction. **Alert type:** `log`.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `query` | object | **Yes** | — | Signoz log query (autocomplete-driven in the UI). |
| `duration` | int | No | `15` | Window in minutes. |
| `regex_extractors[]` | object[] | No | — | `{pattern, label_name}` extractors. |

### `chronosphere_traces_enricher`

Chronosphere traces with tag filters.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `query_type` | string | **Yes** | — | `TRACE_IDS` or `SERVICE_OPERATION`. |
| `service` | string | No | — | Required when `query_type=SERVICE_OPERATION`. |
| `trace_ids` | string | No | — | Comma-separated. Required when `query_type=TRACE_IDS`. |
| `tag_filters[]` | object[] | **Yes** | — | List of tag filters. |
| `start_time` / `end_time` | string | No | event window | RFC3339 timestamps. |

---

## Proxy Agent (Custom Data Collection)

These actions execute through a Nudgebee **proxy agent** running inside your network. Use them to query private databases, hit internal HTTP endpoints, or run shell commands on hosts the cloud-side server cannot reach directly. The `datasource_id` parameter is rendered as a dropdown of configured proxy integrations of the matching type (tenant-wide).

### `proxy_db_query`

SQL query against any DB integrated via the proxy agent (PostgreSQL, MySQL, MSSQL, ClickHouse, Oracle). Intended for read-only investigation; register the datasource with a database user that only has `SELECT` privileges to enforce that. The proxy also accepts a per-datasource `read_only` flag that blocks separate `db_execute` calls.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `datasource_id` | string | **Yes** | — | Proxy DB integration to run against. |
| `query` | string | **Yes** | — | SQL to execute. |
| `database` | string | No | datasource default | Override the default database. |
| `max_rows` | int | No | `1000` | Cap on rows returned. |
| `timeout_ms` | int | No | `30000` | Query timeout in milliseconds (clamped to 120000 by the proxy). |

> **Tip.** Attach `proxy_db_query` with a `pg_stat_activity` snapshot to a `HighDBCPU` alert and the running-query state lands on the event before the LLM analyses it. See [Custom Data Collection](./alerting.md#custom-data-collection).

### `proxy_http_request`

HTTP request to an internal API reachable by the proxy (Grafana, Jenkins, custom health endpoints).

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `datasource_id` | string | **Yes** | — | Proxy HTTP integration. |
| `url` | string | **Yes** | — | Path relative to the datasource's base URL. |
| `method` | string | No | `GET` | One of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. |
| `headers` | object | No | `{}` | Extra request headers. |
| `body` | string | No | — | Request body (for `POST`/`PUT`/`PATCH`). |

### `proxy_ssh_command`

Shell command on a remote server via SSH through the proxy.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `datasource_id` | string | **Yes** | — | Proxy SSH integration. |
| `command` | string | **Yes** | — | Command to run. |
| `timeout_ms` | int | No | `30000` | Command timeout in milliseconds. |

---

## Notifications

### `notification_channel_join`

Join an incident channel on Slack / Teams / Google Chat.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `platform` | string | **Yes** | `slack` | One of `slack`, `ms_teams`, `google_chat`. |
| `channel_id` | string | **Yes** | — | Channel to join. |
| `incident_id` | string | **Yes** | — | UUID of the Nudgebee incident. |
| `team_id` | string | No | integration default | Workspace / team override. |
| `text` | string | No | — | Optional join message. |

### `notification_channel_message`

Post a message to a Slack / Teams / Google Chat channel.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `platform` | string | **Yes** | `slack` | One of `slack`, `ms_teams`, `google_chat`. |
| `channel_id` | string | **Yes** | — | Channel to post to. |
| `incident_id` | string | **Yes** | — | UUID of the Nudgebee incident. |
| `text` | string | **Yes** | — | Message body. |
| `team_id` | string | No | integration default | Workspace / team override. |

---

## Monitoring Rules / Integrations

### `prometheus_rules_enricher`

Information about the Prometheus rule that fired the alert. Takes only `title`.

### `prometheus_enricher`

Run one or more PromQL queries against the cluster's Prometheus.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `instant` | bool | No | `false` | Instant query instead of range. |
| `promql_query` | string | No | — | A single PromQL expression. |
| `promql_queries[]` | object[] | No | — | Multiple named queries — `{key, query}`. Use this **or** `promql_query`. |
| `step` | string | No | — | Resolution (`15s`, `1m`, …). |
| `duration` | object | **Yes** | — | `{duration_minutes: <n>}` window. |

### `datadog_monitors_search`

Look up triggered Datadog monitors.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `status` | string | No | `alert` | One of `alert`, `warn`, `no data`. |
| `env` | string | No | — | Environment tag filter. |
| `service` | string | No | — | Service tag filter. |
| `query` | string | No | — | Custom Datadog monitor query. |
| `limit` | int | No | `30` | Page size (max `100`). |
| `duration` | int | No | `1` | Hours to look back. |

### `alert_explanation_enricher`

Pins a human-readable explanation and a suggested resolution to the event.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `alert_explanation` | string | **Yes** | — | Plain-English explanation of what triggered the alert. |
| `recommended_resolution` | string | No | — | Suggested mitigation. |

---

## Alert Resource Graphs

### `alert_graph_enricher_cpu` / `alert_graph_enricher_memory` / `alert_graph_enricher_disk`

Resource-usage graph for the alerting Pod or Node.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `item_type` | string | **Yes** | `Pod` | `Pod` or `Node`. |
| `graph_duration_minutes` | int | **Yes** | `60` | Window length. |

### `pod_node_metrics_enricher_memory`

Node-level memory metrics for the alerting pod.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `graph_duration_minutes` | int | **Yes** | `60` | Window length. |

---

## Performance Analysis

### `cpu_throttling_analysis_enricher`

CPU throttling events for pods. Takes only `title`.

---

## Custom Execution / Utility

These actions run arbitrary code or fetch arbitrary resources.

### `kubectl_command_executor`

Run any `kubectl` command in the alert's cluster.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `command` | string | **Yes** | — | Full command, e.g. `kubectl describe pod foo -n bar`. |

### `pod_script_run_enricher`

Run a script against a pod (the alerting one or an ephemeral one).

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `command` | string | **Yes** | — | Script to execute. |
| `name` | string | No | — | Container name. |
| `image` | string | No | — | Image to use. |
| `secret` | string | No | — | Image-pull secret. |
| `use_side_car` | bool | No | `false` | Run as a side-car container. |
| `ephemeral` | bool | No | `false` | Run as an ephemeral pod. |
| `pod_name` / `namespace` | string | No | alerting pod | Override pod target. |

### `custom_image_run_enricher`

Run any container image as a one-shot enrichment job.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `image` | string | **Yes** | — | Container image. |
| `command[]` | string[] | No | image default | Command override. |
| `args[]` | string[] | No | — | Arguments. |
| `env_variables` | object | No | `{}` | Environment variables map. |
| `secret` | string | No | — | Image-pull secret. |
| `config_map` | string | No | — | ConfigMap to mount. |
| `image_pull_policy` | string | No | `IfNotPresent` | `Always` or `IfNotPresent`. |
| `service_account` | string | No | — | Service account to run under. |

### `pg_health_enricher`

Run predefined PostgreSQL health queries.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `secret_name` | string | **Yes** | — | Kubernetes secret with DB credentials. |
| `secret_namespace` | string | **Yes** | — | Namespace of the secret. |

### `pg_run_queries`

Run a list of user-defined PostgreSQL queries.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `queries[]` | string[] | **Yes** | — | SQL statements to execute. |
| `secret_name` | string | **Yes** | — | Kubernetes secret with DB credentials. |
| `secret_namespace` | string | **Yes** | — | Namespace of the secret. |

### `get_resource_yaml`

Fetch a Kubernetes resource YAML for debugging.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `name` | string | **Yes** | — | Resource name. |
| `kind` | string | **Yes** | — | One of `Pod`, `Deployment`, `StatefulSet`, `DaemonSet`, `Job`, `CronJob`, `ReplicaSet`, `Service`, `ConfigMap`, `Secret`, `PersistentVolumeClaim`. |
| `namespace` | string | No | — | Namespace. |

### `get_kubernetes_resource`

Fetch deployment(s) by name or across all namespaces.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `name[]` | string[] | **Yes** | — | Names to fetch. |
| `resource_type` | string | No | `deployment` | Resource type. |
| `namespace[]` | string[] | No | — | Specific namespaces. |
| `all_namespaces` | bool | No | `false` | Fetch across all namespaces. |

### `get_pod_resource`

Fetch pod(s) by name, namespace, or owner.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `name[]` | string[] | No | — | Pod names. |
| `owner` | string | No | — | Pods by owner (Deployment / ReplicaSet / Job). |
| `resource_type` | string | No | `pod` | Resource type. |
| `namespace[]` | string[] | No | — | Specific namespaces. |
| `all_namespaces` | bool | No | `false` | Fetch across all namespaces. |

### `resource_events_enricher`

Nearby Kubernetes events for the alert resource.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `runbook_name` | string | **Yes** | — | Source runbook (dropdown). |
| `max_pods` | int | No | `1` | Cap on pods inspected when `dependent_pod_mode` is set. |
| `dependent_pod_mode` | bool | No | `false` | Fetch events for the resource's pods rather than the resource. |

### `resource_logs_enricher`

Logs from a specific (parameterised) pod.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `pod_name` | string | **Yes** | — | Pod to fetch logs from. |
| `namespace` | string | **Yes** | — | Pod namespace. |
| `container_name` | string | No | — | Specific container. |
| `since_seconds` | int | No | — | Lookback in seconds. |
| `tail_lines` | int | No | `100` | Lines from the end. |

### `related_pods`

Pods related to the alerting subject.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `output_format` | string | No | `table` | `table` or `json`. |

### `text_enricher`

Pin a free-form text message on the event.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `text` | string | **Yes** | — | Message body. |
| `severity` | string | No | `Info` | `Info` or `Critical`. |

### `status_enricher`

Resource status conditions, optionally with messages.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `show_details` | bool | No | `false` | Include condition messages. |

### `api_service_status_enricher` / `api_failure_enricher`

API service status and API-failure analysis. Take only `title`.

### `api_traces_enricher`

Traces of API requests around the alert.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `duration` | int | No | `15` | Lookback in minutes. |

### `hpa_mismatch_enricher`

HPA configuration / scaling-policy mismatch analysis.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `check_for_metrics_server` | bool | **Yes** | `true` | Verify metrics-server is installed and report otherwise. |

### `nudgebee_playbook_trigger_enricher`

Trigger another Nudgebee runbook on this event.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `runbook_id` | string | **Yes** | — | Runbook to invoke (dropdown). |

### `nubi_enricher`

Trigger an LLM investigation with a custom prompt.

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `prompt` | string | **Yes** | — | Prompt for the investigation. |
| `title` | string | **Yes** | — | Title for the LLM analysis card. |

---

## Conditional & Iterative Control

Every action above accepts the following control parameters in addition to its own. They are evaluated against the event payload, previous action `outputs`, and `extracted_labels`.

| Field | Type | Description |
|:---|:---|:---|
| `if` | template / bool | Run the action only when the value is the string `"true"` (case-insensitive — `"True"` and `"TRUE"` also work) or boolean `true`. Anything else skips the action: `"false"`, `"False"`, the empty string, `"yes"`, `"1"`, plain text, etc. Use the [`gt` / `lt` / `gte` / `lte` filters](./templating.md#nudgebee-specific-filters) when you want a clean lowercase `"true"` / `"false"` you don't have to think about. |
| `for_each` | template / array | Run the action once per item; inside the action, `{{ item }}` is the current iteration value. |
| `for_each_limit` | int | Cap on iterations (default `10`). |
| `for_each_on_limit_exceeded` | string | What to do when the array is longer than `for_each_limit`. `"warn"` (default) logs a warning and truncates to the limit. `"error"` fails the action. |

### Example — data-driven evidence with `for_each`

A `logs` action with a regex extractor produces an array of distinct values; the next action runs once per value. The `extracted_labels` key follows the action's name + position — here `logs_0` because the `logs` action is at index 0.

```json
[
  {
    "logs": {
      "title": "Error logs",
      "query": "level=error",
      "duration": 30,
      "regex_extractors": [
        { "pattern": "service=(\\S+)", "label_name": "service" }
      ]
    }
  },
  {
    "kubectl_command_executor": {
      "for_each": "{{ extracted_labels['logs_0']['_series'] }}",
      "for_each_limit": 5,
      "command": "kubectl describe deploy {{ item.service }} -n production"
    }
  }
]
```

### Example — `if` to gate expensive evidence

The first action gets a `title` so we can reference it cleanly, and the `gt` filter produces the lowercase `"true"` / `"false"` string the `if:` field expects.

```json
[
  {
    "pod_enricher": {
      "title": "Pod details"
    }
  },
  {
    "pod_profiler": {
      "if": "{{ outputs['Pod details'].data.containers[0].restarts | gt(5) }}",
      "profile_type": "cpu",
      "duration": 60
    }
  }
]
```

---

## See Also

- [Event Playbooks vs Workflows](./event-playbooks-vs-workflows.md) — when to use a playbook vs a workflow.
- [Alerting & Action Customisation](./alerting.md) — UI flow for attaching playbook actions to an alert.
- [Workflow Builder](../workflow-builder/index.md) — for post-processing automations that consume the event after evidence is collected.
