---
sidebar_position: 1
---

# NuBi Use Cases

Real conversations with **NuBi**, NudgeBee's SRE AI Agent. You see the actual questions you ask, what comes back, and how NuBi gets there. Every walkthrough is a real investigation against a live workload, captured end to end. Nothing here is staged.

:::info Before you start
NuBi chat needs an [LLM provider](../../../integrations/LLM/) connected, plus a [Kubernetes cluster](../../../installation/agent/installation/) with an [observability source](../../../integrations/Observability/). Cloud SaaS users get a managed LLM by default. A few use cases need an extra integration, such as source control for code analysis or ticketing to open tickets. These are called out where they apply.
:::

## Available now

- **[Find the Root Cause of a Failing Service](./incident-rca.md)**. A service is throwing errors and you don't know why. NuBi triages it, traces the failure across services through the Knowledge Graph, proves it with logs and traces, and points to the exact line of code. One conversation, symptom to fix.
- **[Cut Through Alert Noise](./alert-management.md)**. Thousands of alerts, almost none worth paging on. NuBi audits what's firing, checks which alerts line up with real degradation, and classifies each as noisy, flapping, stale, or valid, so you know what to keep, tune, and silence.
- **[Audit Database Health](./database-health.md)**. No DBA on call. NuBi checks your Postgres for bloat, slow queries, and unused indexes, verifies a fix is safe against your application code, and drafts the migration as a pull request for your review.

More use cases are on the way: "what changed after a deploy", cost and right-sizing, on-call handoffs.

## How NuBi answers

A few things worth knowing so you get better answers:

- **It investigates, it doesn't look up.** NuBi runs real tools like kubectl, logs, traces, the Knowledge Graph, and code, then reasons over what it finds. Ask it what's wrong, not where to look.
- **It holds the thread.** Within a conversation, follow-ups build on what it already found. Start broad, then drill down.
- **It scopes to what you name.** Mention the namespace or service and the answer comes back faster and sharper.
- **You don't need exact phrasing.** Plain language is fine. The prompts in these pages are starting points, not commands.
