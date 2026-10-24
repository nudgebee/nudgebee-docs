---
sidebar_position: 6
sidebar_label: Packages
keywords: [vm packages, package inventory, deb, rpm, installed packages]
---

# Packages

**Infra → VM → Packages**

Every package found on the account's VMs by the last scan.

| Column | Meaning |
|---|---|
| **Package** / **Version** / **Architecture** | The installed package |
| **Type** | `deb` or `rpm` |
| **Source** | Where the package came from |
| **Operating System** / **VM** | Where it is installed |
| **Last Seen** | When the last scan saw it |

Search with **Search By Package Name**, filter by **Package Type** (deb or rpm) and **VM**, or **Download** the list. A VM's row on **Virtual Machines** has the same list for that VM.

With no inventory yet: *No package inventory — Run a scan on a VM to collect its installed packages.*

## Related

- [Vulnerabilities](./vulnerabilities.md)
- [How scanning works](./how-scanning-works.md)
