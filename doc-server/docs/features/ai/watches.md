---
sidebar_position: 1.27
sidebar_label: Watches
keywords: [watch, ping me when, notify me when done, wait for rollout, watch cancel]
---

# Watches

A watch lets NuBi keep checking something for you and tell you when it's done — *"watch the rollout of checkout and tell me when all pods are ready"*, *"ping me when the CI run finishes"*. You ask in chat; NuBi checks in the background and replies in the same conversation when the condition is met, or when it gives up.

Watches are available when they are enabled for your installation. If they aren't, NuBi answers the question once instead of watching.

## Start and stop a watch

- **Start:** ask NuBi in plain language to watch something and tell you when it changes. If the condition is already true, NuBi answers straight away and no watch is created.
- **Only read-only checks.** NuBi won't watch with a command that changes something (such as `kubectl delete`).
- **Stop:** ask NuBi to stop watching, or use **Cancel watch** in the **Watches** drawer.

## Follow a watch

The **Watches** chip on the latest answer opens the **Watches (N)** drawer. Each watch shows when it checks next and when it stops — *Next check in 2m · stops in 1h* — and its status:

| Status | Meaning |
|---|---|
| **Watching** | Still checking |
| **Done** | The condition was met |
| **Timed out** | It gave up before the condition was met |
| **Failed** | The check could not run (three failures in a row) |
| **Cancelled** | You or NuBi stopped it |

Each watch notifies **once**, when it ends, where you asked: the web chat, the Slack thread or the Teams conversation. In Slack, NuBi first posts *Watching…* and replaces it with the result.

## Limits

| Limit | Default |
|---|---|
| Longest a watch runs | 1 hour |
| How often it checks | At most every 30 seconds |
| Active watches per tenant | 20 |

## Related

- [Using the Chat](./nubi-chat.md)
- [What NuBi Can Do](./nubi.md)
