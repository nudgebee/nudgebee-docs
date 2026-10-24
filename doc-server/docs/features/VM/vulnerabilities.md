---
sidebar_position: 5
sidebar_label: Vulnerabilities
keywords: [vm vulnerabilities, cve, known exploited, kev, package vulnerability, dismiss vulnerability, vm security]
---

# Vulnerabilities

**Infra → VM → Vulnerabilities**

Each finding is an installed package version that matches a known vulnerability (CVE).

## Views

**Group vulnerabilities by** **All** (one row per finding), **Vulnerability**, **Package** or **VM**. Grouped rows show how many findings they hold; expand one for its **Findings**.

| Column | Meaning |
|---|---|
| **Severity** | Critical, High, Medium, Low or Info |
| **Vulnerability** | The CVE, marked **Known exploited** when it is on the known-exploited list |
| **Package** | Package name, with its type and architecture |
| **Installed** / **Fixed In** | Installed version, and the version that fixes it (**No fix** when none is available) |
| **CVSS** | Score |
| **Last Seen** | When the last scan saw it |
| **Status** | **Open** or **Dismissed** |

Filter by **Severity**, **Status** (**Open** or **Dismissed / snoozed**), **VM** and **Package**. Links from Summary or Virtual Machines open this tab already filtered (a vulnerability filter shows as a removable chip).

## Actions

From a row's menu, or the detail panel that opens when you click a row:

- **Create Ticket** — files a ticket (shows the ticket ID once created; needs access to the account).
- **Ask NuBi** — an icon on every row, and in the detail panel.
- **Dismiss / snooze** or **Reactivate** — needs write access. Dismissals are kept across rescans while the finding is still present; a finding that disappears and later reappears comes back Open. Decommissioning a VM archives its findings, dismissed ones included.
- **Apply Patch** — *Coming Soon*.

With no findings: *No open vulnerabilities — Findings appear here after a VM package scan matches installed packages against the CVE database.*

## Across accounts

**Optimize → Security → VM Vulnerabilities** shows the same findings for every self-hosted account, with an **Account** column and filter. See [Optimize → Security](../optimizations/security.md).

## Related

- [How scanning works](./how-scanning-works.md)
- [Packages](./packages.md)
- [Virtual Machines](./virtual-machines.md)
