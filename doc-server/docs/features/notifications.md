---
sidebar_position: 7
---
# Notification Rules

Notification rules let you control where alerts and event notifications are routed — and which ones are suppressed. By creating rules, you can direct notifications from specific clusters, namespaces, or workloads to the right channel, or disable notifications for noisy resources.

:::info
**Prerequisite**: You need at least one [notification channel configured](/docs/integrations/Notifications/) (Slack, Microsoft Teams, or Google Chat) before you can create routing rules.
:::

### What You Can Do with Notification Rules

1. Route notifications from a specific cluster, namespace, or workload to any channel in your configured messaging tool.
2. Suppress (disable) notifications for a specific rule — useful for development or staging environments that generate noise.

:::tip
Start by routing production namespace alerts to a dedicated on-call channel, and suppress notifications from development and staging namespaces to reduce alert fatigue.
:::

## How to Create a Notification Rule

<div style={{position: "relative",paddingBottom: "55.625%", height: 0}}><iframe src="https://www.loom.com/embed/325351364f244fd59cb7e47de844a219?sid=b10b2b9e-5c0e-4ec5-9722-0ab1453e6593" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

