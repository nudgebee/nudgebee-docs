---
sidebar_position: 3
sidebar_label: Security
keywords: [optimize security, image scan, cis scan, vm vulnerabilities, cloud posture, cve]
---
# Optimize → Security

**Optimize → Security** gathers security findings across accounts in four sub-tabs, each with a count and an **Account** filter:

| Sub-tab | Accounts | What it shows |
|---|---|---|
| **Image Scan** | Kubernetes clusters | Vulnerabilities in container images — views **Images**, **Apps**, **CVE** and **Details**; filter by Namespace, Workload, Severity and Status. Image status can be *Clean*, *Scan failed* or *Unscannable*. |
| **CIS Scan** | Kubernetes clusters | CIS benchmark results — **Cluster**, **Rule**, **Description**, **Severity**, **Failures**, **Updated At**, **Actions**. To run a new scan, use **Trigger Scan** on a single cluster's CIS Scan tab. |
| **VM Vulnerabilities** | Self-hosted VM accounts | Vulnerabilities found on your VMs |
| **Cloud Posture** | AWS, Azure and GCP accounts | Provider security checks — **Check**, **Severity**, **Provider**, **Accounts**, **Resources**; Status *Open* or *Dismissed / snoozed* |

If no account of the right type is connected, the sub-tab says so — for example *No cloud accounts connected. Findings appear here once an AWS, Azure or GCP account is added and scanned.*

## Related

- [Kubernetes → Security & Upgrades](../Kubernetes/security-and-upgrades.md)
- [Optimize overview](./index.md)
