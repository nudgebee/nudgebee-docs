module.exports = [
  {
    groupId: 'cloud-infrastructure',
    title: 'List Cloud Accounts',
    description: 'Retrieve all cloud accounts with their status and provider.',
    query: `query ListCloudAccounts {
  cloud_accounts(order_by: {account_name: asc}) {
    id
    account_name
    cloud_provider
    account_type
    status
    budget
    created_at
  }
}`,
    variables: null,
  },
  {
    groupId: 'cost-management',
    title: 'Get Spend Breakdown by Account',
    description: 'Aggregate spending across accounts for a date range.',
    query: `query SpendByAccount($startDate: timestamp!, $endDate: timestamp!) {
  cloud_accounts {
    id
    account_name
    cloud_provider
    spends_aggregate(where: {
      _and: [{date: {_gte: $startDate}}, {date: {_lte: $endDate}}]
    }) {
      aggregate {
        sum { amount }
        count
      }
    }
  }
}`,
    variables: `{
  "startDate": "2026-01-01T00:00:00",
  "endDate": "2026-01-31T23:59:59"
}`,
  },
  {
    groupId: 'recommendations',
    title: 'Get Recommendations by Severity',
    description: 'Fetch open recommendations sorted by severity with estimated savings.',
    query: `query GetRecommendations($limit: Int, $offset: Int) {
  recommendation(
    where: {status: {_in: ["Open", "Assigned"]}}
    order_by: [{severity: asc}, {estimated_savings: desc}]
    limit: $limit
    offset: $offset
  ) {
    id
    recommendation
    rule_name
    category
    severity
    status
    estimated_savings
    cloud_resourse {
      name
      region
      service_name
    }
  }
  recommendation_aggregate(where: {status: {_in: ["Open", "Assigned"]}}) {
    aggregate { count }
  }
}`,
    variables: `{
  "limit": 20,
  "offset": 0
}`,
  },
  {
    groupId: 'kubernetes',
    title: 'List K8s Workloads',
    description: 'Get workloads across clusters with resource usage.',
    query: `query ListK8sWorkloads($accountId: uuid!, $limit: Int) {
  k8s_workloads(
    where: {cloud_account_id: {_eq: $accountId}}
    order_by: {name: asc}
    limit: $limit
  ) {
    id
    name
    namespace
    workload_type
    replicas
    status
    cpu_request
    cpu_limit
    memory_request
    memory_limit
  }
}`,
    variables: `{
  "accountId": "your-account-uuid",
  "limit": 50
}`,
  },
  {
    groupId: 'events-incidents',
    title: 'Fetch Recent Events',
    description: 'Retrieve recent events with severity and status.',
    query: `query RecentEvents($limit: Int!, $offset: Int!) {
  events(
    order_by: {created_at: desc}
    limit: $limit
    offset: $offset
  ) {
    id
    title
    severity
    source
    status
    created_at
    cloud_account {
      account_name
    }
  }
  events_aggregate {
    aggregate { count }
  }
}`,
    variables: `{
  "limit": 50,
  "offset": 0
}`,
  },
  {
    groupId: 'tickets',
    title: 'Create a Ticket',
    description: 'Create a new ticket linked to an integration (e.g., Jira).',
    query: `mutation CreateTicket($input: TicketsInsertOneInput!) {
  tickets_insert_one(object: $input) {
    data {
      insert_tickets_one {
        id
        ticket_id
        url
        message
      }
    }
  }
}`,
    variables: `{
  "input": {
    "title": "High CPU usage on prod-api-server",
    "description": "CPU consistently above 90% for the last 2 hours",
    "severity": "High",
    "integration_id": "your-integration-uuid",
    "project_key": "OPS",
    "source": "nudgebee",
    "account_id": "your-account-uuid"
  }
}`,
  },
  {
    groupId: 'ai-llm',
    title: 'Send an AI Message',
    description: 'Send a message to the AI assistant and receive a response.',
    query: `mutation AiFollowup($request: AiFollowupResponseInput!) {
  ai_followup_response(request: $request) {
    conversation_id
    response
    references
    status
  }
}`,
    variables: `{
  "request": {
    "message": "What are the top cost recommendations for my AWS account?",
    "conversation_id": null,
    "account_id": "your-account-uuid"
  }
}`,
  },
  {
    groupId: 'observability',
    title: 'Query Logs',
    description: 'Search application logs with label filters.',
    query: `mutation FetchLogs($request: LogsQueryInput!) {
  logs_query(request: $request) {
    timestamp
    severity
    message
    labels
  }
}`,
    variables: `{
  "request": {
    "account_id": "your-account-uuid",
    "query": "{namespace=\\"production\\"}",
    "start": "2026-02-15T00:00:00Z",
    "end": "2026-02-15T23:59:59Z",
    "limit": 100
  }
}`,
  },
  {
    groupId: 'automation',
    title: 'List Auto-Pilot Policies',
    description: 'Retrieve automation policies with their approval status.',
    query: `query ListAutoPilotPolicies($limit: Int, $offset: Int) {
  auto_pilot(
    order_by: {created_at: desc}
    limit: $limit
    offset: $offset
  ) {
    id
    name
    description
    status
    trigger_type
    created_at
    auto_pilot_approval_policy {
      approval_type
      status
    }
  }
}`,
    variables: `{
  "limit": 20,
  "offset": 0
}`,
  },
  {
    groupId: 'org-users',
    title: 'List Tenant Users',
    description: 'Retrieve all users in the current tenant with their roles.',
    query: `query ListTenantUsers {
  tenant_users {
    user {
      id
      username
      display_name
      status
      user_roles {
        role
        entity_type
        entity_id
      }
    }
  }
}`,
    variables: null,
  },
];
