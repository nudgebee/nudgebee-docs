---
sidebar_position: 2
sidebar_label: Core Tasks
---

# Core Tasks

Control flow primitives for orchestrating workflow execution order.

## `core.print`

**Display Name:** Print

Log a message to the workflow output. Useful for debugging templates and verifying data between steps.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `message` | string | Yes | The message to print. Supports template expressions. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | The printed message. |

---

## `core.wait`

**Display Name:** Wait

Pause workflow execution for a specified duration before continuing to the next task.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `duration` | string | Yes | Duration to wait. Uses Go duration format: `10s`, `5m`, `1h`, `2h30m`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `message` | string | Confirmation message. |
| `duration` | string | The duration that was waited. |

---

## `core.approval`

**Display Name:** Approval

Pause the workflow and wait for a human to approve or reject before continuing. By default it waits for an approval in the execution view; it can also send the request to Slack, Microsoft Teams or email.

The wait counts against the step's timeout, like any other step. An Approval step has no separate approval timeout: it uses the step's **Task Timeout**, else the **Automation Timeout** (5 minutes by default), else 10 minutes. If nobody answers in that time, the step fails. The Automation Timeout also limits the whole run, so when approvers need more time, raise both the step's **Task Timeout** and the workflow's **Automation Timeout**.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `message` | string | Yes | The message shown to the approver explaining what they are approving. |
| `approval_type` | string | No | Where to send the request. `in_app` (default) sends nothing and waits for an approval in the execution view; `instant_message`; or `email`. |
| `im_provider` | string | No | `slack` or `ms_teams` (required when `approval_type` is `instant_message`). Webhook-only chat integrations can't carry approvals. |
| `im_channel` | string | No | Channel ID to send the approval request to (required when `approval_type` is `instant_message`). |
| `im_team_id` | string | No | Microsoft Teams team the channel is in (required for `ms_teams`). |
| `message_thread_id` | string | No | Post the prompt into an existing thread, for example `{{ Tasks['notify'].output.message_id }}` from an earlier Send IM step. Empty posts top-level. |
| `email_recipients` | array | No | Email addresses (required when `approval_type` is `email`). Pick NudgeBee users or type any address. The email links to an approval page in NudgeBee. |
| `approval_options` | array | No | Custom approval button labels. Default: `["approve", "reject"]`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `status` | string | Approval result — matches one of the `approval_options` values (e.g., `approve`, `reject`). |
| `approver` | string | Identifier of the person who responded. |
| `comments` | string | Optional comments left by the approver. |
| `im_provider`, `im_channel`, `im_message_id`, `im_team_id` | string | Where the chat prompt was posted (chat approvals only). |

---

## `core.switch`

**Display Name:** Switch

Conditional branching — evaluate a template expression and route execution to the matching case. Works like an if/else or switch statement.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `expression` | string | Yes | Template expression to evaluate. The result is matched against case values. Example: `{{ Inputs.env }}` |
| `cases` | array | No | List of cases, each with `value` (string to match) and `next` (task ID to execute). |
| `default_next` | string | No | Task ID to execute if no case matches. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `selected_case` | string | The matched case value, or `"default"` if no case matched. |

---

## `core.foreach`

**Display Name:** For Each

Iterate over a list and execute a set of tasks for each item. Supports parallel execution with configurable concurrency.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `items` | any | Yes | List of items to iterate over. Can be a JSON array or template expression that resolves to an array. |
| `tasks` | array | Yes | List of task definitions to execute for each item in the loop. |
| `item` | string | No | Variable name for the current item inside the loop. Default: `"item"`. Access via `{{ LoopItem.item }}`, or `{{ LoopItem.<name> }}` when you set a custom name. |
| `concurrency` | integer | No | Max parallel iterations. `0` or `1` = sequential. `>1` = run N iterations in parallel. Default: `1`. |
| `output` | object | No | Map of output names to extract from each iteration's result. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `results` | array | List of outputs from each iteration. |

---

## `core.group`

**Display Name:** Group

Execute multiple tasks together as a single logical step. Tasks within the group run inline, as part of the same workflow run.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `tasks` | array | Yes | List of task definitions to execute in the group. |

### Output

`core.group` runs its tasks inline and has no output of its own; read results from the tasks inside the group.

---

## `core.call-workflow`

**Display Name:** Call Workflow

Execute another workflow by name as a child workflow and return its result. Useful for composing reusable workflow modules.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `workflow_name` | string | Yes | Name of the workflow to execute. |
| `inputs` | object | No | Input parameters to pass to the child workflow. |
| `workflow_version` | integer | No | Pin the call to a version number of the target workflow. Empty (or 0) always runs its current **Live** version. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `workflow_id` | string | ID of the executed child workflow. |
| `run_id` | string | Run ID of the child workflow execution. |
| `output` | object | Final output of the child workflow. |

