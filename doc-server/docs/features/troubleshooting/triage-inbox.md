---
id: triage-inbox
title: Triage Inbox
sidebar_label: Triage Inbox
sidebar_position: 2
keywords: [triage inbox, alert triage, triage score, source severity, grouped alerts, fingerprint]
intent: diagnose
provider: all
---

# Triage Inbox

The Triage Inbox aggregates and prioritizes alerts across your connected accounts and clusters into deduplicated fingerprint groups.

## Where to find it

Go to **Troubleshoot → All Events → Triage Inbox**.

## Set it up

1. Open **Troubleshoot** from the sidebar navigation.
2. Select the **All Events** tab, then select the **Triage Inbox** sub-tab.
3. Filter the inbox using the controls in the toolbar:
   - **Event Type**
   - **Source**
   - **Source Severity**
   - **Status**
   - **Triage Priority**
   - **Issue Type** (select **New Issues**, **Recurring Issues**, or **All Issues**)
   - **Sort By**
   - **Triage Status**
4. Review the columns displayed in the table:
   - **Triage Score**: Displays the computed priority chip and numeric score.
   - **Source Severity**: Displays the original urgency level from the source alerting system.
   - **Application**: The resource or workload the event belongs to.
   - **Event Type**: The classification of the event.
   - **Count**: The occurrence run count and collapsed subjects.
   - **Triage Status**: The team response status.
   - **Alert Status**: Current firing state from the source system.
   - **Action**: Actions including ticket creation and automations.

## What it changes

- **Triage Score leads the table**: The first column displays the triage score chip and score value, followed by **Source Severity**.
- **Priority overrides**: Click the priority chip in the **Triage Score** column to select an override from **P0** through **P3**.
- **Alert grouping and drill-down**: Alerts group when the same subject, a direct caller/callee, or the same failure across several subjects raises alerts within a 15-minute window. Grouped child alerts fold under the leading event. Selecting a group allows you to drill down into the leading event and inspect its grouped alerts.
