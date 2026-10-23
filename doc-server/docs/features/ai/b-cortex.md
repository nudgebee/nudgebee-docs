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
| **Insights** | Weekly **Digests** of event analyses, **Feedback** on answers, and **My Usage** |

## Enabling b-Cortex

The **Memory** and **Preferences** tabs need the tenant feature **Memory across conversations** (**Admin → Tenant Settings → Features → AI assistant**); changing it requires tenant settings write access. When it is off, those tabs show *"b-Cortex not enabled for your tenant"* with a link to the legacy memory view. **Knowledge**, **Knowledge Graph** and **Insights** work either way.

## Personal and Global

**Decisions**, **Soul**, **Privacy** and **Typed** preferences have a **Personal | Global** switch. **Personal** is yours. **Global** is the tenant-wide version that applies to everyone: tenant admins can edit it (*"Tenant-shared memory · editable as admin"*); other users see it read-only (*"Read-only · tenant-managed"*). Each item carries how it got there — **Explicit** (you set it), **Inferred** (NuBi picked it up) or **System**.

Some tabs — **Decisions**, **Knowledge Base**, **Account Context**, **Feedback** and **My Usage** — also have an account selector; leave it on **All accounts** for everything.

## How NuBi uses memory

Your **Soul**, **Typed** preferences and the current **Session** are given to NuBi on every message. **Patterns**, **Decisions**, **Collective** insights and **Inferred** preferences are looked up when they are relevant to the question. Nothing is used from a layer that is switched off in **Privacy** or in the tenant's [Memory Policy](./memory-policy.md).

## Memory

### Patterns

*"Patterns — what NuBi inferred. Behaviours NuBi noticed (not entered by you)."* For example *Frequently-investigated: ledger_service_http_503*, or a diagnostic playbook NuBi keeps using.

- **Filters:** **All**, **Active**, **Fading**, **Stale**, **Pinned**, and **Search patterns…**. By default a pattern not seen for 14 days becomes **Fading**, one not seen for 30 days becomes **Stale**, and after 60 days it is retired; only Active and Pinned patterns are used.
- **Pin** keeps a pattern from fading. **Edit** rewrites it and marks it as yours, so it no longer fades. **Delete** removes it permanently.

### Decisions

*"Decisions — your decision history: 'You decided X because Z.'"* Choices you made during investigations, with the rationale, the area (for example AI-SRE, AI-FinOps) and the date. Decisions are never overwritten: **Edit** adds a correction and keeps the original in history (**Show all history** to see it). **Save to global** shares a personal decision with the whole tenant. With an account selected, **View** opens the conversation where it was made.

### Sessions

*"Sessions — recent activity."* Your last five sessions (filter **All**, **General**, **Investigation**, **Automation**) and their short-term working memory — current target, work in progress, findings, open questions and clarifications. **Clear session memory** discards what NuBi learned in that session.

### Soul

*"Soul — your style profile. Curated, not inferred."* How NuBi should talk to you, loaded on every message:

| Setting | Options |
|---|---|
| **Tone** | Formal, Friendly peer, Friendly junior, Direct / Blunt, Mentor / Coaching |
| **Verbosity** | Terse, Balanced, Detailed |
| **Explain reasoning** | None, Brief, Step-by-step, Detailed + tradeoffs, Full reasoning trace |
| **Format preferences** | Code-first, Tables over prose, Diagrams when helpful |
| **Domain shorthand** | Your team's terms, for example `prod` = … (long entries are summarized) |

Click **Save**; NuBi uses it from your next message. The **Global** soul sets tenant defaults; your personal settings override them.

### Privacy

Which memory layers NuBi may use in your chats. **Use memory in chats** is the master switch; below it, one switch each for **Soul**, **Preferences**, **Patterns**, **Decisions**, **Sessions** and **Collective**. Turning a layer off stops it being used but does not delete what is stored — use the delete actions on each tab for that. In **Global**, tenant admins set the tenant-wide opt-out (the same page as [Memory Policy](./memory-policy.md)); users can only restrict further.

### Collective

*"Collective — shared team memory."* Knowledge shared across the tenant — team facts, query patterns, playbooks and past investigations — grouped by area. Filter by module and type, or **Search insights…**. **View** opens the source conversation; **Delete insight** stops it being used in future answers.

## Preferences

### Inferred

Preferences NuBi detected from your conversations, such as a namespace or cloud you keep using. **Keep** tells NuBi to rely on one and stop overwriting it; **Unkeep** returns it to review; **Discard** removes it (NuBi may detect it again later).

### Typed

*"Preferences — durable facts. Set explicitly, used on every relevant request."*

| Field | Meaning |
|---|---|
| **Timezone** | Defaults to your browser timezone |
| **Default environment** | One of your connected accounts or clusters |
| **Default namespace** | The namespace to assume |
| **Preference — manual inputs** | Anything else, for example *"Always tag me on cost spikes above $200/day."* |
| **Preferred channels** | Notification channels to use |

Recently used environments and namespaces are shown for reference. **Global** sets tenant defaults.

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

**b-Cortex → Knowledge → Account Context**

*"Account-level rules and identity that define how your AI debugger/planner behaves and reasons — set once, applies to all sessions."* It is included in every conversation on the account, so keep it to what NuBi must always know. See [Account context](./improve-accuracy.md#account-context) for what to put in it.

- **One per account.** Select the account first; in the tenant-wide view you can see every account's context but not create one. Once an account has a context, **Add Account Context** is disabled — edit the existing one instead.
- **Create Account Context:** **Name** (for example `account_ctx_01`), **Description**, and **Content** — type or paste it, or upload a `.txt` file up to 5 MB. A character count shows the length.
- Each context card has **Edit** and **Delete**. Changing it needs write access to the account.

## Knowledge Graph

A map of the tenant's services, resources and how they depend on each other, from the [Semantic Knowledge Graph](../knowledge-graph/index.md). Filter by **Account**, **Node Type**, **Node**, **Level** (how many relationship hops to show) and attributes, or **Search nodes…**. Open a node to **View node details** or **Focus on this node**. **Download** exports the view as CSV or PNG. Tenant admins can review coverage and add manual dependency declarations from the settings icon.

## Insights

### Digests

Weekly reliability reviews (weeks run Monday to Monday, UTC) built from the tenant's event analyses: how many events were fully analysed and how many were real incidents, **What broke & why** grouped by cause, **Learnings**, what was **Carried over & resolved**, a **Plan for next week** with owners, and **Signal hygiene**. Digests are generated automatically after each week ends and are also sent as a notification. Tenant admins can **Generate this week again** for a failed or partial week (this uses AI spend across all accounts).

### Feedback

The thumbs-up and thumbs-down feedback people gave on AI answers, read-only. Filter by date range (default last 7 days), **Module** and **Useful**.

### My Usage

This month's AI spend and conversation counts for the selected account against its budgets, read-only. Budgets are changed in [Budgets & Limits](./budgets-and-limits.md).

## Who can change knowledge

Creating, retriggering and marking knowledge needs write access to the account you are viewing. Tenant admins can also create organization-wide knowledge bases from the tenant-wide view and choose which accounts can use them.

## Related

- [Improve NuBi's Answers](./improve-accuracy.md)
- [Memory Policy](./memory-policy.md)
- [What NuBi Can Do](./nubi.md)
