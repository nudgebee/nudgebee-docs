---
sidebar_position: 3
sidebar_label: Summary
keywords: [vm summary, vm fleet, scan coverage, open vulnerabilities, packages tracked]
---

# Summary

**Infra → VM → Summary**

## Counts

| Tile | Meaning | Opens |
|---|---|---|
| **Virtual Machines** | VMs in the account | Virtual Machines |
| **Proxy Agents Connected** | Connected proxy agents, out of all agents for the account | Agent Health → Proxy Agent |
| **Packages Tracked** | Distinct packages across all VMs | Packages |
| **Open Vulnerabilities** | Open package findings | Vulnerabilities |
| **Last Scan** | The most recent package inventory collected | — |

## Utilization & Health

Pick a VM and a window (**Last 1 Hour**, **6 Hours**, **24 Hours**) to see CPU and memory gauges with total, usage, P50, P90 and max. This needs a metrics source — without one the card shows *Metrics are not connected* with **Connect metrics**. See [Observability](./observability.md).

## Events/Errors

Event counts by severity, with **View all**. Without an Alertmanager webhook the card shows *Alertmanager is not connected* with **Connect Alertmanager**. If the webhook integration is disabled, it shows *Alertmanager webhook is disabled* with **Manage**; alerts sent to it are dropped until you enable it.

## Security

| Card | Shows |
|---|---|
| **Vulnerabilities by severity** | Open findings by severity; click a severity to open Vulnerabilities filtered to it |
| **Scan coverage** | **Inventoried** (VMs with a package inventory) and **Never scanned** (no inventory collected yet) |
| **Operating systems** | OS mix across the fleet, collected with the package inventory |
| **Most vulnerable VMs**, **Most affected packages**, **Most common vulnerabilities** | The top five of each; each row opens the matching filtered view |

"Scanned" here means a package inventory was collected. With no findings yet: *No open findings. Scan a VM to match its packages against the CVE database.*

## Related

- [Virtual Machines](./virtual-machines.md)
- [Vulnerabilities](./vulnerabilities.md)
- [How scanning works](./how-scanning-works.md)
