---
sidebar_position: 4.5
sidebar_label: Manual Declarations
keywords: [knowledge graph manual declaration, declare dependency, declare node, import json, network switch, merge node]
---

# Manual Declarations

**Troubleshoot → Knowledge Graph → Settings → Manual Declarations**

Add what no collector can see: a dependency on a third-party API, an on-premises database, a network switch, or a call your tracing doesn't capture. Declared nodes and dependencies appear in the graph alongside collected ones, and NuBi uses them in its answers.

## Nodes

**Declare node** adds a resource by hand. The table lists **Node**, **Where** (the account it belongs to, or outside any account), **Declared** and **Status**:

| Status | Meaning |
|---|---|
| **Active** | In the graph as declared |
| **Adopted** | A collector now sees the same resource, so the collected one is used |
| **Possible duplicate** | It looks like a resource NudgeBee already collects |

Row actions: **Edit**, **Delete** and **Merge into collected node**, which folds a declared node into the collected one it duplicates.

Nodes outside any account can use your own kinds, such as `NetworkSwitch`. A tenant admin introduces a new kind the first time it is used.

## Dependencies

**Declare dependency** links two nodes. The table lists **Source → Destination**, **Type**, **Matches**, **Status** and **Last resolved**. NudgeBee resolves each end to a node in the graph:

| Status | Meaning |
|---|---|
| **Resolved** | Both ends matched |
| **Pending** | Not resolved yet |
| **Unmatched** | An end matches no node |
| **Ambiguous** | An end matches more than one node |
| **Too many matches** | An end matches too many nodes; make it more specific |
| **Node inactive** | An end matched a node that is no longer active |
| **Invalid payload** | The declaration can't be read; edit it |

Row actions: **Edit**, **Delete**, **Re-resolve** and **Resolve**.

### Relationship types

- Between any two nodes: `CALLS`, `PUBLISHES_TO`, `SUBSCRIBES_TO`.
- Only when one end is declared outside any account: `CONNECTED_TO`, `DEPENDS_ON`, `RUNS_ON`, `HOSTED_ON`, `ROUTES_TO`, `BELONGS_TO`.

## Import JSON

**Import JSON** adds nodes and dependencies from one document, up to 500 items at a time.

## Who can declare

Tenant admins open **Settings**. Declarations are checked against your access to the account each node or dependency belongs to.

## Related

- [Where the Data Comes From](./data-sources.md)
- [Nodes and Relationships](./nodes-and-relationships.md)
- [How NudgeBee Uses the Graph](./how-nudgebee-uses-it.md)
