/**
 * Worked examples for the reference's "Common Examples" section.
 *
 * Every query here is written against a real action in `actions.graphql`, and
 * `generate-md-docs.js` validates all of them against the schema before it
 * writes anything — a wrong example fails the generation rather than shipping.
 *
 * That gate exists because the previous set was written for the Hasura schema
 * (table root fields, `spends_aggregate`, `uuid!` variables) and stayed in the
 * published reference for years after that layer was removed. These are the
 * first thing an integrator copies, so a wrong one costs more than a missing one.
 *
 * Shared shape worth knowing when adding an example: list actions take
 * `limit` / `offset` / `order_by: [QuerySortByRequest!]` / a typed `where`, and
 * answer with `{ rows { … } }`. Filter operators are per-type inputs
 * (`QueryWhereStringRequest` and friends) exposing `_eq`, `_in`, `_gte`,
 * `_ilike` and so on.
 */
module.exports = [
  {
    groupId: 'cloud-infrastructure',
    title: 'List Cloud Accounts',
    description: 'Retrieve all connected cloud accounts with their provider and sync status.',
    query: `query ListCloudAccounts {
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
}`,
    variables: null,
  },
  {
    groupId: 'cost-management',
    title: 'Get Spend Breakdown by Service',
    description: 'Group cloud spend by service over a date range. Grouping is a server-side argument, not a nested aggregate.',
    query: `query SpendByService($startDate: Datetime, $endDate: Datetime) {
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
}`,
    variables: `{
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-01-31T23:59:59Z"
}`,
  },
  {
    groupId: 'recommendations',
    title: 'Get Recommendations by Severity',
    description: 'Fetch open recommendations sorted by severity, with estimated savings.',
    query: `query GetRecommendations($limit: Int, $offset: Int) {
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
}`,
    variables: `{
  "limit": 25,
  "offset": 0
}`,
  },
  {
    groupId: 'kubernetes',
    title: 'List Kubernetes Pods',
    description: 'List active pods in one account, newest first.',
    query: `query ListK8sPods($accountId: String, $limit: Int) {
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
}`,
    variables: `{
  "accountId": "00000000-0000-0000-0000-000000000000",
  "limit": 50
}`,
  },
  {
    groupId: 'events-incidents',
    title: 'Fetch Recent Events',
    description: 'Read high-priority events that are still firing.',
    query: `query RecentEvents($limit: Int, $offset: Int) {
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
}`,
    variables: `{
  "limit": 50,
  "offset": 0
}`,
  },
  {
    groupId: 'tickets',
    title: 'List Tickets',
    description: 'List open tickets with their external reference.',
    query: `query ListTickets($limit: Int) {
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
}`,
    variables: `{
  "limit": 25
}`,
  },
  {
    groupId: 'agents',
    title: 'Check Collector Agent Health',
    description: 'See which collector agents are connected and when each last checked in.',
    query: `query AgentHealth {
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
}`,
    variables: null,
  },
  {
    groupId: 'organization-users',
    title: 'List User Groups',
    description: 'List the tenant’s user groups.',
    query: `query ListUserGroups($limit: Int) {
  usergroups_list(limit: $limit, order_by: [{column: "name", order: asc}]) {
    rows {
      id
      name
      description
      created_at
    }
  }
}`,
    variables: `{
  "limit": 50
}`,
  },
];
