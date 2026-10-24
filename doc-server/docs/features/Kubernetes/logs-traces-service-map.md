---
sidebar_position: 2
sidebar_label: Logs, Traces & Service Map
keywords: [query log, log groups, query metrics, traces, trace group, service map, cross-zone, grafana, service map not supported, log grouping not supported]
---

# Logs, Traces & Service Map

**Cluster → Monitoring.** The sub-tabs are grouped into logs, metrics, traces and others. What you see depends on the log, metrics and trace providers connected for the cluster.

## Query Log

Search the cluster's logs.

- If more than one log provider is connected, pick one with the provider switcher.
- **Modes:** **Builder** (not offered for Datadog), **Code** (Elasticsearch also lets you choose **DSL** or **KQL**) and **AI** (write the question in plain language; not offered for Datadog, Prometheus, Chronosphere or VictoriaMetrics). Builder is the default for SigNoz, Loggly, Loki and ClickHouse; Code for the others.
- Choose a **Limit** (50–1000 lines), run, browse your query history, or **Download**. The default window is the last hour.

Cloud accounts have the same screen as **Cloud Logs**.

## Log Groups

Similar log lines grouped into patterns. Filter by **Namespace**, **Application** and **Index**, and turn on **Include In-Active Workloads** to see workloads that are gone. Each group shows a **Sample**; **Create Ticket** files a ticket for it.

*Log Grouping not supported* means neither your log provider nor your metrics provider supports grouping.

## Query Metrics

Query the cluster's metrics in **Builder** or **Code** mode; **Instant** returns a single point instead of a range. **How to use** explains the syntax. *No Data* means the query returned nothing.

## Traces

- **By Spans** shows one row per span; **By Traces** one row per trace (its root span — filters match the root span).
- Filters include Service, Error/Unset, HTTP Status, resource / trace ID / span name, source and destination namespace and workload, Status Code, **Trace Source** (**ebpf** from the node agent, or **otel** from OpenTelemetry) and headers.
- Time range: shortcuts from *Last 5 Minutes*, up to 14 days back.
- Columns: Timestamp, Source, Status Code, Span, Duration, Resource, Destination.

## Trace Group

Requests grouped by source, span and target, with **Total Request**, **Error Count** (sorted highest first), **Avg Duration**, **P99**, **P95** and **Max**. Not shown when the trace provider is Jaeger. *Trace Grouping not supported* means your provider can't group traces.

## Service Map

A live map of which services call which. Narrow it by **Source Type**, **Namespaces**, **Workloads** and **Duration**; **Latency Threshold** keeps only calls at or above that latency, and **Red Edges** narrows the map to services with failing calls. Click a node for **Node Details**.

*Service Map not supported* means your trace provider doesn't support the map view.

## Cross-Zone Communication

Traffic between availability zones — **Source**, **Source Zone**, **Target**, **Target Zone** and **Count** — filtered by **Namespace** and **Workload**; open a row for its traces. *Cross-Zone Communication not supported* means your trace provider doesn't report it.

## SLO

The cluster's service-level objectives by workload. See [SLO](../slo.md).

## Grafana

Your Grafana dashboards inside NudgeBee, with a full-screen button. The tab appears only when the agent reports a Grafana connection — see [Grafana](../../installation/agent/connect/grafana.md).

## Related

- [Kubernetes](./index.md)
- [Alert Manager](./alert-manager.md)
- [Logging integrations](../../installation/agent/connect/logging/index.md)
- [Tracing integrations](../../installation/agent/connect/tracing/index.md)
