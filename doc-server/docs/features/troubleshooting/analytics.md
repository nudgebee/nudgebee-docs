---
sidebar_position: 8
sidebar_label: Analytics
keywords: [troubleshoot analytics, problems we explained, engineer time saved, recurring issues, issue volume, are we improving]
---

# Analytics

**Troubleshoot → Analytics**

A view of whether things are getting better: how many problems NudgeBee explained, how much engineer time that saved, which issues keep coming back, and what to look at this week.

## Viewing filters

At the top, choose **Account** (default *All accounts*) and a date range. The page opens on the **last 7 days**.

Clicking the **Are we improving?** tiles (except *Problems we have seen before*), a recurring-issue row, a volume bar or most suggestions opens **All Events → Events** filtered to what you clicked; **Review in Alert Tuning** opens Alert Tuning. The four Overview tiles, *Problems we have seen before* and the *Stopped happening* rows aren't clickable.

## Overview

| Tile | What it shows |
|---|---|
| **Investigations finished** | Automatic investigations started in this window that have completed |
| **Problems we explained** | The share of eligible problems NudgeBee analyzed. Eligible problems are high- or critical-priority issues, not duplicates. When this is low, ask an admin to check [Automatic Event Analysis](../ai/event-analysis.md). |
| **Time to explain a problem** | The typical (median) time to explain a problem, in minutes. Shows *—* until at least 5 problems were explained. |
| **Engineer time saved** | Hours saved compared with investigating by hand, and the equivalent cost. See [how time saved is calculated](./events-and-triage-inbox.md#how-time-saved-is-calculated). |

**Engineer time saved** here follows the **Account** and date filters and counts automatic investigations only. Unlike the **Total Time Saved** card on **Investigations** — which always covers the last 24 hours and never goes below zero — it isn't floored at zero; it shows *—* when the saving is under about 0.05 hours or the figures don't add up.

## Are we improving?

- **Distinct problems** — how many different issues fired.
- **Problems we rated urgent** — issues ranked P0 or P1.
- **Problems we have seen before** — the share of the busiest issues that have fired before.

*Distinct problems* and *Problems we rated urgent* are compared against the same length of time immediately before the window.

## The longer view

From the latest weekly digest: the week's main findings, what **Keeps coming back**, and what **Stopped happening**. It covers the whole tenant, not the Account filter, and is hidden until a digest exists.

## What should we do this week?

Suggestions with a link to act on them, for example:

- A recurring issue that already has a threshold suggestion — **Review in Alert Tuning**.
- One alert class causing a large share of firings — **See these issues**.
- An issue that has kept recurring for weeks but is still ranked P3 — **See these issues**.
- More urgent issues than in the previous window — **See urgent issues**.

## What keeps coming back?

The issues that fired most often in the window. If nothing fired more than once, the section says so.

## Issue volume

**New issues per day**, as a bar chart. With fewer than 4 days in the window there isn't enough to show a trend; switch to the last 7 days.

## When it doesn't load

*Analytics unavailable* means the event figures for this window couldn't be loaded. Try again, or narrow the date range. The events list on **All Events** is not affected.

## Related

- [Events & Triage Inbox](./events-and-triage-inbox.md)
- [Automatic Event Analysis](../ai/event-analysis.md)
- [Alert Tuning](./alert-tuning.md)
- [Triage Scoring & Priority](./triage-scoring.md)
