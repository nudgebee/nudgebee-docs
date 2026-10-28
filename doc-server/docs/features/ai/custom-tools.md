---
sidebar_position: 5.2
sidebar_label: Custom Tools
---

# Custom Tools

**AI & Tools → Tools & MCP → Tools → Create Tool**

A custom tool lets NuBi run your own container image — a script that checks something specific to your environment, a CLI your team relies on, a report you want on demand. Once created, NuBi can find and call it like any built-in tool.

Two other ways to give NuBi new capabilities: connect an **[MCP server](../../integrations/MCP/index.md)** (Admin → Integrations → MCP), or offer an **automation** to NuBi (see [Tools & MCP → Automations](./tools-and-mcp.md#automations)).

## How a custom tool runs

| | |
|---|---|
| **Where** | As a new pod in the account's **Kubernetes cluster**, started by the NudgeBee agent. The account must be a Kubernetes account with a connected agent — otherwise the call fails with *agent not connected*. |
| **Image** | Pulled by the cluster's nodes, so it must be public or pullable with the cluster's existing registry credentials. |
| **Input** | NuBi can pass a **command** (overriding the configured one) and **environment variables**, and can override the image. There is no stdin. |
| **Command** | The command NuBi passes, else the tool's **Container Command**, else the image's `ENTRYPOINT`. |
| **Output** | The container's **standard output** is returned to NuBi. Standard error is not returned, and a non-zero exit code is not treated as a failure — print what NuBi needs to stdout. |
| **Time limit** | 120 seconds by default. |
| **Caching** | None — every call runs the container again. |

## Create a tool

**Create Tool** (needs write access to the account; tenant admins can also create from the tenant-wide view) opens *Add Tool*:

| Field | What to enter |
|---|---|
| **Name** | 3–50 characters: letters, digits and underscores, starting with a letter. Must be unique and can't match a built-in tool or agent. |
| **Description** | What the tool does and what it returns. NuBi decides when to use the tool from this, so be specific. |
| **Who can use it** | Tenant admins: **This account** (only this account), **Organisation** (every account; an account admin can switch it off for theirs) or **Selected accounts**. Change it later with **Who can use it** on the row. |
| **Container Image** | For example `alpine:latest` or `myrepo/myimage:tag` |
| **Container Command (Optional)** | For example `/bin/sh` or `printenv` — overrides the image's `ENTRYPOINT` |
| **Read-only** | On by default. See below. |

Click **Submit**. When you edit a tool, a **Status** field (**Enabled** / **Disabled**) also appears.

### Read-only and approvals

| Read-only | What happens |
|---|---|
| **On** | The tool runs without asking (**Never asks**). |
| **Off** | The tool changes something: NuBi asks for approval before every call (**Always asks**), and automatic alert investigations never run it. A [Tool Approvals](./tool-approvals.md) rule can skip the approval for specific calls. |

Only a tenant admin or super admin can turn a tool that changes things back to read-only.

## Using it

- **NuBi** finds enabled custom tools on its own when a question needs them.
- **Custom agents** — select the tool when you [create or edit the agent](./custom-agents.md#create-a-custom-agent).
- **Built-in agents** — give one the tool with [Add tools](./custom-agents.md#add-tools-to-a-built-in-agent).

Edit, delete or share a tool from its row in **Tools & MCP → Tools**.

## Related

- [Tools & MCP](./tools-and-mcp.md)
- [Tool Approvals](./tool-approvals.md)
- [MCP integration](../../integrations/MCP/index.md)
