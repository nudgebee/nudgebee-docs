---
sidebar_position: 9
sidebar_label: Anomaly
keywords: [anomaly, anomaly detection, trigger manually, anomaly tab disabled, ANOMALY_DETECTION]
---

# Anomaly (Beta)

**Cluster → Troubleshoot → Anomaly.** Workloads whose CPU, memory, latency, errors or similar metrics left their learned baseline, even when no alert rule fired.

## Turn it on

The tab needs the tenant feature **Anomaly detection** (flag id `ANOMALY_DETECTION`, off by default) in [Tenant Settings → Features](../tenant-settings.md#features). Until then the tab is disabled, with the tooltip *The ANOMALY_DETECTION feature flag is not enabled for this tenant*. Users with a custom role also need read access to **anomalies**.

## The list

Columns **Namespace**, **Workload**, **Anomaly Type**, **Count** (anomalies in the last month) and **Evaluated At**; filter by namespace, workload and anomaly type. Expanding a row opens its **Anomalies** tab (Namespace, Workload, Summary, Updated At); each of those rows has **Trends**, **+/- Logs** and **Traces** tabs.

The **Trigger Manually** icon button runs detection now instead of waiting for the next scheduled run. It needs write access, the feature turned on and the cluster's agent connected. It runs in the background — you see *Anomaly detection triggered successfully*, and the list doesn't refresh on its own, so reload it later.

## Related

- [Troubleshoot](./troubleshoot-tab.md)
- [Tenant Settings](../tenant-settings.md)
