---
sidebar_position: 3
sidebar_label: Notification Tasks
---

# Notification Tasks

Send messages via email, Slack, Microsoft Teams, and Google Chat.

## `notifications.email`

**Display Name:** Send Email

Send an email to one or more recipients.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `recipients` | array | Yes | Email addresses to send to. Supports dynamic selection from onboarded users. |
| `subject` | string | Yes | Email subject line. |
| `body` | string | Yes | Email body content (HTML or plain text). |
| `reply_to` | string | No | Reply-to email address. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `success` | boolean | Whether the email was sent successfully. |
| `sent_to` | array | List of recipients the email was delivered to. |

### Example

```yaml
- id: send_report
  type: notifications.email
  params:
    recipients: ["ops@example.com", "lead@example.com"]
    subject: "Daily Cost Report — {{ Inputs.workflow_execution_time }}"
    body: |
      <h2>Cost Summary</h2>
      <p>{{ Tasks['generate_report'].output.data }}</p>
```

---

## `notifications.im`

**Display Name:** Send IM

Send a message to a Slack channel, MS Teams channel, or Google Chat space.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `provider` | string | Yes | IM platform. Options: `slack`, `ms_teams`, `google_chat`. |
| `team_id` | string | No | Team ID (required for MS Teams). |
| `channel` | string | Yes | Channel ID or name to post in. |
| `message` | string | Yes | Message body (supports markdown for Slack). |
| `message_thread_id` | string | No | Thread ID to reply within a thread instead of posting a new message. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `channel` | string | Channel where the message was posted. |
| `message_id` | string | ID of the sent message (use as `message_thread_id` for follow-ups). |
| `team` | string | Team ID. |
| `platform` | string | Platform used. |

### Example

```yaml
- id: alert_team
  type: notifications.im
  params:
    provider: slack
    channel: "C0123ALERTS"
    message: ":warning: High CPU on {{ Inputs.workload }} — {{ Tasks['check'].output.cpu_pct }}%"
```

---

## `notifications.dm`

**Display Name:** DM

Send a direct message to a specific user.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `provider` | string | Yes | IM platform. Options: `slack`. |
| `user_id` | string | Yes | User ID to send the message to. |
| `message` | string | Yes | Message body. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `user_id` | string | Target user ID. |
| `channel_id` | string | DM channel ID. |
| `message_id` | string | Message ID. |
| `provider` | string | Platform used. |

### Example

```yaml
- id: notify_oncall
  type: notifications.dm
  params:
    provider: slack
    user_id: "U0123ONCALL"
    message: "You have a pending approval: {{ Tasks['approval'].output.message }}"
```

---

## `notifications.read_thread`

**Display Name:** Read Thread Messages

Fetch replies and reactions from a Slack thread. Useful for checking if someone responded to a notification.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `provider` | string | Yes | Only `slack` is currently supported. |
| `channel_id` | string | Yes | Channel ID where the thread exists. |
| `thread_ts` | string | Yes | Thread timestamp (parent message `ts`). |
| `team_id` | string | No | Workspace ID (optional if tenant has a single workspace). |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `success` | boolean | Whether the request succeeded. |
| `messages` | array | Messages in the thread (includes reactions). |
| `reply_count` | number | Number of replies. |
| `has_responses` | boolean | True if there are replies or reactions. |
| `has_reactions` | boolean | True if the parent message has reactions. |
| `has_more` | boolean | Whether there are more messages to fetch. |

### Example

```yaml
- id: check_thread
  type: notifications.read_thread
  params:
    provider: slack
    channel_id: "C0123ALERTS"
    thread_ts: "{{ Tasks['alert_team'].output.message_id }}"
```

---

## `notifications.add_reaction`

**Display Name:** Add Reaction

Add an emoji reaction to a message on Slack, MS Teams, or Google Chat.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `provider` | string | Yes | Platform. Options: `slack`, `ms_teams`, `google_chat`. |
| `team_id` | string | No | Team ID (required for MS Teams). |
| `channel_id` | string | Yes | Channel or space ID. |
| `message_id` | string | Yes | Message timestamp (Slack) or message ID (Teams/Chat). |
| `emoji` | string | Yes | Emoji to add. Slack: name without colons (e.g., `thumbsup`). Teams/Chat: unicode (e.g., `👍`). |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `success` | boolean | Whether the reaction was added. |

### Example

```yaml
- id: ack_message
  type: notifications.add_reaction
  params:
    provider: slack
    channel_id: "C0123ALERTS"
    message_id: "{{ Tasks['alert_team'].output.message_id }}"
    emoji: "white_check_mark"
```

---

## `slack.join_channel`

**Display Name:** Slack Join Channel

Add the bot to a public Slack channel so it can post messages there.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `channel_id` | string | Yes | The ID of the public Slack channel to join. |
| `text` | string | No | Optional message to send upon joining. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `response` | object | Raw response from the Slack API. |
