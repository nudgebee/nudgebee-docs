---
sidebar_position: 8
sidebar_label: How Scanning Works
keywords: [vm scan schedule, network sweep, package inventory ssh, cve matching, vm scan failed, content pack]
---

# How scanning works

A scan has three steps. Nothing is installed on the VMs.

1. **Sweep** — the proxy agent's discovery datasource looks for hosts in its allowed network ranges by connecting to ports 22, 3389 and 5985 (rate limited, about 100 probes per second by default). When SSH credentials are set, it also logs in to responding hosts to read their cloud identity. IPv4 only; a host that is powered off or has none of those ports open isn't found.
2. **Inventory** — the agent connects to each responding host over SSH with the discovery datasource's read-only user and runs the signed Linux inventory content pack to read the OS and installed packages. **A host becomes a VM in the account only after a successful inventory** — a host that only answers the sweep isn't listed, so an agent without SSH credentials adds no VMs.
3. **Match** — NudgeBee matches the packages against known vulnerabilities and records each match as a finding.

## When scans run

- **Automatically once a day**, for every enabled discovery datasource.
- **On demand** with **Scan** on the Virtual Machines tab — for the whole account or one VM.

Timing:

- A per-VM **Scan** fails after about 90 seconds if the inventory doesn't complete.
- A scan left in the started state is marked failed after about 20–25 minutes.
- The page stops refreshing scan progress after about 16 minutes — reload to see the final state.

## Which content pack version

Daily and account scans use the highest pack version in `pack_dir`. A per-VM **Scan** asks for **version 2**, so it needs `linux-inventory-v2.yaml` in `pack_dir` — with only an older pack, per-VM scans are refused.

## What is scanned

- **Linux** VMs with **deb** or **rpm** packages. Packages on other operating systems aren't matched yet; an unsupported OS is reported as a failed scan.
- Kernel headers, tools and documentation packages are listed but not matched, since they don't run.
- If a scan returns no packages, or the OS isn't supported, it is marked failed on every kind of scan and the previous inventory is kept.
- An SSH login failure during a daily or account scan doesn't mark the VM failed — it keeps its previous inventory. Only a per-VM **Scan** shows the SSH failure.
- Severity is Critical, High, Medium, Low or Info (unknown or negligible severities show as Info).
- Dismissed findings stay dismissed on later scans while the finding is still present. If it disappears and later reappears, it comes back as Open.
- Decommissioned VMs are skipped.

## Related

- [Virtual Machines](./virtual-machines.md)
- [Discovery datasource](../../installation/proxy-agent/discovery.md)
- [Troubleshooting](./troubleshooting.md)
