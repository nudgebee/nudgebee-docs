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
