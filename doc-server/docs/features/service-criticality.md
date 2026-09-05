---
sidebar_position: 12
sidebar_label: Service Criticality
---

# Service Criticality

Criticality tells NudgeBee how much each workload matters, so incident triage surfaces failures on your important services first and downranks the noise from demo, test and internal tooling.

NudgeBee infers a baseline automatically from topology and AI. You review and correct it here, and your edits are kept — the automatic refresh never overwrites them.

<!-- ![Service Criticality review screen listing workloads with tier, source and rationale](./img/service-criticality.png) -->

## Tiers

`critical` · `high` · `medium` · `low`

A workload with no row is treated as `medium`. Most workloads have no row at all, and that is the intended state — the tier only means something if it is not applied to everything.

## Where a tier comes from

The **Source** column tells you which of three paths set the tier, and that matters because they carry different authority.

| Source | Set by | Authority |
|---|---|---|
| `user` | An operator, on this screen | Authoritative and sticky. Never overwritten. |
| `fact_signal` | Derived from observed topology | Advisory. |
| `llm_inferred` | Inferred by AI | Advisory. |

### What the automatic derivation looks at

In precedence order:

1. **An operator-declared label on the workload.** NudgeBee reads common tier conventions — `critical`, `tier-0`, `tier0`, `p0`, `gold` map to `critical`; `high`, `tier-1`, `p1`, `silver` to `high`; `medium`, `tier-2`, `p2`, `bronze` to `medium`; `low`, `tier-3`, `p3` to `low`. Anything it cannot classify confidently, including bare numbers, is ignored rather than guessed at.
2. **Customer-facing position.** A workload behind an ingress or load balancer sits on the request path, and is derived as `high`.
3. **Dependency fan-in.** A workload that ten or more services depend on is a shared hub — a datastore, queue or gateway — and is derived as `high`.

A workload with none of those signals is left untiered rather than given a noise row.

:::note Automatic derivation stops at `high`
`critical` is reserved for an explicit human decision. Most ingress-backed workloads are internal APIs, not genuinely customer-critical, so NudgeBee surfaces them as `high` for you to promote rather than inflating the top tier on its own.
:::

## What a tier actually changes

Criticality is resolved **per event**, against the specific workload that alerted. Two workloads with the same name in different accounts get their own tiers.

**Every tier adjusts the alert's score:**

| Tier | Score adjustment |
|---|---|
| `critical` | +12 |
| `high` | +6 |
| `medium` | 0 |
| `low` | −10 |

Those magnitudes sit alongside the other scoring terms — enough to reorder a queue, not enough to overrule the alert's own semantics.

**Only an operator's tier moves the priority band.** A tier you set yourself can overrule a band the AI verdict capped lower:

| Your tier | Band effect |
|---|---|
| `critical` | Floor of P1 |
| `high` | Floor of P2 |
| `low` | Ceiling of P3 |

Auto-derived tiers stay advisory: they move the score, never the band. This is the practical reason to review this screen — an inferred `high` nudges a queue, but a declared `critical` guarantees the alert cannot be buried.

## Reviewing

The table lists Namespace, Workload, Kind, Criticality, Source and **Why** — the rationale behind the tier, such as `ingress/LB-backed (customer-facing request path)` or `14 services depend on it (shared dependency)`. Change the tier inline; the row's source becomes `user` and stops being touched by the refresh.

Start with the workloads NudgeBee derived as `high` and decide which are genuinely `critical`, then demote the demo and test namespaces to `low`. Those two passes do most of the work.

## Related

- [Event Lifecycle & Triage](./troubleshooting/event-lifecycle.md)
- [Semantic Knowledge Graph](./knowledge-graph.md) — the topology behind fan-in and customer-facing signals
