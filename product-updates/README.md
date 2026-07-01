# Product Updates (in-app changelog)

`product_updates.json` is the source of truth for the **Product Updates** drawer
in the NudgeBee app (the megaphone icon in the header). The api-server fetches
this file at runtime (raw URL on `main`), caches it for ~30 min, and serves it
to every tenant. **Editing the changelog = committing to this file.** No
api-server release is required.

> Raw URL the app reads:
> `https://raw.githubusercontent.com/nudgebee/nudgebee-docs/main/product-updates/product_updates.json`
> (overridable per-deployment via the `PRODUCT_UPDATES_URL` env var).

## Format

A JSON **array of objects** (no comments — JSON doesn't support them; a stray
non-object element breaks the parse and the app falls back to its built-in
copy).

| Field          | Type    | Required | Notes |
|----------------|---------|----------|-------|
| `slug`         | string  | yes      | Unique, stable id for the entry. Don't reuse. |
| `title`        | string  | yes      | Short headline. |
| `body`         | string  | yes      | Markdown (bold, lists, links supported). |
| `category`     | string  | no       | `feature` \| `fix` \| `announcement` (shown as a tag). |
| `url`          | string  | no       | Optional "Learn more" link (opens in a new tab). |
| `highlight`    | boolean | no       | Default `true`. **`false` = shown but never badged / "New"** — use for historical back-catalog entries. |
| `is_active`    | boolean | no       | Default `true`. `false` retires an entry (hidden). |
| `published_at` | string  | yes      | RFC3339, e.g. `2026-07-01T09:00:00Z`. Drives ordering (newest first) and the unread badge. |

## Adding an update

1. Add an object to the array with a new unique `slug` and a current
   `published_at`. Leave `highlight` unset (defaults to `true`) so it badges as
   new.
2. For **historical** entries (releases that predate this feature), set
   `"highlight": false` and the real past `published_at` — they appear in the
   drawer but never highlight.
3. Open a PR. Once merged to `main`, the change goes live within the cache TTL.
