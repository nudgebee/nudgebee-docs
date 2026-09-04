---
id: create-event-automation
title: "Create an Automation When an Event Occurs"
sidebar_label: Event-Triggered Automation
sidebar_position: 2
keywords: [event automation, event trigger, workflow trigger, automated incident response, event remediation]
intent: setup
provider: all
---

# Create an Automation When an Event Occurs

Start with a narrowly filtered notification workflow, verify the event input, and then add ticket creation or remediation.

## Prerequisites

You need a connected event source, permission to create and run workflows, and a configured test notification destination. Confirm that a representative event is visible in Troubleshoot before configuring the trigger.

## Configure the event trigger

Create a workflow and add an **Event Trigger**. Configure at least one filter: event type, cluster, namespace, source, priority, or an advanced expression. Structured filters combine with AND; priorities are `HIGH`, `MEDIUM`, `LOW`, `INFO`, and `DEBUG`.

For advanced matching, use a Jinja expression such as:

```jinja
{{ event.priority == "HIGH" and event.source == "prometheus" }}
```

Select the lifecycle phase appropriate to your operation when that option is available. Creation, triage, and investigation completion are distinct phases; an event-created trigger should not assume AI analysis is already present.

See [Configuring Triggers](./triggers.md#event-trigger) for the form and filtering rules.

## Map the event into tasks

The event payload is passed as `Inputs.event`. Inspect a real execution input before referencing optional source-specific fields.

| Expression | Meaning |
| --- | --- |
| `{{ Inputs.event.event_type }}` | Event type |
| `{{ Inputs.event.subject_namespace }}` | Subject namespace |
| `{{ Inputs.event.subject_name }}` | Subject name |
| `{{ Inputs.event.priority }}` | Priority |
| `{{ Inputs.event.source }}` | Ingestion source |

A subject is not necessarily a Pod. Validate the resource kind and account before using it in a Kubernetes action. Do not assume `labels.pod_name`, `annotations.cluster_name`, or `rca.summary` exist on every event.

## Test a notification

1. Add an appropriate [Notification Task](./notification-tasks.md), connected to the trigger.
2. Select a test channel and include the event type, priority, and subject in the message.
3. Validate the workflow, then test using a representative sanitized input. Follow [Dry Run & Validation](./workflow-dry-run-validation.md); Dry Run can send actual messages.
4. Inspect task inputs and outputs and confirm the message reached the intended destination.
5. Publish an Active version and make it live. Confirm that a new matching event produces an execution.

## Add operational actions

After matching and payload mapping are verified, add a [Ticket Task](./ticket-tasks.md) or [Kubernetes Task](./kubernetes-tasks.md) with its required parameters. Place an [Approval](./workflow-operations-approvals.md) before changes that require review and configure decision handling before remediation.

Inspect completed actions before retrying a failed workflow: retry starts the workflow again, including earlier tasks. Record a recovery procedure for changes to infrastructure.
