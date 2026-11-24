---
sidebar_position: 3
sidebar_label: Proxy Agent Releases
---

# Proxy Agent Releases

The **NudgeBee Proxy Agent (`forager`)** is a host-level telemetry agent designed for standalone Linux and Windows virtual machines, physical servers, and edge compute nodes. It runs as a system service (`systemd` or Windows Service) to capture system performance, running processes, open network connections, and host logs.

## Release Channels & Repositories

- **GitHub Repository**: [https://github.com/nudgebee/forager](https://github.com/nudgebee/forager)
- **Official Releases & Binaries**: [https://github.com/nudgebee/forager/releases](https://github.com/nudgebee/forager/releases)

## Supported Operating Systems

- **Linux**: Ubuntu (20.04+), Debian (11+), RHEL / CentOS (8+), Amazon Linux 2 / 2023, Rocky Linux
- **Windows**: Windows Server 2016, 2019, 2022, Windows 10/11

## Installation & Upgrade

- **Quick Start Guide**: [Deploy Proxy Agent on Linux and Windows](../installation/proxy-agent/quick-start.md)
- **Upgrade Guide**: [Upgrading Existing Proxy Agents](../installation/proxy-agent/upgrade.md)
- **Troubleshooting**: [Proxy Agent Diagnostics & Logs](../installation/proxy-agent/troubleshooting.md)

## Release Notes

### v0.1.7

- feat: The Linux and macOS install scripts set up VM discovery on a new install — the local subnet, an SSH key for the agent, the Linux inventory content pack and a `discovery` datasource — and print the `ssh-copy-id` command for each VM. Upgrades leave the existing config alone. See [Set up self-hosted VMs](../features/VM/setup.md).
- feat: `pack_public_key` is optional. When it is set, packs must be signed with it, as before; when it isn't, packs in `pack_dir` load without a signature check (still validated) and a warning is logged.
- feat: `host_key_policy: accept-new` records an unknown host's key in `known_hosts_file` on first contact and still refuses a changed key. `known_hosts` is re-read when it changes, so no restart is needed. It can only be set in the agent's local config. See [Host keys](../installation/proxy-agent/discovery.md#host-keys).
- feat: The Linux inventory content pack, `linux-inventory-v2.yaml`, ships as a release asset next to the binary.
- fix: The agent asks each host for the key type `known_hosts` already holds for it, so a `known_hosts` written by OpenSSH (usually ed25519 only) no longer fails as a key mismatch.
- fix: Datasource metadata is sent again after a config push from NudgeBee, not only on connect, so a pushed discovery datasource is swept without waiting for a reconnect.
- fix: `known_hosts` paths containing `..` are refused.
