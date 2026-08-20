---
sidebar_position: 2
sidebar_label: K8s Agent Releases
---

# K8s Agent Releases

The **NudgeBee K8s Agent** runs inside your Kubernetes clusters as a central Runner deployment and node-level DaemonSet. It collects workload metrics, events, pod logs, and eBPF network telemetry, streaming them securely to the NudgeBee Server.

## Release Channels & Repositories

- **GitHub Repository**: [https://github.com/nudgebee/k8s-agent](https://github.com/nudgebee/k8s-agent)
- **Official Releases & Changelogs**: [https://github.com/nudgebee/k8s-agent/releases](https://github.com/nudgebee/k8s-agent/releases)
- **Helm Chart Registry**: `https://nudgebee.github.io/k8s-agent/`

## Installation & Upgrade

- **Installation Guide**: [Deploy K8s Agent across EKS, GKE, AKS, and Local Clusters](../installation/agent/installation/index.md)
- **Helm Values Reference**: [Full Chart Configuration Reference](../installation/agent/installation/helm_values.md)
- **Upgrade Guide**: [Upgrading Existing K8s Agents](../installation/agent/installation/upgrade.md)
