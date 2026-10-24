---
sidebar_position: 1.15
sidebar_label: Using the Chat
keywords: [nubi chat, ask nubi, attach image, queued message, stop response, approval, answer confidence, share conversation, conversation history]
---

# Using the NuBi Chat

Open NuBi from **Nubi** on the left rail (your tenant may have renamed the assistant — the rail shows its name), or press **⌘J** (**Ctrl+J** on Windows and Linux) on any page to open it in a side drawer. The drawer has **Open full page**, **New chat**, **Your Chats**, **Expand** and **Close**; while it is closed, it tells you when NuBi has finished or how many chats are still running. The floating launcher button is hidden on the investigation page, the automation editor and Setup, but **⌘J** still opens the drawer there. On the full NuBi page there is no drawer.

Many screens also have an **Ask Nubi** button — logs, log patterns, traces, the pod profiler, Kubernetes tables, cloud recommendations and global search. It opens the drawer with what you were looking at as context. On an event, **Investigate** starts an analysis and **View Analysis** opens it; **Ask a follow up** on the analysis continues the same conversation in the drawer.

## Asking a question

| Control | What it does |
|---|---|
| **Account** chip | The account the chat runs on. Pick it before you start — once the chat has started it is locked: *"This chat stays on its account. Start a new chat to ask about another account."* |
| **Attach image** | Add screenshots: PNG or JPEG, up to 4 per message and 1.5 MB each (your installation may set other limits). You can also paste an image. Images are kept for 7 days; after that the conversation shows **Image expired**. |
| **Agents** (`@`) | Ask one agent directly: pick it from the agent button, or type `@` at the start of the message. Clear it with ✕. Only enabled agents are listed. See [Agents & Custom Agents](./custom-agents.md). |
| `/` | Load a skill by name — type `/` to pick from the list. Up to three per message. See [Skills](./improve-accuracy.md#skills). |
| **Model** | Shown when a model or provider configuration is available. **All calls** uses one model for everything, **By task** sets models for reasoning, retrieval and summaries (an empty slot inherits the default), and **Config** picks a saved provider configuration. **Clear all** goes back to the default; click **Apply**. The button shows **Auto** when nothing is chosen, otherwise the model, configuration or **By task**. |

The landing page suggests starter questions such as *Any Errors in the Past 24 Hours?* and *What can we Optimize?*. If no Kubernetes cluster is connected yet, the page says *Currently No kubernetes cluster is configured, Please add a kubernetes cluster* and takes you to the form to add one.

## While NuBi is working

- **Queue follow-ups.** You can keep typing while NuBi answers — the box says *Queue a follow-up message...*. Queued messages (up to 5 by default) run in order after the current answer. The **Queued** banner lets you **Edit**, **Remove from queue** or **Send now**, which stops the current answer and sends the message at once. If the queue is full, wait or remove a message.
- **Stop.** With the box empty, the send button becomes **Stop**; the running-tasks banner also has **Stop execution**. Right after you send, stop may say it isn't available yet — try again in a moment.

## Approvals and questions from NuBi

When NuBi needs approval for a step that changes something, or needs an answer from you, a sheet opens above the message box:

- Choose an option. On a yes/no question **Y** and **N** work as shortcuts; on a list use ↑/↓ and Enter (Space to toggle on a multi-select). When the question is about deleting, removing, restarting or force-stopping something, the yes button reads **Yes, continue**.
- Type your own reply in **Something else…**, or **Skip** the question.
- **End conversation** (✕ menu) stops the chat.

A pending question doesn't wait forever: a chat left waiting ends after 14 days by default, and conversations started by alerts, automations, Slack or Teams after 12 hours. After that the question can no longer be answered — ask again in a new message.

Steps that ran without asking because an admin's [Tool Approvals](./tool-approvals.md) rule allowed them show an **Auto-approved** chip; hover it to see which rule allowed it. **Approvals & clarifications** on the answer lists every approval and question in that turn (rule-approved steps appear as **Approved by rule**), and the duration shows **Waited for approval** separately from the time NuBi spent answering.

## Reading an answer

- **Plan.** For an investigation NuBi shows its plan: each step is **Done**, **In progress**, **Testing**, **Skipped** or **Not started**, with *Now: …* for the current step. Work outside the plan is grouped under **Outside the plan**.
- **Tool calls.** Each call shows its status (**Success**, **Error**, **Completed with errors**, **Skipped**, **Waiting**, **In-Progress**); open **Tool Details** for its input and output.
- **Citations and sources.** Numbered references jump to the step they came from. **N sources** lists the documents and pages used.
- **Answer confidence.** On investigations, when the tenant feature *Answer confidence on investigations* is on, a **high**, **medium** or **low confidence** chip explains the level and lists anything NuBi **could not verify**. Low means no specific root cause could be confirmed from the available data.
- **Chips under the answer** open drawers for the turn's **Tasks**, **Additional Contexts**, **New Memories**, linked **Channel Conversation** and **Watches** (things NuBi keeps checking for you — cancel one with **Cancel watch**). Redaction chips are explained in [Egress Filter](./egress-filter.md).
- **Metrics.** The usage figure on each answer opens **Message Metrics**; the one in the header opens **Conversation Metrics** — tokens (including thinking tokens, billed at the output rate), cached tokens, cost, tool calls and timings. A model without a price shows **No price**; set one in [Budgets & Limits](./budgets-and-limits.md#model-pricing).
- **Actions.** **Share**, **Copy**, **Download conversation JSON**, and **Open as dashboard** for dashboard answers.
- **Feedback.** Thumbs up or down. Thumbs down asks **What went wrong?** with a reason and an optional comment. If the answer names a root cause, your vote is also remembered as agreeing or disagreeing with it — see [b-Cortex → Decisions](./b-cortex.md#decisions).

## Your chats

**New chat** starts over; **Chats** lists your conversations.

| Filter | Shows |
|---|---|
| **Search conversations...** | Matches on the conversation |
| **Mine** / **Everyone** | Your conversations, or everyone's you are allowed to see |
| **All accounts** | Narrow to one account |
| Type | **Chats** (user chats, Slack channels), **System** (event analysis, automations, optimization) or **Query transcripts** (Prometheus, Loki, Elasticsearch, dashboards) |
| **Saved** / **Waiting** | Saved conversations, or ones paused waiting for your approval or answer |

Conversations are grouped into Today, Yesterday, Last 7 Days, Last 30 Days and Older. Each row has **Share** (copies a link), **Save** / **Unsave** and, for your own conversations, **Delete** — which removes its questions, answers and investigation history permanently. The open conversation's header shows **Queries Asked** and **Participants**, with **Save conversation** and **Share**.

Users with a custom role that lacks read access to AI conversations see **Nubi** greyed out on the rail.

## When something goes wrong

| Message | What it means |
|---|---|
| *Monthly Budget Limit exceeded for this account. Contact … Support team.* | An AI budget was reached — for the account or the whole tenant. See [Budgets & Limits](./budgets-and-limits.md). |
| *Rate limit exceeded. Please retry shortly.* (or the provider's own rate-limit message) | Too many requests to the AI provider; wait and retry. |
| *Service is temporarily unavailable. Please retry.* | NuBi or the AI provider is unavailable for a moment. |
| *You do not have permission to perform this action.* / *You do not have permission to access this conversation* | Your role doesn't allow it, or the conversation belongs to an account you can't see. |
| *Conversation is not ready to queue a message. Please retry your message.* | Send it again once the current step has started. |
| *Failed to load Conversation* | Reload; if it persists, the conversation may have been deleted. |
| NuBi says the cluster is unavailable for inspection | The NudgeBee agent on that cluster isn't connected, so NuBi can't run live commands there. See [Troubleshoot agent connectivity](../../installation/agent/operate/troubleshoot-agent-connectivity.md). |

## Related

- [What NuBi Can Do](./nubi.md)
- [Improve NuBi's Answers](./improve-accuracy.md)
- [Tool Approvals](./tool-approvals.md)
- [Budgets & Limits](./budgets-and-limits.md)
