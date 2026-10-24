---
sidebar_position: 4
sidebar_label: Virtual Machines
keywords: [vm list, scan vm, decommission vm, recommission, reach through, vm scan status]
---

# Virtual Machines

**Infra → VM → Virtual Machines**

## The list

| Column | Meaning |
|---|---|
| **Name** | The VM (VMs found by a network sweep are named by their IP address) |
| **Host / Resource ID** | Private IP, host or resource ID |
| **Operating System** | From the package inventory |
| **Status** | Green when active or running; red when stopped, terminated or deallocated |
| **Metrics** | CPU and memory mini gauges — click for the VM's metrics dialog |
| **Packages** | Package count, or **Not scanned** |
| **Open Vulnerabilities** | Open Critical, High and Medium findings |
| **Last Scan** | When the last inventory was collected; **Scanning…** while a scan runs, or **Scan failed** (hover for the reason) |

Search with **Search By Name Or Resource ID**, or **Download** the list. Expand a row for its **Vulnerabilities**, **Packages** and **Events**. Opened from a vulnerability, the list shows only the VMs it affects.

With no VMs yet: *No virtual machines yet — VMs appear here once a proxy agent has reported them for this account.* See [Troubleshooting](./troubleshooting.md).

## Scan

Scans run automatically once a day. To scan now (needs write access):

- **Scan** in the toolbar scans the whole account — *Scan account for vulnerabilities* → **Start scan**. Results appear as each VM finishes. With no discovery datasource the toolbar Scan reports *no discovery agent is configured to scan this account*.
- **Scan** on a row scans one VM — *Scan VM for vulnerabilities*. Choose the discovery datasource in **Reach through** (preselected when there is only one), then **Start scan**. The row shows progress until the scan finishes. With no discovery datasource the dialog says *No forager discovery datasource is configured for this account*.

A per-VM scan fails after about 90 seconds if the inventory doesn't complete. The page stops refreshing after about 16 minutes — reload to see the final state. See [How scanning works](./how-scanning-works.md) for timing and the content pack version a per-VM scan needs.

## Decommission and Recommission

**Decommission** (needs write access) marks a VM **Inactive** and archives its packages and all its findings, including dismissed ones. Nothing is deleted, and later scans skip the VM even if it still answers. **Recommission** brings it back; the next scan brings its packages and findings back, with findings as **Open**.

## Related

- [Vulnerabilities](./vulnerabilities.md)
- [Packages](./packages.md)
- [How scanning works](./how-scanning-works.md)
