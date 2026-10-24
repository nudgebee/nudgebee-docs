---
id: triage-scoring
title: Triage Scoring & Priority
sidebar_label: Triage Scoring & Priority
sidebar_position: 2.3
keywords: [triage score, priority, p0, p1, p2, p3, ai alert prioritisation, override priority, why is this alert p0, score breakdown]
intent: inspect
provider: all
---

# Triage Scoring & Priority

Every event gets a **Triage Score** from 0 to 100 and a **Triage Priority** from P0 to P3. The priority decides what reaches the top of the [Triage Inbox](./events-and-triage-inbox.md) and which events are [analyzed automatically](../ai/event-analysis.md).

## Score to priority

| Score | Priority |
|---|---|
| 80 and above | **P0 Critical** |
| 60–79 | **P1 High** |
| 40–59 | **P2 Medium** |
| Below 40 | **P3 Low** |

Hover the score chip for a breakdown of what produced it.

## How the score is worked out

### With AI alert prioritisation (default for new tenants)

With the tenant feature **AI alert prioritisation** on ([Tenant Settings → Features](../tenant-settings.md#features)), NudgeBee asks the AI once per kind of alert — not once per event — what it means: its category, severity, blast radius, and whether it represents an expected change. That verdict is reused for every event of that kind, and a fixed, repeatable policy turns it into a score from:

- **the alert's intrinsic severity**, as the AI judged it;
- **the environment** — production counts more than non-production or unknown;
- **blast radius** — control-plane and customer-facing problems, data durability and monitoring outages raise it; expected changes lower it;
- **recurrence** — how often it has fired recently;
- **[service criticality](../service-criticality.md)** of the workload.

The result stays inside the priority range the AI set for that kind of alert. Notifications that only report a provider's lifecycle or state change are kept at P3.

Until the AI has seen a new kind of alert, the event is scored with the formula below.

### Without AI alert prioritisation

The score comes from the source's severity and the environment, then adjusted for:

- repeats of the same alert (lower);
- correlation with other events — a likely root cause is raised, symptoms of it are lowered;
- the finding type — SLO violations and anomalies are raised, configuration changes lowered;
- evidence such as an OOM kill or repeated restarts (higher).

### Then: scoring rules

[Triage rules](./triage-rules.md) of type **Scoring** add or subtract from the score. Built-in service-tier rules raise events on ingress, gateways, databases, caches and queues. With AI alert prioritisation on, the result is kept within the AI's priority band, so a scoring rule can't move an event out of it.

## Grouped alerts

When several alerts fire on the same resource within a few minutes, NudgeBee groups them under one leading alert, and the others score slightly lower so the inbox shows the incident once. See [Event Lifecycle](./event-lifecycle.md#grouped-alerts).

## Override a priority

Open the score chip's menu and choose **Override priority**. By default the override applies to the **whole alert** — every past and future event with the same fingerprint — and it doesn't change the event's triage status. You can also correct the priority of a single event when you **Classify** it.

An override always wins over the AI, the formula and scoring rules. A correction on one event wins over an override for the whole alert. Overrides are saved as **Pin** rules in [Triage Rules](./triage-rules.md).

## Related

- [Events & Triage Inbox](./events-and-triage-inbox.md)
- [Triage Rules](./triage-rules.md)
- [Service Criticality](../service-criticality.md)
- [Automatic Event Analysis](../ai/event-analysis.md)
