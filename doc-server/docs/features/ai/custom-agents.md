---
sidebar_position: 5.5
sidebar_label: Custom Agents
---

# Custom Agents

**Admin → AI & Tools → Agents**

The Agents list shows every built-in agent plus the custom agents your team created. Filter by **Agent Type**: all agents, NudgeBee system agents, or user-created agents. Each row's menu offers:

| Action | What it does |
|---|---|
| **Prioritize knowledge** | Reserve room for chosen knowledge bases in this agent's search, optionally always loading a skill. See [Improve NuBi's Answers](./improve-accuracy.md#prioritize-knowledge-for-one-agent). |
| **Override Agent Prompt** (built-in agent) / **Edit Agent** (custom agent) | Change the agent's role, instructions, constraints and tools. |
| **Add tools** / **Update tools** | Give a built-in agent additional tools without changing its prompt. |
| **Who can use it** | Tenant admins: share a custom agent with the whole organisation or selected accounts. |
| **Revert Agent** | Remove a prompt override and go back to the built-in agent. |
| **Delete Agent** | Remove a custom agent. |

## Create an agent

**Add Agent** opens a form in four parts:

1. **Agent Identity** — **Name** (3–50 characters: letters, digits and underscores, starting with a letter; unique) and **Description** (what the agent does and its purpose).
2. **Behavior & Guidelines** — **Role** (*"You are a [role], responsible for [specific task]."*), **Instructions** (step-by-step behaviour) and **Constraints** (limits and rules it must follow).
3. **Tool/Agent Selection** — the tools and agents it may use, and **Tool Usage**: how and when to use each one, with examples.
4. **Knowledge & Examples** — **Examples** of good answers, and **Upload RAG Data Files** for agent-specific reference material.

When you edit an agent, an **Agent Status** section lets you set it to **Enabled**, **Disabled** or **Draft**.

Write instructions as you would brief a new engineer: what to check first, what evidence counts, when to stop and ask. Keep environment facts in [account context](./improve-accuracy.md#account-context) and procedures in [SOP knowledge](./improve-accuracy.md#facts-and-sops) rather than in the prompt — they then help every agent, not only this one.

## Override a built-in agent

**Override Agent Prompt** on a built-in agent creates a custom version that replaces the original for the selected account (tenant admins can share it more widely with **Who can use it**). Use it to change how, for example, the **Event & Alert Investigator** writes its findings. **Revert Agent** restores the built-in behaviour.

## Add tools to a built-in agent

**Add tools** extends a built-in agent with **Additional Tools** — for example a [custom tool or MCP server](./tools-and-mcp.md) your team added — while keeping its built-in prompt. Use this instead of an override when the agent behaves well but lacks access to a system.

## Share across the organisation

Tenant admins can make a custom agent (and custom tools) available to the whole organisation or to selected accounts with **Who can use it**. Other admins see them in the tenant-wide view with an **Account** column.

## Related

- [Tools & MCP](./tools-and-mcp.md)
- [Improve NuBi's Answers](./improve-accuracy.md)
- [Workflow Builder](../workflow-builder/index.md) — run agents inside automations
