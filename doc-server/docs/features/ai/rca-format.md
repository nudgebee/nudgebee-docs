---
sidebar_position: 7
sidebar_label: RCA Format
---

# RCA Format

**Admin → AI & Tools → RCA Format**

The Markdown template NudgeBee's AI fills in when it writes a root cause analysis for an event. Edit it so generated RCAs come out in the shape your incident process already expects, instead of a shape your team has to reformat by hand.

<!-- ![RCA Format editor with the Markdown template](./img/rca-format.png) -->

## How it works

The template is a set of headings and instructions. NudgeBee passes it to the model along with the event's evidence, and the model writes the report against it — so headings you add get filled, and headings you remove stop appearing.

The template is set **per account**, so different accounts can carry different formats. Save is disabled until you actually change something.

## The default template

Out of the box the template asks for:

- **Event Summary** — date and time, affected component, impact.
- **Root Cause Analysis** — the primary cause, a 5-Whys causality chain from symptom to root cause, and contributing factors with supporting evidence.
- **Evidence Overview** — system details and a timeline of events with real data points.
- **Recommendations** — immediate and long-term actions.
- **Notes** — anything else worth recording.

If you have never edited it, this is what you are getting.

## Editing

Write instructions, not just headings. The default template's sections carry guidance like *"Replace these brackets with actual data, do not output literal brackets"* and *"Only include details which contribute to the event"* — that guidance is what stops the model padding the report, and it is worth keeping the same style in sections you add.

Useful changes:

- **Add a section your process requires** — customer impact, SLA breach status, a link to the incident channel.
- **Remove what you do not use.** A shorter template produces a shorter report.
- **Fix the audience.** If these RCAs go to non-engineers, say so in the template and ask for plain language in the summary.

## Related

- [Incident RCA use case](./use-cases/incident-rca.md) — what a generated RCA looks like end to end
- [Event Lifecycle & Triage](../troubleshooting/event-lifecycle.md)
