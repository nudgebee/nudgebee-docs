# Nudgebee GraphQL API Documentation

Generated on: 2026-09-06T05:11:26.833Z

## Table of Contents

- [Getting Started](#getting-started)
  - [Authentication](#authentication)
  - [List Cloud Accounts Example](#list-cloud-accounts-example)
  - [Errors](#errors)
- [Common Examples](#common-examples)
- [Queries](#queries) (191 total)
  - [Cost Management](#queries--cost-management) (4)
  - [Anomalies](#queries--anomalies) (2)
  - [Events & Incidents](#queries--events-incidents) (8)
  - [Recommendations](#queries--recommendations) (6)
  - [Cloud Infrastructure](#queries--cloud-infrastructure) (10)
  - [Kubernetes](#queries--kubernetes) (13)
  - [Automation](#queries--automation) (9)
  - [AI & LLM](#queries--ai-llm) (35)
  - [Observability](#queries--observability) (21)
  - [Tickets](#queries--tickets) (5)
  - [Notifications](#queries--notifications) (6)
  - [Organization & Users](#queries--organization-users) (15)
  - [Integrations](#queries--integrations) (4)
  - [Configuration](#queries--configuration) (5)
  - [Audit](#queries--audit) (2)
  - [Other](#queries--other) (46)
- [Mutations](#mutations) (195 total)
  - [Anomalies](#mutations--anomalies) (2)
  - [Events & Incidents](#mutations--events-incidents) (21)
  - [Recommendations](#mutations--recommendations) (2)
  - [Cloud Infrastructure](#mutations--cloud-infrastructure) (18)
  - [Automation](#mutations--automation) (13)
  - [AI & LLM](#mutations--ai-llm) (45)
  - [Observability](#mutations--observability) (2)
  - [Compliance & Security](#mutations--compliance-security) (7)
  - [Tickets](#mutations--tickets) (4)
  - [Notifications](#mutations--notifications) (6)
  - [Organization & Users](#mutations--organization-users) (15)
  - [Integrations](#mutations--integrations) (7)
  - [Configuration](#mutations--configuration) (12)
  - [Data Warehouse](#mutations--data-warehouse) (1)
  - [Other](#mutations--other) (40)
- [Subscriptions](#subscriptions) (0 total)
- [Actions Without a Schema Entry](#actions-without-a-schema-entry) (106)
- [Types](#types) (1163 total)
  - [Core Types](#core-types) (1162)
  - [Helper Types](#helper-types-filter-input-ordering) (1)

## Getting Started

### How the API is shaped

Requests are GraphQL documents POSTed to `/api/graphql`, but the schema is **not** a table-per-entity
schema. Every operation is a named **action** — `accounts_list`, `events_list_v2`,
`recommendations_list` — routed by the in-app gateway to the service that owns it. Query the action,
not a table: there is no `cloud_accounts` root field; the account listing is `accounts_list`.

Most list actions share a shape: `limit`, `offset`, `order_by` and a typed `where`, answering with a
`rows` array.

### Authentication

Create an API token in **Admin → Access & Users → API Tokens**, then exchange it for a JWT. The API
token is used as the `secret` in step one — it is **not** sent directly as a bearer token.

```bash
curl -X POST https://your-domain.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email": "your-api-user@example.com", "secret": "your-api-token"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expiry": 3600
}
```

Then send the JWT as a bearer token on every request:

```bash
curl -X POST https://your-domain.com/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "{ accounts_list(limit: 3) { rows { id account_name cloud_provider } } }"}'
```

See [API Tokens](./api-tokens.md) for token lifecycle and scoping.

### List Cloud Accounts Example

**GraphQL Query:**

```graphql
query CloudAccounts {
  accounts_list(limit: 3) {
    rows {
      id
      account_name
      cloud_provider
      status
    }
  }
}
```

**Full curl example:**

```bash
# Step 1: Exchange the API token for a JWT
TOKEN=$(curl -s -X POST https://your-domain.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email": "api-user@example.com", "secret": "your-api-token"}' \
  | jq -r '.token')

# Step 2: Call an action
curl -X POST https://your-domain.com/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query HelloWorld { accounts_list(limit: 3) { rows { id account_name cloud_provider status } } }"
  }'
```

**JavaScript example:**

```javascript
const response = await fetch('https://your-domain.com/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `
      query HelloWorld {
        accounts_list(limit: 3) {
          rows {
            id
            account_name
            cloud_provider
            status
          }
        }
      }
    `,
  }),
});

const { data } = await response.json();
console.log(data.accounts_list.rows);
```

### Errors

A failed call still returns HTTP 200 with a GraphQL `errors` array. Two messages are worth
recognising:

| Message | Meaning |
|---|---|
| `Upstream unreachable for <action>` | The service that owns the action is down. |
| `Handler URL unresolved for <action>` | The deployment has no URL configured for that service. |

Calls made against `/api/rpc` instead of `/api/graphql` surface the same two as HTTP **502** and
**500** respectively.

---

## Common Examples

Copy-pasteable examples for the most common operations.

### List Cloud Accounts

**Category:** Cloud Infrastructure

Retrieve all connected cloud accounts with their provider and sync status.

```graphql
query ListCloudAccounts {
  accounts_list(order_by: [{column: "account_name", order: asc}]) {
    rows {
      id
      account_name
      cloud_provider
      account_type
      status
      sync_status
      synced_at
      created_at
    }
  }
}
```

---

### Get Spend Breakdown by Service

**Category:** Cost Management

Group cloud spend by service over a date range. Grouping is a server-side argument, not a nested aggregate.

```graphql
query SpendByService($startDate: Datetime, $endDate: Datetime) {
  spend_groupings_v2(
    group_by: ["resource_service_name"]
    where: {spend_date: {_gte: $startDate, _lte: $endDate}}
    order_by: [{column: "spend_amount", order: desc}]
    limit: 20
  ) {
    rows {
      resource_service_name
      spend_amount
      resource_count
      currency_type
    }
  }
}
```

**Variables:**

```json
{
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-01-31T23:59:59Z"
}
```

---

### Get Recommendations by Severity

**Category:** Recommendations

Fetch open recommendations sorted by severity, with estimated savings.

```graphql
query GetRecommendations($limit: Int, $offset: Int) {
  recommendations_list(
    where: {status: {_in: ["Open", "Assigned"]}}
    order_by: [{column: "severity_weight", order: desc}, {column: "estimated_savings", order: desc}]
    limit: $limit
    offset: $offset
  ) {
    rows {
      id
      rule_name
      category
      severity
      status
      estimated_savings
      resource_name
      resource_type
      resource_cloud_provider
    }
  }
}
```

**Variables:**

```json
{
  "limit": 25,
  "offset": 0
}
```

---

### List Kubernetes Pods

**Category:** Kubernetes

List active pods in one account, newest first.

```graphql
query ListK8sPods($accountId: String, $limit: Int) {
  k8s_pods_v2(
    where: {account_id: {_eq: $accountId}, is_active: {_eq: true}}
    order_by: [{column: "creation_time", order: desc}]
    limit: $limit
  ) {
    rows {
      name
      namespace
      workload_name
      workload_type
      status
      node_name
      restart_count
      creation_time
    }
  }
}
```

**Variables:**

```json
{
  "accountId": "00000000-0000-0000-0000-000000000000",
  "limit": 50
}
```

---

### Fetch Recent Events

**Category:** Events & Incidents

Read high-priority events that are still firing.

```graphql
query RecentEvents($limit: Int, $offset: Int) {
  events_list(
    where: {priority: {_in: ["HIGH", "MEDIUM"]}, status: {_eq: "FIRING"}}
    order_by: [{column: "starts_at", order: desc}]
    limit: $limit
    offset: $offset
  ) {
    rows {
      id
      title
      description
      source
      category
      priority
      status
      subject_type
      subject_name
      subject_namespace
      starts_at
    }
  }
}
```

**Variables:**

```json
{
  "limit": 50,
  "offset": 0
}
```

---

### List Tickets

**Category:** Tickets

List open tickets with their external reference.

```graphql
query ListTickets($limit: Int) {
  tickets_list(
    where: {status: {_neq: "Closed"}}
    order_by: [{column: "created_at", order: desc}]
    limit: $limit
  ) {
    rows {
      id
      ticket_id
      reference_id
      ticket_type
      status
      assignee
      message
      created_at
    }
  }
}
```

**Variables:**

```json
{
  "limit": 25
}
```

---

### Check Collector Agent Health

**Category:** Agents

See which collector agents are connected and when each last checked in.

```graphql
query AgentHealth {
  agents_list_health {
    rows {
      cloud_account_id
      type
      version
      status
      status_message
      last_connected_at
      k8s_version
      k8s_provider
    }
  }
}
```

---

### List User Groups

**Category:** organization-users

List the tenant’s user groups.

```graphql
query ListUserGroups($limit: Int) {
  usergroups_list(limit: $limit, order_by: [{column: "name", order: asc}]) {
    rows {
      id
      name
      description
      created_at
    }
  }
}
```

**Variables:**

```json
{
  "limit": 50
}
```

---

## Queries

### Cost Management {#queries--cost-management}

*Track cloud spending, budgets, billing, and funding sources across accounts.*

#### billing_aggregate

**Returns:** `billing_infographics_output!`

---

#### billing_list

**Arguments:**

- `limit`: `Int`
- `offset`: `Int`

**Returns:** `billing_list_output!`

---

#### billing_list_usage_costs

**Arguments:**

- `start_date`: `String!`
- `end_date`: `String!`
- `limit`: `Int`
- `offset`: `Int`

**Returns:** `billing_usage_cost_list_output!`

---

#### spend_groupings_v2

**Arguments:**

- `where`: `SpendGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `SpendGroupingsResponse`

---

### Anomalies {#queries--anomalies}

*Detect and manage cost and operational anomalies.*

#### anomaly_grouping_v2

**Arguments:**

- `where`: `ListAnomalyWhereRequest`

**Returns:** `AnomalyGroupingsResponse`

---

#### anomaly_type_v2

**Arguments:**

- `where`: `AnomalyTypeWhereRequest`
- `limit`: `Int`
- `offset`: `Int`

**Returns:** `AnomalyTypeResponse!`

---

### Events & Incidents {#queries--events-incidents}

*Event ingestion, alerting rules, triage, severity classification, and incident insights.*

#### event_get_filter_values

**Arguments:**

- `request`: `EventFilterValuesRequest!`

**Returns:** `EventFilterValuesResponse`

---

#### event_get_recurrence_info

**Arguments:**

- `event_id`: `String!`

**Returns:** `event_get_recurrence_info_output!`

---

#### event_groupings_v2

**Arguments:**

- `where`: `EventGroupingsWhereRequest`
- `having`: `EventGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `group_by`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `EventGroupingsResponse`

---

#### event_resolution_groupings_v2

**Arguments:**

- `where`: `EventResolutionGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `group_by`: `[String!]`

**Returns:** `EventResolutionGroupingsResponse`

---

#### event_resolution_v2

**Arguments:**

- `where`: `EventResolutionWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `EventResolutionResponse`

---

#### event_rules_groupings_v2

**Arguments:**

- `where`: `EventRulesGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `group_by`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `EventRulesGroupingsResponse`

---

#### event_rules_v2

**Arguments:**

- `where`: `EventRulesWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `EventRulesResponse`

---

#### events_list

**Arguments:**

- `where`: `EventsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `EventsResponse`

---

### Recommendations {#queries--recommendations}

*Cost optimization, security, and misconfiguration recommendations with estimated savings.*

#### recommendation_groupings_v2

**Arguments:**

- `where`: `RecommendationGroupingWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `group_by`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `RecommendationGroupingResponse`

---

#### recommendation_resolution_groupings_v2

**Arguments:**

- `where`: `RecommendationResolutionGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `group_by`: `[String!]`

**Returns:** `RecommendationResolutionGroupingsResponse`

---

#### recommendation_resolution_v2

**Arguments:**

- `where`: `RecommendationResolutionWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `RecommendationResolutionResponse`

---

#### recommendation_security_cis_groupings_v2

**Arguments:**

- `where`: `RecommendationSecurityCisGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `RecommendationSecurityCisGroupingsResponse`

---

#### recommendation_security_groupings_v2

**Arguments:**

- `where`: `RecommendationSecurityGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `RecommendationSecurityGroupingsResponse`

---

#### recommendation_security_v2

**Arguments:**

- `where`: `RecommendationSecurityWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `RecommendationSecurityResponse`

---

### Cloud Infrastructure {#queries--cloud-infrastructure}

*Cloud accounts, resources, provider-specific operations (AWS, Azure), and resource metrics.*

#### cloud_account_attrs_v2

**Arguments:**

- `where`: `CloudAccountAttrsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `CloudAccountAttrsResponse`

---

#### cloud_metric_groupings_v2

**Arguments:**

- `where`: `CloudMetricGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `CloudMetricGroupingsResponse`

---

#### cloud_resource_attributes_v2

**Arguments:**

- `where`: `CloudResourceAttributesWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `CloudResourceAttributesResponse`

---

#### cloud_resource_details_v2

**Arguments:**

- `where`: `CloudResourceDetailsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `CloudResourceDetailsResponse!`

---

#### cloud_resource_groupings_v2

**Arguments:**

- `where`: `CloudResourceGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `group_by`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `CloudResourceGroupingsResponse`

---

#### cloud_resource_metrics_v2

**Arguments:**

- `where`: `CloudResourceMetricsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `CloudResourceMetricsResponse!`

---

#### cloud_resource_v2

**Arguments:**

- `where`: `CloudResourcesWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `CloudResourcesResponse`

---

#### cloud_resources_list_v2

**Arguments:**

- `where`: `CloudResourcesListWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `CloudResourcesListResponse`

---

#### cloud_vm_package_groupings_v2

**Arguments:**

- `where`: `CloudVmPackageGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `group_by`: `[String!]`

**Returns:** `CloudVmPackageGroupingsResponse`

---

#### cloud_vm_packages_v2

**Arguments:**

- `where`: `CloudVmPackagesWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`

**Returns:** `CloudVmPackagesResponse`

---

### Kubernetes {#queries--kubernetes}

*K8s clusters, workloads, pods, nodes, namespaces, and cluster management.*

#### k8s_cluster_groupings_v2

**Arguments:**

- `where`: `K8sClusterGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `K8sClusterGroupingsResponse`

---

#### k8s_list_versions

**Returns:** `[K8sVersionResponse]`

---

#### k8s_metrics_groupings_v2

**Arguments:**

- `where`: `K8sMetricsGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `K8sMetricsGroupingsResponse`

---

#### k8s_namespace_groupings_v2

**Arguments:**

- `where`: `K8sNamespaceGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `K8sNamespaceGroupingsResponse`

---

#### k8s_namespaces_v2

**Arguments:**

- `where`: `K8sNamespaceWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `K8sNamespaceResponse`

---

#### k8s_nodes_groupings_v2

**Arguments:**

- `where`: `K8sNodesGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `K8sNodesGroupingsResponse`

---

#### k8s_nodes_v2

**Arguments:**

- `where`: `K8sNodesWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `K8sNodesResponse`

---

#### k8s_pod_groupings_v2

**Arguments:**

- `where`: `K8sPodGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `K8sPodGroupingsResponse`

---

#### k8s_pods_v2

**Arguments:**

- `where`: `K8sPodsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `K8sPodsResponse`

---

#### k8s_workload_groupings_v2

**Arguments:**

- `where`: `K8sWorkloadGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `K8sWorkloadGroupingsResponse`

---

#### k8s_workloads_cloud_account_monitoring_recommendations_v2

**Arguments:**

- `where`: `MonitoringWhereRequest`

**Returns:** `MonitoringRecommendationsResponse`

---

#### k8s_workloads_cloud_account_monitoring_v2

**Arguments:**

- `where`: `MonitoringWhereRequest`
- `order_by`: `[QuerySortByRequest]`

**Returns:** `MonitoringResponse`

---

#### k8s_workloads_v2

**Arguments:**

- `where`: `K8sWorkloadWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `K8sWorkloadResponse`

---

### Automation {#queries--automation}

*Auto-pilot policies, playbooks, runbooks, workflows, and optimization rules.*

#### workflow_get

**Arguments:**

- `request`: `WorkflowGetRequest`

**Returns:** `Workflow`

---

#### workflow_get_execution

**Arguments:**

- `request`: `WorkflowExecutionGetRequest!`

**Returns:** `WorkflowExecutionGetResponse`

---

#### workflow_get_template

**Arguments:**

- `request`: `WorkflowGetTemplateRequest!`

**Returns:** `WorkflowTemplateType`

---

#### workflow_list

**Arguments:**

- `request`: `WorkflowListRequest!`

**Returns:** `WorkflowListResponse`

---

#### workflow_list_callers

**Arguments:**

- `request`: `WorkflowListCallersRequest!`

**Returns:** `WorkflowListCallersResponse`

---

#### workflow_list_executions

**Arguments:**

- `request`: `WorkflowExecutionListRequest!`

**Returns:** `WorkflowExecutionListResponse`

---

#### workflow_list_executions_for_event

**Arguments:**

- `request`: `WorkflowExecutionListForEventRequest!`

**Returns:** `WorkflowExecutionListResponse`

---

#### workflow_list_taskdefinitions

**Arguments:**

- `params`: `WorkflowTaskDefinitionListRequest!`

**Returns:** `WorkflowTaskDefinitionListResponse`

---

#### workflow_list_template

**Arguments:**

- `request`: `WorkflowListTemplateRequest!`

**Returns:** `WorkflowTemplateListResponse`

---

### AI & LLM {#queries--ai-llm}

*AI conversations, knowledge bases, RAG, LLM agents, tools, and root cause analysis.*

#### ai_aggregate_conversations

**Arguments:**

- `where`: `LlmConversationGroupingsWhereRequest`

**Returns:** `LlmConversationGroupingsResponse!`

---

#### ai_generate_workflow

**Arguments:**

- `request`: `AIGenerateWorkflowRequest!`

**Returns:** `AIGenerateWorkflowResponse`

---

#### ai_get_budget_status

**Arguments:**

- `request`: `AIBudgetStatusRequest!`

**Returns:** `AIBudgetStatusResponse`

---

#### ai_get_budget_system_defaults

**Returns:** `AIBudgetSystemDefaultsResponse`

---

#### ai_get_conversation_detail_polling

**Arguments:**

- `where`: `LlmConversationDetailWhereRequest`
- `limit`: `Int`
- `offset`: `Int`

**Returns:** `LlmConversationDetailResponse!`

---

#### ai_get_conversation_v3

**Arguments:**

- `request`: `AiGetConversationV3Request!`

**Returns:** `AiGetConversationV3Response`

---

#### ai_get_gc

**Arguments:**

- `request`: `GetGCRequest!`

**Returns:** `GetGCResponse`

---

#### ai_get_kb

**Arguments:**

- `request`: `GetKBRequest!`

**Returns:** `GetKBResponse`

---

#### ai_get_kb_load_history

**Arguments:**

- `request`: `GetKBLoadHistoryRequest!`

**Returns:** `GetKBLoadHistoryResponse`

---

#### ai_get_model_config

**Arguments:**

- `request`: `AIGetModelConfigRequest!`

**Returns:** `AIGetModelConfigResponse`

---

#### ai_get_rca

**Arguments:**

- `event_id`: `String!`
- `account_id`: `String!`
- `generate`: `Boolean!`

**Returns:** `AIResponse`

---

#### ai_get_rcaformat

**Arguments:**

- `request`: `AIGetRcaFormatRequest!`

**Returns:** `AIGetRcaFormatResponse`

---

#### ai_get_recommendation

**Arguments:**

- `event_id`: `String!`
- `account_id`: `String!`
- `recommendation_type`: `String!`
- `regenerate`: `Boolean`

**Returns:** `AIResponse`

---

#### ai_get_workspace_file

**Arguments:**

- `request`: `AiGetWorspaceFile!`

**Returns:** `jsonb`

---

#### ai_list_agent_installations

**Arguments:**

- `where`: `LlmAgentsInstallationWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`

**Returns:** `LlmAgentsInstallationResponse`

---

#### ai_list_agent_kbs

**Arguments:**

- `request`: `ListAgentKBsRequest!`

**Returns:** `ListAgentKBsResponse`

---

#### ai_list_agents

**Arguments:**

- `request`: `ListAgentRequest!`

**Returns:** `ListAgentResponse`

---

#### ai_list_agents_with_kb_counts

**Arguments:**

- `request`: `ListAgentsWithKBCountsRequest!`

**Returns:** `ListAgentsWithKBCountsResponse`

---

#### ai_list_budget_config

**Arguments:**

- `request`: `AIBudgetConfigListRequest!`

**Returns:** `AIBudgetConfigListResponse`

---

#### ai_list_conversation_feedback

**Arguments:**

- `where`: `GetFeedbackWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `GetFeedbackResponse`

---

#### ai_list_conversations

**Arguments:**

- `where`: `LlmConversationListWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `LlmConversationListResponse!`

---

#### ai_list_functions

**Arguments:**

- `where`: `LlmFunctionsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `LlmFunctionsResponse`

---

#### ai_list_gc

**Arguments:**

- `request`: `ListGCRequest!`

**Returns:** `ListGCResponse`

---

#### ai_list_kb

**Arguments:**

- `request`: `ListKBRequest!`

**Returns:** `ListKBResponse`

---

#### ai_list_memory

**Arguments:**

- `request`: `ListAIMemoryRequest!`

**Returns:** `ListAIMemoryResponse`

---

#### ai_list_models

**Arguments:**

- `request`: `AIListModelsRequest!`

**Returns:** `AIListModelsResponse`

---

#### ai_list_references

**Arguments:**

- `request`: `ListAIReferencesRequest!`

**Returns:** `ListAIReferencesResponse`

---

#### ai_list_tools

**Arguments:**

- `request`: `ListToolRequest!`

**Returns:** `ListToolResponse`

---

#### ai_list_watches_by_conversation

**Arguments:**

- `request`: `AILlmWatchListRequest!`

**Returns:** `AILlmWatchListResponse`

---

#### ai_remediation_generate

**Arguments:**

- `account_id`: `String!`
- `event_id`: `String`
- `context`: `String!`
- `available_artifacts`: `[String!]`

**Returns:** `AIResponse`

---

#### ai_remediation_get

**Arguments:**

- `account_id`: `String!`
- `event_id`: `String`

**Returns:** `AIResponse`

---

#### kg_get_filter_options

**Arguments:**

- `request`: `kg_get_filter_options_input`

**Returns:** `kg_get_filter_options_output`

---

#### kg_get_filter_values

**Arguments:**

- `request`: `kg_get_filter_values_input!`

**Returns:** `kg_get_filter_values_output`

---

#### kg_get_tenant_filter

**Returns:** `kg_get_tenant_filter_output`

---

#### knowledge_base_v2

**Arguments:**

- `where`: `KnowledgeBaseWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `KnowledgeBaseResponse`

---

### Observability {#queries--observability}

*Logs, metrics, traces, application profiles, and service maps.*

#### log_group

**Arguments:**

- `request`: `LogGroupRequest!`

**Returns:** `LogGroupOutput`

---

#### logs_list

**Arguments:**

- `request`: `FetchLogRequest!`

**Returns:** `[FetchLogResponse]`

---

#### logs_list_label_values

**Arguments:**

- `request`: `FetchLogLabelValuesRequest!`

**Returns:** `[OutputLogLabelValue]`

---

#### logs_list_labels

**Arguments:**

- `request`: `FetchLogLabelRequest!`

**Returns:** `[OutputLogLabel]`

---

#### metric_groupings_v2

**Arguments:**

- `where`: `MetricGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `MetricGroupingsResponse`

---

#### metrics_aggregate_utilisation

**Arguments:**

- `request`: `MetricsQueryUtilisationRequest!`

**Returns:** `OutputMetricQuery`

---

#### metrics_get_query

**Arguments:**

- `request`: `FetchMetricsRequest!`

**Returns:** `FetchMetricQueryOutput`

---

#### metrics_list

**Arguments:**

- `request`: `FetchMetricsRequest!`

**Returns:** `OutputMetricQuery`

---

#### metrics_list_label_values

**Arguments:**

- `request`: `FetchMetricsLabelValueRequest!`

**Returns:** `[OutputMetricsLabelValues]`

---

#### metrics_list_labels

**Arguments:**

- `request`: `FetchMetricLabelsRequest!`

**Returns:** `[OutputMetricLabels]`

---

#### metrics_list_names

**Arguments:**

- `request`: `FetchMetricsListRequest!`

**Returns:** `[OutputMetrics]`

---

#### ml_get_metrics

**Arguments:**

- `deployment`: `String!`
- `namespace`: `String!`
- `account`: `String!`

**Returns:** `metrics_response`

---

#### traces_counts

**Arguments:**

- `request`: `TracesV3Input!`

**Returns:** `TracesV3CountResponse`

---

#### traces_get_heatmap

**Arguments:**

- `request`: `TraceHeatMapInput!`

**Returns:** `[TraceHeatMapOutput]`

---

#### traces_grouping_count_v3

**Arguments:**

- `request`: `TracesV3Input!`

**Returns:** `TracesGroupV3CountResponse`

---

#### traces_grouping_v3

**Arguments:**

- `request`: `TracesV3Input!`

**Returns:** `[TraceGroupingValues]!`

---

#### traces_groupings_v2

**Arguments:**

- `where`: `TraceGroupingWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `group_by`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `having`: `TraceGroupingWhereRequest`

**Returns:** `TracesGroupResponse`

---

#### traces_heatmap_v2

**Arguments:**

- `where`: `TraceHeatMapWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `TracesHeatMapResponse`

---

#### traces_label_values

**Arguments:**

- `request`: `TracesV3LabelValuesRequest!`

**Returns:** `TracesV3LabelValuesResponse`

---

#### traces_list

**Arguments:**

- `request`: `TracesV3Input!`

**Returns:** `[TracesOutputResponse]!`

---

#### traces_v2

**Arguments:**

- `where`: `TraceWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `TracesResponse`

---

### Tickets {#queries--tickets}

*Ticket creation, management, and integrations with external issue trackers.*

#### ticket_get_comments

**Arguments:**

- `object`: `TicketGetCommentsObjectInput!`

**Returns:** `TicketComments!`

---

#### ticket_groupings_v2

**Arguments:**

- `where`: `TicketGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `group_by`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `TicketGroupingsResponse`

---

#### tickets_get_create_meta

**Arguments:**

- `integration_id`: `String!`
- `project_key`: `String!`

**Returns:** `ticket_create_meta_response`

---

#### tickets_get_field_values

**Arguments:**

- `integration_id`: `String!`
- `url`: `String!`
- `key`: `String!`
- `search_term`: `String`

**Returns:** `ticket_field_values_response`

---

#### tickets_list

**Arguments:**

- `where`: `TicketsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `TicketsResponse`

---

### Notifications {#queries--notifications}

*Notification channels, delivery rules, and user notification preferences.*

#### notification_channel_account_mapping_v2

**Arguments:**

- `where`: `NotificationChannelAccountMappingWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `NotificationChannelAccountMappingResponse`

---

#### notification_get_user_list

**Arguments:**

- `platform`: `String!`

**Returns:** `notification_user_list_resp`

---

#### notifications_aggregate_rules

**Arguments:**

- `where`: `NotificationRulesWhereRequest`

**Returns:** `NotificationRulesAggregationResponse!`

---

#### notifications_google_chat_permission_status

**Returns:** `gchat_permission_status_resp`

---

#### notifications_list_channels

**Arguments:**

- `platform`: `String!`

**Returns:** `notification_channel_list_resp`

---

#### notifications_list_rules

**Arguments:**

- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `where`: `NotificationRulesWhereRequest`

**Returns:** `NotificationRulesResponse!`

---

### Organization & Users {#queries--organization-users}

*Users, tenants, business units, roles, groups, projects, and authentication.*

#### roles_list

**Arguments:**

- `object`: `roles_list_input`

**Returns:** `[roles_list_item!]!`

---

#### tenant_attributes_v2

**Returns:** `TenantAttributesResponse`

---

#### tenant_by_user_v2

**Arguments:**

- `where`: `TenantByUserWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `TenantByUserResponse`

---

#### tenant_list_all

**Returns:** `[tenant_list_all_output!]!`

---

#### users_aggregate_by_tenant

**Arguments:**

- `where`: `UsersByTenantWhereRequest`

**Returns:** `UsersByTenantAggregationResponse!`

---

#### users_get_auth_by_username

**Arguments:**

- `where`: `UserAuthByUsernameWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `UserAuthByUsernameResponse`

---

#### users_get_by_provider_account

**Arguments:**

- `where`: `UserByProviderAccountWhereRequest`

**Returns:** `UserByProviderAccountResponse`

---

#### users_get_details

**Arguments:**

- `where`: `UserDetailsWhereRequest`

**Returns:** `UserDetailsResponse`

---

#### users_get_super_admin_role

**Arguments:**

- `where`: `UserSuperAdminRoleWhereRequest`

**Returns:** `UserSuperAdminRoleResponse`

---

#### users_list_account_ids_by_tenant

**Arguments:**

- `where`: `UserAccountIdsByTenantWhereRequest`

**Returns:** `UserAccountIdsByTenantResponse`

---

#### users_list_by_tenant

**Arguments:**

- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `where`: `UsersByTenantWhereRequest`

**Returns:** `UsersByTenantResponse!`

---

#### users_list_history

**Arguments:**

- `where`: `UserHistoryWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `UserHistoryResponse`

---

#### users_list_status_types

**Returns:** `[user_status_types_list_item!]!`

---

#### users_list_tenants

**Arguments:**

- `object`: `user_list_tenants_input!`

**Returns:** `[user_list_tenants_item!]!`

---

#### users_list_token

**Returns:** `UserAuthTokenResponse`

---

### Integrations {#queries--integrations}

*Third-party integrations: Slack, MS Teams, Jira, and custom connectors.*

#### integrations_aggregate

**Arguments:**

- `where`: `IntegrationWhereRequest`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `IntegrationAggregationResponse!`

---

#### integrations_autogen_options

**Arguments:**

- `request`: `IntegrationAutogenOptionsRequest!`

**Returns:** `IntegrationAutogenOptionsResponse`

---

#### integrations_get_schema

**Arguments:**

- `request`: `IntegrationSchemaRequest!`

**Returns:** `IntegrationSchemaResponse`

---

#### integrations_list

**Arguments:**

- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `where`: `IntegrationWhereRequest`

**Returns:** `IntegrationResponse!`

---

### Configuration {#queries--configuration}

*Feature flags, SLO targets, system configuration, and upgrade management.*

#### slo_config_v2

**Arguments:**

- `where`: `SloConfigWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `SloConfigResponse`

---

#### slo_report_observation_v2

**Arguments:**

- `where`: `SloReportObservationWhereRequest`
- `limit`: `Int`
- `offset`: `Int`

**Returns:** `SloReportObservationResponse`

---

#### slo_report_v2

**Arguments:**

- `where`: `SloReportWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `SloReportResponse`

---

#### upgrade_plan_audit_v2

**Arguments:**

- `where`: `UpgradePlanAuditWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `UpgradePlanAuditResponse`

---

#### upgrade_plan_fetch_all

**Arguments:**

- `account_id`: `String!`

**Returns:** `[UpgradePlanResponse]`

---

### Audit {#queries--audit}

*Audit logs, user action history, and system activity tracking.*

#### audit_groupings_v2

**Arguments:**

- `where`: `AuditGroupingWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `group_by`: `[String!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `AuditGroupingResponse`

---

#### audits_v2

**Arguments:**

- `where`: `AuditWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `AuditResponse`

---

### Other {#queries--other}

*Uncategorized operations.*

#### accounts_aggregate

**Arguments:**

- `where`: `CloudAccountWhereRequest`

**Returns:** `CloudAccountAggregationResponse!`

---

#### accounts_list

**Arguments:**

- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `where`: `CloudAccountWhereRequest`

**Returns:** `CloudAccountResponse!`

---

#### agents_list_health

**Arguments:**

- `where`: `AgentHealthWhereRequest`

**Returns:** `AgentHealthResponse!`

---

#### agents_list_playbooks

**Arguments:**

- `where`: `AgentPlaybookWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `AgentPlaybookResponse`

---

#### anomalies_list

**Arguments:**

- `where`: `ListAnomalyV3WhereRequest`
- `limit`: `Int`
- `offset`: `Int`

**Returns:** `ListAnomalyV3Response`

---

#### anomalies_list_v2

**Arguments:**

- `where`: `ListAnomalyWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `ListAnomalyResponse`

---

#### applications_aggregate_group_mappings

**Arguments:**

- `where`: `ApplicationGroupMappingGroupingsWhereRequest`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `ApplicationGroupMappingGroupingsResponse`

---

#### applications_aggregate_groups

**Arguments:**

- `where`: `ApplicationGroupGroupingsWhereRequest`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `ApplicationGroupGroupingsResponse`

---

#### applications_list_group_mappings

**Arguments:**

- `where`: `ApplicationGroupMappingWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `ApplicationGroupMappingResponse`

---

#### applications_list_groups

**Arguments:**

- `where`: `ApplicationGroupWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `ApplicationGroupResponse`

---

#### applications_list_profiles

**Arguments:**

- `where`: `ApplicationProfileWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `ApplicationProfileResponse`

---

#### autooptimize_aggregate

**Arguments:**

- `where`: `AutoPilotGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest]`
- `columns`: `[String]`
- `group_by`: `[String]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `AutoPilotGroupingsResponse`

---

#### autooptimize_aggregate_approvals

**Arguments:**

- `where`: `AutoPilotApprovalsGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `group_by`: `[String!]`

**Returns:** `AutoPilotApprovalsGroupingsResponse`

---

#### autooptimize_aggregate_tasks

**Arguments:**

- `where`: `AutoPilotTaskGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `group_by`: `[String!]`

**Returns:** `AutoPilotTaskGroupingsResponse`

---

#### autooptimize_list

**Arguments:**

- `where`: `AutoPilotWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `AutoPilotResponse`

---

#### autooptimize_list_approval_policies

**Arguments:**

- `where`: `AutoPilotApprovalPolicyWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `AutoPilotApprovalPolicyResponse`

---

#### autooptimize_list_approvals

**Arguments:**

- `where`: `AutoPilotApprovalsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `AutoPilotApprovalsResponse`

---

#### autooptimize_list_tasks

**Arguments:**

- `where`: `AutoPilotTaskWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `AutoPilotTaskResponse`

---

#### clusters_check_health

**Arguments:**

- `account_id`: `String!`
- `resource_type`: `String!`

**Returns:** `health_check_response`

---

#### dashboards_get

**Arguments:**

- `request`: `DashboardGetRequest!`

**Returns:** `DashboardGetResponse`

---

#### dashboards_list

**Arguments:**

- `request`: `DashboardListRequest!`

**Returns:** `[Dashboard]`

---

#### dashboards_list_contextual

**Arguments:**

- `request`: `DashboardResolveRequest!`

**Returns:** `[Dashboard]`

---

#### dashboards_list_versions

**Arguments:**

- `request`: `DashboardGetRequest!`

**Returns:** `[DashboardVersion]`

---

#### executions_aggregate

**Arguments:**

- `request`: `ExecutionAggregateRequest!`

**Returns:** `ExecutionAggregateResponse`

---

#### executions_list

**Arguments:**

- `request`: `AccountExecutionListRequest!`

**Returns:** `AccountExecutionListResponse`

---

#### featureflags_list

**Arguments:**

- `where`: `FeatureFlagWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `FeatureFlagResponse`

---

#### features_list

**Arguments:**

- `where`: `FeatureWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `FeatureResponse`

---

#### insights_list

**Arguments:**

- `where`: `InsightWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `group_by`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `InsightV2Response`

---

#### messagingplatforms_list

**Arguments:**

- `object`: `messaging_platform_list_input`

**Returns:** `messaging_platform_list_output`

---

#### nudgebee_list_versions

**Returns:** `NBVersionResponse`

---

#### observability_get_default_provider

**Arguments:**

- `request`: `DefaultProviderRequest!`

**Returns:** `DefaultProviderResponse`

---

#### observability_get_label_mapping

**Arguments:**

- `request`: `GetLabelMappingRequest!`

**Returns:** `LabelMappingResponse`

---

#### observability_list_provider_capabilities

**Arguments:**

- `request`: `ListProviderCapabilitiesRequest!`

**Returns:** `[ProviderCapabilityEntry]`

---

#### recommendations_list

**Arguments:**

- `where`: `RecommendationWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `RecommendationResponse`

---

#### resource_details_v2

**Arguments:**

- `where`: `ResourceDetailsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `columns`: `[String!]`

**Returns:** `ResourceDetailsResponse`

---

#### resource_groupings_v2

**Arguments:**

- `where`: `ResourceGroupingsWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `columns`: `[String!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`
- `group_by`: `[String!]`

**Returns:** `ResourceGroupingsResponse`

---

#### resource_spend_trend_v2

**Arguments:**

- `where`: `ResourceSpendTrendWhereRequest`
- `order_by`: `[QuerySortByRequest!]`
- `column_transformations`: `[QueryColumnTransformationRequest!]`

**Returns:** `ResourceSpendTrendResponse`

---

#### signup_check_token

**Arguments:**

- `token`: `String!`

**Returns:** `[tenant_onboarding_record!]!`

---

#### tenants_list

**Arguments:**

- `where`: `TenantWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `TenantResponse`

---

#### usergroups_aggregate

**Arguments:**

- `where`: `UserGroupsWhereRequest`

**Returns:** `UserGroupsAggregationResponse!`

---

#### usergroups_aggregate_users

**Arguments:**

- `where`: `UsergroupUsersGroupingWhereRequest`

**Returns:** `UsergroupUsersGroupingResponse`

---

#### usergroups_check_name_exists

**Arguments:**

- `object`: `check_group_name_exists_input!`

**Returns:** `[check_group_name_exists_item!]!`

---

#### usergroups_list

**Arguments:**

- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`
- `where`: `UserGroupsWhereRequest`

**Returns:** `UserGroupsResponse!`

---

#### usergroups_list_users

**Arguments:**

- `where`: `UsergroupUsersWhereRequest`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QuerySortByRequest!]`

**Returns:** `UsergroupUsersResponse`

---

#### workflows_count

**Arguments:**

- `request`: `WorkflowCountRequest!`

**Returns:** `WorkflowCountResponse`

---

#### workflows_count_executions

**Arguments:**

- `request`: `WorkflowExecutionCountRequest!`

**Returns:** `WorkflowExecutionCountResponse`

---

## Mutations

### Anomalies {#mutations--anomalies}

*Detect and manage cost and operational anomalies.*

#### anomaly_execute

**Arguments:**

- `request`: `TriggerAnomalyExecuteRequest!`

**Returns:** `TriggerAnomalyExecuteResponse`

---

#### anomaly_template_list

**Arguments:**

- `request`: `AnomalyTemplateListRequest!`

**Returns:** `AnomalyTemplateListResponse`

---

### Events & Incidents {#mutations--events-incidents}

*Event ingestion, alerting rules, triage, severity classification, and incident insights.*

#### event_apply_threshold_suggestion

**Arguments:**

- `alert_rule_key`: `String!`
- `cloud_account_id`: `String!`
- `method`: `String!`
- `override_risk`: `Boolean`
- `accept_value`: `Float`
- `accept_duration`: `Int`
- `git_provider`: `String`
- `git_integration`: `String`
- `git_file_path`: `String`
- `git_org`: `String`
- `git_repo`: `String`
- `git_branch`: `String`
- `reference_link`: `String`

**Returns:** `ThresholdApplyResultOutput`

---

#### event_create_triage_rule

**Arguments:**

- `cloud_account_id`: `String!`
- `rule_type`: `String!`
- `action`: `String!`
- `match_source`: `String`
- `match_alertname`: `String`
- `match_namespace`: `String`
- `match_service`: `String`
- `match_fingerprint`: `String`
- `match_labels`: `String`
- `match_priority`: `String`
- `match_finding_type`: `String`
- `action_value`: `String`
- `priority`: `Int`
- `effective_until`: `String`
- `name`: `String`
- `description`: `String`
- `apply_to_existing`: `Boolean`

**Returns:** `CreateTriageRuleResponse`

---

#### event_delete_triage_rule

**Arguments:**

- `cloud_account_id`: `String!`
- `rule_id`: `String!`
- `hard_delete`: `Boolean`

**Returns:** `DeleteTriageRuleResponse`

---

#### event_get_duplicate_suggestions

**Arguments:**

- `event_id`: `String!`

**Returns:** `EventGetDuplicateSuggestionsOutput`

---

#### event_get_duplicates

**Arguments:**

- `event_id`: `String!`

**Returns:** `EventGetDuplicatesOutput`

---

#### event_get_impact

**Arguments:**

- `event_id`: `String!`

**Returns:** `EventGetImpactOutput`

---

#### event_get_threshold_apply_options

**Arguments:**

- `alert_rule_key`: `String!`
- `cloud_account_id`: `String!`

**Returns:** `ThresholdApplyOptionsOutput`

---

#### event_get_threshold_suggestion

**Arguments:**

- `event_id`: `String!`

**Returns:** `ThresholdSuggestionOutput`

---

#### event_get_timeline

**Arguments:**

- `event_id`: `String!`

**Returns:** `EventTimelineOutput`

---

#### event_get_triage_rule_events

**Arguments:**

- `rule_id`: `String!`
- `account_id`: `String`
- `limit`: `Int`
- `offset`: `Int`
- `start_date`: `String`
- `end_date`: `String`

**Returns:** `EventGetTriageRuleEventsOutput`

---

#### event_get_triage_rules

**Arguments:**

- `cloud_account_id`: `String`
- `rule_type`: `String`
- `enabled`: `Boolean`

**Returns:** `EventGetTriageRulesOutput`

---

#### event_list_threshold_suggestions

**Arguments:**

- `cloud_account_id`: `String`
- `source`: `String`
- `confidence`: `String`
- `limit`: `Int`
- `offset`: `Int`

**Returns:** `ThresholdSuggestionListOutput`

---

#### event_revert_threshold_suggestion

**Arguments:**

- `alert_rule_key`: `String!`
- `cloud_account_id`: `String!`

**Returns:** `ThresholdApplyResultOutput`

---

#### event_update

**Arguments:**

- `request`: `EventUpdateRequest!`

**Returns:** `EventsRowResponse`

---

#### event_update_nb_status

**Arguments:**

- `event_id`: `String!`
- `nb_status`: `String!`
- `snoozed_until`: `String`

**Returns:** `UpdateNBStatusResponse`

---

#### event_update_triage_rule

**Arguments:**

- `cloud_account_id`: `String!`
- `rule_id`: `String!`
- `rule_type`: `String!`
- `action`: `String!`
- `match_source`: `String`
- `match_alertname`: `String`
- `match_namespace`: `String`
- `match_service`: `String`
- `match_fingerprint`: `String`
- `match_labels`: `String`
- `match_priority`: `String`
- `match_finding_type`: `String`
- `action_value`: `String`
- `priority`: `Int`
- `effective_until`: `String`
- `name`: `String`
- `description`: `String`
- `apply_to_existing`: `Boolean`

**Returns:** `UpdateTriageRuleResponse`

---

#### events_dryrun_classification

**Arguments:**

- `event_id`: `String!`
- `classification`: `String!`
- `apply_scope`: `String`
- `apply_until_hours`: `Int`

**Returns:** `ClassifyPreviewResponse`

---

#### events_dryrun_triage_rule

**Arguments:**

- `cloud_account_id`: `String!`
- `rule_type`: `String!`
- `action`: `String!`
- `match_source`: `String`
- `match_alertname`: `String`
- `match_namespace`: `String`
- `match_service`: `String`
- `match_fingerprint`: `String`
- `match_labels`: `String`
- `match_priority`: `String`
- `match_finding_type`: `String`

**Returns:** `EventPreviewTriageRuleOutput`

---

#### events_update_classification

**Arguments:**

- `event_id`: `String!`
- `classification`: `String!`
- `reason_code`: `String!`
- `reason_text`: `String`
- `priority_direction`: `String`
- `corrected_priority`: `String`
- `apply_scope`: `String`
- `apply_until_hours`: `Int`
- `linked_event_id`: `String`
- `apply_to_existing`: `Boolean`
- `confirmed`: `Boolean`
- `preserve_status`: `Boolean`

**Returns:** `ClassifyEventResponse`

---

#### events_update_resolution

**Arguments:**

- `object`: `event_resolve_input!`

**Returns:** `event_resolve_output`

---

#### events_update_rule_override

**Arguments:**

- `cloud_account_id`: `String!`
- `system_rule_id`: `String!`
- `disabled`: `Boolean!`

**Returns:** `ToggleSystemRuleOverrideResponse`

---

### Recommendations {#mutations--recommendations}

*Cost optimization, security, and misconfiguration recommendations with estimated savings.*

#### recommendation_export

**Arguments:**

- `request`: `ExportRecommendationRequest!`

**Returns:** `ExportRecommendationResponse`

---

#### recommendation_job_create

**Arguments:**

- `account_id`: `String!`
- `job_name`: `String!`

**Returns:** `recommendation_job_create_output`

---

### Cloud Infrastructure {#mutations--cloud-infrastructure}

*Cloud accounts, resources, provider-specific operations (AWS, Azure), and resource metrics.*

#### aws_cloud_formation

**Arguments:**

- `object`: `AWSCloudFormationInput!`

**Returns:** `AWSCloudFormationOutput`

---

#### aws_get_onboard_eventbridge_url

**Arguments:**

- `object`: `AwsEventBridgeOnboardInput!`

**Returns:** `AwsEventBridgeOnboardOutput`

---

#### aws_org_refresh_token

**Returns:** `AwsOrgRefreshTokenOutput`

---

#### aws_org_status

**Returns:** `AwsOrgStatusOutput`

---

#### azure_get_onboard_eventgrid_url

**Arguments:**

- `object`: `AzureEventGridOnboardInput!`

**Returns:** `AzureEventGridOnboardOutput`

---

#### azure_list_subscriptions

**Arguments:**

- `object`: `AzureListSubscriptionsInput!`

**Returns:** `AzureListSubscriptionsOutput`

---

#### cloud_account_attrs_upsert

**Arguments:**

- `object`: `cloud_account_attrs_upsert_input!`

**Returns:** `cloud_account_attrs_upsert_output`

---

#### cloud_account_update

**Arguments:**

- `object`: `cloud_account_update_input!`

**Returns:** `cloud_account_update_output`

---

#### cloud_apply_command

**Arguments:**

- `account_id`: `String!`
- `service_name`: `String!`
- `region`: `String!`
- `resource_id`: `String!`
- `command`: `String!`
- `args`: `jsonb`

**Returns:** `CloudApplyCommandResponse`

---

#### cloud_check_credentials

**Arguments:**

- `object`: `ValidateCloudCredentialsInput!`

**Returns:** `ValidateCloudCredentialsOutput`

---

#### cloud_check_monitoring_permission

**Arguments:**

- `object`: `CheckGcpMonitoringPermissionInput!`

**Returns:** `CheckGcpMonitoringPermissionOutput`

---

#### cloud_execute_command

**Arguments:**

- `account_id`: `String!`
- `commands`: `[String!]!`
- `recommendation_id`: `String`

**Returns:** `ExecuteCloudCommandResponse`

---

#### cloud_list_metrics

**Arguments:**

- `request`: `CloudMetricsRequestInput!`

**Returns:** `CloudMetricsResponse`

---

#### cloud_list_notification_targets

**Arguments:**

- `account_id`: `String!`
- `region`: `String`

**Returns:** `CloudNotificationTargetsResponse`

---

#### cloud_resource_attributes_upsert

**Arguments:**

- `objects`: `[cloud_resource_attribute_item!]!`

**Returns:** `cloud_resource_attributes_upsert_output`

---

#### cloud_setup_monitoring_webhook

**Arguments:**

- `object`: `SetupGcpMonitoringWebhookInput!`

**Returns:** `SetupGcpMonitoringWebhookOutput`

---

#### cloud_sync_service

**Arguments:**

- `account_id`: `String!`
- `service_name`: `String!`
- `regions`: `[String!]`

**Returns:** `CloudServiceSyncResponse`

---

#### cloud_update_cloudformation_permissions

**Arguments:**

- `object`: `CloudUpdateCloudformationPermissionsInput!`

**Returns:** `CloudUpdateCloudformationPermissionsOutput`

---

### Automation {#mutations--automation}

*Auto-pilot policies, playbooks, runbooks, workflows, and optimization rules.*

#### workflow_cancel_execution

**Arguments:**

- `request`: `WorkflowCancelRequest!`

**Returns:** `WorkflowCancelResponse`

---

#### workflow_check

**Arguments:**

- `request`: `WorkflowCreateRequest!`

**Returns:** `WorkflowValidateResponse`

---

#### workflow_complete_approval

**Arguments:**

- `request`: `WorkflowCompleteApprovalRequest!`

**Returns:** `WorkflowCompleteApprovalResponse`

---

#### workflow_create

**Arguments:**

- `request`: `WorkflowCreateRequest!`

**Returns:** `WorkflowCreateResponse`

---

#### workflow_delete

**Arguments:**

- `request`: `WorkflowDeleteRequest!`

**Returns:** `WorkflowDeleteResponse`

---

#### workflow_dryrun_execute

**Arguments:**

- `request`: `WorkflowDryrunRequest!`

**Returns:** `WorkflowDryrunResponse`

---

#### workflow_execute

**Arguments:**

- `request`: `WorkflowTriggerRequest!`

**Returns:** `WorkflowTriggerResponse`

---

#### workflow_execute_task

**Arguments:**

- `account_id`: `String!`
- `task_type`: `String!`
- `params`: `jsonb`

**Returns:** `jsonb`

---

#### workflow_list_mcp_tools

**Arguments:**

- `account_id`: `String!`
- `params`: `jsonb!`

**Returns:** `WorkflowListMCPToolsResponse`

---

#### workflow_pause

**Arguments:**

- `request`: `WorkflowGetRequest!`

**Returns:** `WorkflowPauseResponse`

---

#### workflow_replay_execution

**Arguments:**

- `request`: `WorkflowRetriggerRequest!`

**Returns:** `WorkflowRetriggerResponse`

---

#### workflow_resume

**Arguments:**

- `request`: `WorkflowGetRequest!`

**Returns:** `WorkflowResumeResponse`

---

#### workflow_update

**Arguments:**

- `request`: `WorkflowUpdateRequest!`

**Returns:** `WorkflowUpdateResponse`

---

### AI & LLM {#mutations--ai-llm}

*AI conversations, knowledge bases, RAG, LLM agents, tools, and root cause analysis.*

#### ai_cancel_investigation

**Arguments:**

- `request`: `AIStopInvestigationRequest!`

**Returns:** `AIStopInvestigationResponse`

---

#### ai_cancel_watch

**Arguments:**

- `request`: `AILlmWatchCancelRequest!`

**Returns:** `AILlmWatchCancelResponse`

---

#### ai_create_agent

**Arguments:**

- `request`: `CreateAgentRequest!`

**Returns:** `CreateAgentResponse`

---

#### ai_create_agent_extension

**Arguments:**

- `request`: `CreateExtensionAgentRequest!`

**Returns:** `CreateAgentExtensionResponse`

---

#### ai_create_function

**Arguments:**

- `account_id`: `String!`
- `function`: `CreateFunctionInput!`

**Returns:** `FunctionResponse`

---

#### ai_create_gc

**Arguments:**

- `request`: `CreateGCRequest!`

**Returns:** `CreateGCResponse`

---

#### ai_create_kb

**Arguments:**

- `request`: `CreateKBRequest!`

**Returns:** `CreateKBResponse`

---

#### ai_create_kb_mapping

**Arguments:**

- `request`: `MapKBToAgentRequest!`

**Returns:** `MapKBToAgentResponse`

---

#### ai_create_rag

**Arguments:**

- `request`: `CreateAgentRagInput!`

**Returns:** `CreateAgentRagOutput`

---

#### ai_create_saved_conversation

**Arguments:**

- `request`: `SaveLLMConversationRequest!`

**Returns:** `SaveLLMConversationResponse`

---

#### ai_create_tool

**Arguments:**

- `request`: `CreateToolRequest!`

**Returns:** `CreateToolResponse`

---

#### ai_delete_agent

**Arguments:**

- `request`: `DeleteAgentRequest!`

**Returns:** `DeleteAgentResponse`

---

#### ai_delete_budget_config

**Arguments:**

- `request`: `AIBudgetConfigDeleteRequest!`

**Returns:** `AIBudgetConfigDeleteResponse`

---

#### ai_delete_function

**Arguments:**

- `request`: `AiDeleteFunctionRequest!`

**Returns:** `AiDeleteFunctionResponse`

---

#### ai_delete_gc

**Arguments:**

- `request`: `DeleteGCRequest!`

**Returns:** `DeleteGCResponse`

---

#### ai_delete_kb

**Arguments:**

- `request`: `DeleteKBRequest!`

**Returns:** `DeleteKBResponse`

---

#### ai_delete_kb_mapping

**Arguments:**

- `request`: `UnmapKBFromAgentRequest!`

**Returns:** `UnmapKBFromAgentResponse`

---

#### ai_delete_llm_conversation_by_id

**Arguments:**

- `request`: `DeleteLlmConversationByIdRequest!`

**Returns:** `DeleteLlmConversationByIdOutput`

---

#### ai_delete_saved_conversation

**Arguments:**

- `request`: `DeleteLLMConversationRequest!`

**Returns:** `DeleteLLMConversationResponse`

---

#### ai_delete_tool

**Arguments:**

- `request`: `DeleteToolRequest!`

**Returns:** `DeleteToolResponse`

---

#### ai_execute_investigation

**Arguments:**

- `request`: `AITriggerInvestigationRequest!`

**Returns:** `AITriggerInvestigationResponse`

---

#### ai_feedback_create

**Arguments:**

- `request`: `AiFeedbackCreateRequest!`

**Returns:** `GenerateFeedbackResponse`

---

#### ai_generate_log_query

**Arguments:**

- `request`: `AIGetLogQueryRequest!`

**Returns:** `AIGetLogQueryResponse`

---

#### ai_generate_prometheus_query

**Arguments:**

- `request`: `AIGetPrometheusQueryRequest!`

**Returns:** `AIGetPrometheusQueryResponse`

---

#### ai_get_conversation_time_aggregates

**Arguments:**

- `request`: `AIGetConversationTimeAggregatesRequest!`

**Returns:** `AIGetConversationTimeAggregatesResponse`

---

#### ai_get_conversation_usage_metrics

**Arguments:**

- `request`: `AIGetConversationUsageMetricsRequest!`

**Returns:** `AIGetConversationUsageMetricsResponse`

---

#### ai_get_followup_response

**Arguments:**

- `request`: `AIFollowupRequest!`

**Returns:** `AIFollowupResponse`

---

#### ai_list_conversation_suggestions

**Arguments:**

- `request`: `AIGetConversationSuggestionRequest!`

**Returns:** `AIGetConversationSuggestionResponse`

---

#### ai_remediation_execute

**Arguments:**

- `account_id`: `String!`
- `event_id`: `String`
- `command`: `String!`
- `config_name`: `String`
- `slot`: `String`

**Returns:** `AIResponse`

---

#### ai_sync_kb

**Arguments:**

- `request`: `RetriggerKBRequest!`

**Returns:** `RetriggerKBResponse`

---

#### ai_update_agent

**Arguments:**

- `request`: `UpdateAgentRequest!`

**Returns:** `UpdateAgentResponse`

---

#### ai_update_agent_extension

**Arguments:**

- `request`: `UpdateAgentExtensionRequest!`

**Returns:** `UpdateAgentExtensionResponse`

---

#### ai_update_function

**Arguments:**

- `account_id`: `String!`
- `function_id`: `String!`
- `function`: `UpdateFunctionInput!`

**Returns:** `FunctionUpdateResponse`

---

#### ai_update_gc

**Arguments:**

- `request`: `UpdateGCRequest!`

**Returns:** `UpdateGCResponse`

---

#### ai_update_kb

**Arguments:**

- `request`: `UpdateKBRequest!`

**Returns:** `UpdateKBResponse`

---

#### ai_update_kb_enabled

**Arguments:**

- `request`: `UpdateKBEnabledRequest!`

**Returns:** `UpdateKBEnabledResponse`

---

#### ai_update_tool

**Arguments:**

- `request`: `UpdateToolRequest!`

**Returns:** `UpdateToolResponse`

---

#### ai_upsert_budget_config

**Arguments:**

- `request`: `AIBudgetConfigUpsertRequest!`

**Returns:** `AIBudgetConfigUpsertResponse`

---

#### ai_upsert_rcaformat

**Arguments:**

- `request`: `AISaveRcaFormatRequest!`

**Returns:** `AISaveRcaFormatResponse`

---

#### kg_get_complete_graph

**Arguments:**

- `request`: `kg_get_complete_graph_input!`

**Returns:** `kg_get_complete_graph_output`

---

#### kg_get_edge

**Arguments:**

- `request`: `kg_get_edge_input!`

**Returns:** `kg_get_edge_output`

---

#### kg_get_node

**Arguments:**

- `request`: `kg_get_node_input!`

**Returns:** `kg_get_node_output`

---

#### kg_list_nodes

**Arguments:**

- `request`: `kg_search_nodes_input!`

**Returns:** `kg_search_nodes_output`

---

#### kg_list_path

**Arguments:**

- `request`: `kg_traverse_input!`

**Returns:** `kg_traverse_output`

---

#### kg_upsert_tenant_filter

**Arguments:**

- `request`: `kg_upsert_tenant_filter_input!`

**Returns:** `kg_upsert_tenant_filter_output`

---

### Observability {#mutations--observability}

*Logs, metrics, traces, application profiles, and service maps.*

#### logs_get_query

**Arguments:**

- `request`: `FetchLogQueryRequest!`

**Returns:** `FetchLogQueryOutput`

---

#### traces_get_service_map

**Arguments:**

- `request`: `TraceServiceMapRequest!`

**Returns:** `ServiceMapResponse`

---

### Compliance & Security {#mutations--compliance-security}

*Compliance standards, security checks, findings, and alertmanager configurations.*

#### alertmanager_create_rule

**Arguments:**

- `request`: `AlertRule!`

**Returns:** `AlertRuleResponse`

---

#### alertmanager_disable_rule

**Arguments:**

- `request`: `DisableAlertRule!`

**Returns:** `AlertRuleResponse`

---

#### alertmanager_list_actions

**Arguments:**

- `request`: `AlertActionListRequest!`

**Returns:** `AlertAction`

---

#### alertmanager_update_rule

**Arguments:**

- `request`: `UpdateAlertRule!`

**Returns:** `AlertRuleResponse`

---

#### security_scan_image

**Arguments:**

- `object`: `security_scan_image_input!`

**Returns:** `security_scan_image_output`

---

#### security_scan_vm

**Arguments:**

- `object`: `security_scan_vm_input!`

**Returns:** `security_scan_vm_output`

---

#### security_scan_vm_account

**Arguments:**

- `object`: `security_scan_vm_account_input!`

**Returns:** `security_scan_vm_account_output`

---

### Tickets {#mutations--tickets}

*Ticket creation, management, and integrations with external issue trackers.*

#### ticket_add_comment

**Arguments:**

- `object`: `TicketAddCommentObjectInput!`

**Returns:** `TicketComments!`

---

#### ticket_check_connection_by_config

**Arguments:**

- `object`: `ticket_integration_create_config_input!`

**Returns:** `ticket_test_connection_output!`

---

#### ticket_integration_create_config

**Arguments:**

- `object`: `ticket_integration_create_config_input!`

**Returns:** `ticket_integration_create_config_output!`

---

#### tickets_create

**Arguments:**

- `object`: `tickets_insert_one_input!`

**Returns:** `tickets_insert_one_output!`

---

### Notifications {#mutations--notifications}

*Notification channels, delivery rules, and user notification preferences.*

#### notification_channel_mapping_create

**Arguments:**

- `account_id`: `String`
- `platform`: `String!`
- `team_id`: `String`
- `channel_id`: `String!`

**Returns:** `notification_channel_mapping_create_output!`

---

#### notification_channel_mapping_delete

**Arguments:**

- `id`: `String!`

**Returns:** `notification_channel_mapping_delete_output!`

---

#### notification_channel_mapping_update

**Arguments:**

- `id`: `String!`
- `account_id`: `String`
- `team_id`: `String`
- `channel_id`: `String`

**Returns:** `notification_channel_mapping_update_output!`

---

#### notification_rule_delete

**Arguments:**

- `id`: `String!`

**Returns:** `notification_rule_delete_output!`

---

#### notifications_check_connection

**Arguments:**

- `platform`: `String!`
- `channel_id`: `String!`
- `team_id`: `String`

**Returns:** `notification_send_test_resp`

---

#### notifications_upsert_rule

**Arguments:**

- `rule`: `notification_rule_upsert_input!`

**Returns:** `notification_rule_mapping_output`

---

### Organization & Users {#mutations--organization-users}

*Users, tenants, business units, roles, groups, projects, and authentication.*

#### auth_check_session

**Arguments:**

- `object`: `auth_check_session_input!`

**Returns:** `auth_check_session_output`

---

#### auth_delete_session

**Arguments:**

- `object`: `auth_delete_session_input!`

**Returns:** `auth_delete_session_output`

---

#### tenant_attribute_delete

**Arguments:**

- `names`: `[String!]!`

**Returns:** `tenant_attribute_delete_output!`

---

#### tenant_attribute_upsert

**Arguments:**

- `object`: `[TenantAttributeRequest!]!`

**Returns:** `[TenantAttributeResponse!]!`

---

#### tenant_update_name

**Arguments:**

- `name`: `String!`

**Returns:** `tenant_update_name_output!`

---

#### usergroup_create

**Arguments:**

- `name`: `String!`
- `description`: `String`

**Returns:** `usergroup_create_output!`

---

#### usergroup_update

**Arguments:**

- `id`: `String!`
- `name`: `String`
- `description`: `String`
- `role`: `String`

**Returns:** `usergroup_update_output!`

---

#### users_create

**Arguments:**

- `user`: `users_insert_one_input!`

**Returns:** `users_insert_one_output`

---

#### users_create_history

**Arguments:**

- `request`: `UserHistoryInput!`

**Returns:** `UserHistoryOutput`

---

#### users_create_token

**Arguments:**

- `user`: `UserTokenCreateRequest`

**Returns:** `UserTokenCreateResponse`

---

#### users_delete_token

**Arguments:**

- `user`: `UserTokenDeleteRequest`

**Returns:** `UserTokenDeleteResponse`

---

#### users_list_tenant_roles

**Arguments:**

- `object`: `user_tenant_roles_input!`

**Returns:** `user_tenant_roles_output`

---

#### users_update_default_tenant

**Arguments:**

- `object`: `user_update_default_tenant_input!`

**Returns:** `user_update_default_tenant_output`

---

#### users_update_profile

**Arguments:**

- `username`: `String!`
- `display_name`: `String`
- `status`: `String`
- `role`: `String`

**Returns:** `user_update_profile_output!`

---

#### users_update_status

**Arguments:**

- `object`: `user_update_status_input!`

**Returns:** `user_update_status_output`

---

### Integrations {#mutations--integrations}

*Third-party integrations: Slack, MS Teams, Jira, and custom connectors.*

#### integration_update_status_by_pk

**Arguments:**

- `id`: `String!`
- `status`: `String!`

**Returns:** `integration_update_status_by_pk_output!`

---

#### integrations_check_connection

**Arguments:**

- `request`: `IntegrationTestConnectionRequest!`

**Returns:** `IntegrationTestConnectionResponse`

---

#### integrations_check_connection_config

**Arguments:**

- `request`: `IntegrationTestConnectionConfigRequest!`

**Returns:** `IntegrationTestConnectionResponse`

---

#### integrations_create_config

**Arguments:**

- `request`: `CreateIntegrationConfigRequest!`

**Returns:** `CreateIntegrationConfigResponse`

---

#### integrations_delete_config

**Arguments:**

- `request`: `DeleteIntegrationConfigRequest!`

**Returns:** `DeleteIntegrationConfigResponse`

---

#### integrations_update_status

**Arguments:**

- `request`: `DeleteIntegrationConfigRequest!`

**Returns:** `DeleteIntegrationConfigResponse`

---

#### integrations_upsert_discovery_target

**Arguments:**

- `request`: `DiscoveryTargetRequest!`

**Returns:** `DiscoveryTargetResponse`

---

### Configuration {#mutations--configuration}

*Feature flags, SLO targets, system configuration, and upgrade management.*

#### config_delete

**Arguments:**

- `request`: `ConfigDeleteInput!`

**Returns:** `ConfigDeleteOutput`

---

#### config_get

**Arguments:**

- `request`: `GetConfigInput!`

**Returns:** `GetConfigResponse`

---

#### config_list

**Arguments:**

- `request`: `ConfigListRequest!`

**Returns:** `[Config]`

---

#### config_save

**Arguments:**

- `request`: `ConfigSaveInput!`

**Returns:** `ConfigSaveOutput`

---

#### slo_config_create

**Arguments:**

- `request`: `SLOCreateRequest!`

**Returns:** `SLOResponse`

---

#### slo_config_delete

**Arguments:**

- `request`: `SLODeleteRequest!`

**Returns:** `SLODeleteConfigResponse`

---

#### slo_config_list

**Arguments:**

- `request`: `SLOListRequest!`

**Returns:** `SLOConfigListResponse`

---

#### slo_config_update

**Arguments:**

- `request`: `SLOUpdateRequest!`

**Returns:** `SLOUpdateConfigResponse`

---

#### upgrade_execute_command

**Arguments:**

- `account_id`: `String!`
- `plan_id`: `String!`
- `step_id`: `String!`
- `task_id`: `String!`
- `command`: `String!`
- `command_type`: `String!`

**Returns:** `UpgradeExecuteCommandResponse`

---

#### upgrade_plan_create_one

**Arguments:**

- `account_id`: `String!`
- `steps`: `[jsonb]`

**Returns:** `UpgradePlanResponse`

---

#### upgrade_post_flight_check

**Arguments:**

- `account_id`: `String!`
- `plan_id`: `String!`

**Returns:** `flight_check_response`

---

#### upgrade_pre_flight_check

**Arguments:**

- `account_id`: `String!`
- `plan_id`: `String!`

**Returns:** `flight_check_response`

---

### Data Warehouse {#mutations--data-warehouse}

*Data warehouse queries, pipes, databases, and query performance.*

#### database_performance_insights

**Arguments:**

- `request`: `QueryDatabasePerformanceRequest!`

**Returns:** `QueryDatabasePerformanceResponse`

---

### Other {#mutations--other}

*Uncategorized operations.*

#### accounts_check_aws_onboarding

**Arguments:**

- `object`: `AwsOnboardStatusInput!`

**Returns:** `AwsOnboardStatusOutput`

---

#### accounts_create

**Arguments:**

- `object`: `cloud_accounts_insert_one_input!`

**Returns:** `cloud_accounts_insert_one_output`

---

#### accounts_create_aws_org

**Arguments:**

- `object`: `AwsOrgOnboardInput!`

**Returns:** `AwsOrgOnboardOutput`

---

#### accounts_create_azure_subscriptions_bulk

**Arguments:**

- `object`: `AzureBulkOnboardInput!`

**Returns:** `AzureBulkOnboardOutput`

---

#### accounts_create_gcp_projects_bulk

**Arguments:**

- `object`: `GcpBulkOnboardInput!`

**Returns:** `GcpBulkOnboardOutput`

---

#### accounts_sync

**Arguments:**

- `account_id`: `String!`

**Returns:** `TriggerCloudSyncResponse`

---

#### agents_create_token

**Arguments:**

- `object`: `AgentRegenerateTokenInput!`

**Returns:** `AgentRegenerateTokenOutput`

---

#### applications_convert_profile

**Arguments:**

- `request`: `ApplicationProfileConvertRequest!`

**Returns:** `ApplicationProfileConvertDataResponse`

---

#### applications_create_group

**Arguments:**

- `name`: `String!`
- `description`: `String`
- `mappings`: `[application_group_mapping_item!]!`

**Returns:** `application_group_create_output`

---

#### applications_execute_profile

**Arguments:**

- `request`: `ApplicationProfileRequest!`

**Returns:** `ApplicationProfileDataResponse`

---

#### applications_get_profile_status

**Arguments:**

- `request`: `ApplicationProfileGetRequest!`

**Returns:** `ApplicationProfileDataResponse`

---

#### applications_update_group

**Arguments:**

- `id`: `String!`
- `name`: `String!`
- `description`: `String`
- `mappings`: `[application_group_mapping_item!]!`

**Returns:** `application_group_update_output`

---

#### autooptimize_create

**Arguments:**

- `arg1`: `autooptimize_create!`

**Returns:** `auto_optimize_insert_one_output`

---

#### autooptimize_update

**Arguments:**

- `arg1`: `autooptimize_update!`

**Returns:** `auto_optimize_insert_one_output`

---

#### autooptimize_update_status

**Arguments:**

- `arg1`: `auto_optimize_update_status_request!`

**Returns:** `auto_optimize_update_status_response`

---

#### dashboards_create

**Arguments:**

- `request`: `DashboardSaveRequest!`

**Returns:** `Dashboard`

---

#### dashboards_delete

**Arguments:**

- `request`: `DashboardDeleteRequest!`

**Returns:** `DashboardDeleteResponse`

---

#### dashboards_update

**Arguments:**

- `request`: `DashboardSaveRequest!`

**Returns:** `Dashboard`

---

#### featureflag_upsert

**Arguments:**

- `features`: `[featureflag_upsert_input!]!`

**Returns:** `featureflag_upsert_output!`

---

#### gcp_list_projects

**Arguments:**

- `object`: `GcpListProjectsInput!`

**Returns:** `GcpListProjectsOutput`

---

#### insights_aggregate

**Arguments:**

- `request`: `InsightRequest!`

**Returns:** `InsightResponse`

---

#### messagingplatforms_delete

**Arguments:**

- `object`: `messaging_platform_delete_input!`

**Returns:** `messaging_platform_delete_output`

---

#### messagingplatforms_update

**Arguments:**

- `object`: `messaging_platform_update_input!`

**Returns:** `messaging_platform_update_output`

---

#### ml_generate_node_recommendations

**Arguments:**

- `account`: `String!`
- `tenant`: `String!`
- `buffer_percentage`: `Int`
- `number_of_recommendations`: `Int`
- `min_nodes`: `Int`
- `min_cpu_per_node`: `Int`
- `min_memory_per_node`: `Int`
- `preferred_instance_groups`: `[String!]!`
- `graviton`: `Boolean!`

**Returns:** `generate_cluster_recommendations_output`

---

#### recommendations_apply

**Arguments:**

- `object`: `apply_recommendation_input!`

**Returns:** `apply_recommendation_output`

---

#### relay_forward_request

**Arguments:**

- `body`: `jsonb!`
- `no_sinks`: `Boolean`
- `cache`: `Boolean`
- `track_history`: `Boolean`

**Returns:** `RelayForwardOutput`

---

#### signup_complete

**Arguments:**

- `object`: `user_onboard_input!`

**Returns:** `user_onboard_output`

---

#### signup_create

**Arguments:**

- `username`: `String!`
- `verification_token`: `String!`
- `verification_token_expiration`: `String!`
- `tenant_name`: `String`
- `user_displayname`: `String`

**Returns:** `tenant_onboarding_insert_output`

---

#### signup_delete

**Arguments:**

- `username`: `String!`

**Returns:** `tenant_onboarding_delete_by_username_output`

---

#### signup_update_status

**Arguments:**

- `id`: `String!`
- `status`: `String!`
- `updated_at`: `String!`

**Returns:** `tenant_onboarding_update_status_output`

---

#### upgradeplans_upsert_task

**Arguments:**

- `account_id`: `String!`
- `plan_id`: `String!`
- `step_id`: `String!`
- `task_id`: `String!`
- `owner`: `String`
- `status`: `String`

**Returns:** `task_response`

---

#### userauths_create

**Arguments:**

- `object`: `user_create_auth_input!`

**Returns:** `user_create_auth_output`

---

#### userauths_delete

**Arguments:**

- `object`: `user_delete_auth_input!`

**Returns:** `user_delete_auth_output`

---

#### userauths_update_accessed

**Arguments:**

- `object`: `user_update_accessed_input!`

**Returns:** `user_update_accessed_output`

---

#### usergroups_update_members

**Arguments:**

- `group_id`: `String!`
- `add_usernames`: `[String!]!`
- `remove_usernames`: `[String!]!`

**Returns:** `auth_manage_group_users_output`

---

#### userroles_sync

**Arguments:**

- `object`: `user_sync_roles_input!`

**Returns:** `user_sync_roles_output`

---

#### userroles_upsert_account_group

**Arguments:**

- `role`: `auth_account_group_roles_upsert_one_input!`

**Returns:** `auth_account_group_roles_upsert_one_output`

---

#### userroles_upsert_group

**Arguments:**

- `role`: `auth_tenant_group_roles_upsert_one_input!`

**Returns:** `auth_tenant_group_roles_upsert_one_output`

---

#### userroles_upsert_k8s_namespace_group

**Arguments:**

- `role`: `auth_k8saccount_namespace_group_roles_upsert_one_input!`

**Returns:** `auth_k8saccount_namespace_group_roles_upsert_one_output`

---

#### webhook_subject_mappings_sync

**Arguments:**

- `request`: `WebhookSubjectMappingsSyncRequest!`

**Returns:** `WebhookSubjectMappingsSyncOutput!`

---

## Subscriptions


## Actions Without a Schema Entry

These 106 actions are routed by the gateway but declare no types in the schema, so they have no signature above. They are callable; their arguments and response shape have to be confirmed against a live environment. Descriptions come from the routing table.

| Action | Description |
|---|---|
| `critiques_list` | Per-conversation critique rows (llm_conversation_agent_critiques), scoped to the owning account/tenant |
| `ai_get_conversation_tree` | Get the detailed agent and tool execution tree for a conversation |
| `ai_get_conversation_agent` | Get execution detail for one agent node in a conversation |
| `ai_list_conversation_costs` | List conversations with cost and usage for the explorer |
| `ai_list_agent_costs` | List agents ranked by cost, latency, and errors |
| `events_list_analysis_digests` | List the tenant's weekly reliability reviews, newest first |
| `events_get_analysis_digest` | Get one week's tenant reliability review including per-class findings |
| `events_generate_analysis_digest` | Generate one week's tenant reliability review on demand (scheduler supersedes it) |
| `ai_aggregate_tool_usage` | Aggregate tool usage into a leaderboard by calls, errors, and cost |
| `ai_list_tool_calls` | List individual invocations of one tool |
| `ai_get_usage_filters` | Get available filter options for the AI usage dashboard |
| `ai_aggregate_usage_metrics` | Aggregate AI usage cost KPIs and cost-by-dimension breakdowns |
| `ai_aggregate_account_cost_report` | Consolidated per-account AI cost report (daily/MTD/prev-month + top drivers) — same computation as the Slack digest and Nubi's ai_cost_report agent |
| `ai_get_cost_report_schedule` | Read this tenant's configured AI Cost Daily Report send hour (UTC), or the 06:00 default if unset |
| `ai_upsert_cost_report_schedule` | Set this tenant's AI Cost Daily Report send hour (UTC) |
| `critiques_aggregate_all` | Cross-tenant: refine-rate totals, per-agent breakdown, and heuristic feedback themes for the Critique Analytics dashboard |
| `critiques_trend_all` | Cross-tenant: judged/refined counts bucketed by day/week/month for the Critique Analytics Overview chart |
| `critiques_list_all` | Cross-tenant: paginated raw critique rows (query, bad answer, feedback) for the Critique Analytics Browse view |
| `llm_gateway_aggregate_usage` | Aggregate AI Gateway token and cost usage over a time window |
| `llm_gateway_list_requests` | List individual AI Gateway requests |
| `llm_gateway_list_sessions` |  |
| `llm_gateway_get_request_body` | Fetch the captured body of your own gateway request |
| `llm_gateway_list_routing_rules` | List AI Gateway model routing rules |
| `llm_gateway_create_routing_rule` | Create an AI Gateway model routing rule |
| `llm_gateway_update_routing_rule` | Update an AI Gateway model routing rule |
| `llm_gateway_delete_routing_rule` | Delete an AI Gateway model routing rule |
| `llm_gateway_list_tiers` |  |
| `llm_gateway_set_tier` |  |
| `llm_gateway_reset_tier` |  |
| `llm_gateway_list_rate_limits` | List AI Gateway rate-limit quotas |
| `llm_gateway_upsert_rate_limit` | Create or update an AI Gateway rate-limit quota |
| `llm_gateway_delete_rate_limit` | Delete an AI Gateway rate-limit quota |
| `llm_gateway_get_settings` |  |
| `llm_gateway_update_settings` |  |
| `egressfilter_get` | Get the current tenant's LLM egress-filter config (mode + enabled) |
| `egressfilter_update` | Update the current tenant's LLM egress-filter mode / enabled flag |
| `egressfilter_upsert_pattern` | Create or update one custom egress detection pattern for the tenant |
| `egressfilter_delete_pattern` | Delete one custom egress detection pattern by id |
| `egressfilter_clear_override` | Clear the tenant's egress-filter override so env defaults apply |
| `ai_list_kb_agents` | List the agents a knowledge base is mapped to |
| `ai_list_kb_retrieval` | List the knowledge base documents a query would retrieve, ranked, with whether each would reach the agent |
| `ai_memory_get` | Single-record read — layer one of (soul, consent), scope one of (user, tenant). |
| `ai_memory_list` | Collection read — layer one of (prefs, patterns, decisions, collective, session, events). Pass `q` with layer=collective for full-text search. |
| `ai_memory_upsert` | Insert-or-update — layer one of (soul, prefs, consent, decisions[scope=tenant]). Tenant-scope writes gated server-side on tenant_admin. |
| `ai_memory_delete` | Remove a row when `id` is set; wipe the (layer, scope) when `id` is omitted. Includes the GDPR full-wipe path (layer=all, scope=user). |
| `ai_memory_confirm` | Keep an inferred preference — makes it explicit so agents inject it, while retaining its evidence and inferred origin so it stays reviewable and reversible. Preferences layer, user scope only. |
| `ai_memory_unconfirm` | Unkeep a previously kept preference, returning it to the unreviewed pool. Only affects rows of inferred origin, so a user-authored preference can never be downgraded by this path. |
| `ai_memory_create_decision` | Click-wired user decisions (AutoPilot Approve/Decline, RCA thumbs). Insert with uniqueness — separate from update_decision. |
| `ai_memory_update_decision` | Append-supersede (correct subject/rationale) or promote-to-global (set promote_to_global=true). Tenant-scope edits gated server-side on tenant_admin. |
| `ai_memory_update_pattern` | Edit a single pattern row — set `description` to overwrite, or `pinned` to toggle the pin flag. |
| `ai_memory_execute_maintenance` | Manually trigger a memory distillation job (ops debugging). |
| `ai_memory_generate_export` | GDPR portability — exports a user's memory bundle as a fresh JSON artifact. |
| `ai_list_model_pricing` | List built-in and tenant-specific LLM model pricing |
| `ai_upsert_model_pricing` | Set this tenant's own price for a model, overriding the built-in rate |
| `ai_delete_model_pricing` | Remove this tenant's price override so the model falls back to the built-in rate |
| `eventrules_sync_provider_rules` | poll alert rules from external providers and upsert them into event_rules |
| `recommendations_create_ticket_resolution` | Record a created ticket as a resolution attempt on a recommendation |
| `recommendations_update_dismissal` | Dismiss, snooze, or reactivate a recommendation |
| `recommendation_resolution_retry` | Retry a failed recommendation resolution attempt |
| `dashboards_execute_query` | Run one dashboard panel's read-only redis/rabbitmq command against an account (server enforces a read-only command allowlist plus account read access) |
| `dashboards_execute_entity_query` | Run one dashboard panel's query-engine read (events only; server enforces a table allowlist plus account read access) |
| `workload_list_criticality` | List workloads with resolved criticality (Service Criticality review screen) |
| `workload_upsert_criticality` | Set an operator override for a workload's criticality |
| `workload_delete_criticality` | Remove an operator override, reverting to the derived criticality |
| `integrations_diagnose_connection` | Safely diagnose connectivity of a saved integration visible through a linked account |
| `integrations_list_es_indexes` |  |
| `kg_list_manual_dependencies` | list user-declared service dependencies (manual flow source rows) with per-row resolution status and ambiguity candidates. Optional status_filter narrows by resolution_status. |
| `kg_create_manual_dependency` | declare one service-to-service dependency. Endpoints take node_type + name (required) plus optional namespace/cluster/arn/account_id/region. Resolver runs synchronously; response carries post-resolve status. |
| `kg_update_manual_dependency` | edit endpoint identifiers (e.g. add a namespace to disambiguate) and auto-rerun the resolver. |
| `kg_delete_manual_dependency` | soft-delete one row AND remove the matching source='manual' edge from the KG in one transaction. Prevents ghost edges from outliving deleted declarations. |
| `kg_import_manual_dependencies` | bulk import declarations from CSV. Required header columns - source_node_type, source_name, dest_node_type, dest_name. Optional - source_namespace, source_cluster, source_arn, source_account_id, source_region, and the corresponding dest_ columns, plus relationship_type (defaults to CALLS) and notes. Returns per-row imported/rejected status. |
| `kg_resolve_manual_dependency` | operator-disambiguate an ambiguous row by picking source_node_id and/or destination_node_id from source_match_candidates / dest_match_candidates. |
| `kg_reresolve_manual_dependency` | force re-resolve a single row regardless of current status. Useful after the missing referenced node is later ingested into the KG. |
| `kg_reresolve_manual_dependencies` | bulk re-resolve. Default filter targets every non-resolved row (pending, unmatched, ambiguous, too_many_matches, node_inactive). Pass all_rows=true to also re-resolve already-resolved rows. |
| `kg_delete_all_manual_dependencies` | panic-button rollback. Soft-deletes every manual_dependencies row for the tenant AND removes every source='manual' edge from the KG. tenant_admin only. |
| `product_updates_list` | List platform-wide product updates (changelog) |
| `notifications_list_watchable_channels` | List Slack channels Nubi can watch, with per-channel watch state |
| `notifications_enable_channel_watch` | Enable Nubi channel awareness for a channel (posts an in-channel disclosure) |
| `notifications_disable_channel_watch` | Disable Nubi channel awareness for a channel |
| `tickets_list_configs` | List configured ticketing integrations |
| `traces_by_trace_v3` | list one root span per trace for the "By Traces" view |
| `traces_by_trace_count_v3` | count distinct traces for the "By Traces" view |
| `traces_list_labels` | Fetch Trace Labels |
| `ownership_get` | Resolve the effective owner of a resource (direct, rule, or inherited) |
| `ownership_resolve` | Batch-resolve effective owners for a list of resources |
| `ownership_list` | List stored manual owner assignments (optionally filtered) |
| `ownership_assign` | Manually assign (replace) the owner of a resource |
| `ownership_delete` | Remove a resource's manual owner |
| `ownership_cleanup` | Purge orphaned owner rows whose resource no longer exists |
| `ownership_list_rules` | List ownership rules |
| `ownership_upsert_rule` | Create or update an ownership rule |
| `ownership_delete_rule` | Delete an ownership rule |
| `users_list_integration_accounts` | List external integration accounts (Slack/GitHub/PagerDuty/ZenDuty) mapped to a user |
| `users_list_unmapped_accounts` | List unmapped external integration accounts for manual mapping |
| `users_create_account_mapping` | Manually map an external integration account to an internal user |
| `users_delete_account_mapping` | Remove the internal-user mapping from an external integration account |
| `workflow_sync_templates` | Sync the built-in workflow templates |
| `workflow_validate` |  |
| `workflow_list_versions` | List a workflow's versions |
| `workflow_get_version` | Get a specific workflow version |
| `workflows_update_definition` | Restore a workflow to a previous version's definition |
| `workflows_create_version` | Publish a new workflow version |
| `workflows_update_live_version` | Set which workflow version is live |
| `workflows_update_version_metadata` | Update a workflow version's metadata |
| `workflows_update_version_status` | Update a workflow version's status |
| `workflows_delete_version` | Delete a workflow version |

---
## Types

### Core Types

Primary entity types, response types, and enums.

#### Cost Management

##### billing_action_aggregate_count

**Fields:**

- `aggregate`: `billing_action_count_fields!`

##### billing_action_aggregate_sum

**Fields:**

- `aggregate`: `billing_action_sum_fields!`

##### billing_action_count_fields

**Fields:**

- `count`: `Int!`

##### billing_action_sum_values

**Fields:**

- `amount_due`: `Float`
- `last_billed_amount`: `Float`

##### billing_cloud_account_ref

**Fields:**

- `account_name`: `String`

##### billing_infographics_output

**Fields:**

- `total_amount_due`: `billing_action_aggregate_sum!`
- `total_billed_amount`: `billing_action_aggregate_sum!`

##### billing_list_item

**Fields:**

- `id`: `String!`
- `amount_due`: `Float`
- `last_billed_amount`: `Float`
- `last_billed_date`: `String`
- `tier`: `String`
- `created_at`: `String`
- `updated_at`: `String`

##### billing_list_output

**Fields:**

- `billing`: `[billing_list_item!]!`
- `total_count`: `billing_action_aggregate_count!`

##### billing_usage_cost_item

**Fields:**

- `billing_date`: `String`
- `cost_per_unit`: `Float`
- `created_at`: `String`
- `id`: `String!`
- `name`: `String`
- `service_name`: `String`
- `total_cost`: `Float`
- `units`: `Int`
- `updated_at`: `String`
- `account_id`: `String`
- `cloud_account`: `billing_cloud_account_ref`

##### billing_usage_cost_list_input

**Fields:**

- `start_date`: `String!`
- `end_date`: `String!`
- `limit`: `Int`
- `offset`: `Int`

##### billing_usage_cost_list_output

**Fields:**

- `billing_usage_cost`: `[billing_usage_cost_item!]!`
- `billing_usage_cost_aggregate`: `billing_action_aggregate_count!`

#### Events & Incidents

##### event_get_recurrence_info_output

**Fields:**

- `data`: `[event_recurrence_info_item!]!`

##### event_recurrence_info_item

**Fields:**

- `event_id`: `String!`
- `first_event_id`: `String!`
- `previous_event_id`: `String!`
- `occurrence_number`: `Int!`

##### event_resolve_input

**Fields:**

- `account_id`: `String!`
- `event_id`: `String!`
- `data`: `jsonb`
- `provider`: `String`
- `provider_config`: `ProviderConfig`

##### event_resolve_output

**Fields:**

- `data`: `[jsonb]!`

#### Recommendations

##### recommendation_job_create_output

**Fields:**

- `data`: `[jsonb]!`

##### recommendation_request

**Fields:**

- `deployment`: `String!`
- `resource_id`: `String!`
- `namespace`: `String!`
- `container`: `String`
- `tenant`: `String!`
- `account`: `String!`
- `persist_recommendation`: `Boolean`

##### recommendation_response

**Fields:**

- `data`: `jsonb!`

##### recommendation_rule_list_input

**Fields:**

- `rule_name`: `String`
- `category`: `String`
- `recommendation_id`: `String`

##### recommendation_rule_list_item

**Fields:**

- `rule_name`: `String!`
- `category`: `String!`
- `title`: `String!`
- `description`: `String`
- `service_name`: `String`
- `recommendations`: `jsonb`
- `mitigations`: `jsonb`
- `compliances`: `jsonb`
- `references`: `jsonb`

##### recommendation_rule_list_output

**Fields:**

- `data`: `[recommendation_rule_list_item!]!`

#### Cloud Infrastructure

##### aws_account_onboard_input

**Fields:**

- `account_name`: `String!`

##### aws_account_onboard_output

**Fields:**

- `url`: `String!`

##### cloud_account_attr_object

**Fields:**

- `cloud_account_id`: `uuid!`
- `name`: `String!`
- `value`: `String!`

##### cloud_account_attrs_upsert_input

**Fields:**

- `objects`: `[cloud_account_attr_object!]!`

##### cloud_account_attrs_upsert_output

**Fields:**

- `affected_rows`: `Int!`

##### cloud_account_update_input

**Fields:**

- `id`: `uuid!`
- `status`: `String`
- `account_name`: `String`
- `account_env`: `String`
- `data`: `jsonb`

##### cloud_account_update_output

**Fields:**

- `affected_rows`: `Int!`

##### cloud_accounts_insert_one_input

**Fields:**

- `account_access`: `String`
- `account_email`: `String`
- `account_name`: `String`
- `account_purpose`: `String`
- `account_type`: `String`
- `account_url`: `String`
- `assume_role`: `String`
- `billing_source`: `String`
- `budget`: `float8`
- `cloud_provider`: `String`
- `created_at`: `timestamp`
- `created_by`: `uuid`
- `data`: `jsonb`
- `region`: `String`
- `start_date`: `timestamp`
- `access_key`: `String`
- `access_secret`: `String`
- `username`: `String`
- `password`: `String`
- `port`: `Int`
- `account_number`: `String`
- `account_env`: `String`
- `external_id`: `String`

##### cloud_accounts_insert_one_output

**Fields:**

- `id`: `uuid!`
- `access_key`: `String`
- `access_secret`: `String`

##### cloud_resource_attribute_item

**Fields:**

- `resource_id`: `String!`
- `account_id`: `String!`
- `name`: `String!`
- `value`: `String`
- `labels`: `String`

##### cloud_resource_attributes_upsert_output

**Fields:**

- `affected_rows`: `Int!`

#### Automation

##### auto_optimize_gitops_config

**Fields:**

- `enabled`: `Boolean`
- `repository_name`: `String`

##### auto_optimize_insert_one_output

**Fields:**

- `id`: `uuid!`

##### auto_optimize_recommendation_output

**Fields:**

- `recommendation`: `[uuid!]`

##### auto_optimize_resource_input

**Fields:**

- `account_id`: `uuid!`

##### auto_optimize_skip_request

**Fields:**

- `id`: `uuid!`
- `by_minutes`: `Int`

##### auto_optimize_skip_response

**Fields:**

- `message`: `String!`

##### auto_optimize_ticket_config

**Fields:**

- `enabled`: `Boolean`
- `configuration_id`: `String`
- `assignee`: `String`
- `project_key`: `String`
- `source`: `String`
- `severity`: `String`
- `description`: `String`
- `additional_fields`: `jsonb`
- `ticket_type`: `String`
- `platform`: `String`

##### auto_optimize_update_status_request

**Fields:**

- `id`: `uuid!`
- `status`: `String!`
- `account_id`: `uuid!`

##### auto_optimize_update_status_response

**Fields:**

- `status`: `String!`

##### auto_optimize_workload_input

**Fields:**

- `account_id`: `uuid!`
- `resource_filter`: `[autopilot_resource_filter]!`
- `status`: `String`

##### auto_pilot_policy_delete_input

**Fields:**

- `id`: `uuid!`
- `account_id`: `uuid!`

##### auto_pilot_policy_delete_output

**Fields:**

- `id`: `uuid!`

##### auto_playbook_insert_one

**Fields:**

- `name`: `String!`
- `account_id`: `uuid!`
- `resource_filter`: `[resource_filter_request!]!`
- `notification`: `auto_playbook_notification!`
- `trigger`: `jsonb!`
- `tasks`: `[auto_playbook_task_input!]!`
- `dryrun`: `Boolean!`

##### auto_playbook_insert_one_output

**Fields:**

- `id`: `uuid`
- `error`: `String`

##### auto_playbook_notification

**Fields:**

- `slack`: `auto_playbook_notification_enable`
- `email`: `auto_playbook_notification_enable`
- `ms_teams`: `auto_playbook_notification_enable`
- `google_chat`: `auto_playbook_notification_enable`

##### auto_playbook_notification_enable

**Fields:**

- `enabled`: `Boolean!`

##### auto_playbook_task

**Fields:**

- `type`: `String!`
- `config`: `jsonb!`

##### auto_playbook_task_input

**Fields:**

- `type`: `String!`
- `config`: `jsonb!`

##### auto_runbook_action_delete_one_input

**Fields:**

- `id`: `uuid!`
- `account_id`: `uuid!`

##### auto_runbook_action_delete_one_output

**Fields:**

- `id`: `uuid!`

##### auto_runbook_action_insert_one_input

**Fields:**

- `id`: `uuid`
- `action_name`: `String!`
- `description`: `String!`
- `status`: `String`
- `library_id`: `uuid!`
- `account_id`: `uuid!`
- `configs`: `jsonb!`
- `base_action_configs`: `jsonb!`
- `account_type`: `String`

##### auto_runbook_action_insert_one_output

**Fields:**

- `id`: `uuid!`

##### auto_runbook_action_publish_input

**Fields:**

- `id`: `uuid!`
- `account_id`: `uuid!`

##### auto_runbook_action_status_output

**Fields:**

- `status`: `String!`

##### auto_runbook_custom_action_update_input

**Fields:**

- `id`: `uuid`
- `action_name`: `String!`
- `description`: `String!`
- `status`: `String`
- `library_id`: `uuid!`
- `account_id`: `uuid!`
- `configs`: `jsonb!`
- `base_action_configs`: `jsonb!`

##### auto_runbook_custom_action_update_output

**Fields:**

- `id`: `uuid!`

##### auto_runbook_edit_one

**Fields:**

- `id`: `uuid!`
- `name`: `String!`
- `account_id`: `uuid!`
- `resource_filter`: `[resource_filter_request!]!`
- `notification`: `auto_playbook_notification!`
- `trigger`: `jsonb!`
- `tasks`: `[auto_playbook_task_input!]!`
- `dryrun`: `Boolean!`

##### auto_runbook_insert_one

**Fields:**

- `name`: `String!`
- `account_id`: `uuid!`
- `resource_filter`: `[resource_filter_request!]!`
- `notification`: `auto_playbook_notification!`
- `trigger`: `jsonb!`
- `tasks`: `[auto_playbook_task_input!]!`
- `dryrun`: `Boolean!`

##### auto_runbook_insert_one_output

**Fields:**

- `id`: `uuid`
- `error`: `String`

##### auto_runbook_manual_run_request

**Fields:**

- `id`: `uuid!`

##### auto_runbook_manual_run_response

**Fields:**

- `status`: `String!`

##### auto_runbook_skip_request

**Fields:**

- `id`: `uuid!`
- `by_minutes`: `Int`

##### auto_runbook_skip_response

**Fields:**

- `message`: `String!`

##### auto_runbook_task_approval_request_body

**Fields:**

- `task_id`: `uuid!`
- `status`: `String!`
- `account_id`: `uuid!`

##### auto_runbook_task_approval_response

**Fields:**

- `id`: `String!`

##### auto_runbook_task_manual_run_request

**Fields:**

- `id`: `uuid!`

##### auto_runbook_task_manual_run_response

**Fields:**

- `status`: `String!`

##### auto_runbook_update_status_request

**Fields:**

- `id`: `uuid!`
- `status`: `String!`

##### auto_runbook_update_status_response

**Fields:**

- `status`: `String!`

##### autopilot_config

**Fields:**

- `vertical_rightsize`: `autopilot_vertical_rightsize_config`
- `horizontal_rightsize`: `jsonb`
- `pv_rightsize`: `autopilot_pv_rightsize_config`

##### autopilot_cpu

**Fields:**

- `algo`: `String!`
- `buffer_pct`: `Int!`
- `trigger`: `autopilot_trigger!`
- `max_cpu`: `String`
- `min_cpu`: `String`

##### autopilot_google_chat_notification_config

**Fields:**

- `enabled`: `Boolean!`
- `channel_id`: `String`

##### autopilot_insert_one

**Fields:**

- `account_id`: `uuid!`
- `category`: `String!`
- `resource_filter`: `autopilot_resource_filter!`
- `autopilot_config`: `autopilot_config!`
- `schedule`: `autopilot_schedule!`
- `notification`: `autopilot_notification!`
- `dryrun`: `Boolean!`

##### autopilot_insert_one_output

**Fields:**

- `id`: `uuid!`

##### autopilot_memory

**Fields:**

- `algo`: `String!`
- `buffer_pct`: `Int!`
- `unit`: `String!`
- `min_memory`: `String`
- `max_memory`: `String`
- `trigger`: `autopilot_trigger!`

##### autopilot_ms_teams_notification_config

**Fields:**

- `enabled`: `Boolean!`
- `channel_id`: `String`
- `team_id`: `String`

##### autopilot_notification

**Fields:**

- `slack`: `autopilot_slack_notification_config`
- `email`: `autopilot_notification_enable`
- `ms_teams`: `autopilot_ms_teams_notification_config`
- `google_chat`: `autopilot_google_chat_notification_config`

##### autopilot_notification_enable

**Fields:**

- `enabled`: `Boolean!`

##### autopilot_pv_rightsize_config

**Fields:**

- `threshold`: `Int!`
- `change_by_pct`: `Int!`

##### autopilot_resource_filter

**Fields:**

- `name`: `String`
- `namespace`: `String!`
- `type`: `String`

##### autopilot_schedule

**Fields:**

- `frequency`: `String`
- `start_date`: `timestamp`
- `end_date`: `timestamp`

##### autopilot_slack_notification_config

**Fields:**

- `enabled`: `Boolean!`
- `channel_id`: `String`

##### autopilot_trigger

**Fields:**

- `change_pct`: `Int!`
- `max_change_pct`: `Int`

##### autopilot_vertical_rightsize_config

**Fields:**

- `cpu`: `autopilot_cpu!`
- `memory`: `autopilot_memory!`

#### AI & LLM

##### kg_filter_options

**Fields:**

- `account_ids`: `[String]`
- `node_types`: `jsonb`
- `label_keys`: `[String]`
- `attribute_keys`: `[String]`
- `last_sync_time`: `timestamptz`
- `node_keys`: `[String]`
- `node_ids`: `[String]`
- `node_account_idx`: `jsonb`
- `node_specific_type_idx`: `jsonb`
- `node_cluster_idx`: `jsonb`
- `node_bucket_idx`: `jsonb`
- `specific_type_dict`: `[String]`
- `cluster_dict`: `[String]`
- `filter_buckets`: `jsonb`
- `label_key_buckets`: `jsonb`
- `attribute_key_buckets`: `jsonb`
- `node_count`: `Int`

##### kg_filter_values

**Fields:**

- `filter_type`: `String!`
- `filter_key`: `String!`
- `values`: `[String]`

##### kg_get_complete_graph_input

**Fields:**

- `sources`: `[String]`
- `account_ids`: `[String]`
- `node_types`: `[String]`
- `specific_types`: `[String]`
- `labels`: `jsonb`
- `attributes`: `jsonb`
- `node_ids`: `[String]`
- `levels`: `Int`
- `subgraph`: `Boolean`

##### kg_get_complete_graph_output

**Fields:**

- `data`: `kg_graph`

##### kg_get_edge_input

**Fields:**

- `edge_id`: `String!`

##### kg_get_edge_output

**Fields:**

- `data`: `jsonb`

##### kg_get_filter_options_input

**Fields:**

- `account_ids`: `[String]`
- `node_types`: `[String]`
- `specific_types`: `[String]`
- `labels`: `jsonb`
- `label_keys`: `[String]`
- `attributes`: `jsonb`
- `attribute_keys`: `[String]`
- `node_ids`: `[String]`
- `levels`: `Int`

##### kg_get_filter_options_output

**Fields:**

- `data`: `kg_filter_options`

##### kg_get_filter_values_input

**Fields:**

- `filter_type`: `String!`
- `filter_key`: `String!`

##### kg_get_filter_values_output

**Fields:**

- `data`: `kg_filter_values`

##### kg_get_node_input

**Fields:**

- `node_id`: `String!`

##### kg_get_node_neighbors_input

**Fields:**

- `node_id`: `uuid!`

##### kg_get_node_neighbors_output

**Fields:**

- `data`: `kg_graph`

##### kg_get_node_output

**Fields:**

- `data`: `jsonb`

##### kg_get_tenant_filter_output

**Fields:**

- `exists`: `Boolean!`
- `id`: `String`
- `account_ids`: `[String!]!`
- `flow_sources`: `[String!]!`
- `enabled`: `Boolean!`

##### kg_graph

**Fields:**

- `nodes`: `[jsonb]`
- `edges`: `[jsonb]`
- `tenant_id`: `String`
- `generated_at`: `timestamp`

##### kg_search_node_result

**Fields:**

- `id`: `String!`
- `node_type`: `String!`
- `name`: `String`
- `namespace`: `String`
- `cluster`: `String`
- `source`: `String`
- `cloud_account_id`: `String`
- `labels`: `jsonb`
- `properties`: `jsonb`

##### kg_search_nodes_input

**Fields:**

- `name`: `String`
- `name_pattern`: `String`
- `namespace`: `String`
- `cluster`: `String`
- `node_types`: `[String]`
- `source`: `String`
- `labels`: `jsonb`
- `account_ids`: `[String]`
- `limit`: `Int`

##### kg_search_nodes_output

**Fields:**

- `nodes`: `[kg_search_node_result]`
- `total_count`: `Int`

##### kg_traverse_input

**Fields:**

- `node_ids`: `[String]`
- `name`: `String`
- `name_pattern`: `String`
- `namespace`: `String`
- `cluster`: `String`
- `search_node_types`: `[String]`
- `direction`: `String!`
- `max_depth`: `Int`
- `relationship_types`: `[String]`
- `node_types`: `[String]`
- `exclude_node_types`: `[String]`
- `max_nodes`: `Int`

##### kg_traverse_output

**Fields:**

- `data`: `kg_graph`
- `seed_node_ids`: `[String]`
- `truncated`: `Boolean`
- `total_discovered`: `Int`

##### kg_upsert_tenant_filter_input

**Fields:**

- `account_ids`: `[String!]!`
- `flow_sources`: `[String!]!`

##### kg_upsert_tenant_filter_output

**Fields:**

- `id`: `String!`
- `removed_accounts`: `[String!]!`
- `removed_flow_sources`: `[String!]!`
- `message`: `String!`

#### Observability

##### application_group_create_output

**Fields:**

- `id`: `String!`

##### application_group_mapping_item

**Fields:**

- `namespace_name`: `String!`
- `workload_name`: `String!`
- `workload_kind`: `String!`
- `account_id`: `String!`
- `cloud_resource_id`: `String`

##### application_group_update_output

**Fields:**

- `id`: `String!`

##### metrics_request

**Fields:**

- `deployment`: `String!`
- `namespace`: `String!`
- `account`: `String!`

##### metrics_response

**Fields:**

- `data`: `jsonb!`

#### Compliance & Security

##### security_scan_image_input

**Fields:**

- `account_id`: `String!`
- `workload`: `String!`
- `namespace`: `String!`

##### security_scan_image_output

**Fields:**

- `data`: `[jsonb]!`

##### security_scan_vm_account_input

**Fields:**

- `account_id`: `String!`

##### security_scan_vm_account_output

**Fields:**

- `data`: `[jsonb]!`

##### security_scan_vm_input

**Fields:**

- `account_id`: `String!`
- `datasource_id`: `String!`
- `cloud_resource_id`: `String!`

##### security_scan_vm_output

**Fields:**

- `data`: `[jsonb]!`

#### Tickets

##### ticket_create_meta_response

**Fields:**

- `data`: `jsonb!`

##### ticket_data

**Fields:**

- `insert_tickets_one`: `insert_ticket_one_resp!`

##### ticket_field_values_response

**Fields:**

- `data`: `jsonb!`

##### ticket_insert_data_resp

**Fields:**

- `insert_tickets_one`: `insert_ticket_one_resp!`

##### ticket_integration_create_config_input

**Fields:**

- `name`: `String!`
- `tool`: `String!`
- `url`: `String`
- `username`: `String`
- `password`: `String`
- `auth_type`: `String`
- `id`: `uuid`
- `config_values`: `[TicketIntegrationConfigValueInput]`

##### ticket_integration_create_config_output

**Fields:**

- `id`: `uuid!`

##### ticket_test_connection_output

**Fields:**

- `success`: `Boolean!`
- `message`: `String`
- `tool`: `String`
- `projects_count`: `Int`
- `error`: `String`

##### tickets_create

**Fields:**

- `id`: `uuid!`

##### tickets_insert_one_input

**Fields:**

- `reference_id`: `String`
- `ticket_type`: `String`
- `integration_id`: `String`
- `status`: `String`
- `ticket_id`: `String`
- `assignee`: `String`
- `project_key`: `String`
- `title`: `String`
- `description`: `String`
- `source`: `String`
- `severity`: `String`
- `account_id`: `String`
- `action`: `String`
- `message`: `String`
- `additional_fields`: `jsonb`

##### tickets_insert_one_output

**Fields:**

- `data`: `ticket_insert_data_resp!`

#### Notifications

##### messaging_platform_delete_input

**Fields:**

- `id`: `uuid!`

##### messaging_platform_delete_output

**Fields:**

- `id`: `uuid!`

##### messaging_platform_list_input

**Fields:**

- `platform`: `String`

##### messaging_platform_list_output

**Fields:**

- `data`: `[MessagingPlatformItem!]!`

##### messaging_platform_update_input

**Fields:**

- `id`: `uuid!`
- `channels`: `jsonb!`

##### messaging_platform_update_output

**Fields:**

- `affected_rows`: `Int!`

##### notification_channel_list_resp

**Fields:**

- `data`: `jsonb`
- `error`: `jsonb`

##### notification_channel_mapping_create_output

**Fields:**

- `id`: `String!`
- `account_id`: `String`
- `platform`: `String`
- `team_id`: `String`
- `channel_id`: `String`
- `created_by`: `String`
- `created_at`: `String`

##### notification_channel_mapping_delete_output

**Fields:**

- `id`: `String!`

##### notification_channel_mapping_update_output

**Fields:**

- `id`: `String!`
- `account_id`: `String`
- `team_id`: `String`
- `channel_id`: `String`

##### notification_rule_delete_output

**Fields:**

- `id`: `String!`

##### notification_rule_input

**Fields:**

- `id`: `uuid`
- `name`: `String!`
- `description`: `String`
- `source`: `String!`
- `cluster`: `String!`
- `namespace`: `String`
- `workload`: `String`
- `is_supressed`: `Boolean`
- `is_active`: `Boolean`

##### notification_rule_mapping_input

**Fields:**

- `installation_id`: `uuid`
- `platform`: `String!`
- `channels`: `jsonb!`

##### notification_rule_mapping_output

**Fields:**

- `id`: `uuid`
- `error`: `String`

##### notification_rule_upsert_input

**Fields:**

- `id`: `uuid`
- `name`: `String!`
- `description`: `String`
- `source`: `String!`
- `cluster`: `String`
- `account_id`: `uuid`
- `namespace`: `String`
- `workload`: `String`
- `aggregation_key`: `String`
- `expires_at`: `timestamp`
- `is_suppressed`: `Boolean!`
- `is_active`: `Boolean`
- `delivery_mode`: `String`
- `frequency`: `String`
- `severity`: `String`
- `mappings`: `[notification_rule_mapping_input]`

##### notification_send_test_resp

**Fields:**

- `success`: `Boolean`
- `platform`: `String`
- `error`: `String`

##### notification_user_list_resp

**Fields:**

- `data`: `jsonb`
- `error`: `jsonb`

#### Organization & Users

##### auth_account_group_roles_upsert_one_input

**Fields:**

- `group_id`: `String!`
- `account_roles`: `[auth_account_role_input]!`

##### auth_account_group_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### auth_account_role_input

**Fields:**

- `account_id`: `String!`
- `role`: `String!`

##### auth_account_user_roles_upsert_one_input

**Fields:**

- `user_id`: `String!`
- `account_roles`: `[auth_account_role_input]!`

##### auth_account_user_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### auth_check_session_input

**Fields:**

- `user_id`: `String!`
- `jti`: `String`
- `iat`: `Int!`

##### auth_check_session_output

**Fields:**

- `revoked`: `Boolean!`

##### auth_delete_session_input

**Fields:**

- `user_id`: `String!`
- `jti`: `String`
- `expires_at`: `Int!`

##### auth_delete_session_output

**Fields:**

- `revoked`: `Boolean!`

##### auth_k8saccount_group_roles_upsert_one_input

**Fields:**

- `group_id`: `String!`
- `k8saccount_namespace_roles`: `[k8saccount_namespace_role_input]!`

##### auth_k8saccount_namespace_group_roles_upsert_one_input

**Fields:**

- `group_id`: `String!`
- `k8saccount_namespace_roles`: `[k8saccount_namespace_role_input]!`

##### auth_k8saccount_namespace_group_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### auth_k8saccount_namespace_user_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### auth_k8saccount_user_roles_upsert_one_input

**Fields:**

- `user_id`: `String!`
- `k8saccount_namespace_roles`: `[k8saccount_namespace_role_input]!`

##### auth_manage_group_users_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### auth_tenant_group_roles_upsert_one_input

**Fields:**

- `group_id`: `String!`
- `role`: `String!`

##### auth_tenant_group_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### auth_tenant_user_roles_upsert_one_input

**Fields:**

- `user_id`: `String`
- `username`: `String`
- `role`: `String!`

##### auth_tenant_user_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### roles_list_input

**Fields:**

- `filter`: `String`

##### roles_list_item

**Fields:**

- `display_name`: `String`
- `value`: `String!`

##### tenant_attribute_delete_output

**Fields:**

- `status`: `String!`
- `affected_rows`: `Int!`

##### tenant_group_roles_upsert_one_input

**Fields:**

- `group_id`: `String!`
- `role`: `String!`

##### tenant_group_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### tenant_insert_one_input

**Fields:**

- `tenant_name`: `String!`
- `user_id`: `uuid!`
- `role`: `String`

##### tenant_insert_one_output

**Fields:**

- `id`: `uuid!`

##### tenant_list_all_output

**Fields:**

- `id`: `uuid!`
- `name`: `String!`

##### tenant_onboarding_delete_by_username_output

**Fields:**

- `affected_rows`: `Int!`

##### tenant_onboarding_insert_output

**Fields:**

- `id`: `String!`

##### tenant_onboarding_record

**Fields:**

- `id`: `String!`
- `verification_status`: `String`
- `verification_token_expiration`: `String`
- `username`: `String`
- `tenant_name`: `String`
- `user_displayname`: `String`

##### tenant_onboarding_update_status_output

**Fields:**

- `id`: `String!`

##### tenant_update_name_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### tenant_user_roles_upsert_one_input

**Fields:**

- `user_id`: `String!`
- `role`: `String!`

##### tenant_user_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### user_create_auth_input

**Fields:**

- `user`: `String!`
- `provider`: `String!`
- `provider_type`: `String!`
- `account_id`: `String!`
- `name`: `String!`
- `credential`: `String`
- `status`: `String`
- `accessed_at`: `String`
- `expires_at`: `String`

##### user_create_auth_output

**Fields:**

- `id`: `String!`
- `name`: `String!`
- `user_status`: `String!`
- `user_id`: `String!`

##### user_delete_auth_input

**Fields:**

- `id`: `String!`

##### user_delete_auth_output

**Fields:**

- `id`: `String!`

##### user_list_tenants_input

**Fields:**

- `username`: `String!`

##### user_list_tenants_item

**Fields:**

- `name`: `String!`

##### user_onboard_input

**Fields:**

- `username`: `String!`
- `display_name`: `String!`
- `status`: `String`
- `tenant_name`: `String`
- `tenant_id`: `String`
- `role`: `String`
- `groups`: `[String!]`
- `existing_user_id`: `String`

##### user_onboard_output

**Fields:**

- `id`: `String`
- `status`: `String!`
- `message`: `String`

##### user_status_types_list_item

**Fields:**

- `value`: `String!`

##### user_sync_roles_input

**Fields:**

- `username`: `String!`
- `tenant_id`: `String!`
- `target_roles`: `[String!]!`
- `remove_old_roles`: `Boolean!`

##### user_sync_roles_output

**Fields:**

- `added`: `Int!`
- `removed`: `Int!`

##### user_tenant_role

**Fields:**

- `entity_id`: `String`
- `entity_type`: `String`
- `role`: `String`

##### user_tenant_roles_input

**Fields:**

- `username`: `String!`
- `tenant_id`: `String!`

##### user_tenant_roles_output

**Fields:**

- `roles`: `[user_tenant_role!]!`
- `tenant_name`: `String!`

##### user_update_accessed_input

**Fields:**

- `auth_id`: `String`
- `username`: `String`
- `tenant_id`: `String!`
- `token_sha256`: `String`

##### user_update_accessed_output

**Fields:**

- `updated`: `Int!`

##### user_update_default_tenant_input

**Fields:**

- `tenant_id`: `String!`
- `username`: `String!`

##### user_update_default_tenant_output

**Fields:**

- `updated`: `Int!`

##### user_update_profile_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### user_update_status_input

**Fields:**

- `id`: `String!`
- `status`: `String!`

##### user_update_status_output

**Fields:**

- `id`: `String!`

##### usergroup_create_output

**Fields:**

- `id`: `String!`

##### usergroup_update_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### users_insert_one_input

**Fields:**

- `firstname`: `String!`
- `username`: `String!`
- `lastname`: `String`
- `role`: `String`
- `tenantname`: `String`

##### users_insert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String`
- `id`: `String`
- `tenant_id`: `String`

#### Integrations

##### integration_update_status_by_pk_output

**Fields:**

- `id`: `String!`

##### jira_configuration_data

**Fields:**

- `insert_jira_configurations_one`: `insert_jira_configurations_one_resp!`

##### jira_configurations_insert_one_input

**Fields:**

- `auth_type`: `String`
- `name`: `String`
- `password`: `String`
- `status`: `String`
- `url`: `String`
- `username`: `String`
- `projects`: `String`
- `created_at`: `timestamp`
- `created_by`: `uuid`
- `tenant`: `uuid`
- `updated_by`: `uuid`
- `tool`: `String`
- `id`: `uuid`

##### jira_configurations_insert_one_output

**Fields:**

- `data`: `jira_configuration_data!`

#### Other

##### AIBudgetConfigDeleteRequest

**Fields:**

- `id`: `String!`

##### AIBudgetConfigDeleteResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### AIBudgetConfigListRequest

**Fields:**

- `entity_type`: `String`
- `entity_id`: `String`
- `module`: `String`

##### AIBudgetConfigListResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### AIBudgetConfigUpsertRequest

**Fields:**

- `entity_type`: `String!`
- `entity_id`: `String!`
- `module`: `String!`
- `budget_disabled`: `Boolean`
- `monthly_cost_limit`: `Float`
- `monthly_cost_enabled`: `Boolean`
- `monthly_count_limit`: `Int`
- `monthly_count_enabled`: `Boolean`
- `daily_cost_limit`: `Float`
- `daily_cost_enabled`: `Boolean`
- `daily_count_limit`: `Int`
- `daily_count_enabled`: `Boolean`

##### AIBudgetConfigUpsertResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### AIBudgetStatusData

**Fields:**

- `tenant_id`: `String!`
- `account_id`: `String!`
- `period`: `String!`
- `today`: `String!`
- `investigation`: `AIModuleBudgetStatus!`
- `user_investigation`: `AIModuleBudgetStatus!`

##### AIBudgetStatusRequest

**Fields:**

- `account_id`: `String!`

##### AIBudgetStatusResponse

**Fields:**

- `data`: `AIBudgetStatusData`
- `err`: `jsonb`

##### AIBudgetSystemDefaultsResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### AIConfigCapabilitiesInput

**Fields:**

- `disabled_tools`: `[String]`
- `allowed_tools`: `[String]`

##### AIConfigClientToolInput

**Fields:**

- `name`: `String!`
- `description`: `String!`
- `input`: `AIConfigClientToolSchemaInput`

##### AIConfigClientToolSchemaInput

**Fields:**

- `type`: `String!`
- `properties`: `jsonb`
- `required`: `[String]`

##### AIConfigInput

**Fields:**

- `llm_provider`: `String`
- `llm_model_name`: `String`

##### AICountLimitInfo

**Fields:**

- `enabled`: `Boolean!`
- `limit`: `Int!`
- `usage`: `Int!`
- `remaining`: `Int!`
- `limit_source`: `String!`

##### AIEntityBudgetStatus

**Fields:**

- `budget_disabled`: `Boolean!`
- `disabled_by`: `String`
- `disabled_at`: `String`
- `monthly_cost`: `AILimitInfo!`
- `daily_cost`: `AILimitInfo!`
- `monthly_count`: `AICountLimitInfo!`
- `daily_count`: `AICountLimitInfo!`

##### AIFollowupRequest

**Fields:**

- `account_id`: `String!`
- `query`: `String!`
- `user_id`: `String`
- `conversation_id`: `String!`
- `message_id`: `String!`
- `agent_id`: `String!`
- `async`: `Boolean!`
- `config`: `AIConfigInput`
- `resolution`: `String`
- `reason`: `String`

##### AIFollowupResponse

**Fields:**

- `data`: `AIFollowupResponseData!`

##### AIFollowupResponseData

**Fields:**

- `response`: `[String!]!`
- `chain_name`: `String!`
- `conversation_id`: `String`
- `message_id`: `String`

##### AIGenerateWorkflowData

**Fields:**

- `response`: `[String!]!`
- `query`: `String!`
- `agent_step_response`: `[String!]!`
- `chain_name`: `String!`
- `conversation_id`: `String`
- `session_id`: `String`
- `message_id`: `String`
- `agent_id`: `String`
- `status`: `String!`
- `followup`: `AIFollowupResponse`

##### AIGenerateWorkflowRequest

**Fields:**

- `query`: `String!`
- `conversation_id`: `String`
- `session_id`: `String`
- `account_id`: `String!`
- `user_id`: `String`
- `message_id`: `String`
- `agent_id`: `String`
- `async`: `Boolean`
- `config`: `jsonb`
- `source`: `String`

##### AIGenerateWorkflowResponse

**Fields:**

- `data`: `AIGenerateWorkflowData!`

##### AIGetConversationSuggestionRequest

**Fields:**

- `conversation_id`: `uuid!`
- `account_id`: `uuid!`
- `user_id`: `uuid!`
- `message_id`: `uuid!`

##### AIGetConversationSuggestionResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### AIGetConversationTimeAggregatesRequest

**Fields:**

- `account_id`: `String!`
- `user_id`: `String`
- `start_date`: `String!`
- `end_date`: `String!`
- `sources`: `[String!]`
- `event_scoped`: `Boolean`

##### AIGetConversationTimeAggregatesResponse

**Fields:**

- `data`: `jsonb!`

##### AIGetConversationUsageMetricsRequest

**Fields:**

- `account_id`: `String!`
- `conversation_id`: `String!`
- `user_id`: `String`

##### AIGetConversationUsageMetricsResponse

**Fields:**

- `data`: `jsonb!`

##### AIGetLogQueryRequest

**Fields:**

- `account_id`: `String!`
- `query`: `String!`
- `user_id`: `String`
- `async`: `Boolean`
- `log_provider`: `String`
- `index`: `String`

##### AIGetLogQueryResponse

**Fields:**

- `data`: `AIGetPrometheusQuery!`

##### AIGetModelConfigRequest

**Fields:**

- `account_id`: `String!`
- `conversation_id`: `String`

##### AIGetModelConfigResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### AIGetPrometheusQuery

**Fields:**

- `response`: `[String!]!`
- `query`: `String!`
- `agent_step_response`: `[String!]!`
- `chain_name`: `String!`
- `conversation_id`: `String`
- `message_id`: `String`
- `session_id`: `String`

##### AIGetPrometheusQueryRequest

**Fields:**

- `account_id`: `String!`
- `query`: `String!`
- `user_id`: `String`
- `async`: `Boolean`

##### AIGetPrometheusQueryResponse

**Fields:**

- `data`: `AIGetPrometheusQuery!`

##### AIGetRcaFormatRequest

**Fields:**

- `account_id`: `String!`

##### AIGetRcaFormatResponse

**Fields:**

- `data`: `AIGetRcaFormatResponseData`
- `errors`: `jsonb`

##### AIGetRcaFormatResponseData

**Fields:**

- `is_default`: `Boolean`
- `format`: `String`

##### AIImageAttachmentInput

**Fields:**

- `data`: `String`
- `url`: `String`
- `mime_type`: `String`

##### AILimitInfo

**Fields:**

- `enabled`: `Boolean!`
- `limit`: `Float!`
- `usage`: `Float!`
- `remaining`: `Float!`
- `limit_source`: `String!`

##### AIListModelsRequest

**Fields:**

- `account_id`: `String!`

##### AIListModelsResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### AILlmWatchCancelData

**Fields:**

- `affected_rows`: `Int!`
- `watch_id`: `String`
- `status`: `String`

##### AILlmWatchCancelRequest

**Fields:**

- `watch_id`: `String!`

##### AILlmWatchCancelResponse

**Fields:**

- `data`: `AILlmWatchCancelData`
- `err`: `Json`

##### AILlmWatchListData

**Fields:**

- `watches`: `[AILlmWatchRow!]!`

##### AILlmWatchListRequest

**Fields:**

- `conversation_id`: `String!`

##### AILlmWatchListResponse

**Fields:**

- `data`: `AILlmWatchListData`
- `err`: `Json`

##### AILlmWatchRow

**Fields:**

- `id`: `String!`
- `status`: `String!`
- `source_kind`: `String!`
- `predicate_kind`: `String!`
- `predicate_expr`: `String!`
- `predicate_negate`: `Boolean!`
- `poll_interval_sec`: `Int!`
- `max_duration_sec`: `Int!`
- `poll_count`: `Int!`
- `failure_count`: `Int!`
- `next_poll_at`: `String!`
- `last_poll_at`: `String`
- `last_poll_result`: `String`
- `final_result`: `String`
- `error`: `String`
- `expires_at`: `String!`
- `created_at`: `String!`
- `updated_at`: `String!`

##### AIMemoryResponse

**Fields:**

- `id`: `String!`
- `account_id`: `String!`
- `conversation_id`: `String`
- `message_id`: `String`
- `content`: `String`
- `memory_type`: `String`
- `created_at`: `timestamp`

##### AIModuleBudgetStatus

**Fields:**

- `tenant`: `AIEntityBudgetStatus!`
- `account`: `AIEntityBudgetStatus!`

##### AIReferenceResponse

**Fields:**

- `id`: `String`
- `account_id`: `String`
- `conversation_id`: `String`
- `message_id`: `String`
- `agent_id`: `String`
- `reference_id`: `String`
- `type`: `String`
- `content`: `String`
- `metadata`: `Json`
- `used`: `Boolean`
- `used_by_agent`: `String`
- `created_at`: `timestamp`

##### AIResponse

**Fields:**

- `data`: `jsonb!`

##### AISaveRcaFormatRequest

**Fields:**

- `account_id`: `String!`
- `format`: `String`

##### AISaveRcaFormatResponse

**Fields:**

- `data`: `AIGetRcaFormatResponseData`
- `errors`: `jsonb`

##### AISaveRcaFormatResponseData

**Fields:**

- `is_default`: `Boolean`
- `format`: `String`

##### AIStopInvestigationRequest

**Fields:**

- `account_id`: `String!`
- `conversation_id`: `String!`
- `user_id`: `String`

##### AIStopInvestigationResponse

**Fields:**

- `data`: `jsonb!`

##### AISubmitClientToolCallRequest

**Fields:**

- `account_id`: `String!`
- `conversation_id`: `String!`
- `agent_id`: `String!`
- `message_id`: `String!`
- `async`: `Boolean!`
- `results`: `[AISubmitClientToolCallResult]`

##### AISubmitClientToolCallResponse

**Fields:**

- `data`: `AISubmitClientToolCallResponseData`

##### AISubmitClientToolCallResponseData

**Fields:**

- `status`: `String`

##### AISubmitClientToolCallResult

**Fields:**

- `tool_id`: `String!`
- `result`: `String`
- `status`: `String`

##### AITriggerInvestigationDataResponse

**Fields:**

- `response`: `[String!]!`
- `query`: `String!`
- `agent_step_response`: `[String!]!`
- `chain_name`: `String!`
- `conversation_id`: `String`
- `message_id`: `String`
- `session_id`: `String`

##### AITriggerInvestigationRequest

**Fields:**

- `account_id`: `String!`
- `query`: `String!`
- `user_id`: `String`
- `conversation_id`: `String`
- `session_id`: `String`
- `source`: `String`
- `async`: `Boolean!`
- `config`: `AIConfigInput`
- `capabilities`: `AIConfigCapabilitiesInput`
- `client_tools`: `[AIConfigClientToolInput]`
- `images`: `[AIImageAttachmentInput]`

##### AITriggerInvestigationResponse

**Fields:**

- `data`: `AITriggerInvestigationDataResponse`

##### AWSCloudFormationInput

**Fields:**

- `account_name`: `String!`
- `cloud_provider`: `String!`
- `account_type`: `String!`
- `account_env`: `String`
- `account_access`: `String`
- `ssm_access`: `Boolean`

##### AWSCloudFormationOutput

**Fields:**

- `url`: `String!`
- `bucket_name`: `String!`
- `external_id`: `String!`
- `auto_detection_enabled`: `Boolean!`

##### AccountExecutionListRequest

**Fields:**

- `account_ids`: `[String!]` - Account filter. Omit both to span every account the caller can read — the
Executions tab is tenant-level. account_id is the legacy single-account form.
- `account_id`: `String`
- `start_date`: `timestamp`
- `end_date`: `timestamp`
- `workflow_ids`: `[String!]`
- `triggered_by`: `[String!]`
- `statuses`: `[String!]`
- `trigger_types`: `[String!]`
- `limit`: `Int`
- `page`: `Int`
- `next_page_token`: `String`
- `include_failure_reason`: `Boolean`

##### AccountExecutionListResponse

**Fields:**

- `executions`: `[AccountExecutionSummary!]`
- `next_page_token`: `String`
- `total_count`: `Float`
- `total_is_approximate`: `Boolean`

##### AccountExecutionSummary

**Fields:**

- `account_id`: `String`
- `workflow_id`: `String!`
- `id`: `String!`
- `status`: `String!`
- `start_time`: `timestamp`
- `close_time`: `timestamp`
- `triggered_by`: `String`
- `trigger_type`: `String`
- `parent_workflow_id`: `String`
- `workflow_name`: `String`
- `version`: `Int`
- `version_number`: `Int`
- `duration_ms`: `Float`
- `user_name`: `String`
- `failure_reason`: `String`

##### AgentHealth

**Fields:**

- `cloud_account_id`: `String`
- `tenant_id`: `String`
- `type`: `String`
- `version`: `String`
- `status_message`: `String`
- `status`: `String`
- `last_connected_at`: `Datetime`
- `k8s_version`: `String`
- `k8s_provider`: `String`
- `connection_status`: `jsonb`

##### AgentHealthResponse

**Fields:**

- `rows`: `[AgentHealth!]!`

##### AgentHealthWhereRequest

**Fields:**

- `_and`: `[AgentHealthWhereRequest]`
- `_or`: `[AgentHealthWhereRequest]`
- `_not`: `AgentHealthWhereRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `k8s_provider`: `QueryWhereStringRequest`

##### AgentPlaybookResponse

**Fields:**

- `rows`: `[AgentPlaybookRowResponse]`

##### AgentPlaybookRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `cloud_account_id`: `String`
- `trigger_params`: `jsonb`
- `action_params`: `jsonb`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `source`: `String`
- `processor`: `String`
- `alert_name`: `String`

##### AgentPlaybookWhereRequest

**Fields:**

- `_and`: `[AgentPlaybookWhereRequest]`
- `_or`: `[AgentPlaybookWhereRequest]`
- `_not`: `AgentPlaybookWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `processor`: `QueryWhereStringRequest`
- `alert_name`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### AgentRegenerateTokenInput

**Fields:**

- `account_id`: `String!`
- `agent_type`: `String`

##### AgentRegenerateTokenOutput

**Fields:**

- `account_id`: `String!`
- `access_key`: `String!`
- `access_secret`: `String!`

##### AgentRequest

**Fields:**

- `name`: `String`
- `description`: `String`
- `config`: `jsonb`
- `system_prompt`: `String`
- `system_prompt_variables`: `[String]`
- `tools`: `[String]`
- `rags`: `[RagDataInput]`

##### AgentRequestUpdateStruct

**Fields:**

- `id`: `uuid!`
- `name`: `String`
- `description`: `String`
- `system_prompt`: `String`
- `system_prompt_variables`: `[String!]`
- `tools`: `[String!]`
- `config`: `jsonb`
- `status`: `String`

##### AgentStatusInput

**Fields:**

- `id`: `uuid!`
- `status`: `String!`

##### AgentStatusOutput

**Fields:**

- `status`: `String!`
- `success`: `Boolean!`

##### AiConversationAgent

**Fields:**

- `id`: `String!`
- `message_id`: `String!`
- `agent_name`: `String`
- `response`: `String`
- `response_summary`: `String`
- `query`: `String`
- `thought`: `String`
- `parent_agent_id`: `String`
- `status`: `String`
- `references`: `String`
- `created_at`: `timestamptz!`
- `updated_at`: `timestamptz!`

##### AiConversationMessage

**Fields:**

- `id`: `String!`
- `user_id`: `String`
- `user_display_name`: `String`
- `created_at`: `timestamptz!`
- `updated_at`: `timestamptz!`
- `message`: `String!`
- `message_type`: `String`
- `response`: `String`
- `role`: `String`
- `status`: `String`
- `parent_agent_id`: `String`
- `message_config`: `String`
- `ack_message`: `String`
- `metadata`: `String`
- `attachments`: `[AiMessageAttachment!]`
- `followup_wait_seconds`: `Float!`

##### AiConversationShell

**Fields:**

- `id`: `String!`
- `session_id`: `String!`
- `account_id`: `String!`
- `tenant_id`: `String!`
- `user_id`: `String`
- `user_display_name`: `String`
- `created_at`: `timestamptz!`
- `updated_at`: `timestamptz!`
- `source`: `String`
- `context`: `String`
- `status`: `String`
- `title`: `String`

##### AiConversationToolCall

**Fields:**

- `id`: `String!`
- `agent_id`: `String!`
- `tool_name`: `String!`
- `parameters`: `String`
- `response`: `String`
- `thought`: `String`
- `tool_type`: `String`
- `child_agent_id`: `String`
- `references`: `String`
- `tool_id`: `String`
- `status`: `String`
- `metadata`: `String`
- `created_at`: `timestamptz!`
- `updated_at`: `timestamptz!`

##### AiDeleteFunctionRequest

**Fields:**

- `account_id`: `String!`
- `function_id`: `String!`

##### AiDeleteFunctionResponse

**Fields:**

- `data`: `jsonb`

##### AiFeedbackCreateRequest

**Fields:**

- `session_id`: `String!`
- `module`: `String!`
- `question`: `String!`
- `llm_response`: `String!`
- `user_corrected_response`: `String!`
- `additional_notes`: `String!`
- `conversation_id`: `String!`
- `cloud_account_id`: `String!`
- `useful`: `Boolean!`

##### AiFeedbackResponse

**Fields:**

- `id`: `String`
- `module`: `String`
- `useful`: `Boolean`
- `additional_notes`: `String`
- `updated_at`: `String`
- `created_at`: `String`
- `session_id`: `String`
- `cloud_account_id`: `String`
- `question`: `String`
- `llm_response`: `String`
- `user_corrected_response`: `String`
- `conversation_id`: `String`
- `user_id`: `String`

##### AiGetConversationV3Request

**Fields:**

- `account_id`: `uuid!`
- `conversation_id`: `uuid`
- `session_id`: `String`
- `since`: `timestamptz`

##### AiGetConversationV3Response

**Fields:**

- `conversation`: `AiConversationShell`
- `messages`: `[AiConversationMessage!]!`
- `agents`: `[AiConversationAgent!]!`
- `tool_calls`: `[AiConversationToolCall!]!`
- `cursor`: `timestamptz!`

##### AiGetWorspaceFile

**Fields:**

- `account_id`: `String!`
- `conversation_id`: `String!`
- `path`: `String!`
- `download`: `Boolean`

##### AiMessageAttachment

**Fields:**

- `id`: `String!`
- `mime_type`: `String!`
- `size_bytes`: `Int!`
- `description`: `String`
- `created_at`: `timestamptz!`
- `data`: `String`

##### AlertAction

**Fields:**

- `actions`: `jsonb!`

##### AlertActionListRequest

**Fields:**

- `cloud_account_id`: `String!`
- `query`: `String!`
- `source`: `String`
- `alert_type`: `String`

##### AlertActionListResponse

**Fields:**

- `actions`: `[AlertAction]`

##### AlertQueryRequest

**Fields:**

- `state`: `[String!]`
- `label`: `jsonb`
- `rule_id`: `String!`

##### AlertQueryResponse

**Fields:**

- `count`: `Int!`
- `alerts`: `[AlertSummary!]!`

##### AlertRule

**Fields:**

- `annotations`: `Annotations!`
- `expr`: `String!`
- `labels`: `Labels!`
- `alert`: `String!`
- `duration`: `String!`
- `accountId`: `String!`
- `source`: `String!`
- `category`: `String!`
- `severity`: `String!`
- `enabled`: `Boolean!`
- `trigger_params`: `jsonb!`
- `action_params`: `jsonb!`
- `alert_type`: `String`
- `metric_provider`: `String`
- `metric_provider_source`: `String`
- `provider_config`: `jsonb`

##### AlertRuleResponse

**Fields:**

- `response`: `Boolean!`

##### AlertRulesQueryRequest

**Fields:**

- `group_name`: `[String!]`
- `status`: `[String!]`
- `state`: `[String!]`
- `source`: `[String!]`
- `label`: `jsonb`

##### AlertRulesQueryResponse

**Fields:**

- `count`: `Int!`
- `alert_rules`: `[AlertRulesSummary!]!`

##### AlertRulesSummary

**Fields:**

- `id`: `String!`
- `title`: `String!`
- `description`: `String!`
- `status`: `String!`
- `state`: `String!`
- `label`: `jsonb`
- `source`: `String`
- `updated_at`: `String`
- `interval`: `String`
- `created_by`: `String`
- `updated_by`: `String`
- `evaluation_period`: `String`
- `alert_activated_at`: `String`

##### AlertSummary

**Fields:**

- `id`: `String!`
- `rule_id`: `String!`
- `title`: `String!`
- `state`: `String!`
- `label`: `jsonb`
- `alert_activated_at`: `String`

##### Annotations

**Fields:**

- `description`: `String!`
- `summary`: `String!`
- `runbook`: `String`

##### AnomalyGroupingResponse

**Fields:**

- `count`: `Int`

##### AnomalyGroupingsResponse

**Fields:**

- `rows`: `[AnomalyGroupingResponse]!`

##### AnomalyInsight

**Fields:**

- `timestamp`: `String!`
- `value`: `Float!`
- `baseline_value`: `Float!`
- `deviation_absolute`: `Float!`
- `deviation_percent`: `Float!`
- `severity`: `String!`
- `anomaly_score`: `Float!`
- `comparison_window`: `String!`

##### AnomalyResponse

**Fields:**

- `anomaly_type`: `String!`
- `config_id`: `String`
- `current_value`: `String!`
- `updated_at`: `String!`
- `evaluated_at`: `String`
- `is_anomaly`: `Boolean!`
- `name`: `String!`
- `namespace`: `String!`
- `reference_value`: `String!`
- `id`: `String!`
- `account_id`: `String!`
- `insights`: `[AnomalyInsight]`

##### AnomalyTemplateListRequest

**Fields:**

- `account_id`: `String`

##### AnomalyTemplateListResponse

**Fields:**

- `data`: `[AnomalyTemplateResponse!]`

##### AnomalyTemplateResponse

**Fields:**

- `anomaly_type`: `String!`
- `buffer_percentage`: `Float!`
- `change_operator`: `String!`
- `title`: `String!`
- `description`: `String!`

##### AnomalyTypeResponse

**Fields:**

- `rows`: `[AnomalyTypeRowResponse]`

##### AnomalyTypeRowResponse

**Fields:**

- `value`: `String`
- `comment`: `String`

##### AnomalyTypeWhereRequest

**Fields:**

- `_and`: `[AnomalyTypeWhereRequest]`
- `_or`: `[AnomalyTypeWhereRequest]`
- `_not`: `AnomalyTypeWhereRequest`
- `value`: `QueryWhereStringRequest`
- `comment`: `QueryWhereStringRequest`

##### AnomalyV3Response

**Fields:**

- `anomaly_count`: `Int`
- `anomaly_type`: `String!`
- `name`: `String!`
- `namespace`: `String!`
- `count`: `Int`
- `evaluated_at`: `String`

##### ApplicationDeploymentCompareOutput

**Fields:**

- `data`: `ApplicationDeploymentMetrics`

##### ApplicationDeploymentCompareRequest

**Fields:**

- `applications`: `[ApplicationRequest]`
- `account_id`: `String!`

##### ApplicationDeploymentMetrics

**Fields:**

- `account_id`: `String`
- `name`: `String`
- `namespace`: `String`
- `last_deployment_date_time`: `timestamp`
- `previous_stats`: `ApplicationMetrics`
- `current_stats`: `ApplicationMetrics`

##### ApplicationGroupGroupingsResponse

**Fields:**

- `rows`: `[ApplicationGroupGroupingsRowResponse]`

##### ApplicationGroupGroupingsRowResponse

**Fields:**

- `count`: `Int`

##### ApplicationGroupGroupingsWhereRequest

**Fields:**

- `_and`: `[ApplicationGroupGroupingsWhereRequest]`
- `_or`: `[ApplicationGroupGroupingsWhereRequest]`
- `_not`: `ApplicationGroupGroupingsWhereRequest`
- `name`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### ApplicationGroupMappingGroupingsResponse

**Fields:**

- `rows`: `[ApplicationGroupMappingGroupingsRowResponse]`

##### ApplicationGroupMappingGroupingsRowResponse

**Fields:**

- `group_id`: `String`
- `count`: `Int`

##### ApplicationGroupMappingGroupingsWhereRequest

**Fields:**

- `_and`: `[ApplicationGroupMappingGroupingsWhereRequest]`
- `_or`: `[ApplicationGroupMappingGroupingsWhereRequest]`
- `_not`: `ApplicationGroupMappingGroupingsWhereRequest`
- `group_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### ApplicationGroupMappingResponse

**Fields:**

- `rows`: `[ApplicationGroupMappingRowResponse]`

##### ApplicationGroupMappingRowResponse

**Fields:**

- `id`: `String`
- `group_id`: `String`
- `account_id`: `String`
- `namespace_name`: `String`
- `workload_name`: `String`
- `workload_kind`: `String`
- `cloud_resource_id`: `String`
- `account_name`: `String`
- `workload_is_active`: `Boolean`
- `workload_display_name`: `String`
- `workload_namespace`: `String`

##### ApplicationGroupMappingWhereRequest

**Fields:**

- `_and`: `[ApplicationGroupMappingWhereRequest]`
- `_or`: `[ApplicationGroupMappingWhereRequest]`
- `_not`: `ApplicationGroupMappingWhereRequest`
- `id`: `QueryWhereStringRequest`
- `group_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `namespace_name`: `QueryWhereStringRequest`
- `workload_name`: `QueryWhereStringRequest`
- `workload_kind`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### ApplicationGroupResponse

**Fields:**

- `rows`: `[ApplicationGroupRowResponse]`

##### ApplicationGroupRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `description`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `created_by`: `String`
- `updated_by`: `String`
- `created_by_display_name`: `String`
- `updated_by_display_name`: `String`

##### ApplicationGroupWhereRequest

**Fields:**

- `_and`: `[ApplicationGroupWhereRequest]`
- `_or`: `[ApplicationGroupWhereRequest]`
- `_not`: `ApplicationGroupWhereRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### ApplicationMetrics

**Fields:**

- `application_id`: `String!`
- `name`: `String!`
- `namespace`: `String!`
- `container`: `String`
- `max_cpu_request`: `Float`
- `max_memory_request`: `Float`
- `max_cpu_limit`: `Float`
- `max_memory_limit`: `Float`
- `latency`: `Float`
- `latency_p99`: `Float`
- `cpu_p99`: `Float`
- `cpu_p50`: `Float`
- `cpu_max`: `Float`
- `memory_max`: `Float`
- `memory_p99`: `Float`
- `memory_p50`: `Float`
- `log_failure_count`: `Float`
- `total_request_count`: `Float`
- `failure_request_count`: `Float`
- `bad_data_count`: `Float`
- `good_data_count`: `Float`
- `valid_data_count`: `Float`
- `oom_kill_limit`: `Float`

##### ApplicationMetricsOutput

**Fields:**

- `data`: `[ApplicationMetrics!]`

##### ApplicationMetricsRequest

**Fields:**

- `account_id`: `String!`
- `applications`: `[ApplicationRequest]`
- `start_at`: `Datetime`
- `end_at`: `Datetime`

##### ApplicationProfile

**Fields:**

- `pod_name`: `String`
- `workload_name`: `String`
- `namespace`: `String`
- `created_by`: `String`
- `profile`: `jsonb`
- `source`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `profile_type`: `String`
- `profile_duration`: `Float`
- `profile_language`: `String`
- `profile_tool`: `String`
- `output_type`: `String`

##### ApplicationProfileConvertDataResponse

**Fields:**

- `data`: `ApplicationProfileConvertResponse!`

##### ApplicationProfileConvertRequest

**Fields:**

- `account_id`: `String!`
- `base64_profile`: `String!`

##### ApplicationProfileConvertResponse

**Fields:**

- `svg_profile`: `String!`

##### ApplicationProfileDataResponse

**Fields:**

- `data`: `GetApplicationProfileResponse`

##### ApplicationProfileGetRequest

**Fields:**

- `account_id`: `String!`
- `profile_id`: `String!`

##### ApplicationProfileRequest

**Fields:**

- `account_id`: `String!`
- `namespace`: `String!`
- `pod_name`: `String!`
- `profile_type`: `String`
- `application_language`: `String`
- `profile_duration`: `Int`
- `profile_tool`: `String`
- `lang`: `String`
- `output_type`: `String`

##### ApplicationProfileResponse

**Fields:**

- `rows`: `[ApplicationProfile]`

##### ApplicationProfileWhereRequest

**Fields:**

- `_and`: `[ApplicationProfileWhereRequest]`
- `_or`: `[ApplicationProfileWhereRequest]`
- `_not`: `ApplicationProfileWhereRequest`
- `namespace`: `QueryWhereStringRequest`
- `pod_name`: `QueryWhereStringRequest`
- `workload_name`: `QueryWhereStringRequest`
- `cloud_account_id`: `QueryWhereStringRequest`

##### ApplicationRequest

**Fields:**

- `name`: `String!`
- `namespace`: `String!`
- `kind`: `String!`

##### AssemblyCause

**Fields:**

- `config_changes`: `[AssemblyItem]`
- `upstream`: `[AssemblyItem]`

##### AssemblyEvidence

**Fields:**

- `expected_in_window`: `Float`
- `observed_in_window`: `Float`

##### AssemblyItem

**Fields:**

- `event_id`: `String`
- `title`: `String`
- `subject`: `String`
- `aggregation_key`: `String`
- `priority`: `String`
- `sources`: `[String]`
- `occurrence_count`: `Int`
- `relation`: `String`
- `starts_at`: `String`
- `dt_seconds`: `Int`
- `evidence`: `AssemblyEvidence`

##### AssemblyWindow

**Fields:**

- `lead_in_s`: `Int`
- `core_s`: `Int`
- `impact_s`: `Int`

##### AuditGroupingResponse

**Fields:**

- `rows`: `[AuditGroupingRowResponse]`

##### AuditGroupingRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `user_id`: `String`
- `event_time`: `Datetime`
- `event_category`: `String`
- `event_type`: `String`
- `event_actor`: `String`
- `event_target`: `String`
- `event_action`: `String`
- `event_status`: `String`
- `transaction_id`: `String`
- `count`: `Int`

##### AuditGroupingWhereRequest

**Fields:**

- `_and`: `[AuditGroupingWhereRequest]`
- `_or`: `[AuditGroupingWhereRequest]`
- `_not`: `AuditGroupingWhereRequest`
- `user_id`: `QueryWhereStringRequest`
- `username`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `event_time`: `QueryWhereDatetimeRequest`
- `event_category`: `QueryWhereStringRequest`
- `event_type`: `QueryWhereStringRequest`
- `event_actor`: `QueryWhereStringRequest`
- `event_target`: `QueryWhereStringRequest`
- `event_action`: `QueryWhereStringRequest`
- `event_status`: `QueryWhereStringRequest`
- `transaction_id`: `QueryWhereStringRequest`

##### AuditResponse

**Fields:**

- `rows`: `[AuditRowResponse]`

##### AuditRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `user_id`: `String`
- `event_time`: `Datetime`
- `event_category`: `String`
- `event_type`: `String`
- `event_prev_state`: `String`
- `event_state`: `String`
- `event_actor`: `String`
- `event_target`: `String`
- `event_action`: `String`
- `event_status`: `String`
- `transaction_id`: `String`
- `event_attr`: `Json`

##### AuditWhereRequest

**Fields:**

- `_and`: `[AuditWhereRequest]`
- `_or`: `[AuditWhereRequest]`
- `_not`: `AuditWhereRequest`
- `id`: `QueryWhereStringRequest`
- `user_id`: `QueryWhereStringRequest`
- `username`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `event_time`: `QueryWhereDatetimeRequest`
- `event_category`: `QueryWhereStringRequest`
- `event_type`: `QueryWhereStringRequest`
- `event_actor`: `QueryWhereStringRequest`
- `event_target`: `QueryWhereStringRequest`
- `event_action`: `QueryWhereStringRequest`
- `event_status`: `QueryWhereStringRequest`
- `transaction_id`: `QueryWhereStringRequest`

##### AutoPilotApprovalPolicyResponse

**Fields:**

- `rows`: `[AutoPilotApprovalPolicyRowResponse]`

##### AutoPilotApprovalPolicyRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `created_by`: `String`
- `updated_by`: `String`
- `policy_attributes`: `Json`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `account_name`: `String`
- `created_by_display_name`: `String`
- `updated_by_display_name`: `String`

##### AutoPilotApprovalPolicyWhereRequest

**Fields:**

- `_and`: `[AutoPilotApprovalPolicyWhereRequest]`
- `_or`: `[AutoPilotApprovalPolicyWhereRequest]`
- `_not`: `AutoPilotApprovalPolicyWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`

##### AutoPilotApprovalsGroupingsResponse

**Fields:**

- `rows`: `[AutoPilotApprovalsGroupingsRowResponse]`

##### AutoPilotApprovalsGroupingsRowResponse

**Fields:**

- `count`: `Int`

##### AutoPilotApprovalsGroupingsWhereRequest

**Fields:**

- `_and`: `[AutoPilotApprovalsGroupingsWhereRequest]`
- `_or`: `[AutoPilotApprovalsGroupingsWhereRequest]`
- `_not`: `AutoPilotApprovalsGroupingsWhereRequest`
- `account_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `autopilot_id`: `QueryWhereStringRequest`

##### AutoPilotApprovalsResponse

**Fields:**

- `rows`: `[AutoPilotApprovalsRowResponse]`

##### AutoPilotApprovalsRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `autopilot_id`: `String`
- `policy_id`: `String`
- `reviewer_id`: `String`
- `status`: `String`
- `auto_pilot_type`: `String`
- `reviewer_comments`: `String`
- `attributes`: `Json`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `approval_status_description`: `String`
- `reviewer_display_name`: `String`

##### AutoPilotApprovalsWhereRequest

**Fields:**

- `_and`: `[AutoPilotApprovalsWhereRequest]`
- `_or`: `[AutoPilotApprovalsWhereRequest]`
- `_not`: `AutoPilotApprovalsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `autopilot_id`: `QueryWhereStringRequest`
- `reviewer_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `auto_pilot_type`: `QueryWhereStringRequest`

##### AutoPilotGroupingsResponse

**Fields:**

- `rows`: `[AutoPilotGroupingsRowResponse]`

##### AutoPilotGroupingsRowResponse

**Fields:**

- `account_id`: `String`
- `status`: `String`
- `category`: `String`
- `count`: `Int`

##### AutoPilotGroupingsWhereRequest

**Fields:**

- `_and`: `[AutoPilotGroupingsWhereRequest]`
- `_or`: `[AutoPilotGroupingsWhereRequest]`
- `_not`: `AutoPilotGroupingsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`

##### AutoPilotResponse

**Fields:**

- `rows`: `[AutoPilotRowResponse]`

##### AutoPilotRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `account_id`: `String`
- `tenant_id`: `String`
- `rule`: `jsonb`
- `status`: `String`
- `category`: `String`
- `notification`: `jsonb`
- `auto_optimize_resource_maps`: `jsonb`
- `schedule_time`: `String`
- `next_schedule_time`: `String`
- `last_executed_time`: `String`
- `created_by`: `String`
- `creation_date`: `String`
- `start_at`: `String`
- `end_at`: `String`
- `attributes`: `jsonb`
- `username`: `String`
- `display_name`: `String`
- `updated_by_display_name`: `String`
- `account_name`: `String`

##### AutoPilotTaskGroupingsResponse

**Fields:**

- `rows`: `[AutoPilotTaskGroupingsRowResponse]`

##### AutoPilotTaskGroupingsRowResponse

**Fields:**

- `count`: `Int`

##### AutoPilotTaskGroupingsWhereRequest

**Fields:**

- `_and`: `[AutoPilotTaskGroupingsWhereRequest]`
- `_or`: `[AutoPilotTaskGroupingsWhereRequest]`
- `_not`: `AutoPilotTaskGroupingsWhereRequest`
- `account_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `scheduled_time`: `QueryWhereDatetimeRequest`
- `auto_pilot_id`: `QueryWhereStringRequest`
- `auto_pilot_category`: `QueryWhereStringRequest`
- `auto_pilot_account_id`: `QueryWhereStringRequest`

##### AutoPilotTaskResponse

**Fields:**

- `rows`: `[AutoPilotTaskRowResponse]`

##### AutoPilotTaskRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `auto_pilot_id`: `String`
- `task_id`: `String`
- `name`: `String`
- `command`: `String`
- `reason`: `String`
- `status`: `String`
- `meta`: `Json`
- `resource_filter`: `Json`
- `recommendation_id`: `String`
- `scheduled_time`: `Datetime`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `auto_pilot_category`: `String`
- `auto_pilot_account_id`: `String`
- `auto_pilot_resource_maps`: `Json`
- `attributes`: `Json`

##### AutoPilotTaskWhereRequest

**Fields:**

- `_and`: `[AutoPilotTaskWhereRequest]`
- `_or`: `[AutoPilotTaskWhereRequest]`
- `_not`: `AutoPilotTaskWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `auto_pilot_id`: `QueryWhereStringRequest`
- `task_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `scheduled_time`: `QueryWhereDatetimeRequest`
- `recommendation_id`: `QueryWhereStringRequest`

##### AutoPilotWhereRequest

**Fields:**

- `_and`: `[AutoPilotWhereRequest]`
- `_or`: `[AutoPilotWhereRequest]`
- `_not`: `AutoPilotWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`

##### AutopilotApprovalUpdateInput

**Fields:**

- `approval_id`: `uuid!`
- `account_id`: `uuid!`
- `status`: `String!`
- `reviewer_comments`: `String`

##### AutopilotApprovalUpdateOutput

**Fields:**

- `id`: `uuid!`

##### AvailableProvider

**Fields:**

- `provider`: `String!`
- `supported_operators`: `[String]`
- `supported_operator_descriptors`: `[OperatorDescriptor!]`

##### AwsEventBridgeOnboardInput

**Fields:**

- `account_id`: `String!`

##### AwsEventBridgeOnboardOutput

**Fields:**

- `url`: `String!`
- `external_id`: `String!`

##### AwsOnboardStatusInput

**Fields:**

- `external_id`: `String!`

##### AwsOnboardStatusOutput

**Fields:**

- `status`: `String!`
- `account_id`: `String`
- `account_name`: `String`
- `account_number`: `String`
- `is_reconnected`: `Boolean`

##### AwsOrgOnboardInput

**Fields:**

- `account_name`: `String!`
- `account_env`: `String`

##### AwsOrgOnboardOutput

**Fields:**

- `verification_token`: `String!`
- `stackset_template_url`: `String!`
- `stackset_launch_url`: `String!`
- `sns_topic_arn`: `String!`
- `stackset_parameters`: `jsonb`

##### AwsOrgRefreshTokenOutput

**Fields:**

- `verification_token`: `String!`

##### AwsOrgStatusOutput

**Fields:**

- `org_name`: `String!`
- `org_status`: `String!`
- `member_accounts`: `[OrgMemberStatus]`

##### AzureBulkOnboardAccountResultOutput

**Fields:**

- `subscription_id`: `String!`
- `account_id`: `String!`
- `status`: `String!`
- `error`: `String`

##### AzureBulkOnboardInput

**Fields:**

- `account_name`: `String!`
- `account_env`: `String`
- `tenant_id`: `String!`
- `client_id`: `String!`
- `client_secret`: `String!`
- `subscriptions`: `[AzureBulkOnboardSubInput!]!`

##### AzureBulkOnboardOutput

**Fields:**

- `accounts`: `[AzureBulkOnboardAccountResultOutput!]!`
- `parent_id`: `String!`

##### AzureBulkOnboardSubInput

**Fields:**

- `subscription_id`: `String!`
- `display_name`: `String`

##### AzureEventGridOnboardInput

**Fields:**

- `account_id`: `String!`

##### AzureEventGridOnboardOutput

**Fields:**

- `url`: `String!`
- `external_id`: `String!`
- `webhook_url`: `String!`

##### AzureListSubscriptionsInput

**Fields:**

- `tenant_id`: `String!`
- `client_id`: `String!`
- `client_secret`: `String!`

##### AzureListSubscriptionsOutput

**Fields:**

- `subscriptions`: `[AzureSubscriptionOutput!]!`

##### AzureSubscriptionOutput

**Fields:**

- `subscription_id`: `String!`
- `display_name`: `String!`
- `state`: `String!`

##### BulkOnboardAccountResultOutput

**Fields:**

- `project_id`: `String!`
- `account_id`: `String!`
- `status`: `String!`
- `error`: `String`

##### BulkOperationResponse

**Fields:**

- `job_id`: `String!`
- `events_to_update`: `Int!`
- `status`: `String!`

##### CheckGcpMonitoringPermissionInput

**Fields:**

- `account_id`: `String!`

##### CheckGcpMonitoringPermissionOutput

**Fields:**

- `has_permission`: `Boolean!`
- `error_detail`: `String`

##### ClassifyEventResponse

**Fields:**

- `success`: `Boolean!`
- `classification_id`: `String!`
- `rule_created`: `Boolean!`
- `rule_id`: `String`
- `rule_expires_at`: `timestamp`
- `bulk_operation`: `BulkOperationResponse`

##### ClassifyPreviewResponse

**Fields:**

- `current_event`: `CurrentEventPreview!`
- `existing_events`: `ExistingEventsPreview!`
- `future_events`: `FutureEventsPreview!`
- `rule_to_create`: `TriageRulePreview`

##### CloudAccount

**Fields:**

- `account_name`: `String`
- `account_number`: `String`
- `id`: `String`
- `created_at`: `Datetime`
- `created_by`: `String`
- `created_by_name`: `String`
- `status`: `String`
- `cloud_provider`: `String`
- `tenant_id`: `String`
- `cloud_account_attrs`: `jsonb`
- `account_type`: `String`
- `account_access`: `jsonb`
- `synced_at`: `String`
- `agent_synced_at`: `String`
- `sync_status`: `String`
- `agents`: `jsonb`
- `data`: `jsonb`

##### CloudAccountAggregation

**Fields:**

- `id`: `String`
- `account_name`: `String`
- `account_number`: `String`
- `status`: `String`
- `cloud_provider`: `String`
- `created_at`: `Datetime`
- `created_by`: `String`
- `tenant_id`: `String`
- `count`: `Int`

##### CloudAccountAggregationResponse

**Fields:**

- `rows`: `[CloudAccountAggregation!]!`

##### CloudAccountAttrsResponse

**Fields:**

- `rows`: `[CloudAccountAttrsRowResponse]`

##### CloudAccountAttrsRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `value`: `String`
- `cloud_account_id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `tenant_id`: `String`

##### CloudAccountAttrsWhereRequest

**Fields:**

- `_and`: `[CloudAccountAttrsWhereRequest]`
- `_or`: `[CloudAccountAttrsWhereRequest]`
- `_not`: `CloudAccountAttrsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `value`: `QueryWhereStringRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### CloudAccountResponse

**Fields:**

- `rows`: `[CloudAccount!]!`

##### CloudAccountWhereRequest

**Fields:**

- `_and`: `[CloudAccountWhereRequest]`
- `_or`: `[CloudAccountWhereRequest]`
- `_not`: `CloudAccountWhereRequest`
- `account_name`: `QueryWhereStringRequest`
- `account_number`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `created_by`: `QueryWhereStringRequest`
- `created_by_name`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `cloud_provider`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### CloudApplyCommandResponse

**Fields:**

- `success`: `Boolean!`
- `message`: `String`

##### CloudMetricGroupingsResponse

**Fields:**

- `rows`: `[CloudMetricGroupingsRowResponse]`

##### CloudMetricGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `region_name`: `String`
- `service_name`: `String`
- `resource_id`: `String`
- `metric`: `String`
- `timestamp`: `Datetime`
- `count_value`: `Int`
- `sum_value`: `Float`
- `avg_value`: `Float`
- `min_value`: `Float`
- `max_value`: `Float`

##### CloudMetricGroupingsWhereRequest

**Fields:**

- `_and`: `[CloudMetricGroupingsWhereRequest]`
- `_or`: `[CloudMetricGroupingsWhereRequest]`
- `_not`: `CloudMetricGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `region_name`: `QueryWhereStringRequest`
- `service_name`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`
- `metric`: `QueryWhereStringRequest`
- `timestamp`: `QueryWhereDatetimeRequest`

##### CloudMetricItem

**Fields:**

- `name`: `String`
- `statistics`: `String`
- `resource_id`: `String`
- `values`: `[Float]`
- `timestamps`: `[String]`
- `region`: `String`
- `service_name`: `String`

##### CloudMetricsQueryInput

**Fields:**

- `start_date`: `timestamp`
- `end_date`: `timestamp`
- `resource_ids`: `[String!]`
- `resource_type`: `String`
- `service_name`: `String!`
- `region`: `String!`
- `metric_names`: `[String!]`
- `step`: `bigint`
- `statistics`: `[String!]`
- `metric_namespace`: `String`
- `query`: `String`

##### CloudMetricsRequestInput

**Fields:**

- `account_id`: `String!`
- `query`: `CloudMetricsQueryInput!`

##### CloudMetricsResponse

**Fields:**

- `items`: `[CloudMetricItem]`
- `start_date`: `String`
- `end_date`: `String`
- `step`: `bigint`

##### CloudNotificationTarget

**Fields:**

- `id`: `String!`
- `name`: `String!`
- `type`: `String!`

##### CloudNotificationTargetsResponse

**Fields:**

- `targets`: `[CloudNotificationTarget]`

##### CloudResourceAttributesResponse

**Fields:**

- `rows`: `[CloudResourceAttributesRowResponse]`

##### CloudResourceAttributesRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `value`: `String`
- `labels`: `Json`
- `resource_id`: `String`
- `account_id`: `String`
- `namespace`: `String`
- `created_at`: `Datetime`
- `last_seen_at`: `Datetime`
- `resource_uuid`: `String`
- `resource_arn`: `String`
- `resource_name`: `String`
- `resource_type`: `String`
- `resource_meta`: `Json`
- `resource_status`: `String`
- `resource_created_at`: `Datetime`
- `resource_updated_at`: `Datetime`

##### CloudResourceAttributesWhereRequest

**Fields:**

- `_and`: `[CloudResourceAttributesWhereRequest]`
- `_or`: `[CloudResourceAttributesWhereRequest]`
- `_not`: `CloudResourceAttributesWhereRequest`
- `resource_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `value`: `QueryWhereStringRequest`

##### CloudResourceDetailsResponse

**Fields:**

- `rows`: `[CloudResourceDetailsRowResponse]`

##### CloudResourceDetailsRowResponse

**Fields:**

- `id`: `Int`
- `cloud_provider`: `String`
- `service_name`: `String`
- `service_type`: `String`
- `resource_type`: `String`
- `resource_region`: `String`
- `resource_cost`: `Float`
- `resource_capacity`: `Float`
- `database_engine`: `String`
- `deployment_option`: `String`

##### CloudResourceDetailsWhereRequest

**Fields:**

- `_and`: `[CloudResourceDetailsWhereRequest]`
- `_or`: `[CloudResourceDetailsWhereRequest]`
- `_not`: `CloudResourceDetailsWhereRequest`
- `cloud_provider`: `QueryWhereStringRequest`
- `service_name`: `QueryWhereStringRequest`
- `service_type`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`
- `resource_region`: `QueryWhereStringRequest`
- `resource_cost`: `QueryWhereFloatRequest`
- `resource_capacity`: `QueryWhereFloatRequest`

##### CloudResourceGroupingsResponse

**Fields:**

- `rows`: `[CloudResourceGroupingsRowResponse]`

##### CloudResourceGroupingsRowResponse

**Fields:**

- `account_id`: `String`
- `service_name`: `String`
- `type`: `String`
- `status`: `String`
- `region`: `String`
- `count`: `Int`

##### CloudResourceGroupingsWhereRequest

**Fields:**

- `_and`: `[CloudResourceGroupingsWhereRequest]`
- `_or`: `[CloudResourceGroupingsWhereRequest]`
- `_not`: `CloudResourceGroupingsWhereRequest`
- `account_id`: `QueryWhereStringRequest`
- `service_name`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `region`: `QueryWhereStringRequest`
- `meta`: `QueryWhereStringRequest`
- `tags`: `QueryWhereStringRequest`

##### CloudResourceMetricsResponse

**Fields:**

- `rows`: `[CloudResourceMetricsRowResponse]`

##### CloudResourceMetricsRowResponse

**Fields:**

- `id`: `String`
- `metric`: `String`
- `value`: `Float`
- `timestamp`: `Datetime`
- `cloud_resource_id`: `String`
- `cloud_account_id`: `String`
- `resource_name`: `String`
- `resource_id`: `String`
- `service_name`: `String`

##### CloudResourceMetricsWhereRequest

**Fields:**

- `_and`: `[CloudResourceMetricsWhereRequest]`
- `_or`: `[CloudResourceMetricsWhereRequest]`
- `_not`: `CloudResourceMetricsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `metric`: `QueryWhereStringRequest`
- `timestamp`: `QueryWhereDatetimeRequest`
- `cloud_resource_id`: `QueryWhereStringRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `resource_name`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `service_name`: `QueryWhereStringRequest`

##### CloudResourcesListResponse

**Fields:**

- `rows`: `[CloudResourcesListRowResponse]`

##### CloudResourcesListRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `resourse_id`: `String`
- `type`: `String`
- `status`: `String`
- `meta`: `Json`
- `tags`: `Json`
- `account`: `String`
- `tenant`: `String`
- `namespace`: `String`
- `service_name`: `String`
- `region`: `String`
- `created_at`: `Datetime`
- `resourse_created_on`: `Datetime`
- `spend_amount`: `Float`
- `latest_metric`: `String`
- `latest_metric_value`: `Float`
- `latest_metric_timestamp`: `Datetime`
- `total_count`: `Int`

##### CloudResourcesListWhereRequest

**Fields:**

- `_and`: `[CloudResourcesListWhereRequest]`
- `_or`: `[CloudResourcesListWhereRequest]`
- `_not`: `CloudResourcesListWhereRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `resourse_id`: `QueryWhereStringRequest`
- `account`: `QueryWhereStringRequest`
- `tenant`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `service_name`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `region`: `QueryWhereStringRequest`
- `meta`: `QueryWhereStringRequest`
- `tags`: `QueryWhereStringRequest`
- `metric`: `QueryWhereStringRequest`

##### CloudResourcesResponse

**Fields:**

- `rows`: `[CloudResourcesRowResponse]`

##### CloudResourcesRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `arn`: `String`
- `type`: `String`
- `status`: `String`
- `is_active`: `Boolean`
- `meta`: `Json`
- `tags`: `Json`
- `account`: `String`
- `namespace`: `String`
- `service_name`: `String`
- `region`: `String`
- `cloud_provider`: `String`
- `external_resource_id`: `String`
- `resource_id`: `String`
- `first_seen`: `Datetime`
- `last_seen`: `Datetime`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `resource_created_on`: `Datetime`
- `account_name`: `String`

##### CloudResourcesWhereRequest

**Fields:**

- `_and`: `[CloudResourcesWhereRequest]`
- `_or`: `[CloudResourcesWhereRequest]`
- `_not`: `CloudResourcesWhereRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `account`: `QueryWhereStringRequest`
- `tenant`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `service_name`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `status`: `QueryWhereStringRequest`
- `region`: `QueryWhereStringRequest`
- `meta`: `QueryWhereStringRequest`
- `tags`: `QueryWhereStringRequest`

##### CloudServiceSyncResponse

**Fields:**

- `success`: `Boolean!`
- `message`: `String`

##### CloudUpdateCloudformationPermissionsInput

**Fields:**

- `account_id`: `String!`

##### CloudUpdateCloudformationPermissionsOutput

**Fields:**

- `url`: `String`
- `stack_name`: `String`
- `template_version`: `String`
- `latest_version`: `String`
- `needs_update`: `Boolean`

##### CloudVmPackageGroupingsResponse

**Fields:**

- `rows`: `[CloudVmPackageGroupingsRowResponse]`

##### CloudVmPackageGroupingsRowResponse

**Fields:**

- `account_id`: `String`
- `cloud_resource_id`: `String`
- `os_family`: `String`
- `os_version`: `String`
- `pkg_type`: `String`
- `count`: `Int`
- `max_last_seen_at`: `Datetime`

##### CloudVmPackageGroupingsWhereRequest

**Fields:**

- `_and`: `[CloudVmPackageGroupingsWhereRequest]`
- `_or`: `[CloudVmPackageGroupingsWhereRequest]`
- `_not`: `CloudVmPackageGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `cloud_resource_id`: `QueryWhereStringRequest`
- `os_family`: `QueryWhereStringRequest`
- `os_version`: `QueryWhereStringRequest`
- `pkg_type`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `last_seen_at`: `QueryWhereDatetimeRequest`

##### CloudVmPackagesResponse

**Fields:**

- `rows`: `[CloudVmPackagesRowResponse]`

##### CloudVmPackagesRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `cloud_resource_id`: `String`
- `os_family`: `String`
- `os_version`: `String`
- `pkg_type`: `String`
- `name`: `String`
- `version`: `String`
- `arch`: `String`
- `epoch`: `Int`
- `source_name`: `String`
- `source_version`: `String`
- `is_active`: `Boolean`
- `first_seen_at`: `Datetime`
- `last_seen_at`: `Datetime`
- `updated_at`: `Datetime`

##### CloudVmPackagesWhereRequest

**Fields:**

- `_and`: `[CloudVmPackagesWhereRequest]`
- `_or`: `[CloudVmPackagesWhereRequest]`
- `_not`: `CloudVmPackagesWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `cloud_resource_id`: `QueryWhereStringRequest`
- `os_family`: `QueryWhereStringRequest`
- `os_version`: `QueryWhereStringRequest`
- `pkg_type`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `version`: `QueryWhereStringRequest`
- `arch`: `QueryWhereStringRequest`
- `source_name`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `last_seen_at`: `QueryWhereDatetimeRequest`

##### CommandResult

**Fields:**

- `command`: `String`
- `status`: `String`
- `output`: `String`
- `error`: `String`

##### Comment

**Fields:**

- `author`: `String!`
- `comment`: `String!`
- `created_at`: `String!`
- `updated_at`: `String`

##### Config

**Fields:**

- `id`: `String!`
- `key`: `String!`
- `value`: `String!`
- `type`: `String!`
- `labels`: `jsonb`
- `metadata`: `jsonb`
- `tenant_id`: `String`
- `account_id`: `String`
- `created_at`: `timestamp`
- `updated_at`: `timestamp`
- `created_by`: `String`
- `updated_by`: `String`

##### ConfigDeleteInput

**Fields:**

- `account_id`: `String` - Optional. Omit/empty to delete the tenant-level row.
- `key`: `String!`

##### ConfigDeleteOutput

**Fields:**

- `message`: `String!`

##### ConfigListRequest

**Fields:**

- `account_id`: `String` - Optional. When omitted (or empty), only tenant-level configs are returned.
When provided, tenant-level + that-account-level configs are merged with
account-level rows winning on key collision (the effective view a workflow
running under that account would see).
- `labels`: `jsonb`
- `decrypt`: `Boolean`

##### ConfigListResponse

**Fields:**

- `data`: `[Config]!`

##### ConfigSaveInput

**Fields:**

- `account_id`: `String` - Optional. When omitted (or empty), the config is saved at the tenant level
and is visible to every account in the tenant. When provided, the config is
account-scoped and overrides any tenant-level config with the same key for
that account at workflow execution time.
- `config`: `ConfigSaveInputObject!`

##### ConfigSaveInputObject

**Fields:**

- `id`: `String`
- `key`: `String`
- `value`: `String`
- `type`: `String`
- `labels`: `jsonb`
- `metadata`: `jsonb`
- `tenant_id`: `String`
- `account_id`: `String`

##### ConfigSaveOutput

**Fields:**

- `id`: `String!`

##### CreateAgentExtensionResponse

**Fields:**

- `data`: `jsonb`
- `err`: `jsonb`

##### CreateAgentRagInput

**Fields:**

- `account_id`: `String!`
- `agent`: `String!`
- `data`: `String!`
- `format`: `String`
- `file_name`: `String`

##### CreateAgentRagOutput

**Fields:**

- `data`: `jsonb`

##### CreateAgentRequest

**Fields:**

- `account_id`: `String!`
- `agent`: `AgentRequest!`
- `override_agent`: `Boolean`

##### CreateAgentResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### CreateApprovalInput

**Fields:**

- `account_id`: `uuid!`
- `minimum_approval`: `Int`
- `reviewers`: `[uuid]`
- `reviewees`: `[uuid]`

##### CreateApprovalOutput

**Fields:**

- `id`: `uuid`

##### CreateExtensionAgentDetails

**Fields:**

- `agent_name`: `String!`
- `prompt`: `String`
- `tools`: `[String]`

##### CreateExtensionAgentRequest

**Fields:**

- `account_id`: `String!`
- `agent`: `CreateExtensionAgentDetails`

##### CreateFunctionInput

**Fields:**

- `name`: `String!`
- `description`: `String!`
- `prompt`: `String!`
- `variables`: `[String]`
- `variable_defaults`: `jsonb`
- `status`: `String`
- `version`: `Int`

##### CreateFunctionResponse

**Fields:**

- `success`: `Boolean!`
- `message`: `String!`
- `function`: `LLMFunctionCreateResponse`

##### CreateGCRequest

**Fields:**

- `account_id`: `String!`
- `global_context`: `GlobalContextInput!`

##### CreateGCResponse

**Fields:**

- `data`: `GlobalContextOutput`
- `errors`: `[Error]`

##### CreateIntegrationConfigRequest

**Fields:**

- `integration_id`: `String`
- `account_ids`: `[String]!`
- `integration_name`: `String!`
- `integration_config_name`: `String!`
- `integration_config_values`: `[IntegrationConfigValueInput]`
- `tags`: `jsonb`
- `skip_validation`: `Boolean`
- `source`: `String`

##### CreateIntegrationConfigResponse

**Fields:**

- `id`: `String!`
- `name`: `String!`
- `configs`: `[IntegrationConfigValueResponse]`
- `tags`: `jsonb`
- `schema`: `jsonb`

##### CreateKBRequest

**Fields:**

- `account_id`: `String!`
- `knowledgebase`: `KnowledgebaseInput!`

##### CreateKBResponse

**Fields:**

- `data`: `KnowledgebaseOutput`
- `errors`: `[Error]`

##### CreateToolRequest

**Fields:**

- `account_id`: `String!`
- `tool`: `ToolRequest!`

##### CreateToolResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### CreateTriageRuleResponse

**Fields:**

- `success`: `Boolean!`
- `rule`: `TriageRule`
- `bulk_operation`: `BulkOperationResponse`
- `error`: `String`

##### CurrentEventPreview

**Fields:**

- `id`: `String!`
- `title`: `String!`
- `new_status`: `String!`

##### Dashboard

**Fields:**

- `id`: `String!`
- `tenant_id`: `String`
- `slug`: `String`
- `title`: `String`
- `description`: `String`
- `definition`: `Json`
- `schema_version`: `Int`
- `tags`: `Json`
- `status`: `String`
- `is_builtin`: `Boolean`
- `created_by`: `String`
- `updated_by`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `version`: `Int`

##### DashboardBinding

**Fields:**

- `id`: `String`
- `dashboard_id`: `String`
- `scope_type`: `String`
- `match_kind`: `String`
- `match_value`: `Json`
- `priority`: `Int`

##### DashboardBindingInput

**Fields:**

- `scope_type`: `String!`
- `match_kind`: `String!`
- `match_value`: `Json`
- `priority`: `Int`

##### DashboardDeleteRequest

**Fields:**

- `id`: `String!`

##### DashboardDeleteResponse

**Fields:**

- `id`: `String`
- `deleted`: `Boolean`

##### DashboardGetRequest

**Fields:**

- `id`: `String!`

##### DashboardGetResponse

**Fields:**

- `dashboard`: `Dashboard`
- `bindings`: `[DashboardBinding]`

##### DashboardListRequest

**Fields:**

- `search`: `String`
- `limit`: `Int`
- `offset`: `Int`

##### DashboardResolveRequest

**Fields:**

- `account_id`: `String!`
- `scope_type`: `String!`
- `name`: `String`
- `namespace`: `String`
- `app_type`: `String`

##### DashboardSaveRequest

**Fields:**

- `id`: `String`
- `title`: `String!`
- `description`: `String`
- `definition`: `Json`
- `tags`: `[String]`
- `status`: `String`
- `message`: `String`
- `bindings`: `[DashboardBindingInput]`

##### DashboardVersion

**Fields:**

- `version`: `Int`
- `message`: `String`
- `created_by`: `String`
- `created_at`: `Datetime`

##### Datetime

##### DefaultProviderRequest

**Fields:**

- `account_id`: `String!`
- `provider_type`: `String!`
- `provider_source`: `String`
- `provider`: `String`

##### DefaultProviderResponse

**Fields:**

- `provider`: `String!`
- `integration_source`: `String`
- `default_index`: `String`
- `capabilities`: `ProviderCapabilities`
- `available_providers`: `[AvailableProvider!]`

##### DeleteAgentRequest

**Fields:**

- `account_id`: `String!`
- `name`: `String!`

##### DeleteAgentResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### DeleteByPkRequest

**Fields:**

- `id`: `String!`

##### DeleteByPkResponse

**Fields:**

- `id`: `String!`

##### DeleteGCRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`

##### DeleteGCResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### DeleteIntegrationConfigRequest

**Fields:**

- `integration_name`: `String!`
- `integration_config_name`: `String!`
- `integration_config_status`: `String`
- `source`: `String`

##### DeleteIntegrationConfigResponse

**Fields:**

- `status`: `String!`

##### DeleteKBRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`

##### DeleteKBResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### DeleteLLMConversationRequest

**Fields:**

- `conversation_id`: `String!`

##### DeleteLLMConversationResponse

**Fields:**

- `data`: `SaveResponse!`

##### DeleteLlmConversationByIdOutput

**Fields:**

- `data`: `SaveResponse`

##### DeleteLlmConversationByIdRequest

**Fields:**

- `conversation_id`: `uuid!`

##### DeleteLlmConversationByIdResponse

**Fields:**

- `success`: `Boolean!`

##### DeleteResponse

**Fields:**

- `success`: `Boolean!`

##### DeleteToolRequest

**Fields:**

- `account_id`: `String!`
- `name`: `String!`

##### DeleteToolResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### DeleteTriageRuleResponse

**Fields:**

- `success`: `Boolean!`
- `error`: `String`

##### DisableAlertRule

**Fields:**

- `accountId`: `String!`
- `alert`: `String!`
- `id`: `String!`
- `enable`: `Boolean!`
- `namespace`: `String!`
- `group`: `String!`

##### DiscoveryTargetRequest

**Fields:**

- `integration_id`: `String!`
- `cloud_account_id`: `String!`

##### DiscoveryTargetResponse

**Fields:**

- `status`: `String!`

##### DuplicateSuggestion

**Fields:**

- `event_id`: `String!`
- `title`: `String!`
- `starts_at`: `timestamp!`
- `occurrence_number`: `Int!`
- `is_first`: `Boolean!`

##### DwQueriesResponse

**Fields:**

- `rows`: `[DwQueriesRowResponse]`

##### DwQueriesRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `database_name`: `String`
- `db_username`: `String`
- `query_type`: `String`
- `query_exec_duration_micro`: `Int`
- `bill_total_duration_micro`: `Int`
- `bill_interval_from`: `Datetime`
- `bill_interval_to`: `Datetime`
- `created_at`: `Datetime`
- `bill`: `Float`
- `rpu`: `Float`
- `query_text`: `String`
- `query_planning_duration_micro`: `Int`
- `query_error_message`: `String`
- `query_returned_rows`: `Int`
- `query_returned_bytes`: `Int`
- `query_usage_limit`: `String`
- `query_transaction_id`: `String`
- `query_session_id`: `String`
- `query_status`: `String`
- `query_started_at`: `Datetime`
- `query_ended_at`: `Datetime`
- `query_id`: `String`
- `query_queue_duration_micro`: `Int`
- `query_normalized`: `String`
- `query_normalized_md5`: `String`
- `queue_provision_time`: `Float`
- `queue_repair_time`: `Float`
- `queue_overload_time`: `Float`
- `partitions_scanned`: `Float`
- `bytes_scanned`: `Float`
- `bytes_spilled_locally`: `Float`
- `bytes_spilled_remotely`: `Float`
- `transaction_block_time`: `Float`
- `query_remote_ip`: `String`
- `query_md5`: `String`
- `warehouse_name`: `String`
- `query_result_cache_hit`: `Boolean`
- `tags`: `Json`

##### DwQueriesWhereRequest

**Fields:**

- `_and`: `[DwQueriesWhereRequest]`
- `_or`: `[DwQueriesWhereRequest]`
- `_not`: `DwQueriesWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `database_name`: `QueryWhereStringRequest`
- `db_username`: `QueryWhereStringRequest`
- `query_type`: `QueryWhereStringRequest`
- `query_exec_duration_micro`: `QueryWhereIntRequest`
- `bill_total_duration_micro`: `QueryWhereIntRequest`
- `bill_interval_from`: `QueryWhereDatetimeRequest`
- `bill_interval_to`: `QueryWhereDatetimeRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `bill`: `QueryWhereFloatRequest`
- `rpu`: `QueryWhereFloatRequest`
- `query_text`: `QueryWhereStringRequest`
- `query_planning_duration_micro`: `QueryWhereIntRequest`
- `query_error_message`: `QueryWhereStringRequest`
- `query_returned_rows`: `QueryWhereIntRequest`
- `query_returned_bytes`: `QueryWhereIntRequest`
- `query_usage_limit`: `QueryWhereStringRequest`
- `query_transaction_id`: `QueryWhereStringRequest`
- `query_session_id`: `QueryWhereStringRequest`
- `query_status`: `QueryWhereStringRequest`
- `query_started_at`: `QueryWhereDatetimeRequest`
- `query_ended_at`: `QueryWhereDatetimeRequest`
- `query_id`: `QueryWhereStringRequest`
- `query_queue_duration_micro`: `QueryWhereIntRequest`
- `query_normalized`: `QueryWhereStringRequest`
- `query_normalized_md5`: `QueryWhereStringRequest`
- `queue_provision_time`: `QueryWhereFloatRequest`
- `queue_repair_time`: `QueryWhereFloatRequest`
- `queue_overload_time`: `QueryWhereFloatRequest`
- `partitions_scanned`: `QueryWhereFloatRequest`
- `bytes_scanned`: `QueryWhereFloatRequest`
- `bytes_spilled_locally`: `QueryWhereFloatRequest`
- `bytes_spilled_remotely`: `QueryWhereFloatRequest`
- `transaction_block_time`: `QueryWhereFloatRequest`
- `query_remote_ip`: `QueryWhereStringRequest`
- `query_md5`: `QueryWhereStringRequest`
- `warehouse_name`: `QueryWhereStringRequest`

##### DwQueryGroupingWhereRequest

**Fields:**

- `_and`: `[DwQueryGroupingWhereRequest]`
- `_or`: `[DwQueryGroupingWhereRequest]`
- `_not`: `DwQueryGroupingWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `database_name`: `QueryWhereStringRequest`
- `db_username`: `QueryWhereStringRequest`
- `query_remote_ip`: `QueryWhereStringRequest`
- `query_type`: `QueryWhereStringRequest`
- `query_status`: `QueryWhereStringRequest`
- `warehouse_name`: `QueryWhereStringRequest`
- `query_normalized`: `QueryWhereStringRequest`
- `query_normalized_md5`: `QueryWhereStringRequest`
- `query_text`: `QueryWhereStringRequest`
- `query_started_at`: `QueryWhereDatetimeRequest`
- `query_exec_duration_micro`: `QueryWhereFloatRequest`
- `bill`: `QueryWhereFloatRequest`
- `bytes_spilled_locally`: `QueryWhereFloatRequest`
- `bytes_spilled_remotely`: `QueryWhereFloatRequest`
- `bytes_scanned`: `QueryWhereFloatRequest`
- `partitions_scanned`: `QueryWhereFloatRequest`
- `query_planning_duration_micro`: `QueryWhereFloatRequest`
- `query_queue_duration_micro`: `QueryWhereFloatRequest`
- `query_returned_bytes`: `QueryWhereFloatRequest`
- `query_returned_rows`: `QueryWhereFloatRequest`
- `rpu`: `QueryWhereFloatRequest`

##### DwQueryGroupingsResponse

**Fields:**

- `rows`: `[DwQueryGroupingsRowResponse]`

##### DwQueryGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `database_name`: `String`
- `db_username`: `String`
- `query_remote_ip`: `String`
- `query_type`: `String`
- `query_status`: `String`
- `warehouse_name`: `String`
- `query_normalized`: `String`
- `query_normalized_md5`: `String`
- `query_text`: `String`
- `query_started_at`: `Datetime`
- `avg_query_exec_duration_micro`: `Float`
- `max_query_exec_duration_micro`: `Float`
- `sum_query_exec_duration_micro`: `Float`
- `avg_bill`: `Float`
- `max_bill`: `Float`
- `sum_bill`: `Float`
- `avg_bytes_spilled_locally`: `Float`
- `max_bytes_spilled_locally`: `Float`
- `sum_bytes_spilled_locally`: `Float`
- `avg_bytes_spilled_remotely`: `Float`
- `max_bytes_spilled_remotely`: `Float`
- `sum_bytes_spilled_remotely`: `Float`
- `avg_bytes_scanned`: `Float`
- `max_bytes_scanned`: `Float`
- `sum_bytes_scanned`: `Float`
- `avg_partitions_scanned`: `Float`
- `max_partitions_scanned`: `Float`
- `sum_partitions_scanned`: `Float`
- `avg_query_planning_duration_micro`: `Float`
- `max_query_planning_duration_micro`: `Float`
- `sum_query_planning_duration_micro`: `Float`
- `avg_query_queue_duration_micro`: `Float`
- `max_query_queue_duration_micro`: `Float`
- `sum_query_queue_duration_micro`: `Float`
- `avg_query_returned_bytes`: `Float`
- `max_query_returned_bytes`: `Float`
- `sum_query_returned_bytes`: `Float`
- `avg_query_returned_rows`: `Float`
- `max_query_returned_rows`: `Float`
- `sum_query_returned_rows`: `Float`
- `avg_rpu`: `Float`
- `max_rpu`: `Float`
- `sum_rpu`: `Float`
- `max_query_started_at`: `Datetime`
- `min_query_started_at`: `Datetime`
- `query_count`: `Int`
- `db_username_list`: `[String]`
- `query_remote_ip_list`: `[String]`
- `database_name_list`: `[String]`

##### Error

**Fields:**

- `message`: `String!`
- `code`: `String`

##### EventBackfillTriageOutput

**Fields:**

- `status`: `String!`
- `total_events`: `Int!`
- `duplicates_detected`: `Int!`
- `correlations_created`: `Int!`
- `errors`: `Int!`
- `duration_seconds`: `Float!`

##### EventClassification

**Fields:**

- `id`: `String!`
- `event_id`: `String!`
- `cloud_account_id`: `String!`
- `tenant_id`: `String!`
- `classification`: `String!`
- `original_priority`: `String`
- `corrected_priority`: `String`
- `priority_direction`: `String`
- `reason_code`: `String!`
- `reason_text`: `String`
- `apply_scope`: `String!`
- `apply_until`: `timestamp`
- `linked_event_id`: `String`
- `classified_by`: `String!`
- `classified_at`: `timestamp!`
- `original_score`: `Int`
- `feature_snapshot`: `String`

##### EventDeduplicateCorrelationsOutput

**Fields:**

- `status`: `String!`
- `cloud_account_id`: `String!`

##### EventFilterResult

**Fields:**

- `filter_type`: `String!`
- `values`: `[EventFilterValueItem!]!`
- `total`: `Int!`

##### EventFilterValueItem

**Fields:**

- `value`: `String!`
- `count`: `Int`

##### EventFilterValuesRequest

**Fields:**

- `account_id`: `String`
- `filter_types`: `[String!]!`
- `label_key`: `String`
- `start_time`: `timestamptz`
- `end_time`: `timestamptz`
- `limit`: `Int`

##### EventFilterValuesResponse

**Fields:**

- `filters`: `[EventFilterResult!]!`
- `account_id`: `String`

##### EventGetCorrelationsOutput

**Fields:**

- `event_id`: `String!`
- `correlated_events`: `[TriageCorrelatedEvent]`
- `correlation_count`: `Int!`

##### EventGetDuplicateSuggestionsOutput

**Fields:**

- `suggestions`: `[DuplicateSuggestion]!`

##### EventGetDuplicatesOutput

**Fields:**

- `event_id`: `String!`
- `is_duplicate`: `Boolean!`
- `duplicate_chain`: `[TriageDuplicateEvent]`
- `total_occurrences`: `Int!`
- `first_event_id`: `String`
- `occurrence_number`: `Int`

##### EventGetImpactOutput

**Fields:**

- `event_id`: `String`
- `resolved`: `Boolean`
- `seed`: `ImpactSeedNode`
- `impacted`: `[ImpactedServiceNode]`
- `depends_on`: `[ImpactedServiceNode]`
- `infrastructure_impacted`: `[ImpactedServiceNode]`
- `correlated_count`: `Int`
- `dependent_count`: `Int`
- `production_dependents`: `Int`
- `infrastructure_count`: `Int`
- `coverage_confidence`: `String`
- `truncated`: `Boolean`
- `assembly`: `IncidentAssembly`

##### EventGetTriageOutput

**Fields:**

- `event_id`: `String!`
- `is_duplicate`: `Boolean!`
- `duplicate_info`: `TriageDuplicateInfo`
- `correlated_events`: `[TriageCorrelatedEvent]`
- `historical_stats`: `TriageHistoricalStats`
- `hourly_trend`: `[TriageHourlyBucket]`
- `correlation_count`: `Int!`

##### EventGetTriageRuleEventsOutput

**Fields:**

- `events`: `[TriageRuleEventOutput]`
- `total`: `Int`
- `limit`: `Int`
- `offset`: `Int`

##### EventGetTriageRulesOutput

**Fields:**

- `rules`: `[TriageRule]!`

##### EventGroupingsResponse

**Fields:**

- `rows`: `[EventGroupingsRowResponse]`

##### EventGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `cluster`: `String`
- `status`: `String`
- `service_key`: `String`
- `subject_node`: `String`
- `subject_namespace`: `String`
- `subject_name`: `String`
- `subject_owner`: `String`
- `subject_type`: `String`
- `priority`: `String`
- `category`: `String`
- `finding_type`: `String`
- `aggregation_key`: `String`
- `source`: `String`
- `principal`: `String`
- `title`: `String`
- `created_at`: `Datetime`
- `max_created_at`: `Datetime`
- `min_created_at`: `Datetime`
- `event_count`: `Float`
- `count_subject_name`: `Int`
- `count_aggregation_key`: `Int`
- `distinct_status`: `Json`
- `distinct_priority`: `Json`
- `distinct_aggregation_key`: `Json`
- `distinct_subject_name`: `Json`
- `distinct_subject_namespace`: `Json`
- `count_priority_high`: `Int`
- `count_priority_medium`: `Int`
- `count_priority_low`: `Int`
- `count_priority_debug`: `Int`
- `count_priority_info`: `Int`
- `count_application_issues`: `Int`
- `count_node_issues`: `Int`
- `count_pod_issues`: `Int`
- `labels`: `String`
- `fingerprint`: `String`
- `latest_event_id`: `String`
- `computed_score`: `Int`
- `computed_priority`: `String`
- `score_factors`: `Json`
- `score_confidence`: `Float`
- `max_computed_score`: `Int`
- `count_priority_p0`: `Int`
- `count_priority_p1`: `Int`
- `count_priority_p2`: `Int`
- `count_priority_p3`: `Int`
- `latest_computed_score`: `Int`
- `latest_score_factors`: `Json`
- `latest_score_confidence`: `Float`
- `latest_computed_priority`: `String`
- `latest_nb_status`: `String`
- `latest_title`: `String`
- `latest_snoozed_until`: `Datetime`
- `nb_status`: `String`
- `nb_status_changed_at`: `Datetime`
- `nb_status_changed_by`: `String`
- `count_new_issues`: `Int`
- `count_recurring_issues`: `Int`
- `fingerprint_first_seen_at`: `Datetime`
- `fingerprint_event_count`: `Int`
- `is_new_issue`: `Boolean`

##### EventGroupingsWhereRequest

**Fields:**

- `_and`: `[EventGroupingsWhereRequest]`
- `_or`: `[EventGroupingsWhereRequest]`
- `_not`: `EventGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `cluster`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `service_key`: `QueryWhereStringRequest`
- `subject_node`: `QueryWhereStringRequest`
- `subject_namespace`: `QueryWhereStringRequest`
- `subject_name`: `QueryWhereStringRequest`
- `subject_owner`: `QueryWhereStringRequest`
- `subject_type`: `QueryWhereStringRequest`
- `priority`: `QueryWhereStringRequest`
- `finding_id`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `finding_type`: `QueryWhereStringRequest`
- `aggregation_key`: `QueryWhereStringRequest`
- `principal`: `QueryWhereStringRequest`
- `title`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `starts_at`: `QueryWhereDatetimeRequest`
- `ends_at`: `QueryWhereDatetimeRequest`
- `labels`: `QueryWhereStringRequest`
- `fingerprint`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `computed_priority`: `QueryWhereStringRequest`
- `nb_status`: `QueryWhereStringRequest`
- `is_new_issue`: `QueryWhereBooleanRequest`
- `fingerprint_first_seen_at`: `QueryWhereDatetimeRequest`

##### EventPreviewTriageRuleOutput

**Fields:**

- `matching_events_count`: `Int!`
- `sample_events`: `[RulePreviewSampleEvent]!`
- `new_status`: `String!`

##### EventResolutionGroupingsResponse

**Fields:**

- `rows`: `[EventResolutionGroupingsRowResponse]`

##### EventResolutionGroupingsRowResponse

**Fields:**

- `count`: `Int`

##### EventResolutionGroupingsWhereRequest

**Fields:**

- `_and`: `[EventResolutionGroupingsWhereRequest]`
- `_or`: `[EventResolutionGroupingsWhereRequest]`
- `_not`: `EventResolutionGroupingsWhereRequest`
- `event_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `resolver_type`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `event_cloud_account_id`: `QueryWhereStringRequest`

##### EventResolutionResponse

**Fields:**

- `rows`: `[EventResolutionRowResponse]`

##### EventResolutionRowResponse

**Fields:**

- `id`: `String`
- `event_id`: `String`
- `type`: `String`
- `type_reference_id`: `String`
- `status`: `String`
- `status_message`: `String`
- `resolver_id`: `String`
- `resolver_type`: `String`
- `data`: `Json`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `tenant_id`: `String`
- `account_id`: `String`
- `resolver_display_name`: `String`
- `event_subject_name`: `String`
- `event_subject_namespace`: `String`
- `event_cloud_account_id`: `String`
- `event_priority`: `String`
- `event_category`: `String`

##### EventResolutionWhereRequest

**Fields:**

- `_and`: `[EventResolutionWhereRequest]`
- `_or`: `[EventResolutionWhereRequest]`
- `_not`: `EventResolutionWhereRequest`
- `id`: `QueryWhereStringRequest`
- `event_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `resolver_type`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `event_cloud_account_id`: `QueryWhereStringRequest`

##### EventRulesGroupingsResponse

**Fields:**

- `rows`: `[EventRulesGroupingsRowResponse]`

##### EventRulesGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `category`: `String`
- `source`: `String`
- `severity`: `String`
- `enabled`: `Boolean`
- `alert`: `String`
- `count`: `Int`

##### EventRulesGroupingsWhereRequest

**Fields:**

- `_and`: `[EventRulesGroupingsWhereRequest]`
- `_or`: `[EventRulesGroupingsWhereRequest]`
- `_not`: `EventRulesGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `enabled`: `QueryWhereBooleanRequest`
- `alert`: `QueryWhereStringRequest`

##### EventRulesResponse

**Fields:**

- `rows`: `[EventRulesRowResponse]`

##### EventRulesRowResponse

**Fields:**

- `id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `account_id`: `String`
- `tenant_id`: `String`
- `alert`: `String`
- `annotations`: `jsonb`
- `expr`: `String`
- `duration`: `String`
- `labels`: `jsonb`
- `source`: `String`
- `category`: `String`
- `severity`: `String`
- `enabled`: `Boolean`
- `created_by`: `String`
- `updated_by`: `String`
- `is_editable`: `Boolean`
- `group`: `String`
- `name`: `String`
- `namespace`: `String`
- `alert_type`: `String`
- `metric_provider`: `String`
- `metric_provider_source`: `String`
- `provider_config`: `jsonb`
- `external_rule_id`: `String`

##### EventRulesWhereRequest

**Fields:**

- `_and`: `[EventRulesWhereRequest]`
- `_or`: `[EventRulesWhereRequest]`
- `_not`: `EventRulesWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `alert`: `QueryWhereStringRequest`
- `expr`: `QueryWhereStringRequest`
- `duration`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `enabled`: `QueryWhereBooleanRequest`
- `created_by`: `QueryWhereStringRequest`
- `updated_by`: `QueryWhereStringRequest`
- `is_editable`: `QueryWhereBooleanRequest`
- `name`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### EventTimeline

**Fields:**

- `timestamp`: `timestamp`
- `ref_type`: `String`
- `ref_id`: `String`
- `action`: `String`
- `summary`: `String`
- `metadata`: `jsonb`

##### EventTimelineInput

**Fields:**

- `event_id`: `String!`

##### EventTimelineOutput

**Fields:**

- `event_id`: `String!`
- `timeline`: `[EventTimeline]`

##### EventUpdateRequest

**Fields:**

- `event_id`: `String!`
- `urgency`: `String!`

##### EventsResponse

**Fields:**

- `rows`: `[EventsRowResponse]`

##### EventsRowResponse

**Fields:**

- `id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `finding_id`: `String`
- `title`: `String`
- `description`: `String`
- `source`: `String`
- `aggregation_key`: `String`
- `failure`: `String`
- `finding_type`: `String`
- `category`: `String`
- `priority`: `String`
- `subject_type`: `String`
- `subject_name`: `String`
- `subject_owner`: `String`
- `subject_namespace`: `String`
- `subject_node`: `String`
- `service_key`: `String`
- `cluster`: `String`
- `ends_at`: `Datetime`
- `starts_at`: `Datetime`
- `fingerprint`: `String`
- `evidences`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `status`: `String`
- `principal`: `String`
- `labels`: `String`
- `urgency`: `String`
- `computed_score`: `Int`
- `computed_priority`: `String`
- `score_factors`: `Json`
- `score_confidence`: `Float`
- `nb_status`: `String`
- `snoozed_until`: `Datetime`
- `nb_status_changed_at`: `Datetime`
- `nb_status_changed_by`: `String`
- `pr_url`: `String`
- `pr_title`: `String`
- `fingerprint_first_seen_at`: `Datetime`
- `is_new_issue`: `Boolean`

##### EventsWhereRequest

**Fields:**

- `_and`: `[EventsWhereRequest]`
- `_or`: `[EventsWhereRequest]`
- `_not`: `EventsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `finding_id`: `QueryWhereStringRequest`
- `title`: `QueryWhereStringRequest`
- `description`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `aggregation_key`: `QueryWhereStringRequest`
- `failure`: `QueryWhereStringRequest`
- `finding_type`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `priority`: `QueryWhereStringRequest`
- `subject_type`: `QueryWhereStringRequest`
- `subject_name`: `QueryWhereStringRequest`
- `subject_owner`: `QueryWhereStringRequest`
- `subject_namespace`: `QueryWhereStringRequest`
- `subject_node`: `QueryWhereStringRequest`
- `service_key`: `QueryWhereStringRequest`
- `cluster`: `QueryWhereStringRequest`
- `ends_at`: `QueryWhereDatetimeRequest`
- `starts_at`: `QueryWhereDatetimeRequest`
- `fingerprint`: `QueryWhereStringRequest`
- `evidences`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `principal`: `QueryWhereStringRequest`
- `labels`: `QueryWhereStringRequest`
- `nb_status`: `QueryWhereStringRequest`
- `is_new_issue`: `QueryWhereBooleanRequest`
- `fingerprint_first_seen_at`: `QueryWhereDatetimeRequest`

##### ExecuteCloudCommandResponse

**Fields:**

- `results`: `[CommandResult]`

##### ExecutionAggregateRequest

**Fields:**

- `account_ids`: `[String!]` - Account filter. Omit both to span every account the caller can read — the
Executions tab is tenant-level. account_id is the legacy single-account form.
- `account_id`: `String`
- `start_date`: `timestamp`
- `end_date`: `timestamp`
- `workflow_ids`: `[String!]`
- `triggered_by`: `[String!]`
- `statuses`: `[String!]`
- `trigger_types`: `[String!]`
- `top_failed_limit`: `Int`

##### ExecutionAggregateResponse

**Fields:**

- `total`: `Float`
- `succeeded`: `Float`
- `failed`: `Float`
- `running`: `Float`
- `counts_are_approximate`: `Boolean`
- `top_failed`: `[FailedAutomationCount!]`
- `top_failed_is_approximate`: `Boolean`
- `retention_days`: `Int`

##### ExistingEventsPreview

**Fields:**

- `count`: `Int!`
- `sample_titles`: `[String]`
- `will_be_updated`: `Boolean!`

##### ExportRecommendationRequest

**Fields:**

- `account_id`: `String!`
- `category`: `String`
- `rule_name`: `String`
- `namespace`: `String`
- `workload_type`: `String`
- `workload_name`: `String`
- `status`: `[String]`
- `format`: `String!`

##### ExportRecommendationResponse

**Fields:**

- `file_data`: `String!`
- `filename`: `String!`
- `content_type`: `String!`
- `record_count`: `Int`

##### FailedAutomationCount

**Fields:**

- `workflow_id`: `String!`
- `workflow_name`: `String`
- `failure_count`: `Float`

##### FeatureFlagResponse

**Fields:**

- `rows`: `[FeatureFlagRowResponse]`

##### FeatureFlagRowResponse

**Fields:**

- `id`: `String`
- `feature_id`: `String`
- `feature_module_id`: `String`
- `status`: `String`
- `account_id`: `String`
- `tenant_id`: `String`
- `created_at`: `Datetime`

##### FeatureFlagWhereRequest

**Fields:**

- `_and`: `[FeatureFlagWhereRequest]`
- `_or`: `[FeatureFlagWhereRequest]`
- `_not`: `FeatureFlagWhereRequest`
- `id`: `QueryWhereStringRequest`
- `feature_id`: `QueryWhereStringRequest`
- `feature_module_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`

##### FeatureResponse

**Fields:**

- `rows`: `[FeatureRowResponse]`

##### FeatureRowResponse

**Fields:**

- `value`: `String`
- `description`: `String`

##### FeatureWhereRequest

**Fields:**

- `_and`: `[FeatureWhereRequest]`
- `_or`: `[FeatureWhereRequest]`
- `_not`: `FeatureWhereRequest`
- `value`: `QueryWhereStringRequest`
- `description`: `QueryWhereStringRequest`

##### FeedbackResponse

**Fields:**

- `success`: `Boolean!`

##### FetchLogLabelRequest

**Fields:**

- `account_id`: `String!`
- `log_provider`: `String`
- `log_provider_source`: `String`
- `request`: `jsonb`
- `start_time`: `Float`
- `end_time`: `Float`
- `fetch_index`: `Boolean`
- `integration_config_values`: `[IntegrationConfigValueInput]`

##### FetchLogLabelValuesRequest

**Fields:**

- `account_id`: `String!`
- `label_name`: `String!`
- `log_provider`: `String`
- `request`: `jsonb`
- `start_time`: `Float`
- `end_time`: `Float`

##### FetchLogQueryOutput

**Fields:**

- `query`: `String!`

##### FetchLogQueryRequest

**Fields:**

- `account_id`: `String!`
- `query_request`: `jsonb`
- `log_provider`: `String`
- `log_provider_source`: `String`
- `start_time`: `bigint`
- `end_time`: `bigint`
- `limit`: `Int`

##### FetchLogRequest

**Fields:**

- `account_id`: `String!`
- `log_provider`: `String`
- `log_provider_source`: `String`
- `query`: `String!`
- `start_time`: `Float!`
- `end_time`: `Float!`
- `limit`: `Int`
- `offset`: `Int`
- `sort_fields`: `[SortField]`
- `step_interval`: `Int`
- `query_request`: `jsonb`
- `request`: `jsonb`

##### FetchLogResponse

**Fields:**

- `timestamp`: `String!`
- `message`: `String!`
- `severity`: `String!`
- `labels`: `jsonb!`

##### FetchMetricLabelsRequest

**Fields:**

- `account_id`: `String!`
- `metric_provider`: `String`
- `start_time`: `Float`
- `end_time`: `Float`
- `request`: `jsonb`
- `metric`: `String!`

##### FetchMetricQueryOutput

**Fields:**

- `results`: `jsonb!`

##### FetchMetricsLabelValueRequest

**Fields:**

- `account_id`: `String!`
- `metric_provider`: `String`
- `start_time`: `Float`
- `end_time`: `Float`
- `request`: `jsonb`
- `label`: `String!`

##### FetchMetricsListRequest

**Fields:**

- `account_id`: `String!`
- `metric_provider`: `String`
- `metric_provider_source`: `String`
- `start_time`: `Float`
- `end_time`: `Float`
- `request`: `jsonb`

##### FetchMetricsRequest

**Fields:**

- `account_id`: `String!`
- `queries`: `jsonb`
- `start_time`: `Float`
- `end_time`: `Float`
- `step_interval`: `Int`
- `instant`: `Boolean`
- `request`: `jsonb`
- `metric_provider`: `String`
- `metric_provider_source`: `String`
- `labels`: `jsonb`
- `query_items`: `jsonb`

##### FunctionResponse

**Fields:**

- `data`: `CreateFunctionResponse!`

##### FunctionUpdateResponse

**Fields:**

- `data`: `jsonb!`

##### FutureEventsPreview

**Fields:**

- `rule_applies`: `Boolean!`
- `scope_description`: `String!`

##### GcpBulkOnboardInput

**Fields:**

- `account_name`: `String!`
- `account_env`: `String`
- `credentials_json`: `String!`
- `project_ids`: `[String!]!`
- `billing_project_id`: `String`
- `billing_dataset_id`: `String`
- `billing_table_id`: `String`

##### GcpBulkOnboardOutput

**Fields:**

- `accounts`: `[BulkOnboardAccountResultOutput!]!`
- `parent_id`: `String!`

##### GcpListProjectsInput

**Fields:**

- `credentials_json`: `String!`

##### GcpListProjectsOutput

**Fields:**

- `projects`: `[GcpProjectOutput!]!`

##### GcpProjectOutput

**Fields:**

- `project_id`: `String!`
- `name`: `String!`
- `state`: `String!`

##### GenerateFeedbackResponse

**Fields:**

- `data`: `FeedbackResponse!`

##### GetApplicationProfileResponse

**Fields:**

- `profile_task_id`: `String`
- `account_id`: `String`
- `status`: `String`
- `error_message`: `String`
- `base64_profile`: `jsonb`

##### GetAutopilot

**Fields:**

- `account_id`: `String!`
- `event_ids`: `[String]!`

##### GetAutopiloteOutput

**Fields:**

- `runbooks`: `[jsonb]!`

##### GetBulkOperationStatusResponse

**Fields:**

- `job_id`: `String!`
- `status`: `String!`
- `total_events`: `Int!`
- `processed_events`: `Int!`
- `completed_at`: `timestamp`
- `error_message`: `String`

##### GetConfigInput

**Fields:**

- `account_id`: `String` - Optional. Omit/empty for tenant-level lookup.
- `key`: `String!`
- `decrypt`: `Boolean`

##### GetConfigResponse

**Fields:**

- `config`: `jsonb`

##### GetFeedbackResponse

**Fields:**

- `rows`: `[AiFeedbackResponse]`

##### GetFeedbackWhereRequest

**Fields:**

- `_and`: `[GetFeedbackWhereRequest]`
- `_or`: `[GetFeedbackWhereRequest]`
- `_not`: `GetFeedbackWhereRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `session_id`: `QueryWhereStringRequest`
- `module`: `QueryWhereStringRequest`
- `useful`: `QueryWhereBooleanRequest`
- `question`: `QueryWhereStringRequest`
- `user_id`: `QueryWhereStringRequest`

##### GetGCRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`

##### GetGCResponse

**Fields:**

- `data`: `GlobalContextOutput`
- `errors`: `[Error]`

##### GetInvestigateQueryRequest

**Fields:**

- `account_id`: `String!`
- `query`: `String!`
- `user_id`: `String`
- `conversation_id`: `String`
- `session_id`: `String`
- `async`: `Boolean!`
- `config`: `AIConfigInput`

##### GetKBLoadHistoryRequest

**Fields:**

- `account_id`: `String!`
- `kb_id`: `String!`

##### GetKBLoadHistoryResponse

**Fields:**

- `data`: `[KBLoadHistoryEntry]`
- `errors`: `[Error]`

##### GetKBRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`

##### GetKBResponse

**Fields:**

- `data`: `KnowledgebaseOutput`
- `errors`: `[Error]`

##### GetLabelMappingRequest

**Fields:**

- `account_id`: `String!`
- `provider`: `String`
- `provider_source`: `String`
- `provider_type`: `String`
- `draft_mappings`: `jsonb`
- `draft_set`: `Boolean`

##### GlobalContextInput

**Fields:**

- `name`: `String!`
- `description`: `String`
- `data`: `String!`
- `format`: `String!`
- `file_name`: `String!`

##### GlobalContextOutput

**Fields:**

- `id`: `String!`
- `tenant_id`: `String!`
- `account_id`: `String!`
- `name`: `String!`
- `description`: `String`
- `data`: `String!`
- `data_format`: `String!`
- `data_filename`: `String!`
- `data_size_bytes`: `Float`
- `status`: `String!`
- `created_by`: `String`
- `updated_by`: `String`
- `created_at`: `timestamp`
- `updated_at`: `timestamp`

##### GlobalContextUpdateInput

**Fields:**

- `id`: `String!`
- `name`: `String`
- `description`: `String`
- `data`: `String`
- `format`: `String`
- `file_name`: `String`

##### ImpactAlertRef

**Fields:**

- `event_id`: `String`
- `title`: `String`
- `priority`: `String`
- `source`: `String`
- `starts_at`: `String`

##### ImpactSeedNode

**Fields:**

- `node_id`: `String`
- `name`: `String`
- `namespace`: `String`
- `type`: `String`

##### ImpactedServiceNode

**Fields:**

- `node_id`: `String`
- `name`: `String`
- `node_type`: `String`
- `namespace`: `String`
- `environment`: `String`
- `hops_away`: `Int`
- `relationship`: `String`
- `alerting`: `Boolean`
- `active_alerts`: `[ImpactAlertRef]`

##### IncidentAssembly

**Fields:**

- `root_identity`: `String`
- `same_incident`: `[AssemblyItem]`
- `cause`: `AssemblyCause`
- `impact`: `[AssemblyItem]`
- `chronic`: `[AssemblyItem]`
- `window`: `AssemblyWindow`
- `truncated`: `Boolean`
- `seed_occurrences`: `Int`

##### InsightApplication

**Fields:**

- `name`: `String!`
- `namespace`: `String!`

##### InsightDetails

**Fields:**

- `title`: `String!`
- `source`: `String!`
- `applications`: `[InsightApplication]`

##### InsightRequest

**Fields:**

- `account_id`: `String!`

##### InsightResponse

**Fields:**

- `data`: `[InsightDetails!]!`

##### InsightV2Response

**Fields:**

- `rows`: `[InsightV2RowResponse]`

##### InsightV2RowResponse

**Fields:**

- `id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `title`: `String`
- `type`: `String`
- `source`: `String`
- `account_id`: `String`
- `tenant_id`: `String`
- `unique_id`: `String`
- `resource_id`: `String`
- `status`: `String`
- `rule`: `jsonb`
- `severity`: `String`
- `applications`: `jsonb`

##### InsightWhereRequest

**Fields:**

- `_and`: `[InsightWhereRequest]`
- `_or`: `[InsightWhereRequest]`
- `_not`: `InsightWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `title`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `unique_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### Instance

**Fields:**

- `Id`: `ServiceApplicationId`
- `IsFailed`: `Boolean`

##### Integration

**Fields:**

- `id`: `String`
- `name`: `String`
- `type`: `String`
- `source`: `String`
- `status`: `String`
- `labels`: `jsonb`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `created_by`: `String`
- `updated_by`: `String`
- `tenant_id`: `String`
- `created_by_display_name`: `String`
- `updated_by_display_name`: `String`
- `integrations_cloud_accounts`: `jsonb`
- `integration_config_values`: `jsonb`

##### IntegrationAggregation

**Fields:**

- `id`: `String`
- `name`: `String`
- `type`: `String`
- `source`: `String`
- `status`: `String`
- `created_at`: `Datetime`
- `tenant_id`: `String`
- `count`: `Int`

##### IntegrationAggregationResponse

**Fields:**

- `rows`: `[IntegrationAggregation!]!`

##### IntegrationAutogenOption

**Fields:**

- `label`: `String!`
- `value`: `String!`

##### IntegrationAutogenOptionsRequest

**Fields:**

- `autogen_func`: `String!`
- `form_values`: `jsonb!`

##### IntegrationAutogenOptionsResponse

**Fields:**

- `options`: `[IntegrationAutogenOption!]!`
- `message`: `String`

##### IntegrationConfigValueInput

**Fields:**

- `name`: `String!`
- `value`: `String!`
- `is_encrypted`: `Boolean`

##### IntegrationConfigValueResponse

**Fields:**

- `name`: `String!`
- `value`: `String!`

##### IntegrationResponse

**Fields:**

- `rows`: `[Integration!]!`

##### IntegrationSchemaRequest

**Fields:**

- `integration_name`: `String!`
- `source`: `String!`

##### IntegrationSchemaResponse

**Fields:**

- `data`: `jsonb!`

##### IntegrationTestConnectionConfigRequest

**Fields:**

- `integration_name`: `String!`
- `account_ids`: `[String]!`
- `integration_config_values`: `[IntegrationConfigValueInput]!`
- `source`: `String`

##### IntegrationTestConnectionRequest

**Fields:**

- `integration_id`: `String!`

##### IntegrationTestConnectionResponse

**Fields:**

- `success`: `Boolean!`
- `message`: `String`
- `error`: `String`

##### IntegrationWhereRequest

**Fields:**

- `_and`: `[IntegrationWhereRequest]`
- `_or`: `[IntegrationWhereRequest]`
- `_not`: `IntegrationWhereRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `created_by`: `QueryWhereStringRequest`
- `updated_by`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `created_by_display_name`: `QueryWhereStringRequest`
- `updated_by_display_name`: `QueryWhereStringRequest`
- `config_value_name`: `QueryWhereStringRequest`
- `config_value_value`: `QueryWhereStringRequest`

##### Json

##### K8sClusterGroupingsResponse

**Fields:**

- `rows`: `[K8sClusterGroupingsRowResponse]`

##### K8sClusterGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `node_count`: `Int`
- `node_spot_count`: `Int`
- `node_cpu_capacity`: `Float`
- `node_cpu_allocatable`: `Float`
- `node_memory_capacity`: `Float`
- `node_memory_allocatable`: `Float`
- `workload_type_counts`: `String`
- `pod_status_counts`: `String`

##### K8sClusterGroupingsWhereRequest

**Fields:**

- `_and`: `[K8sClusterGroupingsWhereRequest]`
- `_or`: `[K8sClusterGroupingsWhereRequest]`
- `_not`: `K8sClusterGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`

##### K8sMetricsGroupingsResponse

**Fields:**

- `rows`: `[K8sMetricsGroupingsRowResponse]`

##### K8sMetricsGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `workload_type`: `String`
- `workload_name`: `String`
- `namespace_name`: `String`
- `pod_name`: `String`
- `node_name`: `String`
- `pod_fqdn`: `String`
- `workload_fqdn`: `String`
- `timestamp`: `Datetime`
- `cost`: `Float`
- `avg_efficiency`: `Float`
- `max_efficiency`: `Float`
- `avg_cpu_used`: `Float`
- `max_cpu_used`: `Float`
- `avg_memory_used`: `Float`
- `max_memory_used`: `Float`
- `avg_cpu_request`: `Float`
- `max_cpu_request`: `Float`
- `avg_memory_request`: `Float`
- `max_memory_request`: `Float`
- `avg_cpu_efficiency`: `Float`
- `max_cpu_efficiency`: `Float`
- `avg_ram_efficiency`: `Float`
- `max_ram_efficiency`: `Float`
- `sum_ingress`: `Float`
- `sum_egress`: `Float`

##### K8sMetricsGroupingsWhereRequest

**Fields:**

- `_and`: `[K8sMetricsGroupingsWhereRequest]`
- `_or`: `[K8sMetricsGroupingsWhereRequest]`
- `_not`: `K8sMetricsGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `workload_type`: `QueryWhereStringRequest`
- `workload_name`: `QueryWhereStringRequest`
- `namespace_name`: `QueryWhereStringRequest`
- `pod_name`: `QueryWhereStringRequest`
- `node_name`: `QueryWhereStringRequest`
- `timestamp`: `QueryWhereDatetimeRequest`
- `workload_fqdn`: `QueryWhereStringRequest`
- `pod_fqdn`: `QueryWhereStringRequest`

##### K8sNamespaceGroupingRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `name`: `String`
- `is_active`: `Boolean`
- `count`: `Int`

##### K8sNamespaceGroupingsResponse

**Fields:**

- `rows`: `[K8sNamespaceGroupingRowResponse]`

##### K8sNamespaceGroupingsWhereRequest

**Fields:**

- `_and`: `[K8sNamespaceGroupingsWhereRequest]`
- `_or`: `[K8sNamespaceGroupingsWhereRequest]`
- `_not`: `K8sNamespaceGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `creation_time`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### K8sNamespaceResponse

**Fields:**

- `rows`: `[K8sNamespaceRowResponse]`

##### K8sNamespaceRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `name`: `String`
- `is_active`: `Boolean`
- `workload_count`: `Int`
- `pod_count`: `Int`
- `creation_time`: `Datetime`
- `updated_at`: `Datetime`

##### K8sNamespaceWhereRequest

**Fields:**

- `_and`: `[K8sNamespaceWhereRequest]`
- `_or`: `[K8sNamespaceWhereRequest]`
- `_not`: `K8sNamespaceWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `workload_count`: `QueryWhereIntRequest`
- `pod_count`: `QueryWhereIntRequest`
- `creation_time`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### K8sNodesGroupingsResponse

**Fields:**

- `rows`: `[K8sNodesGroupingsRowResponse]`

##### K8sNodesGroupingsRowResponse

**Fields:**

- `cloud_account_id`: `String`
- `is_active`: `Boolean`
- `node_type`: `String`
- `node_flavor`: `String`
- `count`: `Int`

##### K8sNodesGroupingsWhereRequest

**Fields:**

- `_and`: `[K8sNodesGroupingsWhereRequest]`
- `_or`: `[K8sNodesGroupingsWhereRequest]`
- `_not`: `K8sNodesGroupingsWhereRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `node_type`: `QueryWhereStringRequest`
- `node_flavor`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`

##### K8sNodesResponse

**Fields:**

- `rows`: `[K8sNodesRowResponse]`

##### K8sNodesRowResponse

**Fields:**

- `name`: `String`
- `is_active`: `Boolean`
- `node_creation_time`: `Datetime`
- `updated_at`: `Datetime`
- `conditions`: `Json`
- `node_type`: `String`
- `node_flavor`: `String`
- `node_region`: `String`
- `node_zone`: `String`
- `memory_capacity`: `Float`
- `cpu_capacity`: `Float`
- `memory_allocatable`: `Float`
- `cpu_allocatable`: `Float`
- `memory_limits`: `Float`
- `cpu_limits`: `Float`
- `cloud_resource_id`: `String`
- `cloud_account_id`: `String`
- `external_ip`: `String`
- `internal_ip`: `String`
- `labels`: `Json`
- `taints`: `Json`
- `cost`: `Float`
- `meta`: `Json`
- `pod_count`: `Int`

##### K8sNodesWhereRequest

**Fields:**

- `_and`: `[K8sNodesWhereRequest]`
- `_or`: `[K8sNodesWhereRequest]`
- `_not`: `K8sNodesWhereRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `node_creation_time`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `node_type`: `QueryWhereStringRequest`
- `node_flavor`: `QueryWhereStringRequest`
- `node_region`: `QueryWhereStringRequest`
- `node_zone`: `QueryWhereStringRequest`
- `cloud_resource_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### K8sPodGroupingsResponse

**Fields:**

- `rows`: `[K8sPodGroupingsRowResponse]`

##### K8sPodGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `external_id`: `String`
- `name`: `String`
- `workload_type`: `String`
- `namespace`: `String`
- `status`: `String`
- `node_name`: `String`
- `is_active`: `Boolean`
- `pod_fqdn`: `String`
- `count`: `Int`
- `workload_name`: `String`

##### K8sPodGroupingsWhereRequest

**Fields:**

- `_and`: `[K8sPodGroupingsWhereRequest]`
- `_or`: `[K8sPodGroupingsWhereRequest]`
- `_not`: `K8sPodGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `external_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `workload_type`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `node_name`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `pod_fqdn`: `QueryWhereStringRequest`
- `creation_time`: `QueryWhereDatetimeRequest`
- `workload_name`: `QueryWhereStringRequest`
- `labels`: `QueryWhereStringRequest`

##### K8sPodsResponse

**Fields:**

- `rows`: `[K8sPodsRowResponse]`

##### K8sPodsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `external_id`: `String`
- `name`: `String`
- `workload_type`: `String`
- `workload_name`: `String`
- `namespace`: `String`
- `status`: `String`
- `node_name`: `String`
- `is_active`: `Boolean`
- `restart_count`: `Json`
- `creation_time`: `Datetime`
- `last_seen`: `Datetime`
- `updated_at`: `Datetime`
- `pod_fqdn`: `String`
- `labels`: `Json`
- `meta`: `Json`

##### K8sPodsWhereRequest

**Fields:**

- `_and`: `[K8sPodsWhereRequest]`
- `_or`: `[K8sPodsWhereRequest]`
- `_not`: `K8sPodsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `external_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `workload_type`: `QueryWhereStringRequest`
- `workload_name`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `node_name`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `restart_count`: `QueryWhereIntRequest`
- `creation_time`: `QueryWhereDatetimeRequest`
- `last_seen`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `pod_fqdn`: `QueryWhereStringRequest`
- `labels`: `QueryWhereStringRequest`

##### K8sVersionResponse

**Fields:**

- `version`: `String!`
- `release_date`: `String!`

##### K8sWorkloadGroupingRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `external_id`: `String`
- `namespace`: `String`
- `is_active`: `Boolean`
- `name`: `String`
- `kind`: `String`
- `workload_fqdn`: `String`
- `count`: `Int`
- `deployment_count`: `Int`
- `statefulset_count`: `Int`
- `daemonset_count`: `Int`
- `replicaset_count`: `Int`
- `job_count`: `Int`
- `cronjob_count`: `Int`
- `rollout_count`: `Int`

##### K8sWorkloadGroupingsResponse

**Fields:**

- `rows`: `[K8sWorkloadGroupingRowResponse]`

##### K8sWorkloadGroupingsWhereRequest

**Fields:**

- `_and`: `[K8sWorkloadGroupingsWhereRequest]`
- `_or`: `[K8sWorkloadGroupingsWhereRequest]`
- `_not`: `K8sWorkloadGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `external_id`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `name`: `QueryWhereStringRequest`
- `kind`: `QueryWhereStringRequest`
- `workload_fqdn`: `QueryWhereStringRequest`
- `labels`: `QueryWhereStringRequest`

##### K8sWorkloadResponse

**Fields:**

- `rows`: `[K8sWorkloadRowResponse]`

##### K8sWorkloadRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `external_id`: `String`
- `namespace`: `String`
- `is_active`: `String`
- `total_pods`: `String`
- `ready_pods`: `String`
- `name`: `String`
- `kind`: `String`
- `creation_time`: `Datetime`
- `last_seen`: `Datetime`
- `labels`: `Json`
- `meta`: `Json`
- `updated_at`: `Datetime`
- `workload_fqdn`: `String`

##### K8sWorkloadWhereRequest

**Fields:**

- `_and`: `[K8sWorkloadWhereRequest]`
- `_or`: `[K8sWorkloadWhereRequest]`
- `_not`: `K8sWorkloadWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `external_id`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `total_pods`: `QueryWhereIntRequest`
- `ready_pods`: `QueryWhereIntRequest`
- `name`: `QueryWhereStringRequest`
- `kind`: `QueryWhereStringRequest`
- `creation_time`: `QueryWhereDatetimeRequest`
- `last_seen`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `workload_fqdn`: `QueryWhereStringRequest`
- `labels`: `QueryWhereStringRequest`

##### KBLoadHistoryEntry

**Fields:**

- `id`: `String!`
- `document_count`: `Int!`
- `expected_document_count`: `Int`
- `total_tokens`: `Float!`
- `embedding_provider`: `String`
- `embedding_model`: `String`
- `request_status`: `String!`
- `error_message`: `String`
- `trigger_type`: `String`
- `triggered_by`: `String`
- `load_duration_seconds`: `Float`
- `created_at`: `timestamp!`

##### KnowledgeBaseResponse

**Fields:**

- `rows`: `[KnowledgeBaseRowResponse]`

##### KnowledgeBaseRowResponse

**Fields:**

- `id`: `String`
- `rule_name`: `String`
- `description`: `String`
- `impact`: `String`
- `diagnosis`: `String`
- `mitigation`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`

##### KnowledgeBaseWhereRequest

**Fields:**

- `_and`: `[KnowledgeBaseWhereRequest]`
- `_or`: `[KnowledgeBaseWhereRequest]`
- `_not`: `KnowledgeBaseWhereRequest`
- `id`: `QueryWhereStringRequest`
- `rule_name`: `QueryWhereStringRequest`
- `description`: `QueryWhereStringRequest`
- `impact`: `QueryWhereStringRequest`
- `diagnosis`: `QueryWhereStringRequest`
- `mitigation`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### KnowledgebaseInput

**Fields:**

- `name`: `String!`
- `description`: `String`
- `data`: `String!`
- `format`: `String!`
- `file_name`: `String!`

##### KnowledgebaseOutput

**Fields:**

- `id`: `String!`
- `tenant_id`: `String!`
- `account_id`: `String!`
- `name`: `String!`
- `description`: `String`
- `data`: `String!`
- `data_format`: `String!`
- `data_filename`: `String!`
- `data_size_bytes`: `Float`
- `status`: `String!`
- `kb_type`: `String!`
- `kb_source`: `String`
- `integration_id`: `String`
- `created_by`: `String`
- `updated_by`: `String`
- `created_at`: `timestamp`
- `updated_at`: `timestamp`
- `document_count`: `Int`
- `last_loaded_at`: `timestamp`

##### KnowledgebaseUpdateInput

**Fields:**

- `id`: `String!`
- `name`: `String`
- `description`: `String`
- `data`: `String`
- `format`: `String`
- `file_name`: `String`

##### LLMFunctionCreateResponse

**Fields:**

- `id`: `String!`
- `name`: `String!`
- `description`: `String!`
- `prompt`: `String!`
- `variables`: `[String!]`
- `variable_defaults`: `jsonb`
- `status`: `String!`
- `version`: `Int`
- `account_id`: `String!`
- `tenant_id`: `String!`
- `created_by`: `String`
- `updated_by`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`

##### LLMRagGroupingResponse

**Fields:**

- `rows`: `[LLMRagGroupingRowResponse!]!`

##### LLMRagGroupingRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `agent_id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `data`: `String`
- `data_format`: `String`
- `data_filename`: `String`
- `created_by`: `String`
- `updated_by`: `String`
- `count`: `Int!`

##### LLMRagGroupingWhereRequest

**Fields:**

- `_and`: `[LLMRagGroupingWhereRequest]`
- `_or`: `[LLMRagGroupingWhereRequest]`
- `_not`: `LLMRagGroupingWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `agent_id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `data`: `QueryWhereStringRequest`
- `data_format`: `QueryWhereStringRequest`
- `data_filename`: `QueryWhereStringRequest`
- `created_by`: `QueryWhereStringRequest`
- `updated_by`: `QueryWhereStringRequest`

##### LabelMappingField

**Fields:**

- `canonical`: `String!`
- `effective`: `String`
- `winning_tier`: `String`
- `contributions`: `jsonb`

##### LabelMappingResponse

**Fields:**

- `account_id`: `String!`
- `provider`: `String`
- `provider_source`: `String`
- `provider_type`: `String`
- `integration_saved`: `Boolean`
- `draft_applied`: `Boolean`
- `tier_order`: `[String!]`
- `fields`: `[LabelMappingField!]`
- `effective`: `jsonb`

##### Labels

**Fields:**

- `severity`: `String!`

##### LicenseResponse

**Fields:**

- `license`: `jsonb!`

##### Link

**Fields:**

- `Id`: `String!`
- `Status`: `Int`
- `Stats`: `[String!]`
- `Weight`: `float8`
- `Latency`: `float8`
- `RequestCount`: `float8`
- `FailureCount`: `float8`
- `Protocol`: `String`
- `BytesSent`: `float8`
- `BytesReceived`: `float8`
- `DrillDown`: `LinkDrillDown`

##### LinkDrillDown

**Fields:**

- `time_range`: `LinkTimeRange`
- `error_types`: `[jsonb]`
- `http_status_codes`: `[jsonb]`
- `sample_trace_ids`: `[String]`
- `failed_trace_ids`: `[String]`
- `operations`: `[jsonb]`
- `filter_hints`: `LinkFilterHints`

##### LinkFilterHints

**Fields:**

- `source_service`: `String`
- `target_service`: `String`
- `span_attribute_filters`: `jsonb`
- `protocol`: `String`

##### LinkTimeRange

**Fields:**

- `start_time`: `String`
- `end_time`: `String`

##### ListAIMemoryRequest

**Fields:**

- `account_id`: `String!`
- `conversation_id`: `String`
- `message_id`: `String`
- `message_ids`: `[String]`
- `limit`: `Int`
- `offset`: `Int`
- `memory_type`: `String`
- `query`: `String`

##### ListAIMemoryResponse

**Fields:**

- `data`: `[AIMemoryResponse]`
- `errors`: `[Error]`

##### ListAIReferencesRequest

**Fields:**

- `account_id`: `String!`
- `conversation_id`: `String`
- `message_id`: `String`
- `message_ids`: `[String]`
- `agent_id`: `String`
- `limit`: `Int`
- `offset`: `Int`

##### ListAIReferencesResponse

**Fields:**

- `data`: `[AIReferenceResponse]`
- `errors`: `[Error]`

##### ListAgentKBsRequest

**Fields:**

- `account_id`: `String!`
- `agent_id`: `String!`

##### ListAgentKBsResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### ListAgentRequest

**Fields:**

- `account_id`: `String!`

##### ListAgentResponse

**Fields:**

- `data`: `jsonb!`

##### ListAgentsWithKBCountsRequest

**Fields:**

- `account_id`: `String!`

##### ListAgentsWithKBCountsResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### ListAnomalyResponse

**Fields:**

- `rows`: `AnomalyResponse!`

##### ListAnomalyV3Response

**Fields:**

- `rows`: `AnomalyV3Response!`

##### ListAnomalyV3WhereRequest

**Fields:**

- `account_id`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `anomaly_type`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`

##### ListAnomalyWhereRequest

**Fields:**

- `account_id`: `QueryWhereStringRequest`
- `is_anomaly`: `QueryWhereBooleanRequest`
- `namespace`: `QueryWhereStringRequest`
- `anomaly_type`: `QueryWhereStringRequest`
- `config_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`

##### ListGCRequest

**Fields:**

- `account_id`: `String!`

##### ListGCResponse

**Fields:**

- `data`: `[GlobalContextOutput]`
- `errors`: `[Error]`

##### ListKBAgentMappingsRequest

**Fields:**

- `account_id`: `String!`

##### ListKBAgentMappingsResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### ListKBAgentsRequest

**Fields:**

- `account_id`: `String!`
- `kb_id`: `String!`

##### ListKBAgentsResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### ListKBRequest

**Fields:**

- `account_id`: `String!`

##### ListKBResponse

**Fields:**

- `data`: `[KnowledgebaseOutput]`
- `errors`: `[Error]`

##### ListProviderCapabilitiesRequest

**Fields:**

- `account_id`: `String!`

##### ListToolRequest

**Fields:**

- `account_id`: `String!`

##### ListToolResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### LlmAgentsInstallationResponse

**Fields:**

- `rows`: `[LlmAgentsInstallationRowResponse]`

##### LlmAgentsInstallationRowResponse

**Fields:**

- `id`: `String`
- `agent_id`: `String`
- `account_id`: `String`
- `config`: `Json`
- `tools`: `Json`
- `additional_instructions`: `String`
- `created_at`: `Datetime`
- `created_by`: `String`
- `updated_at`: `Datetime`
- `updated_by`: `String`

##### LlmAgentsInstallationWhereRequest

**Fields:**

- `_and`: `[LlmAgentsInstallationWhereRequest]`
- `_or`: `[LlmAgentsInstallationWhereRequest]`
- `_not`: `LlmAgentsInstallationWhereRequest`
- `id`: `QueryWhereStringRequest`
- `agent_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`

##### LlmConversationDetailResponse

**Fields:**

- `rows`: `[LlmConversationDetailRowResponse]`

##### LlmConversationDetailRowResponse

**Fields:**

- `id`: `String`
- `session_id`: `String`
- `account_id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `source`: `String`
- `context`: `String`
- `status`: `String`
- `user_id`: `String`
- `title`: `String`
- `user_display_name`: `String`
- `messages`: `Json`

##### LlmConversationDetailWhereRequest

**Fields:**

- `_and`: `[LlmConversationDetailWhereRequest]`
- `_or`: `[LlmConversationDetailWhereRequest]`
- `_not`: `LlmConversationDetailWhereRequest`
- `id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `session_id`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`

##### LlmConversationGroupingsResponse

**Fields:**

- `rows`: `[LlmConversationGroupingsRowResponse]`

##### LlmConversationGroupingsRowResponse

**Fields:**

- `count`: `Int`

##### LlmConversationGroupingsWhereRequest

**Fields:**

- `_and`: `[LlmConversationGroupingsWhereRequest]`
- `_or`: `[LlmConversationGroupingsWhereRequest]`
- `_not`: `LlmConversationGroupingsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `message_created_at`: `QueryWhereDatetimeRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `title`: `QueryWhereStringRequest`
- `extract_event_ids_from_title`: `QueryWhereBooleanRequest`
- `event_status`: `QueryWhereStringRequest`

##### LlmConversationListResponse

**Fields:**

- `rows`: `[LlmConversationListRowResponse]`

##### LlmConversationListRowResponse

**Fields:**

- `id`: `String`
- `updated_at`: `Datetime`
- `status`: `String`
- `user_id`: `String`
- `session_id`: `String`
- `created_at`: `Datetime`
- `source`: `String`
- `title`: `String`
- `account_id`: `String`
- `user_display_name`: `String`
- `user_username`: `String`
- `for_status`: `Json`
- `is_saved`: `Boolean`
- `total_count`: `Int`

##### LlmConversationListWhereRequest

**Fields:**

- `_and`: `[LlmConversationListWhereRequest]`
- `_or`: `[LlmConversationListWhereRequest]`
- `_not`: `LlmConversationListWhereRequest`
- `id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `title`: `QueryWhereStringRequest`
- `user_id`: `QueryWhereStringRequest`
- `user_username`: `QueryWhereStringRequest`
- `user_display_name`: `QueryWhereStringRequest`
- `is_saved`: `QueryWhereBooleanRequest`
- `message_search`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `session_id`: `QueryWhereStringRequest`
- `extract_event_ids_from_title`: `QueryWhereBooleanRequest`
- `event_status`: `QueryWhereStringRequest`

##### LlmFunctionsResponse

**Fields:**

- `rows`: `[LlmFunctionsRowResponse]`

##### LlmFunctionsRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `name`: `String`
- `description`: `String`
- `prompt`: `String`
- `variables`: `Json`
- `variable_defaults`: `Json`
- `status`: `String`
- `version`: `Int`
- `created_by`: `String`
- `updated_by`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`

##### LlmFunctionsWhereRequest

**Fields:**

- `_and`: `[LlmFunctionsWhereRequest]`
- `_or`: `[LlmFunctionsWhereRequest]`
- `_not`: `LlmFunctionsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`

##### LogGroup

**Fields:**

- `sample`: `String!`
- `namespace`: `String!`
- `workload`: `String!`
- `container`: `String!`
- `container_id`: `String!`
- `pattern_hash`: `String!`
- `level`: `String!`
- `count`: `Float!`
- `timestamps`: `[Float!]!`
- `values`: `[Float!]!`

##### LogGroupOutput

**Fields:**

- `groups`: `[LogGroup!]!`

##### LogGroupRequest

**Fields:**

- `account_id`: `String!`
- `log_provider`: `String`
- `log_provider_source`: `String`
- `start_time`: `Float!`
- `end_time`: `Float!`
- `request`: `jsonb`

##### MCPToolInfo

**Fields:**

- `name`: `String!`
- `description`: `String`

##### MapKBToAgentRequest

**Fields:**

- `account_id`: `String!`
- `kb_id`: `String!`
- `agent_id`: `String!`

##### MapKBToAgentResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### MessagingPlatformItem

**Fields:**

- `id`: `uuid!`
- `username`: `String`
- `team_name`: `String`
- `created_at`: `String`
- `team_id`: `String`
- `channels`: `jsonb`
- `platform`: `String`

##### MetricGroupingsResponse

**Fields:**

- `rows`: `[MetricGroupingsRowResponse]`

##### MetricGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `metric`: `String`
- `timestamp`: `Datetime`
- `count_value`: `Int`
- `sum_value`: `Float`
- `avg_value`: `Float`
- `min_value`: `Float`
- `max_value`: `Float`

##### MetricGroupingsWhereRequest

**Fields:**

- `_and`: `[MetricGroupingsWhereRequest]`
- `_or`: `[MetricGroupingsWhereRequest]`
- `_not`: `MetricGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `metric`: `QueryWhereStringRequest`
- `timestamp`: `QueryWhereDatetimeRequest`
- `value`: `QueryWhereFloatRequest`

##### MetricsQueryUtilisationRequest

**Fields:**

- `account_id`: `String!`
- `metric_provider`: `String`
- `metric_provider_source`: `String`
- `start_time`: `Float`
- `end_time`: `Float`
- `request`: `jsonb!`

##### MonitoringEventsResponse

**Fields:**

- `rows`: `[MonitoringEventsRowResponse]`

##### MonitoringEventsRowResponse

**Fields:**

- `name`: `String`
- `cloud_account_id`: `String`
- `namespace`: `String`
- `event_count`: `Int`
- `tenant_id`: `String`

##### MonitoringRecommendationsResponse

**Fields:**

- `rows`: `[MonitoringRecommendationsRowResponse]`

##### MonitoringRecommendationsRowResponse

**Fields:**

- `workload_name`: `String`
- `account_id`: `String`
- `namespace`: `String`
- `tenant_id`: `String`
- `recommendation_count`: `Int`

##### MonitoringResponse

**Fields:**

- `rows`: `[MonitoringRowResponse]`

##### MonitoringRowResponse

**Fields:**

- `name`: `String`
- `account_name`: `String`
- `account_id`: `String`
- `namespace`: `String`
- `workload_id`: `String`
- `ready_pods`: `Int`
- `total_pods`: `Int`
- `event_count`: `Int`
- `pod_error_count`: `Int`
- `application_error_count`: `Int`
- `creation_time`: `String`
- `failed_slo_count`: `Int`
- `total_slo_count`: `Int`

##### MonitoringWhereRequest

**Fields:**

- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `creation_time`: `QueryWhereStringRequest`

##### Mutation

**Fields:**

- `agents_create_token`: `AgentRegenerateTokenOutput`
- `ai_upsert_budget_config`: `AIBudgetConfigUpsertResponse`
- `ai_delete_budget_config`: `AIBudgetConfigDeleteResponse`
- `ai_create_agent`: `CreateAgentResponse`
- `ai_create_agent_extension`: `CreateAgentExtensionResponse`
- `ai_create_function`: `FunctionResponse`
- `ai_create_gc`: `CreateGCResponse`
- `ai_create_kb`: `CreateKBResponse`
- `ai_create_rag`: `CreateAgentRagOutput`
- `ai_create_tool`: `CreateToolResponse`
- `ai_delete_agent`: `DeleteAgentResponse`
- `ai_delete_tool`: `DeleteToolResponse`
- `ai_delete_function`: `AiDeleteFunctionResponse`
- `ai_delete_gc`: `DeleteGCResponse`
- `ai_delete_kb`: `DeleteKBResponse`
- `ai_delete_llm_conversation_by_id`: `DeleteLlmConversationByIdOutput`
- `ai_delete_saved_conversation`: `DeleteLLMConversationResponse`
- `ai_feedback_create`: `GenerateFeedbackResponse`
- `ai_get_followup_response`: `AIFollowupResponse`
- `ai_generate_log_query`: `AIGetLogQueryResponse`
- `ai_generate_prometheus_query`: `AIGetPrometheusQueryResponse`
- `ai_list_conversation_suggestions`: `AIGetConversationSuggestionResponse`
- `ai_get_conversation_usage_metrics`: `AIGetConversationUsageMetricsResponse`
- `ai_get_conversation_time_aggregates`: `AIGetConversationTimeAggregatesResponse`
- `ai_remediation_execute`: `AIResponse`
- `ai_sync_kb`: `RetriggerKBResponse`
- `ai_create_kb_mapping`: `MapKBToAgentResponse`
- `ai_create_saved_conversation`: `SaveLLMConversationResponse`
- `ai_upsert_rcaformat`: `AISaveRcaFormatResponse`
- `ai_cancel_investigation`: `AIStopInvestigationResponse`
- `ai_execute_investigation`: `AITriggerInvestigationResponse`
- `ai_delete_kb_mapping`: `UnmapKBFromAgentResponse`
- `ai_update_agent`: `UpdateAgentResponse`
- `ai_update_agent_extension`: `UpdateAgentExtensionResponse`
- `ai_update_function`: `FunctionUpdateResponse`
- `ai_update_gc`: `UpdateGCResponse`
- `ai_update_kb`: `UpdateKBResponse`
- `ai_update_kb_enabled`: `UpdateKBEnabledResponse`
- `ai_update_tool`: `UpdateToolResponse`
- `alertmanager_create_rule`: `AlertRuleResponse`
- `alertmanager_disable_rule`: `AlertRuleResponse`
- `alertmanager_list_actions`: `AlertAction`
- `alertmanager_update_rule`: `AlertRuleResponse`
- `anomaly_template_list`: `AnomalyTemplateListResponse`
- `applications_get_profile_status`: `ApplicationProfileDataResponse`
- `applications_create_group`: `application_group_create_output`
- `applications_update_group`: `application_group_update_output`
- `applications_execute_profile`: `ApplicationProfileDataResponse`
- `applications_convert_profile`: `ApplicationProfileConvertDataResponse`
- `recommendations_apply`: `apply_recommendation_output`
- `userroles_upsert_account_group`: `auth_account_group_roles_upsert_one_output`
- `userroles_upsert_k8s_namespace_group`: `auth_k8saccount_namespace_group_roles_upsert_one_output`
- `usergroups_update_members`: `auth_manage_group_users_output`
- `userroles_upsert_group`: `auth_tenant_group_roles_upsert_one_output`
- `autooptimize_create`: `auto_optimize_insert_one_output`
- `autooptimize_update`: `auto_optimize_insert_one_output`
- `autooptimize_update_status`: `auto_optimize_update_status_response`
- `aws_cloud_formation`: `AWSCloudFormationOutput`
- `cloud_update_cloudformation_permissions`: `CloudUpdateCloudformationPermissionsOutput`
- `accounts_check_aws_onboarding`: `AwsOnboardStatusOutput`
- `accounts_create_aws_org`: `AwsOrgOnboardOutput`
- `aws_org_refresh_token`: `AwsOrgRefreshTokenOutput`
- `aws_org_status`: `AwsOrgStatusOutput`
- `aws_get_onboard_eventbridge_url`: `AwsEventBridgeOnboardOutput`
- `azure_get_onboard_eventgrid_url`: `AzureEventGridOnboardOutput`
- `cloud_account_attrs_upsert`: `cloud_account_attrs_upsert_output`
- `cloud_account_update`: `cloud_account_update_output`
- `accounts_create`: `cloud_accounts_insert_one_output`
- `cloud_resource_attributes_upsert`: `cloud_resource_attributes_upsert_output`
- `config_delete`: `ConfigDeleteOutput`
- `config_get`: `GetConfigResponse`
- `config_list`: `[Config]`
- `config_save`: `ConfigSaveOutput`
- `database_performance_insights`: `QueryDatabasePerformanceResponse`
- `cloud_list_metrics`: `CloudMetricsResponse`
- `cloud_list_notification_targets`: `CloudNotificationTargetsResponse`
- `accounts_sync`: `TriggerCloudSyncResponse`
- `cloud_sync_service`: `CloudServiceSyncResponse`
- `cloud_execute_command`: `ExecuteCloudCommandResponse`
- `cloud_apply_command`: `CloudApplyCommandResponse`
- `events_update_classification`: `ClassifyEventResponse`
- `events_dryrun_classification`: `ClassifyPreviewResponse`
- `event_create_triage_rule`: `CreateTriageRuleResponse`
- `event_delete_triage_rule`: `DeleteTriageRuleResponse`
- `event_get_duplicate_suggestions`: `EventGetDuplicateSuggestionsOutput`
- `event_get_duplicates`: `EventGetDuplicatesOutput`
- `event_get_threshold_suggestion`: `ThresholdSuggestionOutput`
- `event_list_threshold_suggestions`: `ThresholdSuggestionListOutput`
- `event_get_threshold_apply_options`: `ThresholdApplyOptionsOutput`
- `event_apply_threshold_suggestion`: `ThresholdApplyResultOutput`
- `event_revert_threshold_suggestion`: `ThresholdApplyResultOutput`
- `event_get_timeline`: `EventTimelineOutput`
- `event_get_impact`: `EventGetImpactOutput`
- `event_get_triage_rule_events`: `EventGetTriageRuleEventsOutput`
- `event_get_triage_rules`: `EventGetTriageRulesOutput`
- `events_dryrun_triage_rule`: `EventPreviewTriageRuleOutput`
- `events_update_resolution`: `event_resolve_output`
- `events_update_rule_override`: `ToggleSystemRuleOverrideResponse`
- `event_update`: `EventsRowResponse`
- `event_update_nb_status`: `UpdateNBStatusResponse`
- `event_update_triage_rule`: `UpdateTriageRuleResponse`
- `featureflag_upsert`: `featureflag_upsert_output!`
- `cloud_check_monitoring_permission`: `CheckGcpMonitoringPermissionOutput`
- `cloud_setup_monitoring_webhook`: `SetupGcpMonitoringWebhookOutput`
- `ml_generate_node_recommendations`: `generate_cluster_recommendations_output`
- `integration_update_status_by_pk`: `integration_update_status_by_pk_output!`
- `integrations_create_config`: `CreateIntegrationConfigResponse`
- `integrations_delete_config`: `DeleteIntegrationConfigResponse`
- `integrations_update_status`: `DeleteIntegrationConfigResponse`
- `integrations_check_connection`: `IntegrationTestConnectionResponse`
- `integrations_check_connection_config`: `IntegrationTestConnectionResponse`
- `integrations_upsert_discovery_target`: `DiscoveryTargetResponse`
- `kg_get_complete_graph`: `kg_get_complete_graph_output`
- `kg_list_nodes`: `kg_search_nodes_output`
- `kg_list_path`: `kg_traverse_output`
- `kg_get_node`: `kg_get_node_output`
- `kg_get_edge`: `kg_get_edge_output`
- `kg_upsert_tenant_filter`: `kg_upsert_tenant_filter_output`
- `insights_aggregate`: `InsightResponse`
- `logs_get_query`: `FetchLogQueryOutput`
- `messagingplatforms_delete`: `messaging_platform_delete_output`
- `messagingplatforms_update`: `messaging_platform_update_output`
- `notification_channel_mapping_create`: `notification_channel_mapping_create_output!`
- `notification_channel_mapping_delete`: `notification_channel_mapping_delete_output!`
- `notification_channel_mapping_update`: `notification_channel_mapping_update_output!`
- `notifications_check_connection`: `notification_send_test_resp`
- `notification_rule_delete`: `notification_rule_delete_output!`
- `notifications_upsert_rule`: `notification_rule_mapping_output`
- `recommendation_export`: `ExportRecommendationResponse`
- `recommendation_job_create`: `recommendation_job_create_output`
- `relay_forward_request`: `RelayForwardOutput`
- `security_scan_image`: `security_scan_image_output`
- `security_scan_vm`: `security_scan_vm_output`
- `security_scan_vm_account`: `security_scan_vm_account_output`
- `slo_config_create`: `SLOResponse`
- `slo_config_list`: `SLOConfigListResponse`
- `slo_config_update`: `SLOUpdateConfigResponse`
- `slo_config_delete`: `SLODeleteConfigResponse`
- `tenant_attribute_delete`: `tenant_attribute_delete_output!`
- `tenant_attribute_upsert`: `[TenantAttributeResponse!]!`
- `signup_delete`: `tenant_onboarding_delete_by_username_output`
- `signup_create`: `tenant_onboarding_insert_output`
- `signup_update_status`: `tenant_onboarding_update_status_output`
- `tenant_update_name`: `tenant_update_name_output!`
- `ticket_add_comment`: `TicketComments!`
- `ticket_integration_create_config`: `ticket_integration_create_config_output!`
- `ticket_check_connection_by_config`: `ticket_test_connection_output!`
- `tickets_create`: `tickets_insert_one_output!`
- `traces_get_service_map`: `ServiceMapResponse`
- `anomaly_execute`: `TriggerAnomalyExecuteResponse`
- `upgrade_execute_command`: `UpgradeExecuteCommandResponse`
- `upgrade_plan_create_one`: `UpgradePlanResponse`
- `upgradeplans_upsert_task`: `task_response`
- `upgrade_post_flight_check`: `flight_check_response`
- `upgrade_pre_flight_check`: `flight_check_response`
- `userauths_create`: `user_create_auth_output`
- `userauths_delete`: `user_delete_auth_output`
- `users_create_history`: `UserHistoryOutput`
- `signup_complete`: `user_onboard_output`
- `userroles_sync`: `user_sync_roles_output`
- `users_list_tenant_roles`: `user_tenant_roles_output`
- `userauths_update_accessed`: `user_update_accessed_output`
- `auth_delete_session`: `auth_delete_session_output`
- `auth_check_session`: `auth_check_session_output`
- `users_update_default_tenant`: `user_update_default_tenant_output`
- `users_update_profile`: `user_update_profile_output!`
- `users_update_status`: `user_update_status_output`
- `usergroup_create`: `usergroup_create_output!`
- `usergroup_update`: `usergroup_update_output!`
- `users_create_token`: `UserTokenCreateResponse`
- `users_delete_token`: `UserTokenDeleteResponse`
- `users_create`: `users_insert_one_output`
- `cloud_check_credentials`: `ValidateCloudCredentialsOutput`
- `azure_list_subscriptions`: `AzureListSubscriptionsOutput`
- `accounts_create_azure_subscriptions_bulk`: `AzureBulkOnboardOutput`
- `gcp_list_projects`: `GcpListProjectsOutput`
- `accounts_create_gcp_projects_bulk`: `GcpBulkOnboardOutput`
- `webhook_subject_mappings_sync`: `WebhookSubjectMappingsSyncOutput!`
- `workflow_create`: `WorkflowCreateResponse`
- `workflow_delete`: `WorkflowDeleteResponse`
- `workflow_pause`: `WorkflowPauseResponse`
- `workflow_resume`: `WorkflowResumeResponse`
- `workflow_replay_execution`: `WorkflowRetriggerResponse`
- `workflow_cancel_execution`: `WorkflowCancelResponse`
- `workflow_complete_approval`: `WorkflowCompleteApprovalResponse`
- `workflow_execute`: `WorkflowTriggerResponse`
- `workflow_dryrun_execute`: `WorkflowDryrunResponse`
- `workflow_execute_task`: `jsonb`
- `workflow_list_mcp_tools`: `WorkflowListMCPToolsResponse`
- `workflow_update`: `WorkflowUpdateResponse`
- `workflow_check`: `WorkflowValidateResponse`
- `ai_cancel_watch`: `AILlmWatchCancelResponse`
- `dashboards_create`: `Dashboard`
- `dashboards_update`: `Dashboard`
- `dashboards_delete`: `DashboardDeleteResponse`

##### NBVersionResponse

**Fields:**

- `agent_version_latest`: `String!`

##### NotificationChannelAccountMappingResponse

**Fields:**

- `rows`: `[NotificationChannelAccountMappingRowResponse]`

##### NotificationChannelAccountMappingRowResponse

**Fields:**

- `id`: `String`
- `account_id`: `String`
- `platform`: `String`
- `team_id`: `String`
- `channel_id`: `String`
- `channel_metadata`: `Json`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `created_by`: `String`
- `account_name`: `String`
- `cloud_provider`: `String`
- `created_by_display_name`: `String`

##### NotificationChannelAccountMappingWhereRequest

**Fields:**

- `_and`: `[NotificationChannelAccountMappingWhereRequest]`
- `_or`: `[NotificationChannelAccountMappingWhereRequest]`
- `_not`: `NotificationChannelAccountMappingWhereRequest`
- `id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `platform`: `QueryWhereStringRequest`
- `team_id`: `QueryWhereStringRequest`
- `channel_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`

##### NotificationRule

**Fields:**

- `id`: `String`
- `account_id`: `String`
- `source`: `String`
- `created_at`: `Datetime`
- `cluster`: `String`
- `description`: `String`
- `aggregation_key`: `String`
- `expires_at`: `Datetime`
- `workload`: `String`
- `name`: `String`
- `namespace`: `String`
- `is_suppressed`: `Boolean!`
- `created_by`: `String`
- `severity`: `String`
- `delivery_mode`: `String`
- `frequency`: `String`
- `tenant_id`: `String`
- `created_by_display_name`: `String`
- `notification_rule_mappings`: `jsonb`

##### NotificationRulesAggregation

**Fields:**

- `id`: `String`
- `account_id`: `String`
- `source`: `String`
- `created_at`: `Datetime`
- `cluster`: `String`
- `name`: `String`
- `namespace`: `String`
- `is_suppressed`: `Boolean`
- `severity`: `String`
- `delivery_mode`: `String`
- `tenant_id`: `String`
- `count`: `Int`

##### NotificationRulesAggregationResponse

**Fields:**

- `rows`: `[NotificationRulesAggregation!]!`

##### NotificationRulesResponse

**Fields:**

- `rows`: `[NotificationRule!]!`

##### NotificationRulesWhereRequest

**Fields:**

- `_and`: `[NotificationRulesWhereRequest]`
- `_or`: `[NotificationRulesWhereRequest]`
- `_not`: `NotificationRulesWhereRequest`
- `id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `cluster`: `QueryWhereStringRequest`
- `aggregation_key`: `QueryWhereStringRequest`
- `workload`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `is_suppressed`: `QueryWhereBooleanRequest`
- `severity`: `QueryWhereStringRequest`
- `delivery_mode`: `QueryWhereStringRequest`
- `frequency`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `created_by_display_name`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `expires_at`: `QueryWhereDatetimeRequest`

##### NudgebeeAIGetPrometheusQuery

**Fields:**

- `response`: `[String!]!`
- `query`: `String!`
- `agent_step_response`: `[String!]!`
- `chain_name`: `String`

##### NudgebeeAIGetPrometheusQueryRequest

**Fields:**

- `account_id`: `String!`
- `query`: `String!`
- `user_id`: `String`

##### NudgebeeAIGetPrometheusQueryResponse

**Fields:**

- `data`: `NudgebeeAIGetPrometheusQuery!`

##### OTelResourceAttributes

**Fields:**

- `host_id`: `String`
- `host_name`: `String`
- `service_name`: `String`
- `cloud_account_id`: `String`
- `cloud_availability_zone`: `String`
- `cloud_region`: `String`
- `container_id`: `String`

##### OpenAIResponse

**Fields:**

- `data`: `jsonb!`

##### OperatorDescriptor

**Fields:**

- `token`: `String!`
- `chip_label`: `String`
- `line_label`: `String`
- `kinds`: `[String!]!`
- `applicable_data_types`: `[String!]`

##### OrgMemberStatus

**Fields:**

- `account_id`: `String!`
- `account_number`: `String!`
- `account_name`: `String!`
- `status`: `String!`
- `created_at`: `String`

##### OutputLogLabel

**Fields:**

- `label`: `String!`
- `attributes`: `jsonb`
- `data_type`: `String`

##### OutputLogLabelValue

**Fields:**

- `value`: `String!`
- `attributes`: `jsonb`

##### OutputMetricLabels

**Fields:**

- `label`: `String!`
- `attributes`: `jsonb`

##### OutputMetricQuery

**Fields:**

- `results`: `[jsonb]!`

##### OutputMetrics

**Fields:**

- `metric`: `String!`
- `attributes`: `jsonb`

##### OutputMetricsLabelValues

**Fields:**

- `value`: `String!`
- `attributes`: `jsonb`

##### PerformanceHost

**Fields:**

- `host_name`: `String`
- `database_load`: `Float`
- `percentage`: `Float`

##### PerformanceMetric

**Fields:**

- `name`: `String`
- `unit`: `String`
- `timestamps`: `[bigint]`
- `values`: `[Float]`

##### PerformanceQuery

**Fields:**

- `query_id`: `String`
- `query_text`: `String`
- `database_load`: `Float`
- `execution_count`: `bigint`
- `total_duration`: `Float`
- `avg_duration`: `Float`
- `min_duration`: `Float`
- `max_duration`: `Float`
- `avg_cpu_time`: `Float`
- `avg_rows_processed`: `bigint`
- `cache_hit_ratio`: `Float`

##### PerformanceUser

**Fields:**

- `user_name`: `String`
- `database_load`: `Float`
- `percentage`: `Float`

##### PerformanceWaitEvent

**Fields:**

- `event_type`: `String`
- `event_name`: `String`
- `database_load`: `Float`
- `percentage`: `Float`
- `wait_count`: `bigint`
- `total_wait_time`: `Float`
- `avg_wait_time`: `Float`

##### PermissionStatusOutput

**Fields:**

- `permission`: `String!`
- `hasAccess`: `Boolean!`
- `errorDetail`: `String`

##### PlaybookGroupResponse

**Fields:**

- `rows`: `[PlaybookGroupRowResponse]`

##### PlaybookGroupRowResponse

**Fields:**

- `count`: `Float`

##### PlaybookGroupWhereRequest

**Fields:**

- `_and`: `[PlaybookGroupWhereRequest]`
- `_or`: `[PlaybookGroupWhereRequest]`
- `_not`: `PlaybookGroupWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `trigger`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `resource_filter`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`

##### PlaybookResponse

**Fields:**

- `rows`: `[PlaybookRowResponse]`

##### PlaybookRowResponse

**Fields:**

- `id`: `String`
- `resource`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `name`: `String`
- `created_at`: `String`
- `username`: `String`
- `updated_by`: `String`
- `status`: `String`
- `last_executed_time`: `String`
- `tasks`: `String`
- `trigger`: `String`
- `updated_username`: `String`
- `updated_user_displayname`: `String`
- `display_name`: `String`
- `resource_filter`: `String`
- `attributes`: `String`
- `notification`: `jsonb`

##### PlaybookWhereRequest

**Fields:**

- `_and`: `[PlaybookWhereRequest]`
- `_or`: `[PlaybookWhereRequest]`
- `_not`: `PlaybookWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `trigger`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `resource_filter`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`

##### ProviderCapabilities

**Fields:**

- `supports_log_groups`: `Boolean!`
- `supports_auto_query`: `Boolean!`
- `supports_raw_query`: `Boolean!`
- `supports_heatmap`: `Boolean!`
- `supports_trace_grouping`: `Boolean!`
- `supports_service_map`: `Boolean!`
- `supports_cross_zone_communication`: `Boolean!`
- `supported_operators`: `[String]`
- `supported_operator_descriptors`: `[OperatorDescriptor!]`
- `label_mappings`: `jsonb`
- `default_index`: `String`

##### ProviderCapabilityEntry

**Fields:**

- `provider`: `String!`
- `provider_type`: `String!`
- `capabilities`: `ProviderCapabilities!`

##### ProviderConfig

**Fields:**

- `name`: `String`

##### Query

**Fields:**

- `integrations_aggregate`: `IntegrationAggregationResponse!`
- `integrations_list`: `IntegrationResponse!`
- `notifications_aggregate_rules`: `NotificationRulesAggregationResponse!`
- `notifications_list_rules`: `NotificationRulesResponse!`
- `usergroups_aggregate`: `UserGroupsAggregationResponse!`
- `usergroups_list`: `UserGroupsResponse!`
- `users_list_by_tenant`: `UsersByTenantResponse!`
- `users_aggregate_by_tenant`: `UsersByTenantAggregationResponse!`
- `agents_list_playbooks`: `AgentPlaybookResponse`
- `ai_get_budget_status`: `AIBudgetStatusResponse`
- `ai_list_budget_config`: `AIBudgetConfigListResponse`
- `ai_get_budget_system_defaults`: `AIBudgetSystemDefaultsResponse`
- `ai_generate_workflow`: `AIGenerateWorkflowResponse`
- `ai_get_conversation_v3`: `AiGetConversationV3Response`
- `ai_get_gc`: `GetGCResponse`
- `ai_get_kb`: `GetKBResponse`
- `ai_get_model_config`: `AIGetModelConfigResponse`
- `ai_get_rca`: `AIResponse`
- `ai_get_rcaformat`: `AIGetRcaFormatResponse`
- `ai_get_recommendation`: `AIResponse`
- `ai_remediation_generate`: `AIResponse`
- `ai_remediation_get`: `AIResponse`
- `ai_get_workspace_file`: `jsonb`
- `ai_list_agent_kbs`: `ListAgentKBsResponse`
- `ai_list_agents`: `ListAgentResponse`
- `ai_list_agents_with_kb_counts`: `ListAgentsWithKBCountsResponse`
- `ai_list_gc`: `ListGCResponse`
- `ai_list_kb`: `ListKBResponse`
- `ai_get_kb_load_history`: `GetKBLoadHistoryResponse`
- `ai_list_memory`: `ListAIMemoryResponse`
- `ai_list_models`: `AIListModelsResponse`
- `ai_list_references`: `ListAIReferencesResponse`
- `ai_list_tools`: `ListToolResponse`
- `anomaly_grouping_v2`: `AnomalyGroupingsResponse`
- `anomalies_list_v2`: `ListAnomalyResponse`
- `anomalies_list`: `ListAnomalyV3Response`
- `applications_list_profiles`: `ApplicationProfileResponse`
- `audit_groupings_v2`: `AuditGroupingResponse`
- `audits_v2`: `AuditResponse`
- `autooptimize_aggregate`: `AutoPilotGroupingsResponse`
- `autooptimize_list`: `AutoPilotResponse`
- `clusters_check_health`: `health_check_response`
- `cloud_metric_groupings_v2`: `CloudMetricGroupingsResponse`
- `event_get_filter_values`: `EventFilterValuesResponse`
- `event_groupings_v2`: `EventGroupingsResponse`
- `event_rules_groupings_v2`: `EventRulesGroupingsResponse`
- `event_rules_v2`: `EventRulesResponse`
- `events_list`: `EventsResponse`
- `agents_list_health`: `AgentHealthResponse!`
- `accounts_aggregate`: `CloudAccountAggregationResponse!`
- `accounts_list`: `CloudAccountResponse!`
- `observability_get_default_provider`: `DefaultProviderResponse`
- `observability_list_provider_capabilities`: `[ProviderCapabilityEntry]`
- `observability_get_label_mapping`: `LabelMappingResponse`
- `insights_list`: `InsightV2Response`
- `integrations_get_schema`: `IntegrationSchemaResponse`
- `integrations_autogen_options`: `IntegrationAutogenOptionsResponse`
- `k8s_cluster_groupings_v2`: `K8sClusterGroupingsResponse`
- `k8s_metrics_groupings_v2`: `K8sMetricsGroupingsResponse`
- `k8s_namespace_groupings_v2`: `K8sNamespaceGroupingsResponse`
- `k8s_namespaces_v2`: `K8sNamespaceResponse`
- `k8s_pod_groupings_v2`: `K8sPodGroupingsResponse`
- `k8s_pods_v2`: `K8sPodsResponse`
- `k8s_list_versions`: `[K8sVersionResponse]`
- `k8s_workload_groupings_v2`: `K8sWorkloadGroupingsResponse`
- `k8s_workloads_cloud_account_monitoring_recommendations_v2`: `MonitoringRecommendationsResponse`
- `k8s_workloads_cloud_account_monitoring_v2`: `MonitoringResponse`
- `k8s_workloads_v2`: `K8sWorkloadResponse`
- `kg_get_filter_options`: `kg_get_filter_options_output`
- `kg_get_filter_values`: `kg_get_filter_values_output`
- `kg_get_tenant_filter`: `kg_get_tenant_filter_output`
- `ai_list_conversation_feedback`: `GetFeedbackResponse`
- `log_group`: `LogGroupOutput`
- `logs_list_label_values`: `[OutputLogLabelValue]`
- `logs_list_labels`: `[OutputLogLabel]`
- `logs_list`: `[FetchLogResponse]`
- `messagingplatforms_list`: `messaging_platform_list_output`
- `metric_groupings_v2`: `MetricGroupingsResponse`
- `metrics_list_names`: `[OutputMetrics]`
- `metrics_list_label_values`: `[OutputMetricsLabelValues]`
- `metrics_list_labels`: `[OutputMetricLabels]`
- `metrics_list`: `OutputMetricQuery`
- `metrics_aggregate_utilisation`: `OutputMetricQuery`
- `metrics_get_query`: `FetchMetricQueryOutput`
- `ml_get_metrics`: `metrics_response`
- `nudgebee_list_versions`: `NBVersionResponse`
- `notifications_list_channels`: `notification_channel_list_resp`
- `notifications_google_chat_permission_status`: `gchat_permission_status_resp`
- `notification_get_user_list`: `notification_user_list_resp`
- `recommendation_groupings_v2`: `RecommendationGroupingResponse`
- `recommendation_security_cis_groupings_v2`: `RecommendationSecurityCisGroupingsResponse`
- `recommendation_security_groupings_v2`: `RecommendationSecurityGroupingsResponse`
- `recommendation_security_v2`: `RecommendationSecurityResponse`
- `recommendations_list`: `RecommendationResponse`
- `resource_groupings_v2`: `ResourceGroupingsResponse`
- `slo_config_v2`: `SloConfigResponse`
- `slo_report_observation_v2`: `SloReportObservationResponse`
- `slo_report_v2`: `SloReportResponse`
- `spend_groupings_v2`: `SpendGroupingsResponse`
- `tenant_attributes_v2`: `TenantAttributesResponse`
- `signup_check_token`: `[tenant_onboarding_record!]!`
- `ticket_get_comments`: `TicketComments!`
- `ticket_groupings_v2`: `TicketGroupingsResponse`
- `tickets_get_create_meta`: `ticket_create_meta_response`
- `tickets_get_field_values`: `ticket_field_values_response`
- `tickets_list`: `TicketsResponse`
- `traces_counts`: `TracesV3CountResponse`
- `traces_grouping_count_v3`: `TracesGroupV3CountResponse`
- `traces_grouping_v3`: `[TraceGroupingValues]!`
- `traces_groupings_v2`: `TracesGroupResponse`
- `traces_get_heatmap`: `[TraceHeatMapOutput]`
- `traces_heatmap_v2`: `TracesHeatMapResponse`
- `traces_label_values`: `TracesV3LabelValuesResponse`
- `traces_list`: `[TracesOutputResponse]!`
- `traces_v2`: `TracesResponse`
- `upgrade_plan_audit_v2`: `UpgradePlanAuditResponse`
- `upgrade_plan_fetch_all`: `[UpgradePlanResponse]`
- `users_list_account_ids_by_tenant`: `UserAccountIdsByTenantResponse`
- `users_get_by_provider_account`: `UserByProviderAccountResponse`
- `users_get_details`: `UserDetailsResponse`
- `users_get_super_admin_role`: `UserSuperAdminRoleResponse`
- `users_list_token`: `UserAuthTokenResponse`
- `workflow_get`: `Workflow`
- `workflows_count`: `WorkflowCountResponse`
- `workflow_get_execution`: `WorkflowExecutionGetResponse`
- `workflows_count_executions`: `WorkflowExecutionCountResponse`
- `executions_list`: `AccountExecutionListResponse`
- `executions_aggregate`: `ExecutionAggregateResponse`
- `workflow_get_template`: `WorkflowTemplateType`
- `workflow_list`: `WorkflowListResponse`
- `workflow_list_executions`: `WorkflowExecutionListResponse`
- `workflow_list_executions_for_event`: `WorkflowExecutionListResponse`
- `workflow_list_taskdefinitions`: `WorkflowTaskDefinitionListResponse`
- `workflow_list_callers`: `WorkflowListCallersResponse`
- `workflow_list_template`: `WorkflowTemplateListResponse`
- `tenant_list_all`: `[tenant_list_all_output!]!`
- `users_list_status_types`: `[user_status_types_list_item!]!`
- `roles_list`: `[roles_list_item!]!`
- `users_list_tenants`: `[user_list_tenants_item!]!`
- `usergroups_check_name_exists`: `[check_group_name_exists_item!]!`
- `event_get_recurrence_info`: `event_get_recurrence_info_output!`
- `billing_list`: `billing_list_output!`
- `billing_list_usage_costs`: `billing_usage_cost_list_output!`
- `billing_aggregate`: `billing_infographics_output!`
- `k8s_nodes_v2`: `K8sNodesResponse`
- `k8s_nodes_groupings_v2`: `K8sNodesGroupingsResponse`
- `cloud_resource_v2`: `CloudResourcesResponse`
- `resource_details_v2`: `ResourceDetailsResponse`
- `cloud_resource_attributes_v2`: `CloudResourceAttributesResponse`
- `cloud_resource_groupings_v2`: `CloudResourceGroupingsResponse`
- `notification_channel_account_mapping_v2`: `NotificationChannelAccountMappingResponse`
- `applications_list_groups`: `ApplicationGroupResponse`
- `applications_aggregate_groups`: `ApplicationGroupGroupingsResponse`
- `applications_list_group_mappings`: `ApplicationGroupMappingResponse`
- `applications_aggregate_group_mappings`: `ApplicationGroupMappingGroupingsResponse`
- `autooptimize_list_tasks`: `AutoPilotTaskResponse`
- `autooptimize_aggregate_tasks`: `AutoPilotTaskGroupingsResponse`
- `autooptimize_list_approvals`: `AutoPilotApprovalsResponse`
- `autooptimize_aggregate_approvals`: `AutoPilotApprovalsGroupingsResponse`
- `autooptimize_list_approval_policies`: `AutoPilotApprovalPolicyResponse`
- `recommendation_resolution_v2`: `RecommendationResolutionResponse`
- `recommendation_resolution_groupings_v2`: `RecommendationResolutionGroupingsResponse`
- `event_resolution_v2`: `EventResolutionResponse`
- `event_resolution_groupings_v2`: `EventResolutionGroupingsResponse`
- `ai_list_functions`: `LlmFunctionsResponse`
- `ai_list_agent_installations`: `LlmAgentsInstallationResponse`
- `cloud_resource_details_v2`: `CloudResourceDetailsResponse!`
- `cloud_resources_list_v2`: `CloudResourcesListResponse`
- `cloud_vm_packages_v2`: `CloudVmPackagesResponse`
- `cloud_vm_package_groupings_v2`: `CloudVmPackageGroupingsResponse`
- `ai_list_conversations`: `LlmConversationListResponse!`
- `ai_get_conversation_detail_polling`: `LlmConversationDetailResponse!`
- `ai_aggregate_conversations`: `LlmConversationGroupingsResponse!`
- `resource_spend_trend_v2`: `ResourceSpendTrendResponse`
- `knowledge_base_v2`: `KnowledgeBaseResponse`
- `featureflags_list`: `FeatureFlagResponse`
- `users_list_history`: `UserHistoryResponse`
- `tenants_list`: `TenantResponse`
- `features_list`: `FeatureResponse`
- `tenant_by_user_v2`: `TenantByUserResponse`
- `cloud_account_attrs_v2`: `CloudAccountAttrsResponse`
- `usergroups_list_users`: `UsergroupUsersResponse`
- `usergroups_aggregate_users`: `UsergroupUsersGroupingResponse`
- `users_get_auth_by_username`: `UserAuthByUsernameResponse`
- `anomaly_type_v2`: `AnomalyTypeResponse!`
- `cloud_resource_metrics_v2`: `CloudResourceMetricsResponse!`
- `ai_list_watches_by_conversation`: `AILlmWatchListResponse`
- `dashboards_list`: `[Dashboard]`
- `dashboards_get`: `DashboardGetResponse`
- `dashboards_list_contextual`: `[Dashboard]`
- `dashboards_list_versions`: `[DashboardVersion]`

##### QueryColumnInput

**Fields:**

- `name`: `String`
- `expr`: `String`
- `args`: `[String!]`

##### QueryColumnTransformationRequest

**Fields:**

- `name`: `String!`
- `expr`: `String!`
- `args`: `[String!]`

##### QueryDatabasePerformanceRequest

**Fields:**

- `account_id`: `String!`
- `database_identifier`: `String!`
- `region`: `String!`
- `start_time`: `timestamp`
- `end_time`: `timestamp`
- `granularity_seconds`: `Int`
- `include_top_queries`: `Boolean`
- `include_wait_events`: `Boolean`
- `include_top_users`: `Boolean`
- `include_top_hosts`: `Boolean`
- `top_n`: `Int`

##### QueryDatabasePerformanceResponse

**Fields:**

- `database_identifier`: `String`
- `provider`: `String`
- `performance_enabled`: `Boolean`
- `load_metrics`: `[PerformanceMetric]`
- `resource_metrics`: `[PerformanceMetric]`
- `top_queries`: `[PerformanceQuery]`
- `wait_events`: `[PerformanceWaitEvent]`
- `top_users`: `[PerformanceUser]`
- `top_hosts`: `[PerformanceHost]`
- `metadata`: `jsonb`

##### QueryOrderByInput

**Fields:**

- `column`: `String`
- `order`: `String`

##### QueryRequestInput

**Fields:**

- `table`: `String`
- `columns`: `[QueryColumnInput!]`
- `where`: `jsonb`
- `group_by`: `[String!]`
- `having`: `jsonb`
- `limit`: `Int`
- `offset`: `Int`
- `order_by`: `[QueryOrderByInput!]`

##### QuerySortByRequest

**Fields:**

- `column`: `String!`
- `order`: `QuerySortOrderRequest`

##### QuerySortOrderRequest

**Values:**

- `asc`
- `desc`
- `desc_nulls_last`
- `desc_nulls_first`
- `asc_nulls_last`
- `asc_nulls_first`

##### QueryWhereBooleanRequest

**Fields:**

- `_eq`: `Boolean`
- `_neq`: `Boolean`
- `_is_null`: `Boolean`

##### QueryWhereClauseInput

**Fields:**

- `_binary`: `QueryWhereClauseInput`
- `_and`: `[QueryWhereClauseInput!]`
- `_or`: `[QueryWhereClauseInput!]`
- `_not`: `QueryWhereClauseInput`
- `string`: `QueryWhereStringRequest`
- `int`: `QueryWhereIntRequest`
- `float`: `QueryWhereFloatRequest`
- `datetime`: `QueryWhereDatetimeRequest`
- `boolean`: `QueryWhereBooleanRequest`

##### QueryWhereDatetimeBetweenRequest

**Fields:**

- `_gte`: `Datetime`
- `_gt`: `Datetime`
- `_lt`: `Datetime`
- `_lte`: `Datetime`

##### QueryWhereDatetimeRequest

**Fields:**

- `_eq`: `Datetime`
- `_eq_f`: `String`
- `_neq`: `Datetime`
- `_neq_f`: `String`
- `_in`: `[Datetime!]`
- `_lt`: `Datetime`
- `_lt_f`: `String`
- `_gt`: `Datetime`
- `_gt_f`: `String`
- `_lte`: `Datetime`
- `_lte_f`: `String`
- `_gte`: `Datetime`
- `_gte_f`: `String`
- `_between`: `QueryWhereDatetimeBetweenRequest`
- `_is_null`: `Boolean`

##### QueryWhereFloatBetweenRequest

**Fields:**

- `_gte`: `Float`
- `_gt`: `Float`
- `_lt`: `Float`
- `_lte`: `Float`
- `_is_null`: `Boolean`

##### QueryWhereFloatRequest

**Fields:**

- `_eq`: `Float`
- `_eq_f`: `String`
- `_neq`: `Float`
- `_neq_f`: `String`
- `_in`: `[Float!]`
- `_lt`: `Float`
- `_lt_f`: `String`
- `_gt`: `Float`
- `_gt_f`: `String`
- `_lte`: `Float`
- `_lte_f`: `String`
- `_gte`: `Float`
- `_gte_f`: `String`
- `_between`: `QueryWhereFloatBetweenRequest`
- `_is_null`: `Boolean`

##### QueryWhereIntBetweenRequest

**Fields:**

- `_gte`: `Int`
- `_gt`: `Int`
- `_lt`: `Int`
- `_lte`: `Int`

##### QueryWhereIntRequest

**Fields:**

- `_eq`: `Int`
- `_eq_f`: `String`
- `_neq`: `Int`
- `_neq_f`: `String`
- `_in`: `[Int!]`
- `_lt`: `Int`
- `_lt_f`: `String`
- `_gt`: `Int`
- `_gt_f`: `String`
- `_lte`: `Int`
- `_lte_f`: `String`
- `_gte`: `Int`
- `_get_f`: `String`
- `_between`: `QueryWhereIntBetweenRequest`

##### QueryWhereStringRequest

**Fields:**

- `_eq`: `String`
- `_eq_f`: `String`
- `_neq`: `String`
- `_neq_f`: `String`
- `_in`: `[String!]`
- `_not_in`: `[String!]`
- `_like`: `String`
- `_like_f`: `String`
- `_ilike`: `String`
- `_ilike_f`: `String`
- `_contains`: `String`
- `_has_key`: `String`
- `_is_null`: `Boolean`
- `_nlike`: `String`

##### RagDataInput

**Fields:**

- `data`: `jsonb!`
- `format`: `String`
- `filename`: `String`

##### RecommendationGroupingResponse

**Fields:**

- `rows`: `[RecommendationGroupingRowResponse]`

##### RecommendationGroupingRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `category`: `String`
- `rule_name`: `String`
- `status`: `String`
- `timestamp`: `Datetime`
- `resource_type`: `String`
- `resource_k8s_namespace`: `String`
- `resource_cloud_service`: `String`
- `resource_name`: `String`
- `count`: `Int`
- `sum_estimated_savings`: `Float`
- `severity`: `String`
- `safety_band`: `String`
- `account_object_id`: `String`
- `vuln_id`: `String`
- `package_name`: `String`
- `max_severity_weight`: `Float`

##### RecommendationGroupingWhereRequest

**Fields:**

- `_and`: `[RecommendationGroupingWhereRequest]`
- `_or`: `[RecommendationGroupingWhereRequest]`
- `_not`: `RecommendationGroupingWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `rule_name`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`
- `resource_k8s_namespace`: `QueryWhereStringRequest`
- `resource_cloud_service`: `QueryWhereStringRequest`
- `resource_name`: `QueryWhereStringRequest`
- `timestamp`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `estimated_savings`: `QueryWhereFloatRequest`
- `account_object_id`: `QueryWhereStringRequest`
- `recommendation`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `deleted_version`: `QueryWhereStringRequest`
- `deprecated_version`: `QueryWhereStringRequest`
- `safety_band`: `QueryWhereStringRequest`

##### RecommendationMissConfigGroupingResponse

**Fields:**

- `rows`: `[RecommendationMissConfigGroupingRowResponse]`

##### RecommendationMissConfigGroupingRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `category`: `String`
- `rule_name`: `String`
- `status`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `missconfig_category`: `String`
- `missconfig_message`: `String`
- `resource_type`: `String`
- `resource_k8s_namespace`: `String`
- `resource_k8s_container`: `String`
- `resource_name`: `String`
- `estimated_savings`: `String`
- `account_object_id`: `String`
- `count`: `Int`
- `sum_estimated_savings`: `Float`

##### RecommendationMissConfigGroupingWhereRequest

**Fields:**

- `_and`: `[RecommendationMissConfigGroupingWhereRequest]`
- `_or`: `[RecommendationMissConfigGroupingWhereRequest]`
- `_not`: `RecommendationMissConfigGroupingWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `rule_name`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `missconfig_category`: `QueryWhereStringRequest`
- `missconfig_message`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`
- `resource_k8s_namespace`: `QueryWhereStringRequest`
- `resource_k8s_container`: `QueryWhereStringRequest`
- `resource_name`: `QueryWhereStringRequest`
- `estimated_savings`: `QueryWhereFloatRequest`
- `account_object_id`: `QueryWhereStringRequest`

##### RecommendationMissConfigResponse

**Fields:**

- `rows`: `[RecommendationMissConfigRowResponse]`

##### RecommendationMissConfigRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `category`: `String`
- `rule_name`: `String`
- `status`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `missconfig_category`: `String`
- `missconfig_message`: `String`
- `resource_type`: `String`
- `resource_k8s_namespace`: `String`
- `resource_k8s_container`: `String`
- `resource_name`: `String`
- `estimated_savings`: `String`
- `account_object_id`: `String`

##### RecommendationMissConfigWhereRequest

**Fields:**

- `_and`: `[RecommendationMissConfigWhereRequest]`
- `_or`: `[RecommendationMissConfigWhereRequest]`
- `_not`: `RecommendationMissConfigWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `rule_name`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `missconfig_category`: `QueryWhereStringRequest`
- `missconfig_message`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`
- `resource_k8s_namespace`: `QueryWhereStringRequest`
- `resource_k8s_container`: `QueryWhereStringRequest`
- `resource_name`: `QueryWhereStringRequest`
- `estimated_savings`: `QueryWhereFloatRequest`
- `account_object_id`: `QueryWhereStringRequest`

##### RecommendationResolutionGroupingsResponse

**Fields:**

- `rows`: `[RecommendationResolutionGroupingsRowResponse]`

##### RecommendationResolutionGroupingsRowResponse

**Fields:**

- `count`: `Int`
- `resolver_type`: `String`
- `type`: `String`
- `recommendation_id`: `String`

##### RecommendationResolutionGroupingsWhereRequest

**Fields:**

- `_and`: `[RecommendationResolutionGroupingsWhereRequest]`
- `_or`: `[RecommendationResolutionGroupingsWhereRequest]`
- `_not`: `RecommendationResolutionGroupingsWhereRequest`
- `recommendation_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `resolver_type`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`

##### RecommendationResolutionResponse

**Fields:**

- `rows`: `[RecommendationResolutionRowResponse]`

##### RecommendationResolutionRowResponse

**Fields:**

- `id`: `String`
- `recommendation_id`: `String`
- `type`: `String`
- `type_reference_id`: `String`
- `status`: `String`
- `status_message`: `String`
- `resolver_id`: `String`
- `resolver_type`: `String`
- `data`: `Json`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `tenant_id`: `String`
- `account_id`: `String`
- `rec_recommendation`: `String`
- `rec_rule_name`: `String`
- `rec_severity`: `String`
- `rec_status`: `String`
- `rec_recommendation_action`: `String`
- `rec_category`: `String`
- `rec_estimated_savings`: `Float`
- `rec_resource_name`: `String`
- `rec_resource_meta`: `Json`
- `resolver_display_name`: `String`

##### RecommendationResolutionWhereRequest

**Fields:**

- `_and`: `[RecommendationResolutionWhereRequest]`
- `_or`: `[RecommendationResolutionWhereRequest]`
- `_not`: `RecommendationResolutionWhereRequest`
- `id`: `QueryWhereStringRequest`
- `recommendation_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `resolver_type`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`

##### RecommendationResponse

**Fields:**

- `rows`: `[RecommendationRowResponse]`

##### RecommendationRowResponse

**Fields:**

- `id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `recommendation`: `Json`
- `recommendation_action`: `String`
- `note`: `String`
- `severity`: `String`
- `severity_weight`: `Int`
- `estimated_savings`: `Float`
- `status`: `String`
- `category`: `String`
- `rule_name`: `String`
- `dismissed_reason`: `String`
- `is_dismissed`: `Boolean`
- `snoozed_until`: `Datetime`
- `account_object_id`: `String`
- `updated_by`: `String`
- `resource_k8s_namespace`: `String`
- `resource_meta`: `Json`
- `resource_name`: `String`
- `resource_type`: `String`
- `resource_cloud_service`: `String`
- `resource_is_active`: `Boolean`
- `resource_cloud_provider`: `String`
- `resource_arn`: `String`
- `resource_region`: `String`
- `resource_status`: `String`
- `is_primary_recommendation`: `Boolean`
- `finops_score`: `Int`
- `finops_band`: `String`
- `finops_score_breakdown`: `Json`
- `safety_band`: `String`
- `vuln_id`: `String`
- `package_name`: `String`

##### RecommendationSecurityCisGroupingRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `severity`: `String`
- `severity_weight`: `Int`
- `rule_id`: `String`
- `rule_name`: `String`
- `rule_description`: `String`
- `count`: `Int`
- `updated_at`: `Datetime`
- `status`: `String`

##### RecommendationSecurityCisGroupingsResponse

**Fields:**

- `rows`: `[RecommendationSecurityCisGroupingRowResponse]`

##### RecommendationSecurityCisGroupingsWhereRequest

**Fields:**

- `_and`: `[RecommendationSecurityCisGroupingsWhereRequest]`
- `_or`: `[RecommendationSecurityCisGroupingsWhereRequest]`
- `_not`: `RecommendationSecurityCisGroupingsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `severity_weight`: `QueryWhereIntRequest`
- `rule_id`: `QueryWhereStringRequest`
- `rule_name`: `QueryWhereStringRequest`
- `rule_description`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`

##### RecommendationSecurityGroupingsResponse

**Fields:**

- `rows`: `[RecommendationSecurityGroupingsRowResponse]`

##### RecommendationSecurityGroupingsRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `severity`: `String`
- `severity_weight`: `Int`
- `status`: `String`
- `image`: `String`
- `vulnerability_id`: `String`
- `package_id`: `String`
- `created_at`: `Datetime`
- `is_active`: `Boolean`
- `workload_name`: `String`
- `workload_type`: `String`
- `namespace`: `String`
- `count`: `Int`
- `count_severity_critical`: `Int`
- `count_severity_high`: `Int`
- `count_severity_medium`: `Int`
- `count_severity_low`: `Int`
- `count_severity_info`: `Int`
- `count_workload_name`: `Int`
- `count_image`: `Int`
- `count_vulnerability_id`: `Int`
- `count_package_id`: `Int`

##### RecommendationSecurityGroupingsWhereRequest

**Fields:**

- `_and`: `[RecommendationSecurityGroupingsWhereRequest]`
- `_or`: `[RecommendationSecurityGroupingsWhereRequest]`
- `_not`: `RecommendationSecurityGroupingsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `severity_weight`: `QueryWhereIntRequest`
- `status`: `QueryWhereStringRequest`
- `image`: `QueryWhereStringRequest`
- `vulnerability_id`: `QueryWhereStringRequest`
- `package_id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `workload_name`: `QueryWhereStringRequest`
- `workload_type`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`

##### RecommendationSecurityResponse

**Fields:**

- `rows`: `[RecommendationSecurityRowResponse]`

##### RecommendationSecurityRowResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `severity`: `String`
- `severity_weight`: `Int`
- `status`: `String`
- `image`: `String`
- `vulnerability_id`: `String`
- `package_id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `is_active`: `Boolean`
- `workload_name`: `String`
- `workload_type`: `String`
- `namespace`: `String`
- `recommendation`: `Json`

##### RecommendationSecurityWhereRequest

**Fields:**

- `_and`: `[RecommendationSecurityWhereRequest]`
- `_or`: `[RecommendationSecurityWhereRequest]`
- `_not`: `RecommendationSecurityWhereRequest`
- `id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `severity_weight`: `QueryWhereIntRequest`
- `status`: `QueryWhereStringRequest`
- `image`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `is_active`: `QueryWhereBooleanRequest`
- `workload_name`: `QueryWhereStringRequest`
- `workload_type`: `QueryWhereStringRequest`
- `namespace`: `QueryWhereStringRequest`
- `vulnerability_id`: `QueryWhereStringRequest`
- `package_id`: `QueryWhereStringRequest`

##### RecommendationWhereRequest

**Fields:**

- `_and`: `[RecommendationWhereRequest]`
- `_or`: `[RecommendationWhereRequest]`
- `_not`: `RecommendationWhereRequest`
- `id`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `recommendation_action`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `estimated_savings`: `QueryWhereFloatRequest`
- `status`: `QueryWhereStringRequest`
- `category`: `QueryWhereStringRequest`
- `rule_name`: `QueryWhereStringRequest`
- `is_dismissed`: `QueryWhereBooleanRequest`
- `account_object_id`: `QueryWhereStringRequest`
- `updated_by`: `QueryWhereStringRequest`
- `resource_k8s_namespace`: `QueryWhereStringRequest`
- `resource_name`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`
- `resource_cloud_service`: `QueryWhereStringRequest`
- `recommendation`: `QueryWhereStringRequest`
- `deleted_version`: `QueryWhereStringRequest`
- `deprecated_version`: `QueryWhereStringRequest`
- `is_primary_recommendation`: `QueryWhereBooleanRequest`
- `safety_band`: `QueryWhereStringRequest`

##### RelayForwardOutput

**Fields:**

- `data`: `jsonb`

##### ResourceDetailsResponse

**Fields:**

- `rows`: `[ResourceDetailsRowResponse]`

##### ResourceDetailsRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `arn`: `String`
- `type`: `String`
- `status`: `String`
- `meta`: `Json`
- `tags`: `Json`
- `account`: `String`
- `region`: `String`
- `service_name`: `String`
- `first_seen`: `Datetime`
- `last_seen`: `Datetime`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `resource_created_on`: `Datetime`
- `account_name`: `String`
- `cloud_provider`: `String`
- `account_synced_at`: `Datetime`
- `account_type`: `String`
- `sync_status`: `String`
- `spend_amount`: `Float`
- `recommendation_count`: `Int`
- `recommendation_estimated_savings`: `Float`
- `critical_recommendation_count`: `Int`

##### ResourceDetailsWhereRequest

**Fields:**

- `_and`: `[ResourceDetailsWhereRequest]`
- `_or`: `[ResourceDetailsWhereRequest]`
- `_not`: `ResourceDetailsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `account`: `QueryWhereStringRequest`
- `tenant`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `spend_date`: `QueryWhereDatetimeRequest`

##### ResourceGroupingsResponse

**Fields:**

- `rows`: `[ResourceGroupingsRowResponse]`

##### ResourceGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_service_name`: `String`
- `resource_id`: `String`
- `resource_name`: `String`
- `resource_status`: `String`
- `resource_type`: `String`
- `resource_region`: `String`
- `resource_arn`: `String`
- `resource_tags`: `String`
- `spend_date`: `Datetime`
- `recommendation_rule_name`: `String`
- `recommendation_category`: `String`
- `recommendation_status`: `String`
- `recommendation_severity`: `String`
- `count_resource`: `Int`
- `sum_spend_amount`: `Float`
- `count_recommendation`: `Int`
- `sum_recommendation_estimated_savings`: `Float`

##### ResourceGroupingsWhereRequest

**Fields:**

- `_and`: `[ResourceGroupingsWhereRequest]`
- `_or`: `[ResourceGroupingsWhereRequest]`
- `_not`: `ResourceGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_service_name`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `resource_name`: `QueryWhereStringRequest`
- `resource_status`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`
- `resource_region`: `QueryWhereStringRequest`
- `resource_arn`: `QueryWhereStringRequest`
- `spend_date`: `QueryWhereDatetimeRequest`
- `recommendation_rule_name`: `QueryWhereStringRequest`
- `recommendation_category`: `QueryWhereStringRequest`
- `recommendation_status`: `QueryWhereStringRequest`
- `recommendation_severity`: `QueryWhereStringRequest`
- `resource_tags`: `QueryWhereStringRequest`

##### ResourceSpendTrendResponse

**Fields:**

- `rows`: `[ResourceSpendTrendRowResponse]`

##### ResourceSpendTrendRowResponse

**Fields:**

- `spend_date`: `Datetime`
- `spend_amount`: `Float`
- `spend_count`: `Int`
- `currency_type`: `String`
- `account_id`: `String`
- `tenant_id`: `String`
- `resource_external_id`: `String`

##### ResourceSpendTrendWhereRequest

**Fields:**

- `_and`: `[ResourceSpendTrendWhereRequest]`
- `_or`: `[ResourceSpendTrendWhereRequest]`
- `_not`: `ResourceSpendTrendWhereRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_external_id`: `QueryWhereStringRequest`
- `spend_date`: `QueryWhereDatetimeRequest`
- `exclude_aggregate`: `QueryWhereBooleanRequest`

##### RetriggerKBRequest

**Fields:**

- `account_id`: `String!`
- `kb_id`: `String!`

##### RetriggerKBResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### RulePreviewSampleEvent

**Fields:**

- `id`: `String!`
- `title`: `String!`
- `namespace`: `String`
- `service`: `String`

##### SLOConfigCreateRequest

**Fields:**

- `name`: `String!`
- `threshold`: `Float`
- `goal`: `Float`
- `enabled`: `Boolean!`

##### SLOConfigListResponse

**Fields:**

- `data`: `SLOListResponse!`

##### SLOConfigResponse

**Fields:**

- `id`: `String!`
- `name`: `String!`
- `threshold`: `Float!`
- `enabled`: `Boolean!`
- `goal`: `String`

##### SLOConfigUpdateRequest

**Fields:**

- `id`: `uuid!`
- `name`: `String!`
- `threshold`: `Float`
- `goal`: `Float`
- `enabled`: `Boolean!`

##### SLOCreateRequest

**Fields:**

- `cloud_account_id`: `String!`
- `workload_id`: `String!`
- `workload_name`: `String!`
- `namespace`: `String!`
- `config`: `[SLOConfigCreateRequest]`

##### SLOCreateResponse

**Fields:**

- `success`: `Boolean!`

##### SLODeleteConfigResponse

**Fields:**

- `data`: `SLODeleteResponse!`

##### SLODeleteRequest

**Fields:**

- `cloud_account_id`: `String!`
- `workload_name`: `String!`
- `namespace`: `String!`
- `name`: `String`

##### SLODeleteResponse

**Fields:**

- `success`: `Boolean!`

##### SLOListRequest

**Fields:**

- `cloud_account_id`: `String!`
- `workload_id`: `[String]`
- `workload_name`: `[String]`
- `namespace`: `[String]`

##### SLOListResponse

**Fields:**

- `cloud_account_id`: `String!`
- `workload_id`: `String!`
- `workload_name`: `String!`
- `namespace`: `String!`
- `config`: `[SLOConfigResponse]`

##### SLOResponse

**Fields:**

- `data`: `SLOCreateResponse!`

##### SLOUpdateConfigResponse

**Fields:**

- `data`: `SLOUpdateResponse!`

##### SLOUpdateRequest

**Fields:**

- `cloud_account_id`: `String!`
- `workload_id`: `String!`
- `workload_name`: `String!`
- `namespace`: `String!`
- `config`: `[SLOConfigUpdateRequest]`

##### SLOUpdateResponse

**Fields:**

- `success`: `Boolean!`

##### SaveLLMConversationRequest

**Fields:**

- `conversation_id`: `String!`

##### SaveLLMConversationResponse

**Fields:**

- `data`: `SaveResponse!`

##### SaveResponse

**Fields:**

- `success`: `Boolean!`

##### ServiceApplication

**Fields:**

- `Id`: `ServiceApplicationId!`
- `Category`: `ServiceCategory`
- `Labels`: `jsonb`
- `Status`: `Int`
- `Indicators`: `[String]`
- `Upstreams`: `[Link]`
- `Downstreams`: `[Link]`
- `Instances`: `[Instance]`
- `Type`: `[String]`
- `DesiredInstances`: `Int`
- `FailedInstances`: `Int`
- `OOMKills`: `Int`
- `Restarts`: `Int`
- `CPUThrottlingTime`: `float8`
- `VolumeSize`: `float8`
- `VolumeUsed`: `float8`
- `IsHealthy`: `Boolean`
- `HealthReason`: `String`

##### ServiceApplicationId

**Fields:**

- `name`: `String!`
- `kind`: `String`
- `namespace`: `String`

##### ServiceCategory

**Fields:**

- `category`: `String`

##### ServiceMap

**Fields:**

- `labels`: `[String]`
- `applications`: `[ServiceApplication]`
- `generated_at`: `timestamp`

##### ServiceMapResponse

**Fields:**

- `data`: `ServiceMap`

##### SetupGcpMonitoringWebhookInput

**Fields:**

- `account_id`: `String!`
- `webhook_url`: `String!`

##### SetupGcpMonitoringWebhookOutput

**Fields:**

- `channel_name`: `String`

##### SloConfigResponse

**Fields:**

- `rows`: `[SloConfigRowResponse]`

##### SloConfigRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `description`: `String`
- `schedule`: `String`
- `created_by`: `String`
- `updated_by`: `String`
- `filter_good_query`: `String`
- `filter_bad_query`: `String`
- `threshold`: `Float`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `method`: `String`
- `histogram_query`: `String`
- `cloud_account_id`: `String`
- `tenant_id`: `String`
- `window`: `Float`
- `workload_name`: `String`
- `workload_namespace`: `String`
- `goal`: `Float`
- `enabled`: `Boolean`

##### SloConfigWhereRequest

**Fields:**

- `_and`: `[SloConfigWhereRequest]`
- `_or`: `[SloConfigWhereRequest]`
- `_not`: `SloConfigWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `description`: `QueryWhereStringRequest`
- `method`: `QueryWhereStringRequest`
- `workload_name`: `QueryWhereStringRequest`
- `workload_namespace`: `QueryWhereStringRequest`
- `enabled`: `QueryWhereBooleanRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `window`: `QueryWhereFloatRequest`
- `goal`: `QueryWhereFloatRequest`
- `threshold`: `QueryWhereFloatRequest`

##### SloReportGroupingsResponse

**Fields:**

- `rows`: `[SloReportGroupingsRowResponse]`

##### SloReportGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `cloud_account_id`: `String`
- `workload_name`: `String`
- `workload_namespace`: `String`
- `status`: `String`
- `config_id`: `String`
- `timestamp`: `Datetime`
- `count`: `Int`

##### SloReportGroupingsWhereRequest

**Fields:**

- `_and`: `[SloReportGroupingsWhereRequest]`
- `_or`: `[SloReportGroupingsWhereRequest]`
- `_not`: `SloReportGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `workload_name`: `QueryWhereStringRequest`
- `workload_namespace`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `config_id`: `QueryWhereStringRequest`
- `timestamp`: `QueryWhereDatetimeRequest`

##### SloReportObservationResponse

**Fields:**

- `rows`: `[SloReportObservationRowResponse]`

##### SloReportObservationRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `timestamp`: `Datetime`
- `workload_namespace`: `String`
- `workload_name`: `String`
- `config_name`: `String`
- `total_good_events`: `String`
- `total_bad_events`: `String`
- `total_events`: `String`
- `status`: `String`

##### SloReportObservationWhereRequest

**Fields:**

- `_and`: `[SloReportObservationWhereRequest]`
- `_or`: `[SloReportObservationWhereRequest]`
- `_not`: `SloReportObservationWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `timestamp`: `QueryWhereDatetimeRequest`
- `workload_namespace`: `QueryWhereStringRequest`
- `workload_name`: `QueryWhereStringRequest`

##### SloReportResponse

**Fields:**

- `rows`: `[SloReportRowResponse]`

##### SloReportRowResponse

**Fields:**

- `id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `config_id`: `String`
- `status`: `String`
- `cloud_account_id`: `String`
- `tenant_id`: `String`
- `workload_name`: `String`
- `workload_namespace`: `String`
- `error_budget_burn_rate`: `Float`
- `events_count`: `Float`
- `good_events_count`: `Float`
- `bad_events_count`: `Float`
- `sli_measurement`: `Float`
- `slo_config`: `jsonb`

##### SloReportWhereRequest

**Fields:**

- `_and`: `[SloReportWhereRequest]`
- `_or`: `[SloReportWhereRequest]`
- `_not`: `SloReportWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `cloud_account_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `config_id`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `workload_name`: `QueryWhereStringRequest`
- `workload_namespace`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`
- `timestamp`: `QueryWhereDatetimeRequest`

##### SortField

**Fields:**

- `column_name`: `String!`
- `order`: `String!`

##### SortFieldInput

**Fields:**

- `column_name`: `String!`
- `order`: `String!`

##### SpendGroupingsResponse

**Fields:**

- `rows`: `[SpendGroupingsRowResponse]`

##### SpendGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `resource_id`: `String`
- `resource_service_name`: `String`
- `resource_region`: `String`
- `resource_type`: `String`
- `spend_date`: `Datetime`
- `spend_amount`: `Float`
- `spend_count`: `Float`
- `resource_count`: `Float`
- `account_count`: `Float`
- `currency_type`: `String`

##### SpendGroupingsWhereRequest

**Fields:**

- `_and`: `[SpendGroupingsWhereRequest]`
- `_or`: `[SpendGroupingsWhereRequest]`
- `_not`: `SpendGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `resource_id`: `QueryWhereStringRequest`
- `resource_service_name`: `QueryWhereStringRequest`
- `resource_region`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`
- `spend_date`: `QueryWhereDatetimeRequest`
- `exclude_aggregate`: `QueryWhereBooleanRequest`
- `amount`: `QueryWhereFloatRequest`

##### SpendsResponse

**Fields:**

- `rows`: `[SpendsRowResponse]`

##### SpendsRowResponse

**Fields:**

- `id`: `String`
- `date`: `Datetime`
- `amount`: `Float`
- `unit`: `String`
- `business_unit`: `String`
- `tenant`: `String`
- `cloud_account`: `String`
- `cloud_resource_id`: `String`
- `exclude_aggregate`: `Boolean`
- `resource_service_name`: `String`
- `resource_region`: `String`
- `resource_type`: `String`
- `tags`: `Json`

##### SpendsWhereRequest

**Fields:**

- `_and`: `[SpendsWhereRequest]`
- `_or`: `[SpendsWhereRequest]`
- `_not`: `SpendsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `date`: `QueryWhereDatetimeRequest`
- `amount`: `QueryWhereFloatRequest`
- `unit`: `QueryWhereStringRequest`
- `business_unit`: `QueryWhereStringRequest`
- `tenant`: `QueryWhereStringRequest`
- `cloud_account`: `QueryWhereStringRequest`
- `cloud_resource_id`: `QueryWhereStringRequest`
- `resource_service_name`: `QueryWhereStringRequest`
- `resource_region`: `QueryWhereStringRequest`
- `resource_type`: `QueryWhereStringRequest`

##### TemplateVariableType

**Fields:**

- `id`: `String!`
- `input_ref`: `String`
- `display_name`: `String`
- `help_text`: `String`
- `placeholder`: `String`
- `validation`: `String`
- `required`: `Boolean`
- `group`: `String`
- `type`: `String`
- `options`: `[String]`

##### TenantAttributeRequest

**Fields:**

- `name`: `String!`
- `value`: `String!`

##### TenantAttributeResponse

**Fields:**

- `id`: `String!`
- `name`: `String!`
- `created_at`: `Datetime!`
- `updated_at`: `Datetime!`
- `value`: `String!`
- `tenant_id`: `String!`

##### TenantAttributeRow

**Fields:**

- `id`: `String`
- `name`: `String`
- `value`: `String`
- `tenant_id`: `String`

##### TenantAttributesResponse

**Fields:**

- `rows`: `[TenantAttributeRow]`

##### TenantByUserResponse

**Fields:**

- `rows`: `[TenantByUserRowResponse]`

##### TenantByUserRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `username`: `String`

##### TenantByUserWhereRequest

**Fields:**

- `_and`: `[TenantByUserWhereRequest]`
- `_or`: `[TenantByUserWhereRequest]`
- `_not`: `TenantByUserWhereRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `username`: `QueryWhereStringRequest`

##### TenantResponse

**Fields:**

- `rows`: `[TenantRowResponse]`

##### TenantRowResponse

**Fields:**

- `id`: `String`
- `name`: `String`
- `type`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`

##### TenantWhereRequest

**Fields:**

- `_and`: `[TenantWhereRequest]`
- `_or`: `[TenantWhereRequest]`
- `_not`: `TenantWhereRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `type`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### ThresholdAlertDefinition

**Fields:**

- `metric_name`: `String!`
- `metric_namespace`: `String!`
- `operator`: `String!`
- `current_threshold`: `Float!`
- `aggregation`: `String!`
- `period`: `Int!`
- `evaluation_periods`: `Int!`
- `alarm_name`: `String!`
- `alarm_arn`: `String`

##### ThresholdAlertQualityScore

**Fields:**

- `flapping_rate`: `Float!`
- `mean_time_to_close`: `Float!`
- `firing_frequency`: `Float!`
- `resolution_rate`: `Float!`
- `engagement_rate`: `Float!`
- `transient_rate`: `Float!`
- `duration_p90`: `Float!`
- `instant_rate`: `Float!`
- `classification`: `String!`
- `recommendation`: `String!`

##### ThresholdApplyOption

**Fields:**

- `method`: `String!`
- `available`: `Boolean!`
- `reason`: `String`

##### ThresholdApplyOptionsOutput

**Fields:**

- `options`: `[ThresholdApplyOption!]!`
- `risk_level`: `String`
- `requires_override`: `Boolean`
- `preview_expr`: `String`
- `preview_error`: `String`
- `current_threshold`: `Float`
- `new_threshold`: `Float`
- `operator`: `String`

##### ThresholdApplyResultOutput

**Fields:**

- `status`: `String!`
- `method`: `String`
- `applied_expr`: `String`
- `previous_threshold`: `Float`
- `applied_threshold`: `Float`
- `resolution_id`: `String`
- `error`: `String`

##### ThresholdFiringAnalysis

**Fields:**

- `total_occurrences`: `Int!`
- `time_range_days`: `Int!`
- `avg_firings_per_day`: `Float!`
- `metric_values_at_firing`: `[Float]`

##### ThresholdMetricHistory

**Fields:**

- `timestamps`: `[bigint]`
- `values`: `[Float]`
- `start_time`: `String!`
- `end_time`: `String!`
- `step`: `Int!`

##### ThresholdSuggestionDetail

**Fields:**

- `suggested_threshold`: `Float!`
- `reason`: `String!`
- `confidence`: `String!`
- `metric_p50`: `Float!`
- `metric_p90`: `Float!`
- `metric_p95`: `Float!`
- `metric_p99`: `Float!`
- `metric_median`: `Float`
- `metric_mad`: `Float`
- `estimated_reduction`: `Float!`
- `method`: `String`
- `recommendation_type`: `String`
- `suggested_duration`: `Int`
- `duration_reason`: `String`
- `risk_level`: `String`
- `risk_warnings`: `[String!]`

##### ThresholdSuggestionListItem

**Fields:**

- `id`: `String!`
- `alert_rule_key`: `String!`
- `fingerprint`: `String!`
- `cloud_account_id`: `String!`
- `source`: `String!`
- `alert_name`: `String`
- `metric_name`: `String`
- `metric_namespace`: `String`
- `current_threshold`: `Float`
- `operator`: `String`
- `suggested_threshold`: `Float`
- `reason`: `String`
- `confidence`: `String`
- `estimated_reduction`: `Float`
- `method`: `String`
- `recommendation_type`: `String`
- `computed_at`: `String`
- `event_aggregation_key`: `String`
- `firing_analysis`: `jsonb`
- `alert_quality`: `jsonb`
- `metric_stats`: `jsonb`
- `query_metadata`: `jsonb`
- `apply_status`: `String`
- `apply_method`: `String`
- `applied_at`: `String`

##### ThresholdSuggestionListOutput

**Fields:**

- `suggestions`: `[ThresholdSuggestionListItem!]!`
- `total`: `Int!`

##### ThresholdSuggestionOutput

**Fields:**

- `available`: `Boolean!`
- `source`: `String!`
- `alert_definition`: `ThresholdAlertDefinition`
- `firing_analysis`: `ThresholdFiringAnalysis`
- `metric_history`: `ThresholdMetricHistory`
- `suggestion`: `ThresholdSuggestionDetail`
- `alert_quality`: `ThresholdAlertQualityScore`
- `error`: `String`

##### TicketAddCommentActionInput

**Fields:**

- `object`: `TicketAddCommentObjectInput`

##### TicketAddCommentObjectInput

**Fields:**

- `ticket_id`: `String!`
- `tenant`: `String`
- `account_id`: `String!`
- `source`: `String!`
- `integration_id`: `String`
- `comment`: `String!`

##### TicketComments

**Fields:**

- `ticket_id`: `String!`
- `error`: `String`
- `comments`: `[Comment]`

##### TicketGetCommentsActionInput

**Fields:**

- `object`: `TicketGetCommentsObjectInput!`

##### TicketGetCommentsObjectInput

**Fields:**

- `ticket_id`: `String!`
- `account_id`: `String!`
- `source`: `String!`
- `integration_id`: `String!`

##### TicketGroupingsResponse

**Fields:**

- `rows`: `[TicketGroupingsRowResponse]`

##### TicketGroupingsRowResponse

**Fields:**

- `tenant_id`: `String`
- `account_id`: `String`
- `ticket_type`: `String`
- `reference_id`: `String`
- `title`: `String`
- `platform`: `String`
- `status`: `String`
- `assignee`: `String`
- `created_by`: `String`
- `severity`: `String`
- `count`: `Int`

##### TicketGroupingsWhereRequest

**Fields:**

- `_and`: `[TicketGroupingsWhereRequest]`
- `_or`: `[TicketGroupingsWhereRequest]`
- `_not`: `TicketGroupingsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `ticket_type`: `QueryWhereStringRequest`
- `reference_id`: `QueryWhereStringRequest`
- `title`: `QueryWhereStringRequest`
- `platform`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `assignee`: `QueryWhereStringRequest`
- `created_by`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`

##### TicketIntegrationConfigValueInput

**Fields:**

- `name`: `String!`
- `value`: `String!`

##### TicketsResponse

**Fields:**

- `rows`: `[TicketsRowResponse]`

##### TicketsRowResponse

**Fields:**

- `id`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `created_by`: `String`
- `tenant_id`: `String`
- `reference_id`: `String`
- `ticket_type`: `String`
- `status`: `String`
- `message`: `String`
- `ticket_id`: `String`
- `assignee`: `String`
- `integration_id`: `String`
- `url`: `String`
- `severity`: `String`
- `description`: `String`
- `title`: `String`
- `source`: `String`
- `platform`: `String`
- `account_id`: `String`
- `project_key`: `String`
- `created_by_display_name`: `String`

##### TicketsWhereRequest

**Fields:**

- `_and`: `[TicketsWhereRequest]`
- `_or`: `[TicketsWhereRequest]`
- `_not`: `TicketsWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `created_by`: `QueryWhereStringRequest`
- `reference_id`: `QueryWhereStringRequest`
- `ticket_type`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `ticket_id`: `QueryWhereStringRequest`
- `assignee`: `QueryWhereStringRequest`
- `integration_id`: `QueryWhereStringRequest`
- `severity`: `QueryWhereStringRequest`
- `title`: `QueryWhereStringRequest`
- `source`: `QueryWhereStringRequest`
- `platform`: `QueryWhereStringRequest`
- `project_key`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### ToggleSystemRuleOverrideResponse

**Fields:**

- `success`: `Boolean!`
- `error`: `String`
- `is_overridden`: `Boolean`

##### ToolRequest

**Fields:**

- `name`: `String!`
- `description`: `String!`
- `runbook_action_id`: `String`
- `schema`: `jsonb`
- `executor_type`: `String`
- `config`: `jsonb`

##### TraceGroupingValues

**Fields:**

- `count`: `Int!`
- `error_count`: `Int!`
- `workload_name`: `String!`
- `workload_namespace`: `String!`
- `destination_workload_name`: `String!`
- `destination_workload_namespace`: `String!`
- `destination_workload_zone`: `String`
- `resource`: `String!`
- `duration_ns`: `Float!`
- `p99_latency`: `Float!`
- `p95_latency`: `Float!`
- `http_status_code`: `String!`
- `span_name`: `String!`
- `max_latency`: `Float!`

##### TraceGroupingWhereRequest

**Fields:**

- `_and`: `[TraceGroupingWhereRequest]`
- `_or`: `[TraceGroupingWhereRequest]`
- `_not`: `TraceGroupingWhereRequest`
- `timestamp`: `QueryWhereDatetimeRequest`
- `workload_name`: `QueryWhereStringRequest`
- `workload_namespace`: `QueryWhereStringRequest`
- `workload_zone`: `QueryWhereStringRequest`
- `duration_ns`: `QueryWhereFloatRequest`
- `status_code`: `QueryWhereStringRequest`
- `span_name`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `destination_workload_namespace`: `QueryWhereStringRequest`
- `destination_name`: `QueryWhereStringRequest`
- `destination_workload_name`: `QueryWhereStringRequest`
- `destination_workload_zone`: `QueryWhereStringRequest`
- `http_status_code`: `QueryWhereStringRequest`
- `resource`: `QueryWhereStringRequest`
- `headers`: `QueryWhereStringRequest`
- `span_id`: `QueryWhereStringRequest`
- `parent_span_id`: `QueryWhereStringRequest`
- `trace_source`: `QueryWhereStringRequest`
- `trace_id`: `QueryWhereStringRequest`
- `error_count`: `QueryWhereFloatRequest`

##### TraceHeatMapInput

**Fields:**

- `account_id`: `String!`
- `trace_id`: `String!`
- `start_time`: `Float`
- `end_time`: `Float`
- `provider_type`: `String`
- `provider_source`: `String`

##### TraceHeatMapOutput

**Fields:**

- `span_name`: `String`
- `timestamp`: `String`
- `resource_attributes`: `jsonb`
- `status_code`: `String`
- `duration_ns`: `Float`
- `span_attributes`: `jsonb`
- `trace_id`: `String`
- `span_id`: `String`
- `service_name`: `String`
- `events_attributes`: `jsonb`
- `events_name`: `[String]`

##### TraceHeatMapRowResponse

**Fields:**

- `timestamp`: `Datetime`
- `duration_ns`: `Float`
- `parent_span_id`: `String`
- `span_id`: `String`
- `resource_attributes`: `String`
- `status_code`: `String`
- `span_name`: `String`
- `resource`: `String`
- `account_id`: `String`
- `trace_id`: `String`
- `span_attributes`: `String`
- `service_name`: `String`
- `events_name`: `String`
- `events_attributes`: `String`

##### TraceHeatMapWhereRequest

**Fields:**

- `_and`: `[TraceWhereRequest]`
- `_or`: `[TraceWhereRequest]`
- `_not`: `TraceWhereRequest`
- `timestamp`: `QueryWhereDatetimeRequest`
- `account_id`: `QueryWhereStringRequest`
- `trace_id`: `QueryWhereStringRequest`

##### TraceRowGroupResponse

**Fields:**

- `timestamp`: `Datetime`
- `workload_name`: `String`
- `workload_namespace`: `String`
- `workload_zone`: `String`
- `duration_ns`: `Float`
- `status_code`: `String`
- `span_name`: `String`
- `resource`: `String`
- `account_id`: `String`
- `destination_workload_namespace`: `String`
- `destination_name`: `String`
- `destination_workload_name`: `String`
- `destination_workload_zone`: `String`
- `http_status_code`: `String`
- `headers`: `String`
- `request_payload`: `String`
- `span_id`: `String`
- `parent_span_id`: `String`
- `trace_source`: `String`
- `trace_id`: `String`
- `count`: `Int`
- `http_response`: `String`
- `error_count`: `Float`
- `p99_latency`: `Float`
- `p50_latency`: `Float`
- `p95_latency`: `Float`
- `max_latency`: `Float`

##### TraceRowResponse

**Fields:**

- `trace_id`: `String`
- `timestamp`: `Datetime`
- `workload_name`: `String`
- `workload_namespace`: `String`
- `duration_ns`: `Float`
- `status_code`: `String`
- `span_name`: `String`
- `resource`: `String`
- `account_id`: `String`
- `destination_workload_name`: `String`
- `destination_workload_namespace`: `String`
- `destination_name`: `String`
- `headers`: `String`
- `http_status_code`: `String`
- `request_payload`: `String`
- `http_response`: `String`
- `span_id`: `String`
- `parent_span_id`: `String`
- `trace_source`: `String`
- `spanattributes`: `String`

##### TraceServiceMapLabelFilter

**Fields:**

- `key`: `String!`
- `value`: `String!`
- `operator`: `String!`

##### TraceServiceMapRequest

**Fields:**

- `account_id`: `String!`
- `workload_name`: `String`
- `workload_namespace`: `String`
- `start_time`: `String`
- `end_time`: `String`
- `label_filter`: `[TraceServiceMapLabelFilter]`

##### TraceWhereRequest

**Fields:**

- `_and`: `[TraceWhereRequest]`
- `_or`: `[TraceWhereRequest]`
- `_not`: `TraceWhereRequest`
- `timestamp`: `QueryWhereDatetimeRequest`
- `workload_name`: `QueryWhereStringRequest`
- `workload_namespace`: `QueryWhereStringRequest`
- `duration_ns`: `QueryWhereFloatRequest`
- `status_code`: `QueryWhereStringRequest`
- `span_name`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `destination_workload_namespace`: `QueryWhereStringRequest`
- `destination_name`: `QueryWhereStringRequest`
- `destination_workload_name`: `QueryWhereStringRequest`
- `http_status_code`: `QueryWhereStringRequest`
- `resource`: `QueryWhereStringRequest`
- `headers`: `QueryWhereStringRequest`
- `trace_id`: `QueryWhereStringRequest`
- `span_id`: `QueryWhereStringRequest`
- `parent_span_id`: `QueryWhereStringRequest`
- `trace_source`: `QueryWhereStringRequest`

##### TracesGroupResponse

**Fields:**

- `rows`: `[TraceRowGroupResponse]`

##### TracesGroupV3CountResponse

**Fields:**

- `count`: `Int!`

##### TracesHeatMapResponse

**Fields:**

- `rows`: `[TraceHeatMapRowResponse]`

##### TracesOutputResponse

**Fields:**

- `timestamp`: `String`
- `trace_id`: `String`
- `span_id`: `String`
- `parent_span_id`: `String`
- `trace_state`: `String`
- `span_name`: `String`
- `span_kind`: `String`
- `service_name`: `String`
- `resource_attributes`: `OTelResourceAttributes`
- `span_attributes`: `jsonb`
- `duration_ns`: `bigint`
- `status_code`: `String`
- `status_message`: `String`
- `events_timestamp`: `[String!]`
- `events_name`: `[String!]`
- `events_attributes`: `[jsonb!]`
- `links_traceId`: `[String!]`
- `links_span_id`: `[String!]`
- `links_trace_state`: `[String!]`
- `links_attributes`: `[jsonb!]`
- `workload_name`: `String`
- `workload_namespace`: `String`
- `resource`: `String`
- `destination_name`: `String`
- `destination_workload_name`: `String`
- `destination_workload_namespace`: `String`
- `headers`: `String`
- `http_status_code`: `String`
- `request_payload`: `String`
- `http_response`: `String`
- `query_type`: `String`
- `trace_ids`: `[String!]`
- `start_time`: `String`
- `end_time`: `String`
- `start_time_unix_nano`: `String`
- `end_time_unix_nano`: `String`
- `trace_source`: `String`
- `span_attributes_json`: `jsonb`
- `service`: `String`
- `operation`: `String`
- `attributes`: `jsonb`
- `tag_filters`: `jsonb`
- `status`: `jsonb`

##### TracesResponse

**Fields:**

- `rows`: `[TraceRowResponse]`

##### TracesV3CountResponse

**Fields:**

- `count`: `Int!`

##### TracesV3Input

**Fields:**

- `account_id`: `String!`
- `provider_type`: `String`
- `provider_source`: `String`
- `query`: `String`
- `start_time`: `Float!`
- `end_time`: `Float!`
- `limit`: `Int`
- `offset`: `Int`
- `sort_fields`: `[SortFieldInput!]`
- `request`: `jsonb`
- `query_request`: `QueryRequestInput`

##### TracesV3LabelValuesRequest

**Fields:**

- `account_id`: `String!`
- `provider_type`: `String`
- `provider_source`: `String`
- `label`: `String`
- `start_time`: `Float`
- `end_time`: `Float`
- `query_request`: `QueryRequestInput`

##### TracesV3LabelValuesResponse

**Fields:**

- `label`: `String!`
- `values`: `[String]`

##### TriageCorrelatedEvent

**Fields:**

- `correlated_event_id`: `String!`
- `correlation_type`: `String!`
- `correlation_score`: `Float!`
- `correlation_reason`: `String!`
- `time_offset_minutes`: `Int!`
- `dependency_distance`: `Int!`
- `correlated_title`: `String!`
- `correlated_fingerprint`: `String!`
- `correlated_starts_at`: `timestamp!`
- `correlated_state`: `String!`
- `correlated_finding_type`: `String`
- `subject_name`: `String`
- `subject_namespace`: `String`
- `subject_owner`: `String`
- `subject_owner_kind`: `String`

##### TriageDuplicateEvent

**Fields:**

- `event_id`: `String!`
- `first_event_id`: `String!`
- `occurrence_number`: `Int!`
- `created_at`: `timestamp!`
- `event_starts_at`: `timestamp!`
- `event_state`: `String!`

##### TriageDuplicateInfo

**Fields:**

- `first_event_id`: `String!`
- `occurrence_number`: `Int!`
- `duplicate_chain`: `[TriageDuplicateEvent]`
- `total_occurrences`: `Int!`

##### TriageHistoricalStats

**Fields:**

- `total_events`: `Int!`
- `firing_count`: `Int!`
- `resolved_count`: `Int!`
- `closed_count`: `Int!`
- `resolution_rate`: `Float!`
- `closure_rate`: `Float!`
- `noise_level`: `Float!`
- `avg_duration_hours`: `Float!`
- `first_seen_at`: `timestamp`
- `last_seen_at`: `timestamp`

##### TriageHourlyBucket

**Fields:**

- `hour`: `timestamp!`
- `firing_count`: `Int!`
- `resolved_count`: `Int!`
- `closed_count`: `Int!`

##### TriageRule

**Fields:**

- `id`: `String!`
- `tenant_id`: `String`
- `account_id`: `String`
- `rule_type`: `String!`
- `match_source`: `String`
- `match_alertname`: `String`
- `match_namespace`: `String`
- `match_service`: `String`
- `match_fingerprint`: `String`
- `match_labels`: `String`
- `match_priority`: `String`
- `match_finding_type`: `String`
- `match_occurrence_greater_than`: `Int`
- `action`: `String!`
- `action_value`: `String`
- `priority`: `Int!`
- `is_editable`: `Boolean!`
- `can_override`: `Boolean!`
- `override_rule_id`: `String`
- `enabled`: `Boolean!`
- `effective_from`: `timestamp`
- `effective_until`: `timestamp`
- `name`: `String`
- `description`: `String`
- `reason`: `String`
- `created_by`: `String`
- `updated_by`: `String`
- `created_at`: `timestamp!`
- `updated_at`: `timestamp!`
- `match_count`: `Int!`
- `last_matched_at`: `timestamp`
- `apply_to_existing`: `Boolean`
- `is_system_rule`: `Boolean`
- `is_overridden`: `Boolean`

##### TriageRuleEventOutput

**Fields:**

- `id`: `String`
- `account_id`: `String`
- `title`: `String`
- `subject_name`: `String`
- `subject_namespace`: `String`
- `subject_type`: `String`
- `priority`: `String`
- `status`: `String`
- `nb_status`: `String`
- `starts_at`: `String`
- `classified_at`: `String`
- `classification`: `String`

##### TriageRulePreview

**Fields:**

- `rule_type`: `String!`
- `match_criteria`: `String!`
- `action`: `String!`
- `expires_at`: `timestamp`

##### TriggerAnomalyExecuteRequest

**Fields:**

- `account_id`: `String!`

##### TriggerAnomalyExecuteResponse

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### TriggerCloudSyncResponse

**Fields:**

- `success`: `Boolean!`
- `message`: `String`

##### UnmapKBFromAgentRequest

**Fields:**

- `account_id`: `String!`
- `kb_id`: `String!`
- `agent_id`: `String!`

##### UnmapKBFromAgentResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### UpdateAgentExtensionDetails

**Fields:**

- `agent_name`: `String!`
- `prompt`: `String`
- `tools`: `[String]`

##### UpdateAgentExtensionRequest

**Fields:**

- `account_id`: `String!`
- `agent`: `UpdateAgentExtensionDetails`

##### UpdateAgentExtensionResponse

**Fields:**

- `data`: `jsonb`
- `err`: `jsonb`

##### UpdateAgentRequest

**Fields:**

- `account_id`: `String!`
- `agent`: `AgentRequestUpdateStruct!`

##### UpdateAgentResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### UpdateAlertRule

**Fields:**

- `annotations`: `Annotations!`
- `expr`: `String!`
- `labels`: `Labels!`
- `duration`: `String!`
- `source`: `String!`
- `alert`: `String!`
- `category`: `String!`
- `severity`: `String!`
- `enabled`: `Boolean!`
- `accountId`: `String!`
- `trigger_params`: `jsonb!`
- `action_params`: `jsonb!`
- `alert_type`: `String`
- `metric_provider`: `String`
- `metric_provider_source`: `String`
- `provider_config`: `jsonb`

##### UpdateApprovalInput

**Fields:**

- `id`: `uuid!`
- `account_id`: `uuid!`
- `minimum_approval`: `Int`
- `reviewers`: `[uuid]`
- `reviewees`: `[uuid]`

##### UpdateApprovalOutput

**Fields:**

- `id`: `uuid`

##### UpdateFunctionInput

**Fields:**

- `name`: `String!`
- `description`: `String!`
- `prompt`: `String!`
- `variables`: `[String]`
- `variable_defaults`: `jsonb`
- `status`: `String`
- `version`: `Int`

##### UpdateGCRequest

**Fields:**

- `account_id`: `String!`
- `global_context`: `GlobalContextUpdateInput!`

##### UpdateGCResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### UpdateKBEnabledRequest

**Fields:**

- `account_id`: `String!`
- `kb_id`: `String!`
- `enabled`: `Boolean!`

##### UpdateKBEnabledResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### UpdateKBRequest

**Fields:**

- `account_id`: `String!`
- `knowledgebase`: `KnowledgebaseUpdateInput!`

##### UpdateKBResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `[Error]`

##### UpdateNBStatusResponse

**Fields:**

- `success`: `Boolean!`
- `prev_status`: `String!`
- `new_status`: `String!`

##### UpdateToolRequest

**Fields:**

- `account_id`: `String!`
- `tool`: `UpdateToolRequestBody!`

##### UpdateToolRequestBody

**Fields:**

- `id`: `String!`
- `name`: `String!`
- `description`: `String`
- `runbook_action_id`: `String`
- `schema`: `jsonb`
- `executor_type`: `String`
- `config`: `jsonb`
- `status`: `String`

##### UpdateToolResponse

**Fields:**

- `data`: `jsonb`
- `errors`: `jsonb`

##### UpdateTriageRuleResponse

**Fields:**

- `success`: `Boolean!`
- `rule`: `TriageRule`
- `bulk_operation`: `BulkOperationResponse`
- `error`: `String`

##### UpgradeExecuteCommandResponse

**Fields:**

- `success`: `Boolean`
- `output`: `String`
- `error`: `String`

##### UpgradePlanAuditResponse

**Fields:**

- `rows`: `[UpgradePlanAuditRowResponse]`

##### UpgradePlanAuditRowResponse

**Fields:**

- `id`: `String`
- `created_at`: `Datetime`
- `tenant_id`: `String`
- `plan_id`: `String`
- `step_id`: `String`
- `task_id`: `String`
- `field`: `String`
- `action`: `String`
- `old_value`: `String`
- `new_value`: `String`
- `actioned_by`: `String`
- `account_id`: `String`
- `user_actioned_by`: `jsonb`

##### UpgradePlanAuditWhereRequest

**Fields:**

- `_and`: `[UpgradePlanAuditWhereRequest]`
- `_or`: `[UpgradePlanAuditWhereRequest]`
- `_not`: `UpgradePlanAuditWhereRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `plan_id`: `QueryWhereStringRequest`
- `step_id`: `QueryWhereStringRequest`
- `task_id`: `QueryWhereStringRequest`
- `field`: `QueryWhereStringRequest`
- `action`: `QueryWhereStringRequest`
- `actioned_by`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`

##### UpgradePlanResponse

**Fields:**

- `id`: `String`
- `created_at`: `timestamp`
- `updated_at`: `timestamp`
- `current_version`: `String`
- `target_version`: `String`
- `owner`: `String`
- `k8s_provider`: `String`
- `account_id`: `String`
- `tenant_id`: `String`
- `status`: `String`
- `steps`: `jsonb`

##### UserAccountIdsByTenantResponse

**Fields:**

- `rows`: `[UserAccountIdsByTenantRow]`

##### UserAccountIdsByTenantRow

**Fields:**

- `id`: `String`

##### UserAccountIdsByTenantWhereRequest

**Fields:**

- `tenant`: `QueryWhereStringRequest`

##### UserAuthByUsernameResponse

**Fields:**

- `rows`: `[UserAuthByUsernameRowResponse]`

##### UserAuthByUsernameRowResponse

**Fields:**

- `auth_id`: `String`
- `credential`: `String`
- `auth_tenant_id`: `String`
- `expires_at`: `Datetime`
- `auth_status`: `String`
- `provider`: `String`
- `user_id`: `String`
- `id`: `String`
- `display_name`: `String`
- `username`: `String`
- `user_status`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `user_roles`: `Json`
- `user_attrs`: `Json`
- `auth_accounts`: `Json`
- `tenants`: `Json`

##### UserAuthByUsernameWhereRequest

**Fields:**

- `_and`: `[UserAuthByUsernameWhereRequest]`
- `_or`: `[UserAuthByUsernameWhereRequest]`
- `_not`: `UserAuthByUsernameWhereRequest`
- `auth_id`: `QueryWhereStringRequest`
- `credential`: `QueryWhereStringRequest`
- `auth_tenant_id`: `QueryWhereStringRequest`
- `expires_at`: `QueryWhereDatetimeRequest`
- `auth_status`: `QueryWhereStringRequest`
- `provider`: `QueryWhereStringRequest`
- `user_id`: `QueryWhereStringRequest`
- `id`: `QueryWhereStringRequest`
- `display_name`: `QueryWhereStringRequest`
- `username`: `QueryWhereStringRequest`
- `user_status`: `QueryWhereStringRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### UserAuthToken

**Fields:**

- `id`: `String`
- `name`: `String`
- `provider`: `String`
- `status`: `String`
- `created_at`: `timestamp`
- `accessed_at`: `timestamp`

##### UserAuthTokenResponse

**Fields:**

- `tokens`: `[UserAuthToken]`

##### UserByProviderAccountResponse

**Fields:**

- `rows`: `[UserByProviderAccountRow]`

##### UserByProviderAccountRow

**Fields:**

- `auth_id`: `String`
- `id`: `String`
- `display_name`: `String`
- `username`: `String`
- `status`: `String`
- `created_at`: `String`
- `updated_at`: `String`
- `account_id`: `String`
- `provider`: `String`
- `user_roles`: `String`
- `user_auths`: `String`
- `tenants`: `String`
- `groups`: `String`

##### UserByProviderAccountWhereRequest

**Fields:**

- `account_id`: `QueryWhereStringRequest`
- `provider`: `QueryWhereStringRequest`

##### UserByTenantRow

**Fields:**

- `id`: `String`
- `display_name`: `String`
- `status`: `String`
- `username`: `String`
- `created_at`: `String`
- `tenant_id`: `String`
- `user_roles`: `Json`
- `user_groups`: `Json`
- `last_accessed_at`: `String`

##### UserDetailsResponse

**Fields:**

- `rows`: `[UserDetailsRow]`

##### UserDetailsRow

**Fields:**

- `id`: `String`
- `display_name`: `String`
- `username`: `String`
- `status`: `String`
- `created_at`: `String`
- `updated_at`: `String`
- `user_roles`: `String`
- `user_auths`: `String`
- `tenants`: `String`
- `groups`: `String`
- `user_attrs`: `String`

##### UserDetailsWhereRequest

**Fields:**

- `id`: `QueryWhereStringRequest`
- `username`: `QueryWhereStringRequest`

##### UserGroup

**Fields:**

- `id`: `String`
- `name`: `String`
- `description`: `String`
- `owner`: `String`
- `created_at`: `String`
- `tenant_id`: `String`
- `group_roles`: `Json`
- `owner_display_name`: `String`
- `member_count`: `Int`

##### UserGroupsAggregation

**Fields:**

- `id`: `String`
- `name`: `String`
- `description`: `String`
- `owner`: `String`
- `created_at`: `String`
- `tenant_id`: `String`
- `count`: `Int`

##### UserGroupsAggregationResponse

**Fields:**

- `rows`: `[UserGroupsAggregation!]!`

##### UserGroupsResponse

**Fields:**

- `rows`: `[UserGroup]`

##### UserGroupsWhereRequest

**Fields:**

- `_and`: `[UserGroupsWhereRequest]`
- `_or`: `[UserGroupsWhereRequest]`
- `_not`: `UserGroupsWhereRequest`
- `id`: `QueryWhereStringRequest`
- `name`: `QueryWhereStringRequest`
- `owner`: `QueryWhereStringRequest`
- `owner_display_name`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### UserHistoryInput

**Fields:**

- `data`: `String!`
- `account_id`: `String!`
- `module`: `String!`
- `duration`: `Float!`
- `status`: `String!`

##### UserHistoryOutput

**Fields:**

- `status`: `String!`

##### UserHistoryResponse

**Fields:**

- `rows`: `[UserHistoryRowResponse]`

##### UserHistoryRowResponse

**Fields:**

- `id`: `String`
- `user_id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `module`: `String`
- `data`: `String`
- `meta`: `Json`
- `duration`: `Float`
- `status`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`

##### UserHistoryWhereRequest

**Fields:**

- `_and`: `[UserHistoryWhereRequest]`
- `_or`: `[UserHistoryWhereRequest]`
- `_not`: `UserHistoryWhereRequest`
- `id`: `QueryWhereStringRequest`
- `user_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `account_id`: `QueryWhereStringRequest`
- `module`: `QueryWhereStringRequest`
- `data`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `duration`: `QueryWhereFloatRequest`
- `created_at`: `QueryWhereDatetimeRequest`
- `updated_at`: `QueryWhereDatetimeRequest`

##### UserSuperAdminRoleResponse

**Fields:**

- `rows`: `[UserSuperAdminRoleRow]`

##### UserSuperAdminRoleRow

**Fields:**

- `role`: `String`

##### UserSuperAdminRoleWhereRequest

**Fields:**

- `user_id`: `QueryWhereStringRequest`

##### UserTenantRoleRow

**Fields:**

- `entity_id`: `String`
- `entity_type`: `String`
- `role`: `String`
- `tenant_id`: `String`
- `username`: `String`

##### UserTenantRolesResponse

**Fields:**

- `rows`: `[UserTenantRoleRow]`

##### UserTenantRolesWhereRequest

**Fields:**

- `_and`: `[UserTenantRolesWhereRequest]`
- `_or`: `[UserTenantRolesWhereRequest]`
- `_not`: `UserTenantRolesWhereRequest`
- `username`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`
- `entity_id`: `QueryWhereStringRequest`
- `entity_type`: `QueryWhereStringRequest`
- `role`: `QueryWhereStringRequest`

##### UserTokenCreateRequest

**Fields:**

- `name`: `String!`

##### UserTokenCreateResponse

**Fields:**

- `name`: `String!`
- `token`: `String!`

##### UserTokenDeleteRequest

**Fields:**

- `name`: `String!`

##### UserTokenDeleteResponse

**Fields:**

- `name`: `String!`

##### UsergroupUsersGroupingResponse

**Fields:**

- `rows`: `[UsergroupUsersGroupingRowResponse]`

##### UsergroupUsersGroupingRowResponse

**Fields:**

- `count`: `Int`

##### UsergroupUsersGroupingWhereRequest

**Fields:**

- `_and`: `[UsergroupUsersGroupingWhereRequest]`
- `_or`: `[UsergroupUsersGroupingWhereRequest]`
- `_not`: `UsergroupUsersGroupingWhereRequest`
- `id`: `QueryWhereStringRequest`
- `group_id`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### UsergroupUsersResponse

**Fields:**

- `rows`: `[UsergroupUsersRowResponse]`

##### UsergroupUsersRowResponse

**Fields:**

- `id`: `String`
- `group_id`: `String`
- `user_id`: `String`
- `display_name`: `String`
- `username`: `String`
- `status`: `String`
- `tenant_id`: `String`
- `user_roles`: `Json`
- `user_groups`: `Json`

##### UsergroupUsersWhereRequest

**Fields:**

- `_and`: `[UsergroupUsersWhereRequest]`
- `_or`: `[UsergroupUsersWhereRequest]`
- `_not`: `UsergroupUsersWhereRequest`
- `id`: `QueryWhereStringRequest`
- `group_id`: `QueryWhereStringRequest`
- `user_id`: `QueryWhereStringRequest`
- `display_name`: `QueryWhereStringRequest`
- `username`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### UsersByTenantAggregation

**Fields:**

- `id`: `String`
- `display_name`: `String`
- `status`: `String`
- `username`: `String`
- `created_at`: `String`
- `tenant_id`: `String`
- `count`: `Int`

##### UsersByTenantAggregationResponse

**Fields:**

- `rows`: `[UsersByTenantAggregation!]!`
- `execution_time`: `Int`

##### UsersByTenantResponse

**Fields:**

- `rows`: `[UserByTenantRow]`

##### UsersByTenantWhereRequest

**Fields:**

- `_and`: `[UsersByTenantWhereRequest]`
- `_or`: `[UsersByTenantWhereRequest]`
- `_not`: `UsersByTenantWhereRequest`
- `id`: `QueryWhereStringRequest`
- `display_name`: `QueryWhereStringRequest`
- `status`: `QueryWhereStringRequest`
- `username`: `QueryWhereStringRequest`
- `tenant_id`: `QueryWhereStringRequest`

##### ValidateCloudCredentialsInput

**Fields:**

- `cloud_provider`: `String!`
- `account_id`: `String`
- `tenant_id`: `String`
- `client_id`: `String`
- `client_secret`: `String`
- `subscription_id`: `String`
- `credentials_json`: `String`
- `project_id`: `String`
- `billing_project_id`: `String`
- `billing_dataset_id`: `String`
- `billing_table_id`: `String`

##### ValidateCloudCredentialsOutput

**Fields:**

- `success`: `Boolean!`
- `provider`: `String!`
- `missingPermissions`: `[String!]`
- `permissionDetails`: `[PermissionStatusOutput!]!`
- `errorMessage`: `String`

##### VersionDetails

**Fields:**

- `version`: `String!`
- `release_date`: `String!`

##### WebhookSubjectMappingsSyncOutput

**Fields:**

- `status`: `String!`
- `synced_count`: `Int!`

##### WebhookSubjectMappingsSyncRequest

**Fields:**

- `source`: `String!`
- `account_id`: `String!`
- `days`: `Int`

##### Workflow

**Fields:**

- `id`: `String!`
- `tenant_id`: `String!`
- `account_id`: `String!`
- `definition`: `WorkflowDefinition!`
- `tags`: `jsonb`
- `status`: `String`
- `last_execution_status`: `String`
- `last_execution_time`: `timestamp`
- `last_execution_version`: `Int`
- `name`: `String!`
- `created_by`: `String`
- `created_by_user`: `WorkflowUser`
- `updated_by`: `String`
- `updated_by_user`: `WorkflowUser`
- `created_at`: `timestamp`
- `updated_at`: `timestamp`
- `created_from_session_id`: `String`
- `description`: `String`
- `ai_invocable`: `Boolean`

##### WorkflowCaller

**Fields:**

- `id`: `String!`
- `name`: `String!`
- `status`: `String!`

##### WorkflowCancelRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`
- `execution_id`: `String!`

##### WorkflowCancelResponse

**Fields:**

- `message`: `String`

##### WorkflowCompleteApprovalRequest

**Fields:**

- `account_id`: `String!`
- `workflow_id`: `String!`
- `execution_id`: `String!`
- `task_id`: `String!`
- `status`: `String!`
- `comments`: `String`

##### WorkflowCompleteApprovalResponse

**Fields:**

- `message`: `String`

##### WorkflowCountRequest

**Fields:**

- `account_ids`: `[String!]` - Same optional account filter as WorkflowListRequest, so a count always matches
the listing it labels.
- `account_id`: `String`
- `status`: `String`
- `trigger_type`: `String`

##### WorkflowCountResponse

**Fields:**

- `count`: `Int!`

##### WorkflowCreateRequest

**Fields:**

- `account_id`: `String!`
- `workflow`: `WorkflowRequest!`

##### WorkflowCreateResponse

**Fields:**

- `id`: `String!`
- `token`: `String`

##### WorkflowDefinition

**Fields:**

- `version`: `String`
- `inputs`: `[WorkflowDefinitionInput]`
- `triggers`: `[WorkflowDefinitionTrigger]`
- `tasks`: `[WorkflowDefinitionTask]`
- `hooks`: `[WorkflowDefinitionHook]`
- `output`: `jsonb`
- `retry_policy`: `WorkflowDefinitionRetryPolicy`
- `timeout`: `String`
- `layout`: `WorkflowDefinitionLayout`
- `llm_description`: `String`

##### WorkflowDefinitionFailurePolicyRequest

**Fields:**

- `action`: `String`
- `retry`: `WorkflowDefinitionRetryPolicyRequest`

##### WorkflowDefinitionFailurePolicyResponse

**Fields:**

- `action`: `String`
- `retry`: `WorkflowDefinitionRetryPolicyResponse`

##### WorkflowDefinitionHook

**Fields:**

- `success`: `[WorkflowDefinitionHookAction]`
- `failure`: `[WorkflowDefinitionHookAction]`
- `always`: `[WorkflowDefinitionHookAction]`

##### WorkflowDefinitionHookAction

**Fields:**

- `type`: `String!`
- `params`: `jsonb`

##### WorkflowDefinitionHookActionRequest

**Fields:**

- `type`: `String!`
- `params`: `jsonb`

##### WorkflowDefinitionHookRequest

**Fields:**

- `success`: `[WorkflowDefinitionHookActionRequest]`
- `failure`: `[WorkflowDefinitionHookActionRequest]`
- `always`: `[WorkflowDefinitionHookActionRequest]`

##### WorkflowDefinitionInput

**Fields:**

- `id`: `String!`
- `description`: `String`
- `type`: `String`
- `default`: `String`

##### WorkflowDefinitionInputRequest

**Fields:**

- `id`: `String!`
- `description`: `String`
- `type`: `String`
- `default`: `jsonb`
- `required`: `Boolean`

##### WorkflowDefinitionLayout

**Fields:**

- `viewport`: `WorkflowViewport`

##### WorkflowDefinitionLayoutRequest

**Fields:**

- `viewport`: `WorkflowViewportRequest`

##### WorkflowDefinitionRequest

**Fields:**

- `version`: `String`
- `inputs`: `[WorkflowDefinitionInputRequest]`
- `triggers`: `[WorkflowDefinitionTriggerRequest]`
- `tasks`: `[WorkflowDefinitionTaskRequest]`
- `hooks`: `[WorkflowDefinitionHookRequest]`
- `output`: `jsonb`
- `retry_policy`: `WorkflowDefinitionRetryPolicyRequest`
- `timeout`: `String`
- `layout`: `WorkflowDefinitionLayoutRequest`
- `llm_description`: `String`

##### WorkflowDefinitionRetryPolicy

**Fields:**

- `initial_interval`: `String`
- `backoff_coefficient`: `Float`
- `maximum_interval`: `String`
- `maximum_attempts`: `Int`
- `non_retryable_error_types`: `[String]`

##### WorkflowDefinitionRetryPolicyRequest

**Fields:**

- `initial_interval`: `String`
- `backoff_coefficient`: `Float`
- `maximum_interval`: `String`
- `maximum_attempts`: `Int`
- `non_retryable_error_types`: `[String]`

##### WorkflowDefinitionRetryPolicyResponse

**Fields:**

- `initial_interval`: `String`
- `backoff_coefficient`: `Float`
- `maximum_interval`: `String`
- `maximum_attempts`: `Int`
- `non_retryable_error_types`: `[String]`

##### WorkflowDefinitionTask

**Fields:**

- `id`: `String!`
- `type`: `String!`
- `params`: `jsonb`
- `tasks`: `[WorkflowDefinitionTask]`
- `outputs`: `jsonb`
- `depends_on`: `[String!]`
- `if`: `String`
- `matrix`: `String`
- `retry_policy`: `WorkflowDefinitionRetryPolicy`
- `timeout`: `String`
- `hooks`: `WorkflowDefinitionHook`
- `set_state`: `jsonb`
- `set_vars`: `jsonb`
- `failure_policy`: `WorkflowDefinitionFailurePolicyResponse`
- `disabled`: `Boolean`
- `_prev_edges`: `jsonb`
- `layout`: `WorkflowTaskLayout`

##### WorkflowDefinitionTaskRequest

**Fields:**

- `id`: `String!`
- `type`: `String!`
- `params`: `jsonb`
- `tasks`: `[WorkflowDefinitionTaskRequest]`
- `set_state`: `jsonb`
- `set_vars`: `jsonb`
- `depends_on`: `[String!]`
- `if`: `String`
- `matrix`: `jsonb`
- `failure_policy`: `WorkflowDefinitionFailurePolicyRequest`
- `timeout`: `String`
- `hooks`: `WorkflowDefinitionHookRequest`
- `disabled`: `Boolean`
- `_prev_edges`: `jsonb`
- `layout`: `WorkflowTaskLayoutRequest`

##### WorkflowDefinitionTrigger

**Fields:**

- `type`: `String!`
- `params`: `jsonb`
- `layout`: `WorkflowTaskLayout`

##### WorkflowDefinitionTriggerRequest

**Fields:**

- `type`: `String!`
- `params`: `jsonb`
- `layout`: `WorkflowTaskLayoutRequest`

##### WorkflowDeleteRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`

##### WorkflowDeleteResponse

**Fields:**

- `message`: `String!`

##### WorkflowDryrunRequest

**Fields:**

- `account_id`: `String!`
- `definition`: `WorkflowDefinitionRequest!`
- `inputs`: `jsonb`
- `name`: `String`

##### WorkflowDryrunResponse

**Fields:**

- `status`: `String!`
- `output`: `jsonb`
- `error`: `String`
- `dryrun_id`: `String`
- `execution_id`: `String`
- `tasks`: `[WorkflowExecutionTaskResponse]`

##### WorkflowExecutionCountRequest

**Fields:**

- `account_id`: `String!`
- `start_date`: `timestamp`
- `end_date`: `timestamp`
- `status`: `String`
- `trigger_type`: `String`
- `workflow_id`: `String`

##### WorkflowExecutionCountResponse

**Fields:**

- `count`: `Int!`

##### WorkflowExecutionGetRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`
- `workflow_id`: `String!`

##### WorkflowExecutionGetResponse

**Fields:**

- `workflow_id`: `String!`
- `id`: `String!`
- `parent_workflow_id`: `String`
- `triggered_by`: `String`
- `status`: `String`
- `start_time`: `timestamp`
- `close_time`: `timestamp`
- `inputs`: `jsonb`
- `workflow_result`: `jsonb`
- `error`: `String`
- `tasks`: `[WorkflowExecutionTaskResponse]`

##### WorkflowExecutionListForEventRequest

**Fields:**

- `account_id`: `String!`
- `event_id`: `String!`

##### WorkflowExecutionListRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`
- `limit`: `Int`
- `next_page_token`: `String`
- `status`: `String`
- `trigger_type`: `String`

##### WorkflowExecutionListResponse

**Fields:**

- `next_page_token`: `String`
- `executions`: `[WorkflowExecutionSummary!]`

##### WorkflowExecutionSummary

**Fields:**

- `workflow_id`: `String!`
- `id`: `String!`
- `status`: `String!`
- `start_time`: `timestamp`
- `close_time`: `timestamp`
- `triggered_by`: `String`
- `trigger_type`: `String`
- `parent_workflow_id`: `String`
- `workflow_name`: `String`
- `version`: `Int`
- `version_number`: `Int`

##### WorkflowExecutionTaskResponse

**Fields:**

- `id`: `String!`
- `type`: `String!`
- `status`: `String!`
- `start_time`: `timestamp`
- `end_time`: `timestamp`
- `input`: `jsonb`
- `output`: `jsonb`
- `error`: `String`
- `attempt`: `Int`
- `children`: `jsonb`

##### WorkflowGetRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`

##### WorkflowGetTemplateRequest

**Fields:**

- `type`: `String!`
- `id`: `String!`

##### WorkflowListCallersRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`

##### WorkflowListCallersResponse

**Fields:**

- `callers`: `[WorkflowCaller!]!`

##### WorkflowListMCPToolsResponse

**Fields:**

- `tools`: `[MCPToolInfo]`

##### WorkflowListRequest

**Fields:**

- `account_ids`: `[String!]` - Account filter. Omit both to list across every account the caller can read —
the Automations page is tenant-level. account_id is the legacy single-account
form, still sent by `/automation?accountId=` deep links.
- `account_id`: `String`
- `name`: `String`
- `tags`: `String`
- `limit`: `Int`
- `status`: `String`
- `last_execution_status`: `String`
- `type`: `String`
- `created_by`: `String`
- `next_page_token`: `String`

##### WorkflowListResponse

**Fields:**

- `total_count`: `Int`
- `workflows`: `[Workflow]`
- `next_page_token`: `String`

##### WorkflowListTemplateRequest

**Fields:**

- `type`: `String!`
- `category`: `String`
- `name`: `String`
- `limit`: `Int`
- `next_page_token`: `String`
- `event_sources`: `[String]`
- `alert_names`: `[String]`
- `subject_types`: `[String]`

##### WorkflowPauseResponse

**Fields:**

- `data`: `jsonb`

##### WorkflowRequest

**Fields:**

- `definition`: `WorkflowDefinitionRequest!`
- `tags`: `jsonb`
- `name`: `String!`
- `status`: `String`
- `created_from_session_id`: `String`
- `description`: `String`
- `ai_invocable`: `Boolean`

##### WorkflowResumeResponse

**Fields:**

- `data`: `jsonb`

##### WorkflowRetriggerRequest

**Fields:**

- `account_id`: `String!`
- `workflow_id`: `String!`
- `execution_id`: `String!`
- `inputs`: `jsonb`

##### WorkflowRetriggerResponse

**Fields:**

- `id`: `String!`
- `execution_id`: `String!`

##### WorkflowTaskDefinitionListRequest

**Fields:**

- `name`: `String`
- `limit`: `Int`
- `offset`: `Int`

##### WorkflowTaskDefinitionListResponse

**Fields:**

- `tasks`: `[WorkflowTaskDefinitionResponse]`

##### WorkflowTaskDefinitionResponse

**Fields:**

- `name`: `String!`
- `description`: `String!`
- `input_schema`: `jsonb`
- `output_schema`: `jsonb`
- `aliases`: `[String!]`

##### WorkflowTaskLayout

**Fields:**

- `x`: `Float!`
- `y`: `Float!`

##### WorkflowTaskLayoutRequest

**Fields:**

- `x`: `Float!`
- `y`: `Float!`

##### WorkflowTemplateListResponse

**Fields:**

- `total_count`: `Int`
- `templates`: `[WorkflowTemplateType]`
- `next_page_token`: `String`

##### WorkflowTemplateType

**Fields:**

- `id`: `String!`
- `tenant_id`: `String`
- `account_id`: `String`
- `name`: `String!`
- `description`: `String`
- `category`: `String`
- `icon`: `String`
- `definition`: `WorkflowDefinition!`
- `template_variables`: `[TemplateVariableType]`
- `tags`: `jsonb`
- `is_system`: `Boolean`
- `status`: `String`
- `created_by`: `String`
- `created_by_user`: `WorkflowUser`
- `updated_by`: `String`
- `updated_by_user`: `WorkflowUser`
- `created_at`: `timestamp`
- `updated_at`: `timestamp`

##### WorkflowTriggerRequest

**Fields:**

- `account_id`: `String!`
- `id`: `String!`
- `inputs`: `jsonb`
- `event_id`: `String`
- `use_draft_definition`: `Boolean`

##### WorkflowTriggerResponse

**Fields:**

- `id`: `String!`
- `execution_id`: `String!`

##### WorkflowUpdateRequest

**Fields:**

- `account_id`: `String!`
- `workflow`: `WorkflowRequest!`
- `id`: `String!`

##### WorkflowUpdateResponse

**Fields:**

- `id`: `String`
- `tenant_id`: `String`
- `account_id`: `String`
- `name`: `String`
- `status`: `String`
- `last_execution_status`: `String`
- `definition`: `jsonb`
- `tags`: `jsonb`
- `created_by`: `String`
- `updated_by`: `String`
- `created_at`: `Datetime`
- `updated_at`: `Datetime`
- `trigger_details`: `jsonb`

##### WorkflowUser

**Fields:**

- `id`: `String`
- `display_name`: `String`
- `username`: `String`

##### WorkflowValidateResponse

**Fields:**

- `message`: `String`

##### WorkflowViewport

**Fields:**

- `x`: `Float!`
- `y`: `Float!`
- `zoom`: `Float!`

##### WorkflowViewportRequest

**Fields:**

- `x`: `Float!`
- `y`: `Float!`
- `zoom`: `Float!`

##### account_group_roles_upsert_one_input

**Fields:**

- `group_id`: `String!`
- `account_roles`: `[account_role_input]!`

##### account_group_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### account_role_input

**Fields:**

- `account_id`: `String!`
- `role`: `String!`

##### account_user_roles_upsert_one_input

**Fields:**

- `user_id`: `String!`
- `account_roles`: `[account_role_input]!`

##### account_user_roles_upsert_one_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### apply_recommendation_input

**Fields:**

- `account_id`: `String!`
- `recommendation_id`: `String!`
- `data`: `jsonb`
- `provider`: `String`
- `provider_config`: `ProviderConfig`

##### apply_recommendation_output

**Fields:**

- `data`: `[jsonb]!`

##### autooptimize_create

**Fields:**

- `account_id`: `uuid!`
- `category`: `String!`
- `resource_filter`: `[autopilot_resource_filter]!`
- `auto_optimize_config`: `jsonb`
- `schedule`: `autopilot_schedule!`
- `notification`: `autopilot_notification!`
- `dryrun`: `Boolean!`
- `gitops`: `auto_optimize_gitops_config`
- `ticket_config`: `auto_optimize_ticket_config`

##### autooptimize_update

**Fields:**

- `id`: `uuid!`
- `account_id`: `uuid!`
- `category`: `String!`
- `resource_filter`: `[autopilot_resource_filter]!`
- `auto_optimize_config`: `jsonb`
- `schedule`: `autopilot_schedule!`
- `notification`: `autopilot_notification!`
- `dryrun`: `Boolean!`
- `gitops`: `auto_optimize_gitops_config`
- `ticket_config`: `auto_optimize_ticket_config`

##### bigint

##### check_group_name_exists_input

**Fields:**

- `name`: `String!`

##### check_group_name_exists_item

**Fields:**

- `id`: `String!`
- `name`: `String!`

##### disable_runbook_request

**Fields:**

- `id`: `uuid!`

##### disable_runbook_response

**Fields:**

- `status`: `String!`

##### featureflag_upsert_input

**Fields:**

- `feature_id`: `String!`
- `status`: `String!`
- `account_id`: `String`

##### featureflag_upsert_output

**Fields:**

- `status`: `String!`
- `message`: `String!`

##### flight_check_response

**Fields:**

- `id`: `String`
- `plan_id`: `String`
- `account_id`: `String`
- `comparison`: `jsonb`
- `health_check`: `jsonb`
- `pre_flight_summary`: `jsonb`
- `status`: `String`

##### float8

##### gchat_permission_status_resp

**Fields:**

- `status`: `String`
- `error`: `jsonb`

##### generate_cluster_recommendations_input

**Fields:**

- `account`: `String!`
- `tenant`: `String!`
- `buffer_percentage`: `Int`
- `number_of_recommendations`: `Int`
- `min_nodes`: `Int`
- `min_cpu_per_node`: `Int`
- `min_memory_per_node`: `Int`
- `preferred_instance_groups`: `[String!]!`
- `graviton`: `Boolean!`

##### generate_cluster_recommendations_output

**Fields:**

- `data`: `jsonb!`

##### get_openai_query_recommendations_input

**Fields:**

- `account_id`: `String!`
- `query_normalized_md5`: `String!`

##### get_openai_query_recommendations_output

**Fields:**

- `get_result`: `String!`

##### get_query_profile_stat_input

**Fields:**

- `account_id`: `String!`
- `query_normalized_md5`: `String!`

##### get_query_profile_stat_output

**Fields:**

- `data`: `[jsonb]!`

##### get_query_recommendations_input

**Fields:**

- `account_id`: `String!`
- `query_normalized_md5`: `String!`
- `resource_id`: `String`
- `account_type`: `String`

##### get_query_recommendations_output

**Fields:**

- `data`: `query_recommendation_object!`

##### health_check_response

**Fields:**

- `account_id`: `String`
- `nodes`: `jsonb`
- `workloads`: `jsonb`
- `services`: `jsonb`
- `persistentVolumes`: `jsonb`
- `load_balancers`: `jsonb`
- `node_groups`: `jsonb`
- `helm_compatibility`: `jsonb`

##### insert_jira_configurations_one

**Fields:**

- `id`: `String`

##### insert_jira_configurations_one_resp

**Fields:**

- `id`: `uuid!`

##### insert_ticket_one_resp

**Fields:**

- `id`: `uuid`
- `error`: `String`
- `action`: `String`
- `message`: `String`
- `ticket_id`: `String`
- `url`: `String`

##### jsonb

##### k8saccount_namespace_role_input

**Fields:**

- `account_id`: `String!`
- `role`: `String!`
- `namespace`: `String!`

##### query_recommendation_object

**Fields:**

- `recommendation`: `String!`

##### resource_enhance_monitoring_input

**Fields:**

- `resource_id`: `String!`
- `created_by`: `uuid`
- `updated_by`: `uuid`
- `tenant`: `uuid`

##### resource_enhance_monitoring_output

**Fields:**

- `message`: `String`

##### resource_filter_request

**Fields:**

- `name`: `String!`
- `type`: `String!`
- `namespace`: `String!`

##### response_data

**Fields:**

- `insert_tickets_one`: `tickets_create`

##### runbook_action_status_input

**Fields:**

- `ids`: `[uuid!]`
- `account_id`: `uuid!`
- `status`: `String!`

##### runbook_action_status_output

**Fields:**

- `status`: `String!`

##### skip_runbook_request

**Fields:**

- `id`: `uuid!`
- `by_minutes`: `Int`

##### skip_runbook_response

**Fields:**

- `status`: `String!`

##### task_response

**Fields:**

- `id`: `String`
- `step_id`: `String`
- `sequence`: `String`
- `title`: `String`
- `owner`: `String`
- `status`: `String`

##### timestamp

##### timestamptz

##### update_runbook_status_request

**Fields:**

- `id`: `uuid!`
- `status`: `String!`

##### update_runbook_status_response

**Fields:**

- `status`: `String!`

##### uuid

### Helper Types (Filter, Input, Ordering)

Auto-generated types for filtering, sorting, and input operations. Expand each category to view.

<details>
<summary><strong>Cost Management</strong> (1 types)</summary>

#### billing_action_sum_fields

**Fields:**

- `sum`: `billing_action_sum_values!`

</details>

