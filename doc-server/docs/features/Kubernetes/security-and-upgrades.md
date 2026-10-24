---
sidebar_position: 10
sidebar_label: Security & Upgrades
keywords: [image scan, cve, cis scan, trigger scan, sensitive logs, cluster upgrade, upgrade plan, upgrade planner, deprecated apis, certificate issues, helm upgrade]
---

# Security & Upgrades

**Cluster → Security & Tools.**

## Image Scan

Vulnerabilities in the cluster's container images. Switch between **Apps**, **Images**, **CVE** and **Details** views; filter by status, severity, namespace, workload and image. Scan one workload's image from its row menu (**Scan Image**, in Apps & Infra → Applications).

## CIS Scan

The cluster checked against the CIS Kubernetes benchmark: **Rule**, **Description**, **Severity**, **Failures**, **Updated At**. The refresh icon (**Trigger Scan**) runs a new scan — results update after a while. Ask NuBi about a rule, or **Dismiss** it. All clusters' CIS results are also under **Optimize → Security** in the sidebar.

## Sensitive Logs

Log lines that look like secrets or personal data: **Application**, **Name**, **Pattern**. **Create Ticket** files one; **Download** exports the list.

## Cluster Upgrade (Beta)

Checks what would break when you upgrade Kubernetes. It shows the **Current Kubernetes Version**; pick a target in **Select a K8s Version** and click **Generate Upgrade Plan**. The checks appear one by one:

- **Check for Deprecated APIs**
- **PDB Check** — PodDisruptionBudgets that could block draining nodes (Current Healthy, Disruption Allowed)
- **Helm Compatibility**
- **EKS Add-On** (EKS only) — current and target compatibility of each add-on
- **Kube Proxy Version**

## Upgrade Planner (Beta)

A step-by-step upgrade plan with owners and statuses. Needs the tenant feature **Kubernetes upgrade planner** (off by default) — otherwise it says *This feature is restricted*. **Create Plan** (needs write access) builds a new plan, refreshing task owners and statuses; **Export Plan** downloads it. With no plan yet: *No upgrade plan available*.

## Certificate Issues and Helm Upgrade

- **Certificate Issues** — TLS certificates that are expiring or invalid.
- **Helm Upgrade** — Helm releases with newer chart versions available.

Both can **Create Ticket**.

## Related

- [Kubernetes](./index.md)
- [Tenant Settings](../tenant-settings.md)
- [Security](../security.md) — platform security (sign-in, roles)
