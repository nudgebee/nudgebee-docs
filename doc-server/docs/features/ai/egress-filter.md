---
sidebar_position: 4
sidebar_label: Egress Filter
---

# Egress Filter

**Admin → AI & Tools → Egress Filter**

Scans what NudgeBee sends to an LLM for secrets and personal data, and either records it, masks it, or refuses the call. This is the control you point at when someone asks what stops a leaked credential in a log line from reaching a model provider.

<!-- ![Egress Filter settings showing detection mode and custom patterns](./img/egress-filter.png) -->

:::note Platform gate
The filter can be disabled at the platform level. When it is, the tenant settings on this page are visible but have no effect, and a banner says so.
:::

## Secret detection

### Action on detection

| Mode | Behaviour |
|---|---|
| **Detect** | Records an event. The call proceeds unchanged. |
| **Enforce** | Blocks the call. |
| **Redact** | Masks the secret and forwards the rest. |

If your tenant has not set a mode, it inherits the platform default, and the page tells you which one that is.

Start in **Detect** for a week and read the events before switching to Enforce. That tells you your false-positive rate against your own data instead of guessing at it.

### Custom detection patterns

Add your own regular expressions for credential formats the built-in detectors do not know — internal token prefixes, licence keys, bespoke API key shapes. Each pattern has a name, the expression, and an enabled toggle.

**Reset to platform defaults** discards your custom patterns and overrides.

### Excluded agents

Agents listed here skip secret scanning entirely.

The case this exists for: the **websearch** agent sends a fetched public web page, so a documentation page that embeds a public signing key reports dozens of false "secrets". Excluding it stops the noise.

Skips are recorded, so an excluded agent stays visible in metrics rather than being silently unscanned. Matching is exact and case-insensitive.

## PII scrubbing

A second subsystem, configured alongside the secret filter.

### Outage policy

PII scrubbing depends on `ml-k8s-server`. This setting decides what happens when that service is unreachable:

| Mode | Behaviour when the scrubber is down |
|---|---|
| **Detect** | Forwards raw messages so the conversation completes — fail-open. |
| **Enforce** | Refuses the call so raw PII never reaches the LLM. |

Choose **Enforce** where HIPAA or GDPR obligations apply. It trades availability for the guarantee.

### Named-entity recognition

Catches PII the built-in patterns miss — names, unusual location formats. It is fuzzier than pattern matching, and some tenants prefer the precision of patterns alone.

### Categories to skip

Ticked categories are **not** scrubbed, so real values reach the model. Use this where a category is high-value context and the false-positive cost outweighs the leak — names during incident narration being the common example.

## Related

- [AI Gateway](./ai-gateway.md)
- [Memory Policy](./memory-policy.md) — what NudgeBee is allowed to remember
- [Security](../security.md)
