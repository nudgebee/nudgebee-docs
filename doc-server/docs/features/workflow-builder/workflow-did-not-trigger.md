---
id: workflow-did-not-trigger
title: "Troubleshooting: Why Didn't My Workflow Trigger?"
sidebar_label: Workflow Did Not Trigger
sidebar_position: 5
keywords: [workflow not triggering, automation failed to start, trigger mismatch, workflow draft, cron not running, workflow troubleshooting]
intent: diagnose
provider: all
---

# Troubleshooting: Why Didn't My Workflow Trigger?

First distinguish a workflow that never started from one that started and failed. Check execution history for the expected time and inspect errors if a run exists.

## 1. Check the live version

Confirm that a version is published, made live, and Active. Saving draft edits does not publish them, and having draft changes does not stop an existing active live version. See [Workflow Versioning](./workflow-versioning.md).

## 2. Check the trigger input and lifecycle phase

For an Event Trigger, confirm the event exists in Troubleshoot. Compare its actual event type, account, namespace, source, and priority with the configured filters. Structured filters combine with AND. Advanced expressions must render to `true` or `1`.

Check the selected lifecycle phase when available: `event.created`, `event.triaged`, and `investigation.completed` are distinct. A trigger listening for investigation completion does not match the creation phase.

Review event classification and suppression to understand which lifecycle processing occurred. Do not assume that a notification suppression rule globally disables every workflow trigger.

## 3. Check recommendation matching

Optimization triggers run for new recommendations matching their cluster, category, and rule filters. Inspect the actual `Inputs.event` payload and the [Optimization Trigger reference](./triggers.md#optimization-trigger). Editing a workflow does not imply older recommendations will be replayed.

## 4. Check schedule timing and overlap

Scheduled times use UTC. Review the cron expression, catchup window, and schedule overlap policy. For example, Skip can omit a scheduled run while an earlier run remains active; Buffer One queues one pending scheduled run. These schedule policies should not be assumed to govern all event-triggered executions.

See [Schedule Trigger](./triggers.md#schedule-trigger) for supported values.

## 5. Collect evidence for a missing run

Record the workflow ID, live version, account, trigger configuration, event or recommendation ID, and expected UTC time. If no execution exists, ask the administrator to inspect workflow-server trigger/consumer logs for that time and account. A missing execution is not itself proof of a filter mismatch.

If a run exists, inspect its task errors and approval state. See [Workflow Operations](./workflow-operations-approvals.md) before retrying or cancelling it.
