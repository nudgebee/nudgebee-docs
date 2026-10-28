---
sidebar_position: 9
sidebar_label: Troubleshooting
keywords: [vm list empty, no virtual machines, vm scan failed, no discovery datasource, proxy agent not connected vm]
---

# Troubleshooting self-hosted VMs

| What you see | Why | What to do |
|---|---|---|
| *No virtual machines yet* | No scan has found anything: no proxy agent is connected, or it has no discovery datasource | Check **Agent Health → Proxy Agent**, then add a [discovery datasource](../../installation/proxy-agent/discovery.md) and run **Scan** |
| *No forager discovery datasource is configured for this account* (Scan VM dialog) or *no discovery agent is configured to scan this account* (toolbar Scan) | The proxy agent has no discovery datasource, or it isn't enabled | Configure one on the agent — see [Discovery datasource](../../installation/proxy-agent/discovery.md) |
| *A discovery agent is connected but hasn't yet reported scan targets* | The agent just started, or `allowed_hosts` is empty | Wait a moment and retry, or restart the proxy agent; check `allowed_hosts` |
| A VM you expected is missing | It's outside `allowed_hosts`, powered off, none of ports 22, 3389 or 5985 is open from the agent, or the SSH login or inventory failed (a host is listed only after a successful inventory) | Fix the range, the firewall or the SSH user and key, then **Scan** |
| **Scan failed** on a VM | No packages were returned, the OS isn't supported, the content pack version is missing, or (per-VM Scan only) the SSH login failed or didn't finish in about 90 seconds | Hover the status for the reason. Check the SSH user and key exist on the VM, and `linux-inventory-v2.yaml` is in `pack_dir` |
| **Packages** shows **Not scanned** | Inventory never completed for that VM | Check SSH access and the content pack, then **Scan** that VM |
| VMs are named by IP address | Discovered VMs aren't linked to a cloud resource yet | Expected for now |
| *Metrics are not connected* / *No metrics source connected* | No metrics store for the account | See [Observability](./observability.md) |
| *Alertmanager is not connected* | No Alertmanager webhook linked to the account | Add a Prometheus Alertmanager integration and link it to the account |
| *Get started with Proxy Agent monitoring* (Agent Health) | No proxy agent for this account | **Connect VM Agent**, or see [Set up self-hosted VMs](./setup.md), step 2 |
| *No proxy agent installed* (Agent Health) | Health data exists but no proxy agent integration is listed for the account | Check the proxy agent integration in **Admin → Integrations → Servers** |

Your IDS may flag the sweep: allowlist the proxy agent's IP before you enable discovery, and expect `sshd` to log *Did not receive identification string* for each probe.

## Related

- [Set up self-hosted VMs](./setup.md)
- [How scanning works](./how-scanning-works.md)
- [Proxy Agent troubleshooting](../../installation/proxy-agent/troubleshooting.md)
