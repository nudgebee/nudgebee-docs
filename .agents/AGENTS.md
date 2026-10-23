## Release Notes Formatting Rules

When adding new server release notes (under `doc-server/docs/releases/server/`):

1. **Frontmatter Invariants**:
   - Set `sidebar_position: -<number>` where `<number>` corresponds to the version hierarchy (e.g., `-110` for `1.1.0`, `-100` for `1.0.0`, `-99` for `0.99.0`). This ensures proper sorting in Docusaurus.

2. **Bullet Points**:
   - Always use `-` instead of `*` for list items.

3. **Entry Cleaning**:
   - Remove GitHub usernames and pull request URLs (e.g. strip `by @username in https://github...` from the end of each line).
   - Normalize prefixes: remove scopes like `(infra)` or `(security)` from the tag prefix (e.g. simplify `fix(infra):` to `fix:`).
   - Capitalize the first letter of the description.

4. **Categorization & Sorting**:
   - Group entries into the standard categories: `Troubleshoot`, `Notifications`, `Tickets`, `Workflow`, `Cloud`, `AI`, `Integrations`.
   - Within each category, sort features (`feat:`) first, followed by fixes (`fix:`).

5. **Exclusions**:
   - Omit internal developer chores, infrastructure/CI updates, test suites, back-merges, and package dependency bumps.

6. **Index Updates**:
   - Link the new release page at the top of the "Recent Releases" list on the release index page (`doc-server/docs/releases/server/index.md`).

## Writing and Updating Docs Pages

These rules apply to every change under `doc-server/docs/` (release notes have their own rules above), whether a person or an agent writes it.

### Voice

- Second person, present tense: "Set `logs.collection` to send container logs…", not "Users can…" or "will".
- Plain words and short sentences, one idea per sentence. No marketing words ("powerful", "seamless", "simply") and no exclamation marks.
- Describe the product as it is. Do not write "now", "new", "no longer" or "recently": release notes say what changed, a page says how it works.
- Name UI elements exactly as the app shows them, in bold: **Admin → Integrations → Kubernetes Clusters**.
- Put keys, values, commands, file names and API fields in backticks.

### Feature pages

Use this order and leave out any section that has nothing true to say:

1. `# Title`: the feature's name as the app shows it.
2. One or two sentences: what it is and who it is for.
3. `## Where to find it`: the navigation path.
4. `## Set it up`: numbered steps, one action each, with the result the reader should see.
5. `## What it changes`: what the feature affects, including what Nubi does with it.
6. `## When to use it`: only what the code or the feature's owner says; never guessed.
7. `## Troubleshooting`: symptom, cause, fix.

One feature per page. Link related pages instead of repeating them.

### Reference tables (helm values, settings)

- Keep the existing columns and order (`Key | Type | Default | Description`).
- The default is the chart's value, in backticks, exactly as `values.yaml` has it.
- A key a release adds gets its own row next to related rows.
- The description says what the key does and when to change it. Leave it empty rather than restate the key.

### Docusaurus

- Front matter: keep the fields a page has (`sidebar_position`, `sidebar_label`, …). A new page copies its neighbours' fields.
- Admonitions: `:::note`, `:::tip`, `:::warning`. Use `:::warning` only for data loss, security or outage risk.
- Link to other pages with relative paths to the `.md` file (`./storage-and-pvcs.md`).
- Images go in an `img/` folder next to the page and are linked as `./img/<name>.png`. Crop them to the element and write alt text that says what the image shows.

### Public repository

This repository is public. Never write internal hostnames, ticket or pull request numbers from other repositories, customer or tenant names, email addresses, ids, or details of incidents. Examples use `example.com` and RFC 5737 addresses (`192.0.2.x`, `198.51.100.x`, `203.0.113.x`).
