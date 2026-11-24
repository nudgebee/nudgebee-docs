---
sidebar_position: 4.5
sidebar_label: Discovery Datasource
keywords: [discovery datasource, vm discovery, network sweep, package inventory, content pack, pack_public_key, allowed_hosts, known_hosts_file, host_key_policy, accept-new, self-hosted vm]
---

# Discovery Datasource

A `discovery` datasource turns a proxy agent into the collector for a [self-hosted VM account](../../features/VM/index.md). It finds the VMs in its network ranges and reads their OS and package inventory over SSH. Nothing is installed on the VMs.

You configure it on the proxy agent — in its YAML config or Helm values — not in the NudgeBee UI. On a new install, the Linux and macOS install scripts write one for you (see [Set up self-hosted VMs](../../features/VM/setup.md#3-what-the-linux-and-macos-install-sets-up)); this page is the reference for writing or changing one by hand. When the agent starts with it, the datasource registers with NudgeBee automatically and appears in **Agent Health → Proxy Agent**. NudgeBee decides when to sweep and scan; the agent keeps no state between runs.

NudgeBee sweeps the discovery network within about a minute of the agent connecting, reconnecting or restarting, and after a config push from NudgeBee creates or changes a discovery datasource. These sweeps are limited to one every few minutes per account; the daily scan and the **Scan** button still run as before.

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
        pack_public_key: ''          # optional: when set, packs must be signed with this key
        pack_dir: /etc/nudgebee/packs
        # known_hosts_file: /etc/nudgebee/known_hosts
        max_rate_pps: 100            # ceiling on sweep probes per second
        concurrency: 25              # SSH sessions at once during inventory

      credential_source: local
      credentials:
        username: nudgebee-ro        # read-only SSH user on the VMs
        private_key_file: /etc/nudgebee/ssh/id_ed25519

# Mount the content pack read-only
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

## Example (local YAML)

This is what the Linux install script writes on a new install (macOS uses `/usr/local/etc/nudgebee` instead of `/etc/nudgebee`):

```yaml
datasources:
  - type: discovery
    name: "local-network"
    allowed_hosts:
      - "192.168.1.0/24"
    credential_source: local
    credentials:
      username: "ubuntu"
      private_key_file: "/etc/nudgebee/ssh/id_ed25519"
    discovery:
      pack_dir: "/etc/nudgebee/packs"
      known_hosts_file: "/etc/nudgebee/known_hosts"
      host_key_policy: accept-new
      ssh_access: true
```

`ssh_access: true` also needs `signing_public_key` at the top level of the config; the script writes it when the install command includes `NB_SIGNING_PUBLIC_KEY`. After editing the file, restart the agent.

## Settings

| Key | Required | Meaning |
|---|---|---|
| `allowed_hosts` | Yes | Network ranges (CIDRs) or single addresses the agent may sweep and inventory. NudgeBee only schedules sweeps when this is set. |
| `discovery.pack_public_key` | No | Public key the content packs must be signed with. When set, a pack that doesn't verify is refused. When unset, packs in `pack_dir` load without a signature check (they are still validated: the version inside must match the file name), and the agent logs a warning. |
| `discovery.pack_dir` | For inventory | Folder holding the pack, named `linux-inventory-v<N>.yaml` |
| `discovery.known_hosts_file` | For `accept-new` and `ssh_access` | Verify SSH host keys against this OpenSSH `known_hosts` file. Re-read when it changes, so added keys need no restart. A path containing `..` is refused. Without it, host keys aren't checked. |
| `discovery.host_key_policy` | No | `strict` (default) or `accept-new` — see [Host keys](#host-keys). Local config only. |
| `discovery.max_rate_pps` | No | Maximum sweep rate in probes per second (default 1000; each sweep asks for 100 unless lowered). Lower it for fragile or monitored networks. |
| `discovery.concurrency` | No | Concurrent SSH sessions during inventory |
| `discovery.ssh_access` | No | Also expose these hosts for ad-hoc SSH commands with the same credentials. Off by default; needs a signing key, `known_hosts_file` and a non-empty `allowed_hosts`. |
| `credentials.username` | For inventory | Read-only SSH user that exists on the VMs |
| `credentials.private_key_file` or `credentials.private_key` | For inventory | SSH key (prefer the file, mounted from a Secret; setting both is an error) |

Hosts that answer on the SSH port are listed as VMs, named by IP. Their packages and vulnerabilities need SSH credentials, the content pack and a Linux host.

## The content pack

Inventory commands come from a **content pack**, not from the agent itself, so adding OS support never needs an agent upgrade. The Linux inventory pack, `linux-inventory-v2.yaml`, ships as an asset of each [proxy agent release](https://github.com/nudgebee/forager/releases/latest); put it in `pack_dir`. A request from NudgeBee only selects a pack version — it can never carry pack contents. When `pack_public_key` is set, the agent verifies each pack's signature before running it; for signed packs, ask NudgeBee support for the pack and its public key. A per-VM **Scan** asks for pack **version 2** (`linux-inventory-v2.yaml`); daily and account scans use the highest version present. For example:

```bash
kubectl create configmap forager-packs \
  --from-file=linux-inventory-v2.yaml=./linux-inventory-v2.yaml
```

## Host keys

`host_key_policy` decides what happens when the agent connects to a VM over SSH, for both inventory and `ssh_access` commands:

| Policy | Unknown host | Changed key |
|---|---|---|
| `strict` (default) | Refused when `known_hosts_file` is set | Refused |
| `accept-new` | Its key is recorded in `known_hosts_file` on first contact | Refused |

- `accept-new` requires `known_hosts_file`; the file is created if it is missing.
- `host_key_policy` can only be set in the agent's local config (YAML or Helm values). A config pushed from NudgeBee can't turn on `accept-new`.
- The agent asks each host for the key type `known_hosts_file` already holds for it, so a file written by OpenSSH (which usually records only the ed25519 key) works.
- When a VM is re-imaged its key changes and it is refused; remove its line from `known_hosts_file`.

:::caution Trust on first use
`accept-new` trusts the first key it sees for a host, and packs without `pack_public_key` run whatever is in `pack_dir`. That is fine for a lab or laptop network. For production, use a curated `known_hosts_file` with `host_key_policy: strict`, and signed packs with `pack_public_key`.
:::

## Which account the VMs appear under

By default the VMs found by a discovery datasource appear under the account the proxy agent belongs to. For a [self-hosted VM account](../../features/VM/index.md) this is what you want, and you don't need to do anything.

If the agent scans the network of a *different* account (for example, the VMs of a cloud account reached through an agent registered under another account), link the datasource to that account. There is no screen for this yet; it is set through the `integrations_upsert_discovery_target` API action with the datasource's integration ID and the target account ID.

- A datasource has one target account. Setting a new one replaces the previous link.
- When the target changes, the vulnerability findings and packages that earlier scans recorded under the previous account are retired, unless another datasource still targets that account.
- With no target set, scans keep using the agent's own account.

## Before you enable it

- A sweep makes TCP connections to ports 22, 3389 and 5985 across `allowed_hosts`, and with SSH credentials set also logs in to responding hosts to read their cloud identity. Allowlist the agent's IP in your IDS first: an unannounced sweep looks like an attack, and `sshd` logs *Did not receive identification string* for each probe, which some fail2ban setups act on.
- The agent needs no extra privileges for sweeping.
- Directory (LDAP / Active Directory) discovery isn't used yet; VMs are found by the sweep only. The proxy agent can read an LDAP configuration, but NudgeBee never uses it, so configuring it has no effect and raises no error.

## Related

- [Self-hosted VMs](../../features/VM/index.md)
- [How scanning works](../../features/VM/how-scanning-works.md)
- [Configuration](./configuration.md)
