---
sidebar_position: 6
sidebar_label: Cloud CLI Tasks
---

# Cloud CLI Tasks

Run cloud provider CLI commands against your connected accounts.

## `cloud.aws.cli` / `aws.cli`

**Display Name:** AWS CLI

Run AWS CLI commands against your AWS account. The command is executed in a secure, sandboxed environment with credentials from your connected AWS account.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `command` | string | Yes | AWS CLI command to execute (e.g., `aws s3 ls`, `aws ec2 describe-instances`). |
| `account_id` | account | No | Nudgebee account ID to use for AWS credentials. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Command output (stdout). |

### Example

```yaml
- id: list_instances
  type: cloud.aws.cli
  params:
    command: "aws ec2 describe-instances --filters Name=instance-state-name,Values=running --query 'Reservations[].Instances[].InstanceId' --output json"
    account_id: "{{ Inputs.account }}"
```

---

## `cloud.azure.cli` / `azure.cli`

**Display Name:** Azure CLI

Run Azure CLI commands against your Azure subscription.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `command` | string | Yes | Azure CLI command (e.g., `az vm list`). |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Command output (stdout). |

---

## `cloud.gcp.cli` / `gcp.cli`

**Display Name:** GCP CLI

Run gcloud commands against your GCP project.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `command` | string | Yes | GCP CLI command (e.g., `gcloud compute instances list`). |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Command output (stdout). |

---

## `cloud.k8s.cli` / `k8s.cli`

**Display Name:** Kubectl

Run kubectl commands against your Kubernetes cluster.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `command` | string | Yes | kubectl command (e.g., `kubectl get pods -n default`). |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Command output (stdout). |
| `stderr` | string | Error output (stderr), if any. |

### Example

```yaml
- id: get_pods
  type: cloud.k8s.cli
  params:
    command: "kubectl get pods -n {{ Inputs.namespace }} -o json"
    account_id: "{{ Inputs.account }}"
  next: parse_pods
```
