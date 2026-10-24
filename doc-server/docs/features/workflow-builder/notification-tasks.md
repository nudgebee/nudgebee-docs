---
sidebar_position: 4
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
| `cc` | array | No | Carbon-copy recipients, visible to all addressees. |
| `bcc` | array | No | Blind carbon-copy recipients, hidden from other addressees. |
| `subject` | string | Yes | Email subject line. |
| `body_format` | string | No | How the body is rendered: `text`, `markdown` or `html`. Use `markdown` when sending AI output so headings and lists render. |
| `body` | string | Yes | Email body content. |
| `reply_to` | string | No | Reply-to email address. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `success` | boolean | Whether the email was sent successfully. |
| `sent_to` | array | List of recipients the email was delivered to. |

---

## `notifications.im`

**Display Name:** Send IM

Send a message to a Slack channel, MS Teams channel, or Google Chat space — through the app, or through a webhook integration. As a step it **fails** when the message isn't delivered, naming the reason; as a hook it only logs that.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `provider` | string | Yes | IM platform. Options: `slack`, `ms_teams`, `google_chat`, or a webhook integration: `slack_webhook`, `ms_teams_webhook`, `google_chat_webhook`. |
| `team_id` | string | No | Team ID (required for MS Teams; not used with webhooks). |
| `channel` | string | Yes | Channel ID or name to post in. For a webhook provider, the webhook integration. |
| `message` | string | Yes | Message body (supports markdown for Slack). |
| `message_thread_id` | string | No | Thread ID to reply within a thread instead of posting a new message. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `channel` | string | Channel where the message was posted. |
| `message_id` | string | ID of the sent message (use as `message_thread_id` for follow-ups). |
| `team` | string | Team ID. |
| `platform` | string | Platform used. |
| `status` | string | `sent`, or `suppressed` when a notification rule dropped the message. |
| `reason` | string | Why it wasn't delivered — the rule that suppressed it, or a reason code such as `no_destination` or `channel_not_found`. |
| `rule_management_url` | string | Link to the Notification Rules page for the suppressing rule (only when suppressed). |

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

---

## `notifications.add_reaction`

**Display Name:** Add Reaction

Add an emoji reaction to a message on Slack or Google Chat.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `provider` | string | Yes | Platform. Options: `slack`, `google_chat`. |
| `channel_id` | string | Yes | Channel or space ID. |
| `message_id` | string | Yes | Message timestamp (Slack) or message ID (Google Chat). |
| `emoji` | string | Yes | Emoji to add. Slack: name without colons (e.g., `thumbsup`). Google Chat: unicode (e.g., `👍`). |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `success` | boolean | Whether the reaction was added. |

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

---

## `google_chat.join_space`

**Display Name:** Google Chat Join Space

Add the bot to a Google Chat space so it can post messages there. The Google Chat counterpart to `slack.join_channel`.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `channel_id` | string | Yes | Space for the bot to join. Pick one from the list, or supply a space ID (e.g., `spaces/AAAA`) or a template. |
| `text` | string | No | Optional message to send upon joining. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `response` | object | Raw response from the Google Chat API. |

---

## `notifications.create_channel`

**Display Name:** Create Channel

Find or create a Slack channel or Google Chat space. Reuses an existing one with the same name rather than creating a duplicate — check `created` in the output to tell which happened.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `provider` | string | Yes | Notification provider: `slack` or `google_chat`. |
| `name` | string | Yes | Channel or space name to find or create. |
| `is_private` | boolean | No | Create a private channel. |
| `description` | string | No | Channel description. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `channel` | string | Channel or space ID. |
| `name` | string | Channel or space name. |
| `url` | string | Channel or space URL. |
| `provider` | string | Notification provider. |
| `created` | boolean | `true` if a new channel was created, `false` if an existing one was reused. |

---

## `notifications.add_channel_members`

**Display Name:** Add Channel Members

Add users to a Slack channel or Google Chat space. Typically paired with `notifications.create_channel` to stand up an incident war room.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `provider` | string | Yes | Notification provider: `slack` or `google_chat`. |
| `channel_id` | string | Yes | Channel or space ID to add users to. |
| `user_ids` | array | Yes | User IDs to add, in the provider's own format: Slack member IDs (e.g., `U12345678`) or people IDs for Google Chat. |
| `team_id` | string | No | For `slack`, optionally picks a specific workspace installation when the tenant has more than one. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `provider` | string | Notification provider. |
| `channel` | string | Channel or space ID. |
| `added` | array | User IDs successfully added. |
| `already_members` | array | User IDs that were already members. |
| `failed` | array | Users that could not be added, each with a `user_id` and `error`. |

## Related

- [Workflow Builder](./index.md)
- [Notification Rules](../notifications.md)
