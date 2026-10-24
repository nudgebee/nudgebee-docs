---
sidebar_position: 1
sidebar_label: Overview
keywords: [self-hosted vm, virtual machines, bare metal, vm account, infra vm, vm vulnerabilities, package inventory]
---

# Self-hosted VMs

**Infra → VM**

A self-hosted VM account groups standalone virtual machines and bare-metal hosts that sit outside a cloud account. NudgeBee reaches them through a [proxy agent](../../installation/proxy-agent/index.md) (Forager) running in your network, rather than through a cloud provider API. Nothing is installed on the VMs themselves: the proxy agent finds them on the network and reads their package inventory over SSH.

What you get:

- **Package inventory** — the OS and installed packages of each VM.
- **Vulnerability detection** — installed packages matched against known CVEs.
- **Metrics, events, traces and a service map** — when you connect the matching data sources (see [Observability](./observability.md)).

## Before you start

A self-hosted VM account needs three things, in this order. [Set up self-hosted VMs](./setup.md) walks through them.

1. A **self-hosted account** in NudgeBee.
2. A **proxy agent** linked to that account and running on a machine that can reach the VMs.
3. A **discovery datasource** on that proxy agent — this is what finds the VMs and collects their packages. A proxy agent on its own does not list any VMs.

## The VM page

Pick the account in the header account selector (group **Self-hosted VMs**). The page has these tabs:

| Tab | What it shows |
|---|---|
| **Summary** | Fleet counts, utilization, events and a security overview — see [Summary](./summary.md) |
| **Virtual Machines** | Every VM, its packages, open vulnerabilities and scan status — see [Virtual Machines](./virtual-machines.md) |
| **Vulnerabilities** | Package vulnerabilities across the account — see [Vulnerabilities](./vulnerabilities.md) |
| **Packages** | Installed packages across the account — see [Packages](./packages.md) |
| **Service Map**, **Traces**, **Events**, **Metrics** | Observability data from the sources you connect — see [Observability](./observability.md) |

The proxy agents for the account are shown in **Agent Health → Proxy Agent**, not on this page.

If the tenant has no self-hosted account yet, the page shows *Get started with self-hosted VMs* with an **Add Self-Hosted Account** button (users without write access see *Need admin permission to add a self-hosted account*).

Home also shows a **VM fleet** card for the selected self-hosted account, with **View all** linking here.

## Permissions

- Users with a custom role need read access to the **cloud** module to open **Infra → VM**.
- **Scan**, **Decommission**, **Recommission** and **Dismiss** need write access to the account.

## What isn't available yet

- Package scanning supports **Linux deb and rpm** packages only.
- VMs are found by a network sweep. Directory (LDAP / Active Directory) discovery isn't used yet.
- **Apply Patch** shows *Coming Soon*.
- A discovered VM can't yet be linked to an existing cloud resource from the UI, so it appears named by its IP address.
- Proxy agents don't show an "update available" notice.

## Related

- [Set up self-hosted VMs](./setup.md)
- [How scanning works](./how-scanning-works.md)
- [Troubleshooting](./troubleshooting.md)
- [Proxy Agent](../../installation/proxy-agent/index.md)
