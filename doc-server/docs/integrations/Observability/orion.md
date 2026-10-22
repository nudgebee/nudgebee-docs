---
sidebar_position: 15
---
# SolarWinds Platform (Orion)

The SolarWinds Platform integration lets NudgeBee read metrics for **servers and network devices** from a self-hosted SolarWinds server, so a machine SolarWinds already monitors shows its CPU, memory and disk in NudgeBee without installing a second collector on it.

SolarWinds has sold this product under several names: **Orion Platform** up to release 2022.1, **SolarWinds Platform** from 2022.2, and **SolarWinds Observability Self-Hosted** for the current bundle. They all expose the same query service, and this guide calls the server Orion for short.

:::note Three different SolarWinds integrations
| Integration | What it is for |
|---|---|
| **SolarWinds Platform (Orion)** — this page | Metrics from a **self-hosted** server |
| [SolarWinds](./solarwinds.md) | Metrics, logs and traces from SolarWinds Observability, the **SaaS** product |
| **SolarWinds Platform (Orion) Webhook** (under **Webhooks**) | **Alerts** from a self-hosted server |

A self-hosted customer usually wants this page and the webhook page together: the webhook brings the alerts, this brings the measurements behind them.
:::

---

## What NudgeBee Reads, and What It Cannot

Orion is a server and network-device monitoring product, and NudgeBee reads it as one.

**Available for each monitored machine:**

| | Where it comes from in Orion |
|---|---|
| CPU usage and core count | `Orion.CPULoad`, converted from Orion's percentage into cores |
| Memory used and total | `Orion.CPULoad` |
| Disk used and total | `Orion.VolumeUsageHistory`, added up across the machine's volumes |

**Not available, and shown with a reason rather than a zero:**

| | Why |
|---|---|
| Disk read / write rates | Orion keeps only a current reading, with no history, and counts operations rather than bytes |
| Per-service breakdown of a machine | Orion has no equivalent |
| 50th / 90th percentile and peak figures | Orion stores only a minimum, average and maximum per sample, so a percentile cannot be derived honestly |

:::caution Kubernetes is not supported from Orion
Orion's container monitoring records a container's CPU and memory, but **no namespace, pod, deployment, CPU request or memory limit** — confirmed against its query schema, where those columns do not exist. Without them a container's numbers cannot be attached to a workload, and most Kubernetes screens have nothing to show.

A Kubernetes cluster therefore still needs either the NudgeBee agent or a Prometheus-compatible metrics store. This is a limit of the self-hosted SolarWinds product, not a setting: no probe version or licence adds those fields.
:::

---

## Before You Start

**Replace the SolarWinds certificate first.** Out of the box, Orion's query service presents a self-signed certificate that NudgeBee **cannot** accept — not even with certificate checking turned off, because the certificate is rejected before any check is reached. Every default installation is affected.

In the Orion console, go to **Settings** > **All Settings** > **HTTPS Settings** and install a certificate issued by a certificate authority your organisation trusts. If you skip this, the connection test fails with a message saying exactly this.

You also need:

- The address and port of the SolarWinds Information Service — port **17774** on SolarWinds Platform 2023.1 and later, **17778** before that.
- An Orion account NudgeBee can log in with. A read-only account is enough.
- If the Orion server is not reachable from NudgeBee, a **forager** running inside your network. See the proxy agent setup under **Admin** > **Integrations** > **Servers**.

---

## Step 1: Connect the Server

1. Navigate to **Admin** > **Integrations** > **Observability**.
2. Select **SolarWinds Platform (Orion)**.
3. Fill in the form:
   * **Integration Config Name** (Required): a descriptive name, for example `orion-datacenter-1`.
   * **Select Account** (Required): the NudgeBee account these machines belong to.
   * **How Nudgebee reaches the Orion server**: **direct** when NudgeBee can reach the server itself, or **vm_agent** to go through a forager in your network. On-premises servers normally need the forager.
   * **Base URL**: the Information Service address including the port, for example `https://orion.example.com:17774`.
   * **Username** and **Password**: the Orion account from above.
   * **Skip TLS certificate verification**: only if you are still using a self-signed certificate from your own authority. It does **not** rescue the SolarWinds default certificate.
   * **Make SolarWinds Platform (Orion) default Metric Provider**: turn this on so NudgeBee asks Orion for these machines' numbers.
4. Click **Test Connection**, then **Save**. The test runs a real query, so it fails if the address, the credentials or the certificate are wrong.

---

## Step 2: Check a Machine

1. Open **Infrastructure** > **VMs** and pick a machine SolarWinds monitors.
2. Its CPU, memory and disk charts should fill in within a few seconds.
3. Compare a figure against the same machine's page in the Orion console for the same time range. They should agree.

**How NudgeBee finds the machine in Orion.** It matches on the machine's IP address first, then its system name, DNS name and display name. If an identifier matches **more than one** Orion node — the same address added twice, or a host and its management interface — NudgeBee shows no data rather than guess, and says so on the chart. Fix it by removing the duplicate node in Orion.

---

## Things Worth Knowing

**Charts are coarser than an agent's.** Orion polls on its own schedule and stores averages, so short spikes are flattened. Orion also keeps recent data in detail, older data by the hour, and the oldest by the day — all in one view — so a long time range is coarser than a short one.

**One machine, one source.** If a machine also runs the NudgeBee node agent, choose one provider as the default rather than expecting the two to be combined.

**Network devices.** Switches and routers Orion monitors appear as machines and answer the same CPU and memory charts.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Test Connection mentions the certificate and replacing it | Orion is still using its own self-signed certificate | Install a certificate from a trusted authority, as described above. No NudgeBee setting can work around it. |
| Test Connection says the credentials were rejected | Wrong username or password | Check the account can sign in to the Orion web console. |
| Test Connection says the service was not found | The address points at the web console instead of the query service | Use the Information Service port, 17774 (or 17778 before SolarWinds Platform 2023.1). |
| Charts say more than one Orion node matches | The same IP or name is on two nodes in Orion | Remove the duplicate node, or correct its address. |
| Charts say no Orion node matches | The machine is not monitored by this Orion server, or is known there under another address | Check the machine is listed in Orion and compare the address NudgeBee holds for it. |
| Disk charts are empty, CPU and memory are fine | Orion is not monitoring that machine's volumes | In Orion, edit the node and add its volumes under **List Resources**. |
| Kubernetes screens are empty | Expected | Orion cannot serve Kubernetes data. See the note above. |

---

## Helpful Links

- **SolarWinds Platform (Orion) Webhook** — the alerts half of this integration, under **Integrations > Webhooks**
- [SolarWinds Observability (SaaS)](./solarwinds.md)
- [Observability integrations overview](./index.md)
