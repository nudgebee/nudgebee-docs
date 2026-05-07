---
sidebar_position: 1
---
# Troubleshooting

NudgeBee's troubleshooting dashboard gives you a real-time view of events, errors, and anomalies across all your connected Kubernetes clusters. Instead of switching between multiple monitoring tools, you get a single pane of glass — powered by the [Semantic Knowledge Graph](../knowledge-graph.md) — that correlates metrics, logs, traces, and code to help you find the root cause of issues faster, reducing MTTR from hours to minutes.

### What You Can Do Here

- **Monitor real-time events** — See pod crashes, OOM kills, deployment failures, and other Kubernetes events as they happen.
- **AI-powered root cause analysis with NuBi** — When an [LLM is connected](../../integrations/LLM/), NuBi (the SRE AI Agent) and NudgeBee's [pre-built AI agents](../ai/) automatically analyze incidents, correlate signals across the Semantic Knowledge Graph, and suggest root causes in plain language.
- **Explore the Semantic Knowledge Graph** — Visualize your infrastructure dependencies and trace how issues propagate across services. See [Semantic Knowledge Graph](../knowledge-graph.md).
- **Configure alerting rules** — Set up custom alerting rules to get notified when specific conditions are met. See [Alerting](./alerting.md).
- **Attach event playbooks** — Run evidence-collection actions (logs, metrics, custom SQL, kubectl, cloud CLI, SSH, …) automatically on each event so the LLM has the data it needs. See [Playbook Catalog](./playbook-catalog.md).
- **Understand the split between playbooks and workflows** — Playbooks gather evidence for the LLM; [workflows](../workflow-builder/index.md) post-process the resulting event (triage, ticketing, remediation). See [Event Playbooks vs Workflows](./event-playbooks-vs-workflows.md).

:::info
**Prerequisites**: To use troubleshooting features, you need at least one [Kubernetes cluster connected](../../installation/agent/installation/) and an [observability source integrated](../../integrations/Observability/). For AI-powered analysis, an [LLM connection](../../integrations/LLM/) is also needed.
:::

### Watch a Walkthrough

<div style={{position: "relative", paddingBottom: "56.25%", height: 0}}><iframe src="https://www.loom.com/embed/46381390d75c40d09a77e9ab0f5b4a98?sid=95ee4109-b754-4584-8cba-a5111db775f4" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

### What You Will Find in This Section

- **[Event Playbooks vs Workflows](./event-playbooks-vs-workflows.md)** — Conceptual guide to the two automation surfaces and when to use each.
- **[Alerting](./alerting.md)** — Configure custom alerting rules and attach playbook actions for auto-triage.
- **[Playbook Catalog](./playbook-catalog.md)** — Full reference of every event-playbook action and its parameters, including custom data-collection (proxy DB query, cloud CLI, SSH, kubectl).
- **[Templating & Best Practices](./templating.md)** — Use gonja (Jinja-style) templates in action parameters, with patterns for labels, outputs, conditionals, and `for_each` loops.
