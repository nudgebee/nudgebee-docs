---
sidebar_position: 5
---

# Templating & Best Practices

Most action parameters in Nudgebee are not just static strings — they accept **templates**. A template is a small expression like `{{ alert.labels.namespace }}` that pulls a value from the alert (or from an earlier action's output) at the moment the alert fires.

This is what lets one alert configuration handle hundreds of real alerts without manual editing. You write the action once, with placeholders, and Nudgebee fills them in for each event.

Nudgebee uses **gonja** — a Go implementation of Jinja2 — so the syntax will be familiar to anyone who has used Ansible or Jinja-based tools.

---

## The basics

You can use templates in any action parameter — text, textarea, lists, or objects. Nudgebee serialises the whole parameter blob, runs gonja over it, and parses the result back, so a template inside any field works the same way.

| Syntax | What it does |
|:---|:---|
| `{{ value }}` | Substitutes a value from the context. |
| `{{ value \| filter }}` | Pipes the value through a filter (e.g. `\| upper`, `\| length`). |
| `{% if cond %} ... {% endif %}` | Conditionals (rarely needed inside parameters; usually you use the `if:` field on the action instead). |
| `{% for x in list %} ... {% endfor %}` | Loops (rarely needed; usually you use the `for_each:` field on the action). |

Anything not wrapped in `{{ }}` or `{% %}` is treated as literal text. So `host {{ alert.labels.host }}` becomes `host db-prod-01`.

---

## What's in scope

Inside a template, these top-level variables are available:

| Variable | What's in it |
|:---|:---|
| `alert` | An object with `labels`, `annotations`, and `name`. **Note**: this is **all** that's exposed about the event itself — fields like `subject_name`, `subject_namespace`, `aggregation_key`, `started_at` are not in scope. Use the equivalent label (Prometheus convention puts them in labels — `labels.namespace`, `labels.pod`, etc.). |
| `labels` | Alias for `alert.labels`. |
| `annotations` | Alias for `alert.annotations`. |
| `outputs` | Results of previous actions in the same playbook. Keyed by `<action_name>_<index>` (e.g. `logs_enricher_0`); if you set a `title` on the action, the title is **also** added as an alias key. See [What's in `outputs[key]`](#whats-in-outputskey) below. |
| `extracted_labels` | Values pulled out of previous actions via their `regex_extractors` / `label_extractors`. Same key convention as `outputs`. See [What's in `extracted_labels[key]`](#whats-in-extracted_labelskey) below. |
| `item` | Available **only inside an action that has `for_each:` set** — the current iteration value. |

### Maps and arrays — how to access them

Three of the variables are **maps** (key → value) and one is a **nested map** containing **arrays**. This determines whether you use dot-notation, bracket-notation, or indexing.

| Variable | Underlying type | Access patterns |
|:---|:---|:---|
| `alert.labels`, `labels` | `map[string]string` | `labels.namespace`, `labels.pod`, `labels['kubernetes.io/hostname']` (bracket form is required for keys with dots, dashes, or spaces). |
| `alert.annotations`, `annotations` | `map[string]string` | Same as labels. `annotations.summary`, `annotations['runbook_url']`. |
| `outputs` | `map[string]any` keyed by `<action_name>_<index>` (and by `title` if set) | `outputs.logs_enricher_0`, `outputs['logs_enricher_0']`, `outputs['Pod logs']` (when titled). |
| `extracted_labels` | `map[string]map[string]any` (a map of maps) | `extracted_labels['logs_0'].service`, `extracted_labels['logs_0']._series` — bracket form on the outer key is recommended because the keys often contain underscores or look numeric. |
| `extracted_labels[key]._series` | `[]map[string]any` (array of objects) | Index with `[0]` (`extracted_labels.logs_0._series[0].service`), iterate with `for_each: "{{ extracted_labels.logs_0._series }}"`, or filter with `\| pluck('service')`. |
| `outputs[key].rows` (Table response) | `[][]any` (array of arrays — one per row) | `outputs.foo.rows[0][2]` for the cell at row 0, column 2. Iterate with `for_each: "{{ outputs.foo.rows }}"`. |
| `outputs[key].headers` (Table response) | `[]string` | `outputs.foo.headers[0]`, or `\| join(', ')`. |
| `item` (inside `for_each`) | Whatever element type the array holds | If `for_each` is `_series`, then `item` is `{label: value}` and you reach into it with `item.service` or `item['service']`. |

**Dot vs bracket notation:**

```text
{{ labels.namespace }}              # works for simple keys
{{ labels['namespace'] }}           # equivalent
{{ labels['kubernetes.io/host'] }}  # required when key contains . / - or spaces
{{ outputs['Pod details'].data }}   # required when key has spaces (titled actions)
```

**Iterating in templates:**

You almost never need an explicit `{% for %}` loop — use the action's `for_each:` field instead, which gives each iteration its own template render with `item` bound. But when you do need to inline a loop, gonja iterates maps directly (no `.items()` like in Python Jinja):

```text
{% for k, v in labels %}
- {{ k }}: {{ v }}
{% endfor %}
```

**What labels are actually on your alert?**

Labels are integration-specific. There's no fixed schema — Prometheus alerts carry whatever the rule author put in the `labels:` block, Datadog pushes its tags, CloudWatch pushes its dimensions, and so on. To find out which labels a specific alert source is producing, fire the alert once and open the resulting event in Troubleshooting — the evidence panel shows the full label set. Common Prometheus K8s labels: `alertname`, `namespace`, `pod`, `container`, `node`, `instance`, `severity`, `job`. Common CloudWatch labels: `alarmname`, `region`, `dbinstanceidentifier` (or `instanceid`, `loadbalancername`, etc., depending on the resource type).

### What's in `alert`

Just three fields, taken directly from the event:

| Field | Type | Source |
|:---|:---|:---|
| `alert.name` | string | The alert name resolved at ingest — `nb_alert_name` label, falling back to `alertname` label, falling back to the event's `aggregation_key`. |
| `alert.labels` | map[string]string | All labels on the event. For Prometheus alerts, this is the alert's `labels:` block. For external alerts (Datadog, CloudWatch, …), the integration normalises its own metadata into labels. |
| `alert.annotations` | map[string]string | All annotations on the event. For Prometheus alerts this includes `description`, `summary`, `runbook`, etc. |

There is no `alert.subject_name`, `alert.namespace`, `alert.severity`, `alert.aggregation_key`, etc. Reach for those via labels — `labels.namespace`, `labels.severity`, and so on.

### What's in `outputs[key]`

`outputs[key]` is whatever object the action returned. For Nudgebee server-side actions (most actions whose source is `nudgebee` — `proxy_db_query`, `cloud_cli`, `notification_channel_*`, the `proxy_*` family, etc.), the shape depends on the response type the action chose:

| Response type | Shape (visible fields) |
|:---|:---|
| **Table** (e.g. `proxy_db_query`, many enrichers) | `outputs.foo.rows` (array of row arrays), `outputs.foo.headers` (array of column names), `outputs.foo.additional_info`, `outputs.foo.insight`, `outputs.foo.labels`. |
| **JSON** (e.g. `proxy_http_request`, `cloud_cli`, `ssh`) | `outputs.foo.data` (**string** — JSON-serialised payload, not a parsed object), `outputs.foo.format`, `outputs.foo.additional_info`, `outputs.foo.insight`, `outputs.foo.metadata`, `outputs.foo.labels`. |
| **Markdown** | `outputs.foo.text` (string), `outputs.foo.additional_info`, `outputs.foo.insight`. |
| **File** | `outputs.foo.type`, `outputs.foo.filename`, `outputs.foo.data` (string), `outputs.foo.additional_info`, `outputs.foo.insight`, `outputs.foo.labels`. |

For agent-side actions (source `prometheus` — `pod_enricher`, `logs_enricher`, `node_disk_analyzer`, …), the response is whatever the in-cluster agent returns over relay. The shape can be richer (e.g. `pod_enricher` returns a structured `data` object you can navigate with `outputs.pod_enricher_0.data.containers[0].restarts`) but is action-specific. Two practical implications:

- For JSON-format server-side actions, `outputs.foo.data` is a **string** of JSON. Either pipe it through `| markdown` (the [Nudgebee filter](#nudgebee-specific-filters), which JSON-escapes safely) or accept that you'll be doing string-level reasoning.
- The `markdown` filter is the safest way to embed a previous action's result in another action's text-shaped parameter (Slack messages, ticket bodies). It handles all four response types and JSON-escapes the result.

### What's in `extracted_labels[key]`

`extracted_labels[key]` is a `map[string]any` populated from the action's label-extraction:

| Key | When it's there | What's in it |
|:---|:---|:---|
| Custom keys (e.g. `service`, `task_id`) | When the action's `regex_extractors` or `label_extractors` produce values | The extracted value(s). Single values for non-iterating actions; usually arrays after extraction. |
| `_series` | Set by some actions (notably `logs`) when the extractor produced multiple rows | Array of `{label1: value, label2: value, …}` objects, one per matched row. Use this with `for_each`. |
| `_all_extracted` | Set on the **base** key after a `for_each` action completes | Aggregated map: `{labelKey: [values across all iterations]}`. Useful when one for_each loop produces values you want to fan out again in a later step. |

Example shapes:

```text
extracted_labels['logs_0'] = {
  "_series": [
    {"service": "billing"},
    {"service": "checkout"},
    {"service": "auth"}
  ],
  "service": ["billing", "checkout", "auth"]
}

# After a for_each on logs_0._series produced extra extractions per iteration:
extracted_labels['signoz_logs_enricher_6'] = {
  "_all_extracted": {
    "task_id": ["t-101", "t-102", "t-103"],
    "user_id": ["u-77", "u-77", "u-92"]
  }
}
```

---

## A first example

Suppose every alert from your Prometheus rules carries a `namespace` label and a `pod` label.

You attach a `kubectl_command_executor` action and want it to run for the right pod:

```text
kubectl describe pod {{ alert.labels.pod }} -n {{ alert.labels.namespace }}
```

When `KubePodCrashLooping` fires for `checkout-api-7d` in `production`, this becomes:

```text
kubectl describe pod checkout-api-7d -n production
```

No manual editing. Same configuration, different alerts.

---

## Filters you'll actually use

Filters transform a value. Pipe them with `|`.

### Standard Jinja filters

| Filter | Example | Result |
|:---|:---|:---|
| `default` | `{{ labels.region \| default('us-east-1') }}` | Falls back if the label is missing. |
| `lower` / `upper` | `{{ labels.severity \| upper }}` | Case-fold. |
| `length` | `{{ outputs.foo.rows \| length }}` | Number of items in an array (or characters in a string). |
| `first` / `last` | `{{ list \| last }}` | First / last element. |
| `join` | `{{ list \| join(', ') }}` | Concatenate list items. |
| `tojson` | `{{ obj \| tojson }}` | Serialise to JSON (useful when an action expects a JSON-shaped param). |
| `slice` | `{{ list \| slice('1:') }}` | Drop the first item. |
| `selectattr` | `{{ items \| selectattr('status', 'eq', 'failed') }}` | Filter list by attribute. |
| `map(attribute=…)` | `{{ items \| map(attribute='name') }}` | Pluck a field (also see `pluck` below). |

### Nudgebee-specific filters

In addition to the standard Jinja filters above, Nudgebee registers a handful of custom filters that come up often in alert investigation. They're available in any action parameter.

| Filter | Signature | What it does |
|:---|:---|:---|
| `split(sep='-')` | `string \| split(sep='-')` → `[]string` | Splits a string by the separator. The `sep` kwarg defaults to `'-'`. |
| `pluck(field)` | `[]object \| pluck('field')` → `[]any` | Extracts a field from each object in an array. Drops items missing the field. |
| `top(n)` | `[]any \| top(n)` → `[]any` | First `n` items of an array. |
| `gt(threshold)` / `gte(threshold)` / `lt(threshold)` / `lte(threshold)` | `number \| gt(80)` → `"true"` or `"false"` | Numeric comparison that returns the **lowercase string** `"true"` or `"false"` — designed for the action's `if:` field. |
| `markdown` | `<action response> \| markdown` → `string` | Converts a previous action's response into a Markdown string. Tables become pipe-delimited Markdown tables, JSON responses are inlined as JSON, Markdown responses pass through, File responses inline their data. The result is JSON-escaped so it's safe to embed in another action's text parameter. |

#### `split` — examples

```text
{{ "production-air-worker" | split(sep='-') | last }}        → worker
{{ "production-air-worker" | split(sep='-') | first }}       → production
{{ "production-air-worker" | split(sep='-') | slice('1:') | join('-') }}   → air-worker
{{ "key:value:data"        | split(sep=':') }}                → ['key', 'value', 'data']
```

#### `pluck` — extract a field across many rows

If `extracted_labels.logs_0._series` is `[{service: "billing"}, {service: "checkout"}, {service: "auth"}]`:

```text
{{ extracted_labels.logs_0._series | pluck('service') }}
→ ["billing", "checkout", "auth"]
```

(Often the same data is available pre-extracted at `extracted_labels.logs_0.service`. Use `pluck` when you need to lift a field that wasn't promoted to a top-level extracted label.)

#### `top` — limit an array

```text
{{ extracted_labels.logs_0._series | top(5) }}
{{ outputs.proxy_db_query_0.rows | top(10) }}
```

#### `gt` / `gte` / `lt` / `lte` — numeric thresholds for `if:`

```yaml
if: "{{ outputs.api_traces_enricher_0.metadata.error_rate | gt(0.05) }}"   # only run when error rate > 5%
if: "{{ outputs['Pod details'].data.containers[0].restarts | gte(5) }}"
```

These are designed for the `if:` field. The reason a custom filter exists at all: gonja renders Go bools as `"True"` / `"False"` (capitalized). The `if:` check is case-insensitive so `"True"` does work — but `gt` and friends give you a clean lowercase `"true"` / `"false"` that's consistent with the rest of the YAML.

#### `markdown` — embed a prior action's output as text

The most useful filter for chaining. When you want to forward a previous action's evidence card into a Slack message, ticket body, or LLM prompt, `| markdown` does the right thing for any of the four response types:

```yaml
# Send a Slack message that contains the table from a previous proxy_db_query action
notification_channel_message:
  platform: slack
  channel_id: "{{ labels.slack_channel | default('C0123456') }}"
  incident_id: "{{ alert.labels.incident_id }}"
  text: |
    DB high CPU detected.

    Running queries at the time of the alert:
    {{ outputs['Running queries'] | markdown }}
```

The output is a JSON-escaped string, so it's safe to drop into any text-shaped parameter without manually quoting newlines or special characters.

---

## Common patterns

These are the templates we see in real customer playbooks. Copy and adapt.

### Pull a label off the alert

```text
{{ alert.labels.namespace }}
{{ alert.labels.pod }}
{{ labels.dbinstanceidentifier }}
```

`alert.labels` and `labels` are aliases — use whichever reads better.

### Provide a fallback when a label is missing

```text
{{ labels.region | default('us-east-1') }}
```

Useful for alerts coming from external sources where labels aren't always set.

### Reference an earlier action's output

`outputs` is keyed by `<action_name>_<index>`, where the index is the action's position in the playbook (zero-based). So if `pod_enricher` is the first action, its output is at `outputs.pod_enricher_0`:

```text
{{ outputs.pod_enricher_0.data.containers[0].restarts }}
```

If you set a `title` on the action (recommended), the same output is also available under that title — `outputs['Pod details'].data.containers[0].restarts`. Use whichever reads better.

If you find yourself chaining outputs across many actions, that's usually a signal the work belongs in a [workflow](../workflow-builder/index.md) rather than an alert playbook — workflows have a visual outputs picker and proper data-flow plumbing.

### Loop over values extracted from logs

A common pattern: a `logs` action with a regex extractor pulls out distinct service names from error logs, and the next action runs once per service.

Action 1 — `logs` — extracts `service` from each log line:

```yaml
regex_extractors:
  - pattern: "service=(\\S+)"
    label_name: service
```

Action 2 — `kubectl_command_executor` — runs once per service:

```yaml
for_each: "{{ extracted_labels['logs_0']['_series'] }}"
for_each_limit: 5
command: "kubectl describe deploy {{ item.service }} -n production"
```

(The key `logs_0` follows from action 1's name being `logs` and its index being `0`. If you titled the first action `"Error logs"`, you could write `extracted_labels['Error logs']['_series']` instead.)

Inside the loop, `item` is the current row from the extractor.

### Skip an expensive action unless something is true

Title the first action `"Pod details"` and reference it from a later action's `if:` field:

```yaml
if: "{{ outputs['Pod details'].data.containers[0].restarts | gt(5) }}"
```

This `pod_profiler` action only runs when the pod has restarted more than 5 times.

For more complex conditions, use a full Jinja expression. The result must render to the literal string `"true"` (case-insensitive) for the action to run — anything else will skip it:

```yaml
if: "{{ outputs['Pod details'].data.containers | selectattr('status.container_statuses') | map(attribute='status.container_statuses') | map('selectattr', 'state.waiting.reason', 'in', ['CrashLoopBackOff', 'ImagePullBackOff']) | list | length > 0 }}"
```

### Pass a JSON object as a parameter

When an action expects an object (like `dimensions` on `cloud_metrics`), you can build it inline:

```yaml
dimensions:
  - Name: DBInstanceIdentifier
    Value: "{{ alert.labels.dbinstanceidentifier }}"
```

Or, when the value is already a JSON-shaped string, use `| tojson` to preserve types:

```yaml
labels: "{{ outputs.extractor.data | tojson }}"
```

Nudgebee post-processes the rendered template and parses any string that looks like JSON back into the right type, so you usually don't need to think about this.

---

## Best practices

A short list of things that pay off in production.

### 1. Lean on labels, not hardcoded values

If two alerts differ only by namespace, write **one** action that uses `{{ alert.labels.namespace }}` and let it cover both. Maintaining one configuration is cheaper than maintaining two slightly different ones.

### 2. Always provide defaults for optional labels

Alerts forwarded from external sources don't always carry the labels you expect. `{{ labels.region | default('us-east-1') }}` is much better than a template that explodes when the label is missing.

### 3. Name your actions clearly

The default output key is `<action_name>_<index>` — fine for a one-action playbook, awkward when you have three `prometheus_enricher` actions in a row (`prometheus_enricher_0`, `prometheus_enricher_1`, …). Set a short, stable `title` on the action; the title becomes the evidence card heading **and** an alias key in `outputs` / `extracted_labels`, so `{{ outputs['Pod details'] }}` is a lot easier to read than `{{ outputs.pod_enricher_0 }}`.

### 4. Use `if:` on the action, not `{% if %}` inside parameters

If you want to skip an action entirely under some condition, set the action's `if:` field. Don't try to no-op the parameters with `{% if %}{% endif %}` — that just produces empty params and a confusing run.

```yaml
# Good
if: "{{ outputs.cpu.value | gt(80) }}"
command: "kubectl top pods -n {{ alert.labels.namespace }}"

# Avoid
command: "{% if outputs.cpu.value > 80 %}kubectl top pods -n {{ alert.labels.namespace }}{% endif %}"
```

### 5. Cap your loops

`for_each:` makes it easy to fan out, but a runaway loop attaches a flood of evidence cards. Set `for_each_limit` to a sensible number (default is 10) and use `top(n)` if your input list might be huge.

### 6. Keep secrets out of templates

Don't put credentials, tokens, or DB passwords directly into action parameters. Use the integration / secret reference instead — proxy datasources, Kubernetes secrets, integration credentials. Templates are stored in plain text on the alert.

### 7. Verify by triggering the alert once

There is no in-editor template preview. The fastest way to confirm a template works is to let the alert fire once (or trigger it from the source — Prometheus, Datadog, etc.) and inspect the resulting evidence cards on the event in Troubleshooting. A typo in `{{ alert.labels.podd }}` will surface there as a missing value or a runtime error on the action.

---

## Troubleshooting

| Symptom | Likely cause |
|:---|:---|
| `unable to render template` at runtime | Bad syntax in one of the action's parameters. Open the alert, find the action with the error message in its evidence card, and fix the offending template. |
| Value looks like `<no value>` or empty in the evidence card | The label or output you referenced doesn't exist on this event. Add a `\| default(...)`. |
| Action expected an object / array but got a string | A template returned a JSON-shaped string. Pipe it through `\| tojson` (or rely on auto-parse — Nudgebee converts string-encoded JSON back to the typed value before the action runs). |
| `for_each` ran zero times | The expression didn't resolve to an array. Check the rendered value — `extracted_labels` is keyed by `<action_name>_<index>` (e.g. `logs_0`) and most extractors put rows under `_series`. |
| `if:` is being skipped when you expected it to run | The rendered template must equal the string `"true"` (case-insensitive — `"True"`, `"TRUE"` all work) or boolean `true`. Anything else skips the action: `"false"`, `"False"`, the empty string, `"True "` with a trailing space, `"yes"`, `"1"`, etc. Use the `gt` / `lt` / `gte` / `lte` filters to get a clean lowercase `"true"` / `"false"` you don't have to second-guess. |

---

## See Also

- [Playbook Catalog](./playbook-catalog.md) — every action and its parameters; templates work in any of them.
- [Alerting & Auto-Investigation](./alerting.md) — how to attach actions to alerts in the first place.
