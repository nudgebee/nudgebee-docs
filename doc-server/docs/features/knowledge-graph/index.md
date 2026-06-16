---
sidebar_label: Overview
---

# Semantic Knowledge Graph

## Overview

The Semantic Knowledge Graph is NudgeBee's intelligence layer — it goes beyond simple infrastructure topology by correlating logs, metrics, traces, and code to build a rich, contextual map of your entire environment. It provides a visual representation of your infrastructure, showing resources and their relationships across cloud providers, Kubernetes clusters, and observability platforms, while enabling NudgeBee's AI agents to reason about your infrastructure with full context.

### Why Use the Semantic Knowledge Graph

- **Correlate signals** - Automatically links logs, metrics, traces, and code changes to build a unified context for every resource
- **Visualize dependencies** - See service-to-service communication and infrastructure topology at a glance
- **Understand connections** - Trace how resources connect across different cloud accounts
- **Impact analysis** - Identify what depends on a resource before making changes
- **Power AI troubleshooting** - The Semantic Knowledge Graph feeds context to [NuBi and the pre-built AI agents](../ai/), enabling faster and more accurate root cause analysis

### Getting Started

To access the Knowledge Graph:

1. Click **Troubleshoot** in the left navigation sidebar
2. Select the **Knowledge Graph** tab at the top of the page (next to "All Events" and "Investigations")

When the graph first opens it shows your entire environment. Most environments contain far more than the canvas can render at once, so you will usually see a **Graph Too Large to Render** message prompting you to narrow the view with the filters panel on the left.

To render a focused graph, use the filters described in [Filtering Your Graph](./filtering.md) — for example, search for a workload such as `kube-dns` in the **Node** filter, select it, and click **Apply Filters**. The graph then shows that node and its direct neighbors.

![Knowledge Graph Overview](./img/knowledge-graph-overview.png)
*A focused graph — a Workload and its direct neighbors (Pods, a Namespace, and ContainerRegistry) with labeled edges and the minimap (bottom-right)*

## In This Section

- **[Filtering Your Graph](./filtering.md)** — Focus the graph with the Account, Node, Node Type, Level, Label, and Attribute filters
- **[Navigating the Canvas](./navigating.md)** — Search for nodes, traverse with the Path breadcrumb, and use the zoom and minimap controls
- **[Understanding the Visualization](./visualization.md)** — How to read nodes, edges, and the categorized relationship legend
- **[Interacting with the Graph](./interacting.md)** — Click to traverse, hover to highlight connections, and open node details
- **[Knowledge Graph Settings](./settings.md)** — Choose which data feeds the graph and declare manual dependencies
- **[Reference & Tips](./reference.md)** — Node categories, rendering limits, and tips for effective use
