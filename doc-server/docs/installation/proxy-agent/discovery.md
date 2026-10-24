---
sidebar_position: 4.5
sidebar_label: Discovery Datasource
keywords: [discovery datasource, vm discovery, network sweep, package inventory, content pack, pack_public_key, allowed_hosts, self-hosted vm]
---

# Discovery Datasource

A `discovery` datasource turns a proxy agent into the collector for a [self-hosted VM account](../../features/VM/index.md). It finds the VMs in its network ranges and reads their OS and package inventory over SSH. Nothing is installed on the VMs.

You configure it on the proxy agent — in its YAML config or Helm values — not in the NudgeBee UI. When the agent starts with it, the datasource registers with NudgeBee automatically and appears in **Agent Health → Proxy Agent**. NudgeBee decides when to sweep and scan; the agent keeps no state between runs.

We recommend a separate proxy agent for discovery rather than adding it to an agent that already serves databases: it uses different credentials, and a sweep misconfiguration can't then affect anything else.

## Example (Helm)

```yaml
forager:
  relayURL: wss://relay.nudgebee.com/register
  signingPublicKey: ''

  datasources:
    - type: discovery
      name: segment-a

      # Every network range this agent may sweep or inventory.
      # Requests for anything outside are refused. Bare addresses mean one host.
      allowed_hosts:
        - 10.0.1.0/24

      discovery:
        pack_public_key: ''          # verifies the signed content pack (required for inventory)
        pack_dir: /etc/nudgebee/packs
        # known_hosts_file: /etc/nudgebee/known_hosts
        max_rate_pps: 100            # ceiling on sweep probes per second
        concurrency: 25              # SSH sessions at once during inventory

      credential_source: local
      credentials:
        username: nudgebee-ro        # read-only SSH user on the VMs
        private_key_file: /etc/nudgebee/ssh/id_ed25519

# Mount the signed content pack read-only
extraVolumes:
  - name: packs
    configMap:
      name: forager-packs
extraVolumeMounts:
  - name: packs
    mountPath: /etc/nudgebee/packs
    readOnly: true
```

Install it as its own release, passing the access key and secret from the UI:

```bash
helm install forager-discovery oci://ghcr.io/nudgebee/charts/forager \
  -f values-discovery.yaml \
  --set forager.accessKey=<ACCESS_KEY> --set forager.accessSecret=<ACCESS_SECRET>
```

With a local YAML config, put the same datasource block under `datasources:` — see [Configuration](./configuration.md).

## Settings

| Key | Required | Meaning |
|---|---|---|
| `allowed_hosts` | Yes | Network ranges (CIDRs) or single addresses the agent may sweep and inventory. NudgeBee only schedules sweeps when this is set. |
| `discovery.pack_public_key` | For inventory | Public key that verifies the content pack. Without it, inventory refuses to run. |
| `discovery.pack_dir` | For inventory | Folder holding the signed pack, named `linux-inventory-v<N>.yaml` |
| `discovery.known_hosts_file` | No | Verify SSH host keys against this file. Off by default, because discovered hosts' keys are usually unknown and change when a VM is re-imaged. |
| `discovery.max_rate_pps` | No | Maximum sweep rate in probes per second (default 1000; each sweep asks for 100 unless lowered). Lower it for fragile or monitored networks. |
| `discovery.concurrency` | No | Concurrent SSH sessions during inventory |
| `discovery.ssh_access` | No | Also expose these hosts for ad-hoc SSH commands with the same credentials. Off by default; needs a signing key, `known_hosts_file` and a non-empty `allowed_hosts`. |
| `credentials.username` | For inventory | Read-only SSH user that exists on the VMs |
| `credentials.private_key_file` or `credentials.private_key` | For inventory | SSH key (prefer the file, mounted from a Secret; setting both is an error) |

For a sweep-only agent, leave out the credentials.

## The content pack

Inventory commands come from a signed **content pack**, not from the agent itself, so adding OS support never needs an agent upgrade. The agent verifies the pack's signature with `pack_public_key` before running it. Ask NudgeBee support for the signed Linux inventory pack and its public key, then mount the pack into `pack_dir`, for example:

```bash
kubectl create configmap forager-packs \
  --from-file=linux-inventory-v1.yaml=./linux-inventory-v1.yaml
```

## Before you enable it

- A sweep makes plain TCP connections to ports 22, 3389 and 5985 across `allowed_hosts`. Allowlist the agent's IP in your IDS first: an unannounced sweep looks like an attack, and `sshd` logs *Did not receive identification string* for each probe, which some fail2ban setups act on.
- The agent needs no extra privileges for sweeping.
- Directory (LDAP / Active Directory) discovery isn't used yet; VMs are found by the sweep only.

## Related

- [Self-hosted VMs](../../features/VM/index.md)
- [How scanning works](../../features/VM/how-scanning-works.md)
- [Configuration](./configuration.md)
