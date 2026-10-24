---
sidebar_position: 7
sidebar_label: Observability
keywords: [vm metrics, vm service map, vm traces, vm events, alertmanager vm, prometheus vm agent, node agent vm]
---

# Observability for self-hosted VMs

The **Metrics**, **Service Map**, **Traces** and **Events** tabs show data from sources you connect to the account. Package inventory and vulnerabilities don't need any of them.

| Tab | Needs |
|---|---|
| **Metrics** | A metrics store (Prometheus, VictoriaMetrics and others) connected to the account, with VMs reporting to it |
| **Service Map** | The same metrics store, with the NudgeBee node agent on each VM |
| **Traces** | A trace store (Jaeger, Tempo, Elasticsearch and others) |
| **Events** | A Prometheus Alertmanager webhook linked to the account |

A store that only the proxy agent can reach (inside your network) is connected with **connection mode: VM agent**. Make it the account's default metrics or log provider.

## Metrics

Pick a **Virtual machine** (remembered per account) and a date range. Panels: **CPU**, **Memory**, **Disk I/O**, **Disk space**, and **Services** — the latest value per service (CPU, memory, disk used and repository).

**Link repository** on a service connects it to a repository from a connected GitHub or GitLab integration.

Empty states:

- *No metrics source connected* — connect a metrics store (**Open Integrations**).
- *Metrics store unreachable* — the store couldn't be reached.
- *No VM is reporting metrics yet. Install the node agent on a VM and point its metrics at the connected store.*

## Service Map

Calls between services on your VMs — systemd services, containers and processes — and to external hosts. Choose a window (15m, 1h, 6h, 24h), a **VM**, and the **Red Edges** and **Idle services** switches. Calls from hosts without the node agent aren't seen. With nothing in the window: *No calls seen in this window*.

## Traces

The traces list for the account, with the service filter seeded from the service map. Without a trace store: *No trace store connected* (**Open Integrations**).

## Events

Alerts posted to the account's Alertmanager webhook, attached to their VM and grouped like other events. See [Events & Triage Inbox](../troubleshooting/events-and-triage-inbox.md).

## Data source status

**Agent Health → Proxy Agent** shows a card each for metrics, logs and alerts, with **Connected**, **No data**, **Not connected**, **Unreachable** or **Check failed**. For example, *No log store is connected to this account* means add a Loki integration and make it the default log provider. See [Agent Health](../../installation/agent/operate/agent-health.md#self-hosted-vm-accounts).

## Related

- [Self-hosted VMs](./index.md)
- [Troubleshooting](./troubleshooting.md)
- [Alertmanager webhook](../../integrations/Webhooks/index.md)
