---
sidebar_position: 3
---

# Nudgebee Playbook Catalog

This catalog provides a categorized reference of all supported Nudgebee playbooks. Each entry includes the action name, a brief description, and its configurable parameters.

---

## 🐳 Pod Playbooks

| Action Name                                              | Description                                        | Parameters                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `pod_enricher`                                           | Enriches the alert with pod-level metadata.        | None                                                                                       |
| `logs_enricher`                                          | Streams logs from the pod. Not suitable for Jinja. | `container_name`, `tail_lines` (default: 1000), `previous` (default: false)                |
| `pod_events_enricher`                                    | Enriches alert with pod events.                    | `max_events` (default: 8), `included_types` (default: \["Normal", "Warning"])              |
| `report_crash_loop`                                      | Reports pods in CrashLoopBackOff state.            | None                                                                                       |
| `pod_issue_investigator`                                 | Investigates the issue with the pod.               | None                                                                                       |
| `pod_profiler`                                           | Profiles pod CPU or memory.                        | `duration` (default: 60), `action_name`, `profile_type` (default: "cpu")                   |
| `pod_bash_enricher`                                      | Runs a bash command in the pod.                    | `bash_command` (required)                                                                  |
| `pod_script_run`                                         | Runs a script in the pod.                          | `name`, `pod_name`, `namespace`, `image`, `command`, `secret`, `ephemeral`, `use_side_car` |
| `pod_graph_analyzer_cpu` / `pod_graph_analyzer_memory`   | Pod-level resource usage graphs.                   | `resource_type`, `display_limits` (default: false), `graph_duration_minutes` (default: 60) |
| `pod_metric_analyzer_cpu` / `pod_metric_analyzer_memory` | Resource graphs with metrics insights.             | Same as above                                                                              |
| `pod_node_metrics_analyzer_memory`                       | Node-level Memory metrics for pods.                | `resource_type`, `graph_duration_minutes`                                                  |

---

## 🚀 Deployment Playbooks

| Action Name                  | Description                                  | Parameters                                                            |
| ---------------------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| `deployment_events_enricher` | Enriches alert with deployment events.       | `max_pods`, `dependent_pod_mode`                                      |
| `get_kubernetes_deployment`  | Fetches the specified Kubernetes deployment. | `name`, `namespace`, `action_name`, `resource_type`, `all_namespaces` |

---

## 🧱 Node Playbooks

| Action Name                               | Description                                       | Parameters                     |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------ |
| `node_cpu_enricher`                       | Analyzes node CPU usage.                          | None                           |
| `node_disk_analyzer`                      | Analyzes disk usage across node and pods.         | `show_pods`, `show_containers` |
| `node_running_pods_enricher`              | Lists pods running on a node.                     | None                           |
| `node_allocatable_resources_enricher`     | Shows node allocatable resources.                 | None                           |
| `node_status_enricher`                    | Adds node status to the alert.                    | None                           |
| `node_pod_capacity_analyzer`              | Analyzes pod capacity and scheduling constraints. | None                           |
| `node_semantic_version_mismatch_analyzer` | Detects mismatched K8s versions on nodes.         | None                           |

---

## 🧵 Job Playbooks

| Action Name           | Description                         | Parameters                     |
| --------------------- | ----------------------------------- | ------------------------------ |
| `job_events_enricher` | Enriches alert with job events.     | `max_events`, `included_types` |
| `job_pod_enricher`    | Adds job pod details (logs/events). | `logs`, `events`               |
| `job_info`            | Provides job execution information. | None                           |

---

## 🌐 Cluster Playbooks

| Action Name                        | Description                                  | Parameters               |
| ---------------------------------- | -------------------------------------------- | ------------------------ |
| `cluster_memory_requests_enricher` | Analyzes memory requests across the cluster. | `default_query_duration` |
| `cluster_cpu_requests`             | Analyzes CPU requests across the cluster.    | `default_query_duration` |

---

## 📊 Monitoring and Miscellaneous Playbooks

| Action Name                                             | Description                                      | Parameters                                                  |
| ------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| `alert_explanation_analyzer`                            | Adds human-readable explanation and resolution.  | `alert_explanation`, `recommended_resolution`               |
| `prometheus_query_analyzer`                             | Runs a Prometheus query.                         | `promql_query`, `duration`, `instant`, `action_name`        |
| `alert_resource_graph_analyzer_cpu` / `memory` / `disk` | Graphs for Prometheus alert resource usage.      | `item_type`, `resource_type`, `graph_duration_minutes`      |
| `prometheus_rules_analyzer`                             | Provides Prometheus rule metadata.               | None                                                        |
| `dns_target_down_silencer`                              | Silences DNS target down alerts.                 | None                                                        |
| `daemonset_status_analyzer`                             | Adds pod status breakdown for a DaemonSet.       | None                                                        |
| `daemonset_misscheduled_analyzer`                       | Reports scheduling failures of DaemonSets.       | None                                                        |
| `hpa_mismatch_analyzer`                                 | Analyzes HPA target mismatches.                  | `check_for_metrics_server`                                  |
| `api_service_status`                                    | Enriches alert with API service status.          | None                                                        |
| `api_failure_analyzer`                                  | Detects API request failures.                    | None                                                        |
| `api_traces_analyzer`                                   | Provides traces for API requests.                | `duration`, `action_name`                                   |
| `oom_killer_analyzer`                                   | Analyzes recent OOMKills and memory usage.       | `metrics_duration_in_secs`, `new_oom_kills_duration_in_sec` |
| `impacted_services_analyzer`                            | Identifies affected services for a crashing pod. | `delay_s`                                                   |

---

## 🛠 Utility and Custom Actions

| Action Name                | Description                                         | Parameters                                                                                                  |
| -------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `kubectl_command_executor` | Runs a kubectl command.                             | `command` (required)                                                                                        |
| `text_enricher`            | Adds a plain text message to alert.                 | `text`, `severity`                                                                                          |
| `get_resource_yaml`        | Fetches resource YAML for debugging.                | None                                                                                                        |
| `resource_events_enricher` | Fetches recent resource events.                     | `max_pods`, `dependent_pod_mode`                                                                            |
| `get_kubernetes_pod`       | Retrieves pod(s) info by name or owner.             | `name`, `namespace`, `owner`, `resource_type`, `action_name`, `all_namespaces`                              |
| `custom_image_run`         | Runs script using a custom container image.         | `image`, `command`, `args`, `env_variables`, `secret`, `config_map`, `image_pull_policy`, `service_account` |
| `postgres_query_runner`    | Runs custom SQL queries on PostgreSQL DB.           | `queries`, `secret_name`, `secret_namespace`                                                                |
| `postgres_health`          | Checks health of PostgreSQL using standard queries. | `secret_name`, `secret_namespace`                                                                           |
| `nudgebee_runbook_trigger` | Triggers another Nudgebee runbook.                  | `runbook_id`                                                                                                |

---
