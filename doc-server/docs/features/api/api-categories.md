# API Categories

All available GraphQL APIs organized by functional category.

---

## Account Management APIs

Query and manage your account environment types and purposes.

### APIs
- **`account_env_type`** - List account environment types (dev, staging, prod, etc.)
- **`account_env_type_aggregate`** - Get aggregated data from environment types
- **`account_env_type_by_pk`** - Get a specific environment type by value
- **`account_purpose_type`** - List account purpose types
- **`account_purpose_type_aggregate`** - Get aggregated data from purpose types
- **`account_purpose_type_by_pk`** - Get a specific purpose type by value

### Example: List Environment Types
```bash
# 1) Exchange your API secret for an access token
curl -X POST https://app.nudgebee.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","secret":"YOUR_API_TOKEN"}'

# Response -> { "token": "YOUR_ACCESS_TOKEN", "expiry": 3600 }

# 2) Call the GraphQL API with the access token
curl -X POST https://api.nudgebee.com/graphql \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { account_env_type(limit: 10) { value } }"}'
```

### Response
```json
{
  "data": {
    "account_env_type": [
      { "value": "dev" },
      { "value": "staging" },
      { "value": "production" }
    ]
  }
}
```

---

## Agent APIs

Manage agents, playbooks, tasks, and audit logs.

### Agent Management
- **`agent`** - List and query agents
- **`agent_aggregate`** - Get agent count and statistics
- **`agent_by_pk`** - Get a specific agent by ID
- **`agent_audit_log`** - Audit trail for agent operations
- **`agent_audit_log_aggregate`** - Get agent audit log statistics
- **`agent_audit_log_by_pk`** - Get specific audit log entry

### Agent Playbooks
- **`agent_playbook`** - Agent automation playbooks
- **`agent_playbook_aggregate`** - Playbook statistics
- **`agent_playbook_by_pk`** - Get specific playbook
- **`agent_playbook_action`** - Actions executable in playbooks
- **`agent_playbook_action_aggregate`** - Action statistics
- **`agent_playbook_action_by_pk`** - Get specific action
- **`agent_playbook_trigger`** - Playbook trigger conditions
- **`agent_playbook_trigger_aggregate`** - Trigger statistics
- **`agent_playbook_trigger_by_pk`** - Get specific trigger
- **`agent_playbook_processor`** - Playbook processors
- **`agent_playbook_processor_aggregate`** - Processor statistics
- **`agent_playbook_processor_by_pk`** - Get specific processor
- **`agent_playbook_source`** - Playbook sources
- **`agent_playbook_source_aggregate`** - Source statistics
- **`agent_playbook_source_by_pk`** - Get specific source

### Agent Tasks
- **`agent_task`** - Track agent tasks
- **`agent_task_aggregate`** - Task statistics
- **`agent_task_by_pk`** - Get specific task

### Example: List Active Agents
```graphql
query {
  agent(limit: 5, where: {status: {_eq: "active"}}) {
    id
    name
    status
    created_at
  }
}
```

---

## AI & LLM APIs

Access AI-powered features including recommendations, analysis, and workflow generation.

### Agent Knowledge
- **`ai_list_agents`** - List agents with AI capabilities
- **`ai_list_agents_with_kb_counts`** - Agents with knowledge base mapping counts
- **`ai_list_agent_kbs`** - Knowledge bases for a specific agent

### Knowledge Bases
- **`ai_list_kb`** - List all knowledge bases for an account
- **`ai_list_kb_agent_mappings`** - List KB-agent mappings
- **`ai_list_kb_agents`** - Agents mapped to a specific KB
- **`ai_get_kb`** - Get specific knowledge base details

### Global Context
- **`ai_list_gc`** - List all global contexts for an account
- **`ai_get_gc`** - Get specific global context by ID

### LLM Models & Configuration
- **`ai_list_models`** - Available LLM models for conversations
- **`ai_get_model_config`** - Get LLM model configuration for a conversation

### AI Operations
- **`ai_get_rca`** - Root cause analysis powered by AI
- **`ai_get_recommendation`** - AI-generated recommendations for logs
- **`ai_generate_workflow`** - Auto-generate workflows using AI
- **`ai_budget_status`** - Check AI budget usage and limits
- **`ai_list_memory`** - AI conversation memory
- **`ai_list_references`** - AI reference materials
- **`ai_list_tools`** - Available AI tools

### Example: Get AI RCA
```graphql
query {
  ai_get_rca(
    account_id: "your-account-id"
    event_id: "your-event-id"
    generate: true
  ) {
    response
  }
}
```

---

## Anomaly Detection APIs

Monitor and manage anomalies in your infrastructure.

### Anomalies
- **`anomaly`** - Query detected anomalies
- **`anomaly_aggregate`** - Get anomaly statistics
- **`anomaly_by_pk`** - Get specific anomaly by ID
- **`anomaly_v2`** - Advanced anomaly queries with pagination
- **`anomaly_v3`** - Latest anomaly query version with enhanced filtering
- **`anomaly_grouping_v2`** - Group related anomalies

### Anomaly Configuration
- **`anomaly_config`** - Anomaly detection configurations
- **`anomaly_config_aggregate`** - Config statistics
- **`anomaly_config_by_pk`** - Get specific config
- **`anomaly_config_type`** - Types of anomaly configurations
- **`anomaly_config_type_aggregate`** - Config type statistics
- **`anomaly_config_type_by_pk`** - Get specific config type

### Anomaly Classification
- **`anomaly_type`** - Classification of anomalies
- **`anomaly_type_aggregate`** - Anomaly type statistics
- **`anomaly_type_by_pk`** - Get specific anomaly type
- **`anomaly_change_operator`** - Detection rule operators
- **`anomaly_change_operator_aggregate`** - Operator statistics
- **`anomaly_change_operator_by_pk`** - Get specific operator

### Example: List Recent Anomalies
```graphql
query {
  anomaly_v2(
    limit: 20
    offset: 0
    order_by: [{created_at: desc}]
  ) {
    id
    name
    severity
    created_at
  }
}
```

---

## Application Management APIs

Manage your applications and application groups.

### Application Groups
- **`application_group`** - Create/manage application groups
- **`application_group_aggregate`** - Group statistics
- **`application_group_by_pk`** - Get specific group
- **`application_group_mapping`** - Map applications to groups
- **`application_group_mapping_aggregate`** - Mapping statistics
- **`application_group_mapping_by_pk`** - Get specific mapping

### Application Profiles
- **`application_profile`** - Application performance profiles
- **`application_profile_aggregate`** - Profile statistics
- **`application_profile_by_pk`** - Get specific profile
- **`application_profile_v2`** - Advanced profile queries with transformations

### Example: List Application Groups
```graphql
query {
  application_group(limit: 10) {
    id
    name
    created_at
  }
}
```

---

## Audit & Compliance APIs

Track changes and maintain compliance records.

### Audit Logs
- **`audit`** - Full audit trail of all operations
- **`audit_aggregate`** - Audit statistics
- **`audit_by_pk`** - Get specific audit entry
- **`audits_v2`** - Advanced audit queries with filtering
- **`audit_groupings_v2`** - Group audit entries by categories

### Example: Get Recent Audit Logs
```graphql
query {
  audits_v2(
    limit: 50
    order_by: [{created_at: desc}]
    where: {user_id: {_eq: "user-123"}}
  ) {
    id
    action
    user_id
    created_at
  }
}
```

---

## Authentication APIs

Manage authentication providers and types.

### Auth Configuration
- **`auth_type`** - Available authentication types
- **`auth_type_aggregate`** - Auth type statistics
- **`auth_type_by_pk`** - Get specific auth type
- **`auth_provider_type`** - List auth providers (SAML, OAuth, etc.)
- **`auth_provider_type_aggregate`** - Provider statistics
- **`auth_provider_type_by_pk`** - Get specific provider

---

## Auto-Optimization APIs

Intelligent resource optimization and cost reduction.

### Optimization Management
- **`auto_optimize_recommendation`** - Get optimization recommendations
- **`auto_optimize_resource_map`** - Track optimizable resources
- **`auto_optimize_resource_map_aggregate`** - Resource mapping statistics
- **`auto_optimize_resource_map_by_pk`** - Get specific resource mapping
- **`auto_optimize_workload`** - Manage optimization workloads

### Example: Get Optimization Recommendations
```graphql
query {
  auto_optimize_recommendation(
    account_id: "your-account-id"
    auto_optimize_categories: ["cost", "performance"]
  ) {
    resource_id
    recommendations {
      category
      savings
      action
    }
  }
}
```

---

## Auto-Pilot APIs

Automated task execution and approval workflows.

### Auto-Pilot Execution
- **`auto_pilot`** - Main auto-pilot executions
- **`auto_pilot_aggregate`** - Execution statistics
- **`auto_pilot_by_pk`** - Get specific execution
- **`auto_pilot_executions`** - Execution tracking

### Tasks & Actions
- **`auto_pilot_task`** - Individual tasks in executions
- **`auto_pilot_task_aggregate`** - Task statistics
- **`auto_pilot_task_by_pk`** - Get specific task
- **`auto_pilot_task_status`** - Task status tracking
- **`auto_pilot_task_status_aggregate`** - Status statistics
- **`auto_pilot_task_status_by_pk`** - Get specific status

### Approvals & Reviews
- **`auto_pilot_approvals`** - Approval workflows
- **`auto_pilot_approvals_aggregate`** - Approval statistics
- **`auto_pilot_approvals_by_pk`** - Get specific approval
- **`auto_pilot_approval_policy`** - Approval policies
- **`auto_pilot_approval_policy_aggregate`** - Policy statistics
- **`auto_pilot_approval_policy_by_pk`** - Get specific policy
- **`auto_pilot_approval_status`** - Approval status
- **`auto_pilot_approval_status_aggregate`** - Approval status statistics
- **`auto_pilot_approval_status_by_pk`** - Get specific approval status
- **`auto_pilot_reviewers`** - Users involved in approvals
- **`auto_pilot_reviewers_aggregate`** - Reviewer statistics
- **`auto_pilot_reviewers_by_pk`** - Get specific reviewer
- **`auto_pilot_reviewee`** - Users being reviewed
- **`auto_pilot_reviewee_aggregate`** - Reviewee statistics
- **`auto_pilot_reviewee_by_pk`** - Get specific reviewee

### Categories & Status
- **`auto_pilot_category`** - Task categories
- **`auto_pilot_category_aggregate`** - Category statistics
- **`auto_pilot_category_by_pk`** - Get specific category
- **`auto_pilot_status`** - Execution status
- **`auto_pilot_status_aggregate`** - Status statistics
- **`auto_pilot_status_by_pk`** - Get specific status
- **`auto_pilot_execution_status`** - Execution status tracking
- **`auto_pilot_execution_status_aggregate`** - Execution status statistics
- **`auto_pilot_execution_status_by_pk`** - Get specific execution status

---

## Auto-Playbook APIs

Automated remediation playbooks and executions.

### Playbook Management
- **`auto_playbook`** - Playbook definitions
- **`auto_playbook_aggregate`** - Playbook statistics
- **`auto_playbook_by_pk`** - Get specific playbook
- **`auto_playbook_v2`** - Extended playbook queries

### Playbook Executions
- **`auto_playbook_executions`** - Track playbook runs
- **`auto_playbook_executions_aggregate`** - Execution statistics
- **`auto_playbook_executions_by_pk`** - Get specific execution
- **`auto_playbook_grouping_v2`** - Group playbook executions

### Playbook Details
- **`auto_playbook_actions`** - Actions within playbooks
- **`auto_playbook_actions_aggregate`** - Action statistics
- **`auto_playbook_actions_by_pk`** - Get specific action
- **`auto_playbook_task`** - Individual playbook tasks
- **`auto_playbook_task_aggregate`** - Task statistics
- **`auto_playbook_task_by_pk`** - Get specific task
- **`auto_playbook_task_status`** - Task execution status
- **`auto_playbook_task_status_aggregate`** - Status statistics
- **`auto_playbook_task_status_by_pk`** - Get specific status

### Status & Classification
- **`auto_playbook_status`** - Playbook execution status
- **`auto_playbook_status_aggregate`** - Status statistics
- **`auto_playbook_status_by_pk`** - Get specific status
- **`auto_playbook_execution_status`** - Detailed execution status
- **`auto_playbook_execution_status_aggregate`** - Detailed status statistics
- **`auto_playbook_execution_status_by_pk`** - Get specific execution status

---

## Resource Management APIs

Manage your cloud resources and resource tracking.

### Active Resources
- **`active_resources`** - Currently active cloud resources
- **`active_resources_aggregate`** - Resource statistics
- **`active_resources_by_pk`** - Get specific resource by ID

### Example: List Active Resources
```graphql
query {
  active_resources(
    limit: 20
    where: {tenant_id: {_eq: "tenant-123"}}
  ) {
    external_resource_id
    resource_type
    cloud_account_id
  }
}
```

---

## Next Steps

- Explore [Query Patterns](./query-patterns.md) for complex queries
- See [Getting Started](./getting-started.md) for quick examples
- Review [Error Handling](./error-handling.md) for error management
- Check [Full Reference](./reference.md) for complete endpoint documentation
