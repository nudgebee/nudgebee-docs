---
sidebar_position: 7.6
sidebar_label: Monitoring
keywords: [cloud logs, cloudwatch logs insights, log analytics kql, cloud logging, cloud metrics, cloudwatch metrics, azure monitor, gcp traces, cloud alert manager]
---

# Monitoring (Cloud)

**Infra → Cloud → Monitoring** has **Alert Manager**, **Cloud Logs**, **Cloud Metrics**, and **Traces** on GCP accounts. Cloud Foundry accounts don't have this tab.

## Alert Manager

The cloud alarms and alert rules for this account.

- **Filters:** **Category**, **Severity**, **Source**, **Status** (Enabled / Disabled) and search by name.
- **Columns:** **Name**, **Category**, **Source**, **Severity**, **Status**, **Configured Actions**.
- The row menu works as on Kubernetes — **Disable** / **Enable**, **Edit**, **Mute** / **Unmute**, or *Change this rule where it is defined* when NudgeBee can't change it. See [Alert Manager](../Kubernetes/alert-manager.md).
- Creating new alerts from this screen isn't available yet for cloud accounts. Alarms suggested by **Configuration** recommendations can be created with **Create Alarm** — see [Optimize](./optimize.md#acting-on-a-recommendation).

## Cloud Logs

Query the account's logs. If other log providers (such as Datadog, Elasticsearch, Splunk, Dynatrace, Observe or SolarWinds) are connected to the account, a switcher lets you pick one.

The cloud provider's own logs use a plain query box with **Query Help** examples:

| Provider | Choose first | Query language |
|---|---|---|
| AWS | **Region** and **Log Group** | CloudWatch Logs Insights |
| Azure | **Log Analytics Workspace** | KQL |
| GCP | Optional **Severity** and **Region** (searches the whole project) | Cloud Logging filter |

Other log providers offer **Builder** and **Code** modes (Datadog has no Builder). Pick a **Limit** (50, 100, 200, 500 or 1000 lines; default 100), click **Run Query**, and **Download** the results. The default window is the last hour.

This screen is different from the Kubernetes **Query Log** screen — it has no AI mode or query history.

## Cloud Metrics

Chart metrics from CloudWatch, Azure Monitor or Cloud Monitoring (or another connected metrics provider).

Choose a **Service**, **Region**, one or more **Resources**, one or more **Metrics** and a **Statistic** (Average, Sum, Maximum or Minimum). You can also type extra metric names, separated by commas. Click **Run Query**. The default window is the last 7 days.

If a service shows no metrics, see [Metrics empty for a service](./troubleshooting.md).

## Traces (GCP)

GCP accounts show traces from Cloud Trace, in the same list as Kubernetes traces — see [Logs, Traces & Service Map](../Kubernetes/logs-traces-service-map.md).

## Related

- [Troubleshoot](./troubleshoot-tab.md)
- [Alert Manager](../Kubernetes/alert-manager.md)
- [Cloud Accounts](./index.md)
