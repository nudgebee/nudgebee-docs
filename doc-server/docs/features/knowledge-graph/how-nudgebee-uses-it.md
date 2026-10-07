---
sidebar_position: 5
sidebar_label: How NudgeBee Uses the Graph
keywords: [knowledge graph, nubi, impact, blast radius, criticality, incident]
---

# How NudgeBee Uses the Graph

You can browse the Knowledge Graph directly, but most of the time it works in the background. These are the places it changes what you see.

## NuBi's answers about dependencies

When you ask NuBi a dependency question, it hands the question to the **Dependency Mapper** agent, which reads the graph. It answers questions such as:

- What does `checkout` call, and what calls it?
- Where is this workload hosted, and what does it run on?
- Which load balancer routes to this service?
- What is in this VPC?
- Find the database named `orders`.

The agent only reports relationships the graph has actually recorded, and asks you to choose when a name matches more than one resource.

During an investigation, NuBi also follows the graph downstream from the failing service to find where a problem started. See [Incident RCA](../ai/use-cases/incident-rca.md).

## Alert impact and grouping

When an alert fires, NudgeBee looks up the alerted resource in the graph and walks outward to the services that depend on it. It uses that to put the alert in context on the event's investigation page:

- **Possible Cause & Impact** groups the alerts that belong together: other alerts about the same service, what probably caused it, what it affected, other alerts from the same node running out of memory, and alerts it set aside as background noise. When there is too little graph data around the resource, the card says it can't tell what was affected.
- **Service Dependencies** draws a small map around the alerted service, with callers and callees, and summarizes it, for example "3 services call checkout".

The richer the graph around a service, the better this works. Where the graph has little around a service, NudgeBee leans on other signals, such as recent configuration changes and alerts from the same node or namespace.

## Blast radius on recommendations

On an [Optimization](../optimizations/index.md) recommendation, the **Blast Radius & Safety** card uses the graph to show what the change could affect. Its headline is the resource's **dependents**: the services that call or rely on it, which decide how carefully the change should be applied. Open the neighborhood below it for context:

- **Depends on** — what the resource itself calls, publishes to or subscribes to. These are not at risk from the change.
- **Runs on this machine** — workloads currently scheduled on the instance, which reschedule if the machine changes.
- **Attached infrastructure** — resources directly attached to it, such as the instance a volume backs.

Each dependency is tagged with how NudgeBee knows about it, such as *Observed in traces*, *Observed traffic*, *Observed via APM*, *User-declared*, *Platform metadata* or *Inferred*. A coverage rating says how well the graph's view of the workload is backed: **High** when two or more independent signals agree, **Observed** for one live signal, **Low** for a single source that has not been cross-checked, and **None** when the workload is not in the graph. Use it to judge how much to trust an empty list.

## Service criticality

[Service Criticality](../service-criticality.md) uses two graph facts to suggest which workloads matter most:

- **Customer-facing** — the workload sits behind an ingress or load balancer.
- **Shared dependency** — ten or more other workloads call it.

Either one nominates the workload for a higher tier. An AI review then sets the tier, and you can change it on the Service Criticality screen.

## Making the graph more useful

- **Turn on flow sources.** eBPF, traces, Datadog APM and New Relic APM give the graph the calls between services. Without them it knows where things run, but much less about who talks to whom.
- **Set owners.** Owners set under **Admin → Access & Users → Ownership** appear in the graph as `OWNS` relationships.
- **Declare what NudgeBee cannot see.** A call that no flow source observes, or a database outside your connected accounts, can be added in Knowledge Graph **Settings**. See [Manual Declarations](./manual-declarations.md).

## Related

- [Semantic Knowledge Graph](./index.md)
- [Where the Data Comes From](./data-sources.md)
- [NuBi and the pre-built AI agents](../ai/index.md)
