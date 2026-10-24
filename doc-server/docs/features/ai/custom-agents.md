---
sidebar_position: 5.5
sidebar_label: Agents & Custom Agents
---

# Agents & Custom Agents

**AI & Tools → Agents**

Every agent NuBi can use — NudgeBee's built-in system agents and the custom agents your team created. From here you create agents, override a built-in agent's prompt, give it extra tools, choose which knowledge it should prioritize, and decide who can use it.

## The list

The toolbar has **Search Agent**, an **Agent Type** filter (**All Agents**, NudgeBee system agents, **User Created Agent**), a download button that exports the list, and **Create Custom Agent**. Pick an account at the top right to see one account, or leave **All accounts** for the tenant view (see [AI & Tools](./ai-and-tools.md#tenant-view-and-account-view)).

| Column | Meaning |
|---|---|
| **Name** | The agent, with badges: **NudgeBee System Agent** or **User Created Agent**; **Organisation** or **Selected accounts** for agents shared across accounts; **User overridden** when a built-in agent's prompt was overridden; **Add-on configured** when extra tools were added |
| **Description** | What the agent does |
| **Status** | Enabled, Disabled or Draft. For an agent shared across accounts, the account view also has a switch to turn it on or off for that account |
| **Tools** | The tools the agent can call |
| **Usage** | Hover the info icon to see when to use the agent, an example question, why it helps and what it is not for. Built-in agents only |
| **KB** (account view) | How many knowledge bases are prioritized for this agent — click to change them |
| **Account** (tenant view) | The account the agent belongs to |
| **Action** | The row menu below |

## Row actions

The menu appears on rows you are allowed to manage (write access to the account; tenant admin for agents shared across accounts).

| Action | Shown for | What it does |
|---|---|---|
| **Prioritize knowledge** | Any agent | Choose knowledge bases that get reserved room in this agent's search, and **Always load** short ones. See [Improve NuBi's Answers](./improve-accuracy.md#prioritize-knowledge-for-one-agent). |
| **Override Agent Prompt** | Built-in agents | Create your own version of the agent's role, instructions and tools |
| **Edit Agent** | Custom agents | Change the agent |
| **Add tools** / **Update tools** | Built-in agents | Give the agent extra tools without changing its prompt |
| **Who can use it** | Custom agents (tenant admins) | Share the agent with **This account**, **Selected accounts** or the whole **Organization** |
| **Revert Agent** | Overridden built-in agents | Remove your override and go back to the built-in agent |
| **Delete Agent** | Custom agents | Remove the agent |

Delete and Revert ask for confirmation.

## Create a custom agent

**Create Custom Agent** opens *Add Agent*:

1. **Agent Identity** — **Name** (unique; letters, digits and underscores, starting with a letter, 3–50 characters) and **Description**. Tenant admins can also choose who can use it: this account, selected accounts, or the organization.
2. **Behavior & Guidelines** — **Role** (*"You are a [role], responsible for [specific task]."*), **Instructions** (step-by-step behavior) and **Constraints** (limits and rules it must follow).
3. **Tool/Agent Selection** — the tools and agents it may use, and **Tool Usage**: how and when to use each one, with examples.
4. **Knowledge & Examples** — **Examples** of good answers, and **Upload RAG Data Files** (CSV, JSON, XML or TXT) for agent-specific reference material.

Click **Create Agent**. When you edit an agent later, an **Agent Status** section lets you set it to **Enabled**, **Disabled** or **Draft**.

Write instructions as you would brief a new engineer: what to check first, what evidence counts, when to stop and ask. Keep environment facts in [account context](./improve-accuracy.md#account-context) and procedures in [SOP knowledge](./improve-accuracy.md#facts-and-sops) rather than in the prompt — they then help every agent, not only this one.

## Override a built-in agent

**Override Agent Prompt** opens the same form, pre-filled with the built-in agent. Saving creates your version, which replaces the built-in agent for the selected account (tenant admins can share it more widely). The row then shows **User overridden**. Use it to change how, for example, the **Event & Alert Investigator** writes its findings. **Revert Agent** restores the built-in behavior.

## Add tools to a built-in agent

**Add tools** opens *Tools & Configuration* with **Additional Tools** — for example a [custom tool or MCP server](./tools-and-mcp.md) your team added. The agent keeps its built-in prompt and gains the tools; the row shows **Add-on configured**. Use this instead of an override when the agent behaves well but lacks access to a system.

## Use an agent in chat

In the NuBi chat, click the agent button in the message box (tooltip *Agents — mention one with @*) or type `@` at the start of your message, and pick an agent to send your question straight to it. Clear the choice with ✕. Only enabled agents are listed; if there are none, the button says no agent is connected. Without a choice, NuBi routes the question itself.

## Related

- [AI & Tools](./ai-and-tools.md)
- [Tools & MCP](./tools-and-mcp.md)
- [Improve NuBi's Answers](./improve-accuracy.md)
- [Workflow Builder](../workflow-builder/index.md) — run agents inside automations
