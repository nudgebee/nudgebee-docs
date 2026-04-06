---
sidebar_position: 4
---
# Autopilot

Autopilot enables automated, self-healing operations for your Kubernetes clusters using NudgeBee's 30+ pre-built Cloud-Ops Agents. Instead of manually responding to every alert, you can configure automated runbooks that detect issues and take corrective action — like restarting a pod, scaling a workload, or creating a ticket — powered by [NuBi and the pre-built AI agents](../ai/AI.md) with human-in-loop approvals for safety.

### Why Use Autopilot?

- **Reduce MTTR from hours to minutes** — Automated responses execute in seconds. Common issues get resolved before your team even sees the alert.
- **Eliminate toil** — Repetitive operational tasks (restart crashed pods, scale up during traffic spikes, create incident tickets) run automatically with enterprise guardrails.
- **Consistent responses** — Runbooks ensure the same best-practice steps are followed every time, regardless of who is on call.

### When Do You Need This?

Autopilot is **optional** but highly valuable once you have the basics set up. You should configure Autopilot after:

1. Your Kubernetes clusters are [connected](../../installation/agent/installation/installation.md) and monitored.
2. An [observability source](../../integrations/Observability/) is integrated.
3. An [LLM](../../integrations/LLM/) is connected (required for AI-driven runbooks).

:::info
Autopilot actions are fully auditable. Every automated action is logged with what happened, why it was triggered, and what the outcome was.
:::

### What You Will Find in This Section

- **[Auto-Optimize](./auto_optimize/auto_optimize.md)** — Automatically apply optimization recommendations (resource right-sizing, scaling adjustments) without manual approval.
- **[Auto-Runbook](./auto_runbook/auto_runbook.md)** — Create automated runbooks that trigger on specific events. Available runbook actions include:
  - [Create Ticket](./auto_runbook/create_ticket.md) — Automatically create tickets in your connected ticketing system.
  - [Delete Pod Gracefully](./auto_runbook/delete_pod_gracefully.md) — Safely terminate and restart problematic pods.
  - [Execute Bash Script](./auto_runbook/execute_bash.md) — Run custom shell scripts in response to events.
  - [Execute Custom Image](./auto_runbook/execute_custom_image.md) — Run a custom container image as a remediation step.
  - [Horizontal Right-Size](./auto_runbook/horizontal_rightsize.md) — Adjust horizontal pod autoscaler settings.
  - [Vertical Right-Size](./auto_runbook/vertical_rightsize.md) — Adjust resource requests and limits.
  - [Node Shutdown](./auto_runbook/node_shutdown.md) — Gracefully drain and shut down underutilized nodes.
  - [Notify](./auto_runbook/notify.md) — Send notifications through configured channels.
  - [PVC Right-Size](./auto_runbook/pvc_rightsize.md) — Resize persistent volume claims.
  - [REST API](./auto_runbook/rest_api.md) — Call external APIs as part of remediation.
  - [Workload Restart](./auto_runbook/workload_restart.md) — Restart entire workloads (deployments, statefulsets).
  - [Workload Scaler](./auto_runbook/workload_scaler.md) — Scale workloads up or down.

:::tip
Start with low-risk automations like creating tickets and sending notifications. Once you are confident in the triggers and conditions, move to automated remediation actions like pod restarts and scaling.
:::
