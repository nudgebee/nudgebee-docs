---
sidebar_position: 1.1
sidebar_label: What NuBi Can Do
---

# What NuBi Can Do

NuBi is NudgeBee's AI assistant. Ask it in plain language — from **Nubi** in the app (or **⌘J** on any page), from Slack, or from Microsoft Teams — and it picks the right specialist agents, gathers evidence from your accounts, and answers with the evidence it used.

This page lists what NuBi does today and where each capability lives. For the chat screen itself — attachments, queued messages, approvals, reading an answer, your conversation list — see **[Using the Chat](./nubi-chat.md)**. To make its answers more accurate for your environment, see **[Improve NuBi's Answers](./improve-accuracy.md)**.

## Investigate your environment

When you ask about a problem — a crashing pod, a slow service, a cost spike, a failing alert — NuBi routes the question to the assistant for that account type (Kubernetes, AWS, Azure, GCP, VM) and its specialist agents (logs, metrics, traces, events, databases, code, tickets). See **[AI & Pre-built Agents](./index.md)** for the list and **[NuBi Use Cases](./use-cases/index.md)** for worked examples.

- **Changes need approval.** In chat, a step that would change a system — a cluster, cloud resource, repository or database — is held for your approval. Admins can let specific, known-safe commands run without asking with [Tool Approvals](./tool-approvals.md), and automations can be configured by their author to run without asking.
- **Scoped to the selected account.** Investigations run on the account you have selected and reach another connected account only when you ask about it. Product questions (accounts, integrations, documentation) can cover every account you are allowed to see.
- **Alerts are investigated automatically** — high-priority events by default, controlled by tenant and account settings; you can ask follow-up questions in the same conversation. See [Automatic Event Analysis](./event-analysis.md).
- **It can keep watching.** Ask NuBi to tell you when something finishes and it checks in the background — see [Watches](./watches.md).

## Answer questions about NudgeBee itself

Questions about the product — *"Is my agent connected?"*, *"Why is my Datadog integration not working?"*, *"How do I upgrade the agent?"* — go to NuBi's product assistant. You can also address it directly with `@nubi`.

| You ask about | What NuBi uses |
|---|---|
| How a feature works, setup and upgrade steps | This documentation site |
| Your accounts and configured integrations | Live account and integration data you are allowed to see |
| Kubernetes agent, VM/proxy agent or cloud sync health | The heartbeat and per-feature health NudgeBee records |
| Why an integration is not connecting | A read-only connection check, where the integration supports one |

The product assistant is read-only: it never changes configuration and never shows credentials, tokens or secret values.

:::tip If NuBi says a feature doesn't exist
NuBi answers product questions from this documentation. If a page is missing, NuBi can only say it found no documentation — please tell us so we can add it.
:::

## Use your team's knowledge

NuBi searches your **knowledge bases** (Confluence, ServiceNow, uploaded documents, skills from GitHub) and follows runbooks marked as **SOP**. Manage them in **[b-Cortex](./b-cortex.md)**.

## Build on it

- **[Agents & Custom Agents](./custom-agents.md)** — create your own agents, override a built-in agent's prompt, or add tools to it.
- **[AI & Tools](./ai-and-tools.md)** — every admin setting for the AI, from budgets to security.
- **[Tools & MCP](./tools-and-mcp.md)** — the tools agents can call, and external MCP servers.
- **[Workflow Builder](../workflow-builder/index.md)** — run agents inside automations.

## Where you can talk to NuBi

| Where | What works |
|---|---|
| **Nubi** (app) and the **⌘J** drawer | Full conversations, approvals, image attachments, `@` to ask a specific agent, `/skill-name` to load a skill, `@nubi` for product questions, and **Ask Nubi** buttons on logs, traces, tables and events. See [Using the Chat](./nubi-chat.md). |
| **Slack** | `@Nubi` in a channel or thread, or a direct message; Nubi replies in a thread (mention it again to continue). Alert cards have **Ask Nubi to Analyse!**, approvals have one button per option, and **Watched Channels** give Nubi channel context. See [Using Nubi in Slack](../../integrations/Notifications/slack.md#using-nubi-in-slack). |
| **Microsoft Teams** | `@Nubi` in a channel or thread; alert cards with **Ask Nubi**, and approval cards (buttons stop working after 7 days). Standard channels only. See [Microsoft Teams](../../integrations/Notifications/msteams.md). |

**Notifications are separate from chat.** Alert notifications are delivered to Slack, Microsoft Teams, Google Chat, Discord or webhooks according to your notification rules. Automations can also send messages to Slack, Microsoft Teams or Google Chat with the *Send message* task.

## Related

- [Using the Chat](./nubi-chat.md)
- [Improve NuBi's Answers](./improve-accuracy.md)
- [b-Cortex: Memory and Knowledge](./b-cortex.md)
- [Agents & Custom Agents](./custom-agents.md)
- [Memory Policy](./memory-policy.md)
