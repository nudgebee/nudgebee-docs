---
sidebar_position: 9
sidebar_label: Troubleshooting
keywords: [vm list empty, no virtual machines, vm scan failed, no discovery datasource, proxy agent not connected vm]
---

# Troubleshooting self-hosted VMs

| What you see | Why | What to do |
|---|---|---|
| *No virtual machines yet* | No scan has found anything: no proxy agent is connected, or it has no discovery datasource | Check **Agent Health → Proxy Agent**, then add a [discovery datasource](../../installation/proxy-agent/discovery.md) and run **Scan** |
| *No forager discovery datasource is configured for this account* | The proxy agent has no discovery datasource, or it isn't enabled | Configure one on the agent — see [Discovery datasource](../../installation/proxy-agent/discovery.md) |
| *A discovery agent is connected but hasn't yet reported scan targets* | The agent just started, or `allowed_hosts` is empty | Wait a moment and retry, or restart the proxy agent; check `allowed_hosts` |
| A VM you expected is missing | It's outside `allowed_hosts`, powered off, or none of ports 22, 3389 or 5985 is open from the agent | Fix the range or the firewall, then **Scan** |
| **Scan failed** on a VM | SSH login failed, the OS isn't supported, no packages were returned, or the scan ran past about 15 minutes | Hover the status for the reason. Check the SSH user and key exist on the VM, and the content pack is in place |
| **Packages** shows **Not scanned** | Inventory never completed for that VM | Check SSH access and the content pack, then **Scan** that VM |
| VMs are named by IP address | Discovered VMs aren't linked to a cloud resource yet | Expected for now |
| *Metrics are not connected* / *No metrics source connected* | No metrics store for the account | See [Observability](./observability.md) |
| *Alertmanager is not connected* | No Alertmanager webhook linked to the account | Add a Prometheus Alertmanager integration and link it to the account |
| *No proxy agent installed* (Agent Health) | No proxy agent for this account | [Set up self-hosted VMs](./setup.md), step 2 |

Your IDS may flag the sweep: allowlist the proxy agent's IP before you enable discovery, and expect `sshd` to log *Did not receive identification string* for each probe.

## Related

- [Set up self-hosted VMs](./setup.md)
- [How scanning works](./how-scanning-works.md)
- [Proxy Agent troubleshooting](../../installation/proxy-agent/troubleshooting.md)
