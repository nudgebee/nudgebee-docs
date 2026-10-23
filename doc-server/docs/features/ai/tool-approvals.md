---
sidebar_position: 4.5
sidebar_label: Tool Approvals (Beta)
---

# Tool Approvals (Beta)

**AI & Tools → Security → Tool Approvals**

When NuBi wants to run something that could change a system, it stops and asks a person to approve it. Tool approval rules let you skip that confirmation for specific, known-safe calls — a particular command on a particular account — so routine work isn't held up, while everything else still asks.

> Skip interactive confirmation only when the selected tool, account, command, and arguments match.

Tenant admins and super admins (including read-only ones) can see this tab; tenant admins and super admins can add or change rules.

Rules take effect only when automatic approval is enabled for your installation. If it isn't, the tab shows **Automatic approval is disabled** and every call that needs approval still asks.

## Rules

Each rule card shows the tool, the account and a revision number, with an **Enabled** switch and **Edit** / **Delete**. With no rules: *"No automatic approval rules"* — every call that needs approval asks.

## Add a rule

**Add rule** opens the rule form:

| Field | Meaning |
|---|---|
| **Rule name** | A name for the rule |
| **Tool** | The tool the rule applies to |
| Scope | **Organisation** or **Selected accounts** (for account tools), or **All integrations** / **Selected integrations** (for integration tools) |
| **Also apply in background runs** | Off: the rule skips the prompt only when a signed-in person made the request. On: it also applies when nobody is signed in — system jobs, API calls without a user, or chat users whose NudgeBee account isn't linked |
| **Match type** | How calls are matched — see below |
| **CLI command**, **Working directory**, **Execution target** | What must match, depending on the match type |

Match types, from narrowest to broadest:

| Match type | Approves without asking when… |
|---|---|
| **Exact CLI command** | The command is exactly the one you entered |
| **Regular expression** (RE2, advanced) | The command matches your expression |
| **Argument conditions** | The call's arguments meet the conditions you set |
| **Entire tool** (broad) | Any call to the tool — use with care |

Click **Save rule**. Start with **Exact CLI command** for the commands your team approves every day, and widen only when you need to.

## Related

- [Tools & MCP](./tools-and-mcp.md) — per-tool **Approval** setting and MCP server approvals
- [Egress Filter](./egress-filter.md) — the other half of the Security tab
- [AI & Tools](./ai-and-tools.md)
