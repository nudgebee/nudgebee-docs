---
sidebar_position: 1.3
sidebar_label: b-Cortex (Memory & Knowledge)
---

# b-Cortex: Memory and Knowledge

b-Cortex is where you see and manage what NuBi knows: what it remembers from past conversations, and the knowledge bases it searches. Open it with the **b-Cortex** button on the left rail.

| Tab | What it holds |
|---|---|
| **Memory** | What NuBi remembered from past conversations: **Patterns**, **Decisions**, **Sessions**, **Soul**, **Privacy** and the tenant-wide **Collective** |
| **Preferences** | **Inferred** preferences NuBi picked up and **Typed** preferences you set |
| **Knowledge** | **Knowledge Base** (documents, integrations, skill repositories) and **Account Context** |
| **Knowledge Graph** | Services and dependencies from the [Semantic Knowledge Graph](../knowledge-graph/index.md) |
| **Insights** | Weekly **Digests** of the account's event analyses, plus feedback and your usage |

## Enabling b-Cortex

The **Memory**, **Preferences** and other memory-backed tabs need the tenant feature **Memory across conversations**: **Admin → Tenant Settings → Features → AI assistant**. Changing it requires tenant settings write access. When it is off, those tabs show *"b-Cortex not enabled for your tenant"*.

The **Knowledge Base** and **Account Context** tabs work whether or not memory is turned on.

## Knowledge Base

**b-Cortex → Knowledge → Knowledge Base**

The list has three filters:

| Filter | Shows |
|---|---|
| **User** | Knowledge bases created by hand — uploaded files or typed text |
| **Integration** | Knowledge bases synced from Confluence or ServiceNow |
| **Repositories** | GitHub repositories that provide skills (tenant admins) |

Each row shows its **Source status**, **Use in answers**, the number of **Docs**, its **Classification** and when it was **Added**.

| Status | Meaning |
|---|---|
| **Ready** | Indexed and searchable |
| **Ready with gaps** | Indexed, but some documents could not be processed |
| **Syncing** | A sync or re-index is in progress |
| **Sync failed** | The last sync failed; use **Retrigger** after fixing the cause |
| **Source unavailable** | The source integration was removed or archived |

### Add a knowledge base by hand

**Add Knowledge Base** opens *Create Knowledge Base*:

- **Type** — **Fact** (background that's true about your environment) or **SOP** (how to do something, step by step). Default is Fact. See [Facts and SOPs](./improve-accuracy.md#facts-and-sops).
- **Content** — **Upload File** (`.txt`, or `.pdf` up to 5 MB) or type the content (up to 5,000 characters).
- **Name**, **Description** and **Context Tags**.
- Tenant admins also choose **Who can use it**: this account, selected accounts, or the whole organization.

### Sync from Confluence or ServiceNow

Knowledge integrations are added as integrations, then appear under the **Integration** filter:

- **Confluence** — add it under **Admin → Integrations** (Docs). The space key limits the sync to one space; leave it blank to sync all spaces. See [Confluence](../../integrations/Docs/confluence.md).
- **ServiceNow** — in the ServiceNow integration, turn on **Sync Knowledge Base** to sync knowledge articles. See [ServiceNow](../../integrations/Tickets/servicenow.md).

Other sources (Google Drive, arbitrary URLs) are not synced today; upload their content as a file instead.

### Add skills from GitHub

**Repositories → Add repository**: enter the **Repository** (`owner/name` or a GitHub URL), the **Folder** and the **Branch**. Every folder with a `SKILL.md` becomes a skill. Private repositories use your [GitHub integration](../../integrations/Code%20Repository/GitHub/github-integration.md). Use **Sync now** on the row to pull changes. Status: Pending, Syncing, Synced or Sync failed.

## Re-sync a knowledge base

**b-Cortex → Knowledge → Knowledge Base → (row ⋮ menu) → Retrigger**

- For a Confluence or ServiceNow knowledge base, **Retrigger** fetches the source again and re-indexes it.
- For a knowledge base created by hand, it re-indexes the stored content.

**Retrigger** is unavailable while the knowledge base is **Syncing**, when its source is archived, when **Use in answers** is off, or when you don't have write access to the account. Depending on the knowledge base and your role, the same menu also has **Load History**, **Who can use it** and **Turn off for all accounts** (tenant admins), **Skill details** (repository skills) and **Delete** (knowledge bases created by hand, or archived integrations).

## View and mark documents

Click the **Docs** count on a **Ready** knowledge base to open *Documents*. For synced knowledge bases you can mark each page:

| Mark | Effect |
|---|---|
| **SOP** | Agents read it in full first and follow its steps in order |
| **Fact** | Reference material; agents read only the parts they need |
| **Default** | Use the automatic classification: a page classified as a procedure is followed as an SOP, anything else is reference |

Each page shows its automatic **Classifier** label under the title. Your mark always overrides it. Marking needs write access to the selected account.

## Account Context

**b-Cortex → Knowledge → Account Context → Add Account Context** — account-level knowledge used by the AI planner in every conversation on the account. See [Account context](./improve-accuracy.md#account-context).

## Who can change knowledge

Creating, retriggering and marking knowledge needs write access to the account you are viewing. Tenant admins can also create organization-wide knowledge bases from the tenant-wide view and choose which accounts can use them.

## Related

- [Improve NuBi's Answers](./improve-accuracy.md)
- [Memory Policy](./memory-policy.md)
- [What NuBi Can Do](./nubi.md)
