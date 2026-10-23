---
sidebar_position: 1.4
sidebar_label: AI & Tools (overview)
---

# AI & Tools

Open **AI & Tools** at the bottom of NuBi's sidebar (the same tabs are under **Admin → AI & Tools**). This is where admins configure how NudgeBee's AI works: which agents and tools exist, which models they use, what leaves for a model provider, and how much the AI may spend.

| Tab | What it is for | Page |
|---|---|---|
| **Agents** | Built-in and custom agents; override prompts, add tools, prioritize knowledge | [Agents](./custom-agents.md) |
| **Tools & MCP** | Tools agents can call, MCP servers and their approvals, automations offered to NuBi | [Tools & MCP](./tools-and-mcp.md) |
| **Providers** | Read-only list of LLM provider configurations | [below](#providers) |
| **Gateway** | Model routing, tiers, quotas and user access for the AI Gateway | [AI Gateway](./ai-gateway.md) |
| **Security** | **Egress Filter** (secrets and personal data) and **Tool Approvals (Beta)** | [Egress Filter](./egress-filter.md), [Tool Approvals](./tool-approvals.md) |
| **Budgets & Limits** | Spend and conversation limits, usage, and model pricing | [Budgets & Limits](./budgets-and-limits.md) |
| **Memory Policy** | Tenant-wide switches for each layer of AI memory | [Memory Policy](./memory-policy.md) |
| **RCA Format** | The Markdown template for generated root cause analyses | [RCA Format](./rca-format.md) |

Some tabs depend on your edition and settings:

- **Security** and **Memory Policy** are available in the Enterprise edition.
- **Gateway** appears when the AI Gateway is enabled for your tenant.
- **Memory** and **Account Context** tabs appear here only when the tenant feature **Memory across conversations** is off. When it is on, they live in [b-Cortex](./b-cortex.md).

## Who can open each tab

Tenant admins (including read-only tenant admins) can open every tab. Other users can open a tab when their role grants read access to its module — **ai** for Agents, Tools & MCP, Budgets & Limits, Memory Policy and RCA Format; **integrations** for Providers; **egressfilter** for Security. A tab you can't open is shown disabled with a *missing permission* tooltip. Changing settings needs write access as described on each page.

## Tenant view and account view

Most tabs have an account selector at the top right.

| Selection | Chip next to the title | What you see and change |
|---|---|---|
| **All accounts** | **Tenant** | Everything in the tenant, with an **Account** column. Tenant admins can make tenant-wide changes; other users see **Tenant · Read-only** and must pick an account to make changes. |
| One account | **Tenant** + the account name | That account only. Changes apply to this account. |

Some tabs, such as **RCA Format**, are configured per account and ask you to **Select an account** first.

## Providers

**AI & Tools → Providers** lists the LLM provider configurations NuBi can use. It is read-only — the banner links to **Admin → Integrations → LLM**, where you add and edit providers. See [LLM Integrations](../../integrations/LLM/index.md).

| Column | Meaning |
|---|---|
| **Name** | The provider configuration |
| **Account** | The account it belongs to |
| **Created By** / **Updated By** | Who created and last changed it |
| **Status** | Enabled or Disabled |

A **Default** chip marks the tenant default: accounts that don't have their own default use this configuration. Filter by **Status** or by name.

## Related

- [What NuBi Can Do](./nubi.md)
- [b-Cortex: Memory and Knowledge](./b-cortex.md)
