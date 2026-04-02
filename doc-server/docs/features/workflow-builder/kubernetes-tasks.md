---
sidebar_position: 7
sidebar_label: Kubernetes Tasks
---

# Kubernetes Tasks

Specialized tasks for Kubernetes resource management, optimization, and operations.

## `k8s.vertical_rightsize`

**Display Name:** Vertical Rightsize

Optimize CPU and memory requests/limits for a Kubernetes workload. Can apply changes directly or create a GitOps pull request.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `namespace` | string | Yes | Kubernetes namespace. |
| `name` | string | Yes | Workload name. |
| `kind` | string | Yes | Resource kind (e.g., `Deployment`, `StatefulSet`, `DaemonSet`). |
| `direction` | string | No | Scaling direction. Options: `up`, `down`. |
| `cpu` | object | No | CPU configuration: `change_pct` (number, required — percentage to change), `max` (string, e.g., `"1"`), `min` (string, e.g., `"10m"`), `remove_limit` (boolean). |
| `memory` | object | No | Memory configuration: `change_pct` (number, required — percentage to change), `max` (string, e.g., `"1Gi"`), `min` (string, e.g., `"100Mi"`), `remove_limit` (boolean). |
| `gitops_config` | object | No | GitOps config: `enabled` (boolean) — if true, creates a PR instead of applying directly. |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `status` | string | Operation result status. |
| `patch` | object | The Kubernetes patch that was applied (or would be applied). |
| `resolution_id` | string | Resolution tracking ID. |

---

## `k8s.horizontal_rightsize`

**Display Name:** Horizontal Rightsize

Scale the number of replicas for a Kubernetes workload up or down.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `direction` | string | Yes | Scaling direction. Options: `up`, `down`. |
| `kind` | string | Yes | Resource kind (e.g., `Deployment`, `StatefulSet`). |
| `namespace` | string | Yes | Kubernetes namespace. |
| `name` | string | Yes | Workload name. |
| `scaling_mode` | string | No | How to scale. Options: `change_by` (relative), `change_to` (absolute). |
| `change_by` | number | No | Amount to change replicas by. Visible when `scaling_mode` is `change_by`. |
| `change_to` | number | No | Target absolute replica count. Visible when `scaling_mode` is `change_to`. |
| `min` | number | No | Minimum replica count (floor). |
| `max` | number | No | Maximum replica count (ceiling). |
| `gitops_config` | object | No | GitOps config: `enabled` (boolean) — if true, creates a PR. |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `status` | string | Operation result. |
| `old_replicas` | number | Previous replica count. |
| `new_replicas` | number | New replica count. |
| `patch` | object | The applied patch. |
| `resolution_id` | string | Resolution tracking ID. |

---

## `k8s.pv_rightsize`

**Display Name:** PV Rightsize

Resize a Kubernetes Persistent Volume Claim to match actual usage.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `namespace` | string | Yes | Kubernetes namespace. |
| `name` | string | Yes | PVC name. |
| `kind` | string | Yes | Resource kind. Default: `PersistentVolumeClaim`. |
| `change_by` | string | No | Percentage to increase storage (e.g., `10%`). Only positive values (increase). |
| `change_to` | string | No | Target absolute storage size (e.g., `20Gi`). |
| `max` | string | No | Maximum storage size allowed (e.g., `100Gi`). |
| `gitops_config` | object | No | GitOps config: `enabled` (boolean). |
| `account_id` | account | No | Nudgebee account ID. |
| `resource_id` | string | No | Resource ID for the target PVC (used for GitOps). |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `status` | string | Operation result. |
| `old_storage` | string | Previous storage size. |
| `new_storage` | string | New storage size. |
| `patch` | object | The applied patch. |
| `resolution_id` | string | Resolution tracking ID. |

---

## `k8s.continuous_rightsize`

**Display Name:** Continuous Rightsize

Continuously monitor and auto-adjust resources for Kubernetes workloads based on usage patterns.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `action_params` | object | Yes | Configuration for continuous rightsizing analysis. |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | object | Rightsizing analysis results. |

---

## `k8s.workload_restart`

**Display Name:** Workload Restart

Perform a rolling restart of a Kubernetes workload to apply configuration changes or recover from issues.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `namespace` | string | Yes | Kubernetes namespace. |
| `name` | string | Yes | Workload or pod name. |
| `kind` | string | Yes | Resource kind (`Deployment`, `StatefulSet`, `DaemonSet`, `Pod`). |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `status` | string | Operation result. |
| `message` | string | Details about the restart. |
| `restarted_kind` | string | Kind of the restarted resource. |
| `restarted_name` | string | Name of the restarted resource. |

---

## `k8s.pod_delete`

**Display Name:** Pod Delete

Delete a Kubernetes pod to force a restart or clean up a stuck pod.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `namespace` | string | Yes | Kubernetes namespace. |
| `name` | string | Yes | Workload name or specific pod name. |
| `kind` | string | No | Resource kind. Default: `Pod`. If set to a workload kind (e.g., `Deployment`), deletes a pod owned by that workload. |
| `target_pod_name` | string | No | Specific pod to delete (when `kind` is a workload). If not set, the first found pod is deleted. |
| `force` | boolean | No | If true, immediately removes the pod (`--grace-period=0 --force`). Useful for stuck pods. |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `status` | string | Operation result. |
| `deleted_pod` | string | Name of the deleted pod. |
| `namespace` | string | Namespace of the deleted pod. |

---

## `k8s.node_graceful_shutdown`

**Display Name:** Node Graceful Shutdown

Safely drain and optionally remove a Kubernetes node. Cordons the node (prevents new scheduling), evicts all pods, then optionally deletes the node object.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `name` | string | Yes | Node name to shut down. |
| `delete_node` | boolean | No | Whether to delete the node object after draining. Default: `false`. |
| `ignore_pdbs` | boolean | No | If true, bypasses PodDisruptionBudgets using deletion instead of eviction. Default: `false`. |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `status` | string | Operation result. |
| `node` | string | Node name. |
| `cordoned` | boolean | Whether the node was cordoned. |
| `drained` | boolean | Whether the node was drained. |
| `deleted` | boolean | Whether the node was deleted. |
