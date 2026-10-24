---
sidebar_position: 8
sidebar_label: Alert Tuning
---

# Alert Tuning

**Troubleshoot → All Events → Alert Tuning**, or a cloud account's **Troubleshoot → Alert Tuning**. Kubernetes clusters have no Alert Tuning tab — Prometheus suggestions are on the Troubleshoot page.

Every noisy alert has the same root cause: a threshold that was a guess. Alert Tuning reads seven days of the metric behind an alert, works out what the threshold should have been, and — where the rule is reachable — writes the new value back to the alert source for you.

<!-- ![Alert Tuning tab listing threshold suggestions with recommendation type and confidence](./img/alert-tuning.png) -->

## What it does

Suggestions are made for alerts that fired **5 or more times in the last 30 days**, and refreshed once a day — a new noisy alert can take a day to appear. For each one, NudgeBee:

1. Extracts the alert definition — the metric, comparison operator, threshold and evaluation window — from the rule that produced it.
2. Fetches the metric's history from the source API.
3. Splits that history into **baseline** windows (the alert was quiet) and **firing** windows, and computes robust statistics for each.
4. Compares the two distributions and issues a diagnosis, a suggested threshold, and a confidence.

Splitting baseline from firing is what makes the verdict trustworthy. An alert that is always above its threshold is not mistuned — it is telling you about a chronic condition, and moving the threshold would only hide it.

## Reading a suggestion

### Diagnosis

| Diagnosis | Meaning |
|---|---|
| `mistuned` | The threshold sits inside normal baseline variation. This is the classic noisy alert, and the one worth retuning. |
| `chronic` | The metric is above threshold nearly all the time. The alert is correct; the underlying condition needs fixing. |
| `excursion` | Baseline is well clear of the threshold and firings are genuine spikes. The alert is working. |
| `ambiguous` | The two distributions overlap too much to call. |

### Recommendation type

| Shown as | What it proposes |
|---|---|
| **Tune Threshold** | Move the threshold. |
| **Increase Duration** | Keep the threshold, lengthen the evaluation window so brief spikes stop paging. |
| **Tune Both** | Both of the above. |
| **Disable Alert** | The alert carries no signal worth keeping. |
| **Review Alert** | A human needs to look — the rule may be measuring the wrong thing. |
| **Investigate** | The metric is behaving oddly in a way retuning will not fix. |
| **Not Enough Data** | Too few samples to make a call. |
| **No Change** / **Nothing to Tune** | Nothing to suggest. |

The list also shows the **Threshold** (current → suggested), **Confidence** and **Noise Reduction** (the share of firings the change would remove), with chips such as **Applied**, **PR pending**, **Apply failed**, **Reverted** and **Needs review**.

**Investigate** and **Not Enough Data** carry a suggested value equal to the current one — they are verdicts, not proposals.

### Risk level

Every suggestion carries a risk level of **safe**, **review** or **dangerous**, plus written warnings. A `dangerous` suggestion is one that would materially reduce coverage — read the warnings before applying it.

### Supporting statistics

The panel shows the metric's P50, P90, P95, P99, median and MAD, the estimated reduction in firings, and the method used to derive the suggestion (`MAD`, `IQR`, `P95`, `spike`, or `MAD-baseline`). It also shows a **rule-health verdict** — flapping rate, mean time to close, firing frequency, resolution rate, engagement rate and transient rate. Those come from the events table alone, so a rule whose metric cannot be fetched still gets a health read even when no threshold suggestion is possible.

## Applying a suggestion

Open a suggestion's **Evidence** tab. Two buttons, offered depending on what the source supports — a disabled button explains why on hover:

- **Apply directly** — NudgeBee rewrites the rule at the source and the change takes effect immediately.
- **Raise PR** — NudgeBee opens a pull request against the repository holding the rule (choose the Git integration, repository, base branch and rule file). Available for **Prometheus rule files** only, through a GitHub or GitLab integration, and not for a change that only lengthens the wait.

A **Disable Alert** suggestion is never applied from here — disable or mute the rule with the alert-rule controls instead. Risky suggestions ask you to check a confirmation first. After applying, **View in audit log** shows the change. Applying and reverting need update access to events.

You can override the suggested threshold or duration before applying. A manual override is written even when the engine recommended no retune, so **Investigate** and **Not Enough Data** suggestions can still be used to push a value you have decided on yourself.

**Revert** restores the previous threshold and duration for a change made with **Apply directly**. NudgeBee stores them when it applies a change, so revert works without you having recorded the old values.

:::note Changes made by pull request
A change applied with **Raise PR** can't be reverted from here — open a revert pull request in your repository yourself.
:::

## Supported alert sources

Threshold suggestions require an alert definition NudgeBee can parse:

- AWS CloudWatch alarms
- Azure Monitor alerts (including the webhook form)
- Prometheus
- GCP metric alerts
- PagerDuty (webhook)

Alerts from any other source do not appear here. Azure activity-log and scheduled-query rules have no fetchable metric, so they get a rule-health verdict but no threshold suggestion.

## Related

- [Event Lifecycle & Triage](./event-lifecycle.md) — how an event reaches this screen
- [Snooze, Suppress & Alert Lifecycle](./alert-state-management.md) — silencing an alert instead of retuning it
- [Missing Alerts & Pipeline Triage](./alert-pipeline-troubleshooting.md) — when an alert never arrives at all
