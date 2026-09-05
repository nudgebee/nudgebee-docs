---
sidebar_position: 5
sidebar_label: Tools & MCP
---

# Tools & MCP

**Admin → AI & Tools → Tools & MCP**

What NudgeBee's agents are able to *do*. Tools are the individual capabilities an agent can call — fetch logs, query metrics, run a kubectl command — and MCP servers are external tool providers plugged in over the Model Context Protocol.

<!-- ![Tools & MCP tab listing available tools with status and type](./img/tools-and-mcp.png) -->

## Tools

Two sub-views, switched at the top of the tab.

### Reading the list

| Column | Meaning |
|---|---|
| **Name** | The tool's identifier. |
| **Description** | What it does, and what an agent uses it for. |
| **Status** | Whether the tool is usable. |
| **NB Tool Type** | System-generated or user-created. |
| **Account** | Which account the tool belongs to, in the tenant-wide view. |

Filter by **System Generated** or **User Created**. System tools ship with the platform; user-created tools are ones your tenant added.

An account filter narrows the list to one account, or leave it unset for a tenant-wide view.

### Tools needing configuration

A tool can exist but not be usable, because it depends on an integration that has not been set up — a metrics tool with no metrics backend connected, for example. Those rows carry a warning icon:

> This tool requires additional configuration. Please visit the Integrations page to provide missing values or contact your Organization Admin for assistance.

An agent will not be able to use a tool in that state, which is the usual explanation when an investigation says it could not fetch something you know exists. Fix it at [Admin → Integrations](../../integrations/index.md).

### Adding a tool

Create, edit and delete user-created tools from this tab.

## MCP Servers

The MCP sub-view lists the Model Context Protocol servers connected to the tenant, and is **read-only**.

Manage MCP servers at **Admin → Integrations → MCP** — the tab links straight there. See [MCP Integration](../../integrations/MCP/index.md) for connecting one.

## Related

- [AI & Pre-built Agents](./index.md)
- [MCP Integration](../../integrations/MCP/index.md)
- [Integrations](../../integrations/index.md)
