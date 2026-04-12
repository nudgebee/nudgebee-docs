---
sidebar_position: 1
---

# AI & Pre-built Agents

NudgeBee delivers **Cloud-Ops Intelligence** through **NuBi**, the SRE AI Agent, and a library of 30+ pre-built Cloud-Ops agents. These agents analyze incidents across logs, metrics, traces, and alerts — powered by the [Semantic Knowledge Graph](../knowledge-graph.md) — to identify root causes and recommend actions. The result: MTTR reduced from hours to minutes.

NudgeBee's AI capabilities are **pre-packaged but not a black box** — every agent is fully extensible, modular, and controllable, with enterprise guardrails like RBAC, approval workflows, and audit trails.

:::info
**Prerequisite**: An [LLM provider](../../integrations/LLM/) must be connected for AI features to work. Cloud SaaS users get a managed LLM by default. Self-hosted users can use BYOM (Bring Your Own Model) — see [LLM Integrations](../../integrations/LLM/).
:::

## Pre-built AI Assistants

NudgeBee includes four purpose-built AI assistants, each focused on a specific domain:

| AI Assistant | What It Does |
|---|---|
| **SRE AI-Assistant** | Incident triage, root cause analysis, and remediation guidance for reliability engineering. |
| **FinOps AI-Assistant** | Cost optimization analysis, right-sizing recommendations, and cloud spend insights. |
| **CloudOps AI-Assistant** | Cloud infrastructure management, security posture analysis, and operational recommendations. |
| **K8s AI-Assistant** | Kubernetes-specific debugging, upgrade guidance, and workload optimization. |

## Specialized Agents

Under the hood, NudgeBee's AI assistants use a modular set of specialized agents that you can also invoke directly through the [Workflow Builder](../workflow-builder/):

- **Log Analysis Agent** — Analyzes application and infrastructure logs to identify errors, patterns, and anomalies.
- **Kubectl Agent** — Executes and interprets Kubernetes commands for cluster inspection and management.
- **Prometheus Agent** — Queries Prometheus metrics for performance analysis and anomaly detection.
- **Redis Agent** — Inspects Redis instances for performance, memory, and connectivity issues.
- **RabbitMQ Agent** — Monitors RabbitMQ queues, consumers, and message flow.
- **Traces Agent** — Analyzes distributed traces to identify latency bottlenecks and service dependencies.
- **Debugger Agent** — Deep-dives into application-level issues with context-aware debugging.
- **Postgres Agent** — Inspects PostgreSQL databases for query performance, locks, and connection issues.
- **Ticket Agent** — Searches historical tickets for similar past incidents and resolution patterns.
- **Code Agent** — Analyzes code changes and correlates them with incidents for change-driven RCA.

### Watch a Walkthrough

<div style={{position: "relative", paddingBottom: "62.5%", height: 0}}><iframe src="https://www.loom.com/embed/eb32ed08d89943308e56c3730645c3df?sid=bc4586d3-ca27-423d-b46d-c1f56526abee" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>