---
sidebar_position: 2
sidebar_label: Data Tasks
---

# Data Tasks

Transform, filter, and reshape data between workflow steps.

## `data.transform`

**Display Name:** Data Transform

Reshape or transform data using JSONata expressions or JavaScript. Parse JSON/YAML input and produce formatted output.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `expression` | string | Yes | The transformation expression (JSONata or JavaScript). |
| `input` | string | Yes | Raw string data to transform (e.g., JSON from a previous task). |
| `inputType` | string | No | Format of the input data. Options: `json`, `yaml`. Default: `json`. |
| `outputType` | string | No | Desired output format. Options: `raw`, `json`, `yaml`. Default: `raw`. |
| `scriptType` | string | No | Transformation engine. Options: `jsonata`, `javascript`. Default: `jsonata`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Transformed data in the specified output format. |

### Example — JSONata

```yaml
- id: extract_names
  type: data.transform
  params:
    input: "{{ Tasks['list_pods'].output.data }}"
    expression: "items.metadata.name"
    inputType: json
    outputType: json
    scriptType: jsonata
```

### Example — JavaScript

```yaml
- id: format_report
  type: data.transform
  params:
    input: "{{ Tasks['get_metrics'].output.data }}"
    expression: |
      const data = JSON.parse(input);
      return data.map(m => `${m.name}: ${m.value}`).join('\n');
    scriptType: javascript
```

---

## `data.filter`

**Display Name:** Data Filter

Filter a list to keep only items matching a condition. Uses JSONata predicates.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `list` | any | Yes | The list to filter. Can be a JSON string or array. |
| `condition` | string | Yes | JSONata predicate expression to evaluate for each item. Items where the condition is truthy are kept. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `result` | array | Filtered list containing only matching items. |

### Example

```yaml
- id: find_errors
  type: data.filter
  params:
    list: "{{ Tasks['get_events'].output.events }}"
    condition: "type = 'Error'"
  next: handle_errors
```
