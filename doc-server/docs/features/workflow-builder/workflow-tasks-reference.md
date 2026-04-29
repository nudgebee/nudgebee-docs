---
sidebar_position: 1
sidebar_label: Workflow Tasks Reference
---

# Workflow Tasks Reference

This reference documents every task available in the Workflow Builder. Tasks are the atomic building blocks of workflows — each one performs a specific action and produces structured output that downstream tasks can reference.

## How to Use Tasks

Tasks are defined in the `tasks` section of a workflow definition. Each task has:

- **`id`** — A unique identifier within the workflow (used to reference outputs).
- **`type`** — The task type (e.g., `core.print`, `k8s.cli`).
- **`params`** — Input parameters for the task.
- **`next`** — The ID of the next task to execute (optional).

### Referencing Task Outputs

Use template expressions to pass data between tasks:

```yaml
# Reference a previous task's output
{{ Tasks['my_task_id'].output.field_name }}

# Reference workflow inputs
{{ Inputs.my_input }}

# Reference shared configs and secrets
{{ Configs.slack_channel_id }}
{{ Secrets.github_token }}
```

### Automatic Context Variables

Every workflow execution includes these variables in the `Inputs` map:

| Variable | Description | Format |
|:---|:---|:---|
| `workflow_execution_time` | Actual start time of this execution | RFC3339 |
| `workflow_scheduled_time` | Intended/logical trigger time | RFC3339 |
| `workflow_last_execution_time` | Start time of the previous successful run | RFC3339 |
| `workflow_execution_id` | Unique run ID | UUID |
| `workflow_id` | Workflow definition ID | UUID |
| `workflow_name` | Workflow name | String |

## Task Categories

| Category | Description |
|:---|:---|
| [Core Tasks](./core-tasks.md) | Control flow and orchestration |
| [Data Tasks](./data-tasks.md) | Transform and filter data |
| [Notification Tasks](./notification-tasks.md) | Email, Slack, Teams, Google Chat |
| [Ticket Tasks](./ticket-tasks.md) | Jira, GitHub Issues, PagerDuty, ServiceNow |
| [AI Tasks](./ai-tasks.md) | Summarize, investigate, classify, route with AI |
| [Cloud CLI Tasks](./cloud-cli-tasks.md) | AWS, Azure, GCP, Kubectl |
| [Kubernetes Tasks](./kubernetes-tasks.md) | Rightsize, restart, delete, drain |
| [Scripting Tasks](./scripting-tasks.md) | Run Bash, Python, JavaScript, PowerShell |
| [Integration Tasks](./integration-tasks.md) | HTTP requests, SSH |
| [Observability Tasks](./observability-tasks.md) | Logs, metrics, traces |
| [Database Tasks](./database-tasks.md) | SQL, Redis |
| [CI/CD Tasks](./cicd-tasks.md) | ArgoCD |
| [Source Control Tasks](./source-control-tasks.md) | GitHub CLI |
| [Message Queue Tasks](./message-queue-tasks.md) | RabbitMQ |
| [Network Tasks](./network-tasks.md) | Ping, DNS, TCP, SSL, Traceroute, Whois, NTP |
| [Crypto Tasks](./crypto-tasks.md) | Encode, decode, hash, encrypt, decrypt |
| [Event Tasks](./event-tasks.md) | Store events for analysis |
