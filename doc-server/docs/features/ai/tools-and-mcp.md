---
sidebar_position: 5
sidebar_label: Tools & MCP
---

# Tools & MCP

**AI & Tools → Tools & MCP**

What NudgeBee's agents are able to *do*. Tools are the individual capabilities an agent can call — fetch logs, query metrics, run a kubectl command. MCP servers are external tool providers plugged in over the Model Context Protocol. Automations can also be offered to NuBi as tools.

Switch between three views at the top of the tab: **Tools**, **MCP Servers** and **Automations**.

<!-- ![Tools & MCP tab listing available tools with status and type](./img/tools-and-mcp.png) -->

## Tools

### Reading the list

| Column | Meaning |
|---|---|
| **Name** | The tool's identifier |
| **Description** | What it does, and what an agent uses it for |
| **Status** | Whether the tool is usable |
| **Approval** | Whether a call asks a person first: **Always asks**, **Auto (per call)** — reads run, calls that change something ask — or **Never asks**. A [Tool Approvals](./tool-approvals.md) rule can skip the prompt for specific calls |
| **NB Tool Type** (account view) | System-generated or user-created |
| **Account** (tenant view) | Which account the tool belongs to |
| **Actions** | **Who can use it**, **Edit tool**, **Delete tool** for tools you created |

Filter by **Created By** (**System Generated** or **User Created**), **Approval** and **Status**, or search with **Search Tool**. Pick an account at the top right, or leave **All accounts** for the tenant view.

### Tools needing configuration

A tool can exist but not be usable, because it depends on an integration that has not been set up — a metrics tool with no metrics backend connected, for example. Those rows carry a warning icon:

> This tool requires additional configuration. Please visit the Integrations page to provide missing values or contact your Organization Admin for assistance.

An agent will not be able to use a tool in that state, which is the usual explanation when an investigation says it could not fetch something you know exists. Fix it at [Admin → Integrations](../../integrations/index.md) — the **Integration** button on this tab goes there.

### Create a tool

**Create Tool** adds a tool that runs your own container image as a pod in the account's Kubernetes cluster. NuBi gets the container's standard output. Leave **Read-only** on unless the tool changes something — then every call asks for approval and alert investigations never run it. See **[Custom Tools](./custom-tools.md)** for the fields and how it runs.

## MCP Servers

Lists the MCP servers connected to the tenant. Add or edit servers at **Admin → Integrations → MCP** (**Manage in Integrations**); see [MCP Integration](../../integrations/MCP/index.md).

| Column | Meaning |
|---|---|
| **Name** | The MCP server |
| **Connection** | How NudgeBee reaches it |
| **Account** | The account it belongs to |
| **Created By** | Who added it |
| **Status** | Enabled or disabled |
| **Health** | **Connected**, **Not checked yet**, **Error**, **Can't reach server** or **Login rejected**, with the reason, tool count and when it was checked |
| **Needs approval** | Which of its tools ask for approval |

Row actions:

- **Check now** — test the connection again (needs permission to run integrations).
- **Manage** (tenant admins) — open *Tools that need approval* and choose which of the server's tools must ask a person before they run. Listed tools always ask; the others never ask.

Filter by **Status** or by name.

## Automations

Automations NuBi can run as tools. Create and edit automations in **[Automations](../workflow-builder/index.md)** (**Open Automations**); this view controls whether NuBi may use them.

| Column | Meaning |
|---|---|
| **Name**, **Account** | The automation |
| **Offered to Nubi** | Whether NuBi can run it |
| **Approval** | Whether a run asks first |
| **Created By** | Who created the automation |

**Manage** opens *Nubi settings* with two switches: **Nubi can run it** and **Runs without asking**. Filter by **Offered to Nubi** or by name.

## Related

- [AI & Tools](./ai-and-tools.md)
- [Tool Approvals](./tool-approvals.md) — automatic approval rules for specific commands
- [Agents & Custom Agents](./custom-agents.md)
- [MCP Integration](../../integrations/MCP/index.md)
- [Integrations](../../integrations/index.md)
