---
sidebar_position: 8
sidebar_label: How Scanning Works
keywords: [vm scan schedule, network sweep, package inventory ssh, cve matching, vm scan failed, content pack]
---

# How scanning works

A scan has three steps. Nothing is installed on the VMs.

1. **Sweep** — the proxy agent's discovery datasource looks for hosts in its allowed network ranges by opening plain TCP connections to ports 22, 3389 and 5985 (rate limited, about 100 probes per second by default). Every host that answers becomes a VM in the account. IPv4 only; a host that is powered off or has none of those ports open isn't found.
2. **Inventory** — the agent connects to each VM over SSH with the discovery datasource's read-only user and runs the signed Linux inventory content pack to read the OS and installed packages.
3. **Match** — NudgeBee matches the packages against known vulnerabilities and records each match as a finding.

## When scans run

- **Automatically once a day**, for every enabled discovery datasource.
- **On demand** with **Scan** on the Virtual Machines tab — for the whole account or one VM.

A scan that hasn't finished after about 15 minutes is marked **Scan failed**.

## What is scanned

- **Linux** VMs with **deb** or **rpm** packages. Packages on other operating systems aren't matched yet; an unsupported OS is reported as a failed scan.
- Kernel headers, tools and documentation packages are listed but not matched, since they don't run.
- If a scan returns no packages, it is marked failed and the previous inventory is kept.
- Severity is Critical, High, Medium, Low or Info (unknown or negligible severities show as Info).
- Dismissed findings stay dismissed on later scans.
- Decommissioned VMs are skipped.

## Related

- [Virtual Machines](./virtual-machines.md)
- [Discovery datasource](../../installation/proxy-agent/discovery.md)
- [Troubleshooting](./troubleshooting.md)
