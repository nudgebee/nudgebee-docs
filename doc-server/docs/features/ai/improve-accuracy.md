---
sidebar_position: 1.2
sidebar_label: Improve NuBi's Answers
---

# Improve NuBi's Answers

NuBi starts every investigation knowing only what it can read from your accounts. Five things let you teach it how *your* environment works — and make it follow your runbooks instead of improvising.

| Construct | What it does | Use it for |
|---|---|---|
| **Account context** | A short text loaded into every conversation on the account | Facts NuBi should always know: naming, ownership, what not to touch |
| **Knowledge base — Fact** | Reference material NuBi searches when relevant | Architecture notes, service descriptions, past incident write-ups |
| **Knowledge base — SOP** | A procedure NuBi reads in full and follows step by step | Runbooks, triage checklists, escalation steps |
| **Skills** | A packaged procedure, loaded on demand or with `/skill-name` | Repeatable tasks your team keeps in Git |
| **Prioritize knowledge** | Reserves room for chosen knowledge in one agent's search results, optionally always loading it | Making a specific agent always use a specific runbook |

All of these are managed in **[b-Cortex](./b-cortex.md)** (the **b-Cortex** button on the left rail), except *Prioritize knowledge*, which is set per agent under **Admin → AI & Tools → Agents**.

## Account context

**b-Cortex → Knowledge → Account Context → Add Account Context**

Account-level knowledge used by the AI planner on every conversation for this account. Keep it short and factual — it is included every time, so long text costs on every run.

Good account context:

- "Production namespaces are `payments-*` and `orders-*`; `sandbox-*` is disposable."
- "The `checkout` service is owned by the Payments team; page #payments-oncall."
- "Never restart `ledger-db`; escalate to the DBA team instead."

:::note Where account context lives
Account context is always edited in **b-Cortex → Knowledge → Account Context**. When the tenant feature **Memory across conversations** is turned **off**, admins also see a copy of it under **Admin → AI & Tools → Account Context**; turning memory **on** removes that admin tab. The content is the same either way.
:::

## Facts and SOPs

Every knowledge document is treated as one of two kinds:

| Kind | How NuBi uses it |
|---|---|
| **SOP** | A procedure. Agents read it in full first and follow its applicable steps in order, checking prerequisites. |
| **Fact** | Reference material. Agents read only the parts they need, as supporting information. |

How a document gets its kind:

1. **You marked it.** A mark on a document always wins. For an uploaded or typed knowledge base, choose **Fact** or **SOP** when you create it. For pages synced from Confluence or ServiceNow, open the knowledge base's **Docs** and set each page to **Fact**, **SOP** or **Default**.
2. **Default** — NudgeBee classifies each synced page automatically. A page classified as a procedure is followed as an SOP; everything else is reference.

If NuBi is reading a runbook as background instead of following it, mark the page **SOP**.

## Skills

A skill is a knowledge item NuBi can load in full when it needs it. Skills come from:

- **knowledge bases you write yourself** (typed text, Fact or SOP — not PDFs or synced Confluence/ServiceNow pages), and
- a **GitHub repository**: in **b-Cortex → Knowledge → Knowledge Base → Repositories → Add repository** (tenant admins), every folder containing a `SKILL.md` becomes a skill. Private repositories use your GitHub integration.

In **Ask NudgeBee** you can load a skill explicitly by typing `/skill-name` (up to three per message). Otherwise agents find relevant skills themselves. Mark a procedure **SOP** so it is followed step by step once loaded.

## Prioritize knowledge for one agent

**Admin → AI & Tools → Agents → (agent row menu) → Prioritize knowledge**

Every agent can already use all of the account's knowledge bases. *Prioritized* knowledge bases get reserved space in that agent's search results, so they are not crowded out by other matches.

Turn on **Always load** for a prioritized knowledge base to put its full text in the agent's prompt on every run. Always load is available for knowledge bases you wrote yourself (not PDFs or synced Confluence/ServiceNow pages) of up to 4,000 characters. Use it for the one runbook an agent must always follow — for example the **Event & Alert Investigator** for alert triage, or the **Azure Troubleshooter** for your Azure runbook. Always-loaded text is sent on every run, so keep it to what is essential.

## Knowledge retrieval policy

**b-Cortex → Knowledge → Knowledge Base →** `Knowledge retrieval: <mode>` (select an account first)

| Option | Behavior |
|---|---|
| **Auto (default)** | Recommended for most requests. Searches automatically when knowledge may help and skips some simple requests; the model can also search when needed. |
| **Always discover** | Searches on every non-empty request. Use it when requests regularly depend on internal documentation; it adds latency and retrieval cost, and does not guarantee every document is read. |
| **Model-directed only** | The model decides when to search. Avoids automatic retrieval, but the model may miss useful documentation. |
| **Disabled** | Turns off automatic discovery and the knowledge search and load tools for this account. Some custom agents require automatic discovery and cannot run in this mode. |

Use **Test retrieval** on the same screen to see what NuBi would find for a sample question before you rely on it.

## Memory across conversations

With the tenant feature **Memory across conversations** turned on (**Admin → Tenant Settings → Features**), NuBi remembers preferences, decisions and patterns between conversations. You can review and correct what it remembered in b-Cortex's **Memory** and **Preferences** tabs, and admins control which layers are used in **[Memory Policy](./memory-policy.md)**.

## Checklist: "NuBi isn't following our runbook"

1. The runbook is in a knowledge base for this account (or shared to it), and its status is **Ready**.
2. It is marked **SOP** — or, for a synced page, the classifier shows it as a procedure.
3. **Test retrieval** with the question users actually ask returns the runbook.
4. For a runbook one agent must always use, add it under **Prioritize knowledge** for that agent, and turn on **Always load** if it is a short knowledge base you wrote yourself.
5. Facts the agent keeps getting wrong about your environment go in **Account context**.

## Related

- [b-Cortex: Memory and Knowledge](./b-cortex.md)
- [Agents & Custom Agents](./custom-agents.md)
- [Memory Policy](./memory-policy.md)
