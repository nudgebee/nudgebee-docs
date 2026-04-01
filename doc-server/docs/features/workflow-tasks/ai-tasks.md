---
sidebar_position: 5
sidebar_label: AI Tasks
---

# AI Tasks

Leverage AI for summarization, investigation, classification, and routing.

## `llm.summary`

**Display Name:** AI Summary

Summarize text, logs, or data using AI. Pass any content and receive a concise summary highlighting key points.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `message` | string | Yes | The text, logs, or data to summarize. Supports template expressions to reference previous task outputs. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | AI-generated summary. |
| `conversation_id` | string | NuBi conversation ID (for follow-up). |
| `session_id` | string | NuBi session ID. |

### Example

```yaml
- id: summarize_logs
  type: llm.summary
  params:
    message: "Summarize these error logs:\n{{ Tasks['fetch_logs'].output.logs }}"
```

---

## `llm.investigate`

**Display Name:** AI Investigation

Ask AI to analyze and investigate a problem. The AI will research the issue using available tools and context, returning detailed findings and recommendations.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `message` | string | Yes | Description of the problem or question to investigate. Supports template expressions. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Investigation findings and recommendations. |
| `conversation_id` | string | NuBi conversation ID. |
| `session_id` | string | NuBi session ID. |

### Example

```yaml
- id: investigate_oom
  type: llm.investigate
  params:
    message: |
      Pod {{ Inputs.pod_name }} in namespace {{ Inputs.namespace }} was OOMKilled.
      Current memory limit: {{ Tasks['get_pod'].output.memory_limit }}
      Please investigate and recommend a fix.
```

---

## `llm.event_investigate`

**Display Name:** AI Event Investigation

Ask AI to investigate a specific event or alert. Designed for event-triggered workflows — automatically analyzes the event context, checks related resources, and provides root cause analysis.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `message` | string | Yes | Event or alert details. Typically pass `{{ event }}` for webhook-triggered workflows. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Root cause analysis and recommendations. |
| `conversation_id` | string | NuBi conversation ID. |
| `session_id` | string | NuBi session ID. |

### Example

```yaml
- id: analyze_alert
  type: llm.event_investigate
  params:
    message: "{{ event }}"
  next: notify_findings
```

---

## `llm.nubi`

**Display Name:** Ask NuBi

Ask NuBi (Nudgebee's AI assistant) to investigate an issue or answer a question. NuBi has access to your infrastructure context including K8s clusters, services, and events.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `message` | string | Yes | Question or issue to ask NuBi about. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | NuBi's response. |
| `conversation_id` | string | NuBi conversation ID. |
| `session_id` | string | NuBi session ID. |

### Example

```yaml
- id: ask_nubi
  type: llm.nubi
  params:
    message: "What is the current health status of the payments service in the production cluster?"
```

---

## `llm.classify`

**Display Name:** AI Classifier

Use AI to categorize input into one of several predefined options. Useful for routing decisions based on content analysis.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `prompt` | string | Yes | The user query or context to evaluate. |
| `options` | array | Yes | List of options, each with `name` (branch identifier) and `description` (what it represents). |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `selected_branch` | string | The `name` of the selected option. |

### Example

```yaml
- id: classify_alert
  type: llm.classify
  params:
    prompt: "{{ Inputs.alert_message }}"
    options:
      - name: "infrastructure"
        description: "Hardware, network, or cloud infrastructure issues"
      - name: "application"
        description: "Application bugs, crashes, or performance problems"
      - name: "security"
        description: "Security incidents, unauthorized access, or vulnerabilities"
  next: route_alert
```

---

## `llm.router`

**Display Name:** AI Router

Use AI to classify input and automatically route to the correct branch of tasks. Define multiple branches with descriptions — the AI selects which branch to execute.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `prompt` | string | Yes | The input to classify and route. |
| `branches` | array | No | List of branches, each with `name`, `description`, and `tasks` (list of task definitions to execute). |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `selected_branch` | string | Name of the branch that was selected and executed. |

### Example

```yaml
- id: smart_route
  type: llm.router
  params:
    prompt: "{{ Inputs.user_request }}"
    branches:
      - name: "scale_up"
        description: "User wants to increase resources or replicas"
        tasks:
          - id: scale
            type: k8s.horizontal_rightsize
            params:
              direction: "up"
              kind: "Deployment"
              namespace: "{{ Inputs.namespace }}"
              name: "{{ Inputs.workload }}"
              scaling_mode: "change_by"
              change_by: 1
      - name: "restart"
        description: "User wants to restart a service"
        tasks:
          - id: restart
            type: k8s.workload_restart
            params:
              namespace: "{{ Inputs.namespace }}"
              name: "{{ Inputs.workload }}"
              kind: "Deployment"
```

---

## `llm.a2a_call`

**Display Name:** AI Agent Call

Call an external AI agent via JSON-RPC 2.0. Use this to integrate with third-party AI agents or services that expose an agent-to-agent (A2A) compatible endpoint.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `url` | string | Yes | External agent endpoint URL. |
| `method` | string | Yes | JSON-RPC method name (e.g., `agent.chat`). |
| `params` | any | No | Parameters for the JSON-RPC call (JSON object). |
| `headers` | object | No | Custom headers (e.g., `Authorization`). |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `result` | any | Result of the JSON-RPC call. |
| `id` | string | Request ID echo. |
| `jsonrpc` | string | JSON-RPC version. |

---

## `llm.mcp_call`

**Display Name:** MCP Call

Call a tool on an external MCP (Model Context Protocol) compatible server.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `tool_name` | string | Yes | Name of the MCP tool to invoke. |
| `integration_id` | integration | No | MCP integration ID. If provided, URL and auth are resolved from the integration config. |
| `url` | string | No | MCP server URL (not needed if `integration_id` is provided). |
| `arguments` | object | No | Arguments for the tool. |
| `headers` | object | No | Optional HTTP headers. |
| `auth_type` | string | No | Authentication type. Options: `""` (none), `oauth2`. For bearer/basic/api_key, use `headers` directly. |
| `oauth_token_url` | string | No | OAuth 2.0 token endpoint. Visible when `auth_type` is `oauth2`. |
| `oauth_client_id` | string | No | OAuth 2.0 client ID. Visible when `auth_type` is `oauth2`. |
| `oauth_client_secret` | string | No | OAuth 2.0 client secret (encrypted). Visible when `auth_type` is `oauth2`. |
| `oauth_scope` | string | No | OAuth 2.0 scope (space-separated). Visible when `auth_type` is `oauth2`. |
| `oauth_audience` | string | No | OAuth 2.0 audience. Visible when `auth_type` is `oauth2`. |
| `timeout` | string | No | Request timeout. Default: `60s`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `content` | array | Content returned by the tool. |
| `isError` | boolean | Whether the tool execution resulted in an error. |
