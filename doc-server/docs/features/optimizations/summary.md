---
sidebar_position: 1
sidebar_label: Summary
keywords: [optimize summary, potential savings, do this first, top findings, cost overview, finops briefing]
---
# Optimize → Summary

**Optimize → Summary** is NuBi's briefing on open recommendations (Open and In progress) across all your accounts.

## Filters

- **Account** — one account, or *All accounts*.
- **Environment** — *All*, *Production* or *Non-production* (accounts are classified by their environment setting, or by "prod" in the account name).
- **Clear filters** resets both.

When there are many findings, the page shows the most urgent and most valuable ones and says so — *Top N of M, by urgency + impact*. Totals always cover everything.

## What NuBi found

Tiles for **Potential savings**, **Critical findings**, **Top 3 impact**, **Worst account**, **New findings** (last 24 hours), **Work in progress** and **Resolved**, and bars showing where the opportunity lives: *Cost recommendations*, *Performance*, and *Security & config*.

**Flagged** calls out findings *Open over 14 days*, the *Longest standing* one, and those that are *Safe to apply*.

Clicking a tile opens the matching list: **Critical findings** opens Cost filtered to Critical, **Work in progress** and **Resolved** open [Resolutions](./resolutions.md).

## Do this first

Five cards with the findings worth fixing first, weighted by savings, confidence, how recent they are and severity. Each card links to the resource and has **Ask NuBi**.

## Top findings

| Column | Meaning |
|---|---|
| **Severity** | Critical to Info |
| **Finding** | The recommendation |
| **Resource** | What it applies to |
| **Category** | Cost, Performance, or Security & Config |
| **Impact** | Savings or risk |
| **Action** | What to do — for example *Review sizing*, *Clean up*, *Fix config*, *Remediate*, *Update version* |

Narrow by **Category** (*All*, *Cost*, *Performance*, *Security & Config*) and **Provider** (*All*, *AWS*, *Azure*, *GCP*, *K8S*), and sort by *Savings*, *Age*, *Confidence* or *Resource*. Every **Action** opens the recommendation's details — see [Cost & Configuration](./cost-and-configuration.md#recommendation-details).

## Cost & Health Overview

The right-hand panel shows spend per currency — **Month to Date**, **Prev. Month**, **Projected** (this month at the current rate) and **Year to Date** — and an **Accounts** list with critical and per-category counts. Click an account to filter the page to it. Savings are always in USD.

With nothing to show: *No optimisation findings — Your infrastructure looks well-optimised. Check back later.*

## Related

- [Optimize overview](./index.md)
- [Cost & Configuration](./cost-and-configuration.md)
- [Resolutions](./resolutions.md)
