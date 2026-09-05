---
sidebar_position: 6
sidebar_label: Memory Policy
---

# Memory Policy

**Admin → AI & Tools → Memory Policy**

The tenant-wide opt-out for AI memory. NudgeBee's assistant can carry context between conversations — your preferences, decisions you made during past investigations, patterns it has observed. This page decides which of those layers it may use for everyone in the tenant.

<!-- ![Memory Policy showing the master switch and per-layer toggles](./img/memory-policy.png) -->

:::caution These toggles apply to every user
A change here affects the whole tenant. Individual users can restrict further in their own Privacy settings, but they cannot re-enable a layer you have turned off.
:::

## The master switch

**Use memory in chats.** When off, no layer is injected — nothing NudgeBee has remembered reaches a conversation. Every per-layer toggle is disabled while it is off.

## The layers

| Layer | What it holds |
|---|---|
| **Soul** | Communication style, voice and values. |
| **Preferences** | Explicit defaults — namespace, cloud, channels. |
| **Patterns** | Behaviour patterns inferred across chats. |
| **Decisions** | Choices made during investigations. |
| **Sessions** | Short-term working memory within a chat. |
| **Collective** | Team-wide knowledge shared across users. |

Turn a layer off and it stops being injected into conversations. Each toggle records who changed it and when, so the tenant policy has an audit trail.

## Turning a layer off does not delete it

This is the distinction that matters for a data-handling question: **disabling a layer stops injection, it does not remove stored data.** To delete what has been remembered, use the per-row delete actions in the memory views.

If you need both — stop using it and remove it — do both, in that order.

## Choosing a policy

- **Collective** is the one to think hardest about: it shares knowledge across users, which is the point, and also means one user's context can surface in another's conversation.
- **Sessions** is short-term and scoped to a single chat, so it is the least sensitive.
- **Decisions** and **Patterns** are what make the assistant improve over repeated use. Turning them off costs you that.

## Related

- [Egress Filter](./egress-filter.md) — what is allowed to leave for the model
- [Security](../security.md)
