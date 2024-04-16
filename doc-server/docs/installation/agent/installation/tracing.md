---
sidebar_position: 2
---
# Tracing

## Overview

The Nudgebee Node Agent is a component designed to collect tracing data from HTTP requests and PostgreSQL queries within Kubernetes clusters. It utilizes eBPF (extended Berkeley Packet Filter) probes to capture low-level data directly from the kernel, ensuring minimal overhead and high performance. The collected data, including status, duration, request, and response information, is then sent to an OpenTelemetry collector. From there, the collector writes the data to ClickHouse for storage and analysis.

## Architecture Diagram

![Agent Architecture](/img/nb_agent_architecture.png)

## Components

### Node Agent

The Node Agent runs as a DaemonSet within the Kubernetes cluster, ensuring that there is one instance running on each node. It leverages eBPF technology to intercept network packets and PostgreSQL queries at the kernel level.

### eBPF Probes

eBPF probes are embedded directly into the Node Agent to capture tracing data. These probes are attached to specific kernel functions related to networking (for HTTP tracing) and PostgreSQL (for database query tracing). By intercepting relevant events at the kernel level, eBPF probes achieve high performance and minimal overhead.

### OpenTelemetry Collector

The OpenTelemetry collector acts as an intermediary for receiving tracing data from the Node Agent. It provides capabilities for processing, filtering, and exporting telemetry data to various backends. In this architecture, the OpenTelemetry collector is configured to receive data from the Node Agent and forward it to ClickHouse for storage.

### ClickHouse

ClickHouse serves as the storage backend for the collected tracing data. It is a columnar database optimized for analytical workloads, providing fast query execution and efficient storage for large volumes of data.

## Data Flow

1. **eBPF Probes**: Intercept HTTP requests and PostgreSQL queries at the kernel level.
2. **Node Agent**: Receives tracing data from eBPF probes running on each node.
3. **OpenTelemetry Collector**: Collects tracing data from the Node Agent.
4. **ClickHouse**: Tracing data is forwarded to ClickHouse by the OpenTelemetry collector for storage and analysis.

## Installation
By default tracing is disabled, To enable traces collection add below config in values.yaml
```
runner:
  clickhouse_enabled: true

nodeAgent:
    enabled: true

opentelemetry-collector:
  enabled: true
```

## Conclusion

The Kubernetes Node Agent, in conjunction with eBPF probes and the OpenTelemetry collector, provides a robust solution for collecting and analyzing tracing data from Kubernetes clusters. By leveraging these components, organizations can gain valuable insights into application performance and behavior, facilitating efficient troubleshooting and optimization efforts.
