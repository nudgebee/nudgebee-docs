---
sidebar_position: 4
sidebar_label: Where the Data Comes From
keywords: [knowledge graph, data sources, flow sources, coverage, ebpf, traces, rebuild]
---

# Where the Data Comes From

NudgeBee builds the graph from three kinds of source:

- **Inventory** — the resources in your clusters, cloud accounts and integrations.
- **Flow sources** — the calls services actually make to each other, from eBPF, traces and APM tools.
- **Links between them** — NudgeBee joins resources from different sources, such as a Kubernetes node and the EC2 instance it runs on.

You do not set up the graph separately. Connect a cluster, an account or an integration, and its data appears at the next hourly rebuild.

## Inventory

| Source | Adds | You need |
|:---|:---|:---|
| **Kubernetes** | Clusters, namespaces, nodes, workloads, pods, services, ingresses, persistent volumes, config maps, secrets, service accounts, Helm charts, Karpenter node pools | A cluster connected with the NudgeBee agent. Workloads, pods and nodes come from the cluster inventory. Services, volumes, config maps, secrets, ingresses, service accounts and Karpenter objects are read live from the agent, so they drop out while the agent is disconnected and return when it reconnects. |
| **AWS, GCP, Azure** | Compute, databases, storage, queues, load balancers, networks, DNS, IAM and the rest of the cloud inventory | A connected cloud account. Resources appear once NudgeBee has discovered them. |
| **GitHub, GitLab** | Organizations or groups, repositories or projects, teams, users, and who can access which repository | An enabled GitHub or GitLab integration |
| **PagerDuty** | On-call services, teams and users | An enabled PagerDuty integration |
| **Ownership** | Which user or team owns each workload, namespace, cluster and cloud resource | Owners set under **Admin → Access & Users → Ownership** |
| **Identity** | One node per NudgeBee user, linked to the same person's GitHub, GitLab or PagerDuty account | Users matched to their integration accounts |
| **You** | Dependencies and resources no collector can see | Declared in Knowledge Graph **Settings** |

## Flow sources

Flow sources add the calls between services, as `CALLS` relationships. Each one can be switched off under [Coverage](#choose-what-feeds-the-graph-coverage).

| Flow source | What it observes | You need |
|:---|:---|:---|
| **eBPF** | Network calls between workloads in a cluster, captured by the NudgeBee agent | A cluster with the agent connected |
| **Traces** | Calls in your OpenTelemetry traces, from the last 2 hours at each rebuild | A cluster with the agent connected, and a trace provider connected for its account. See [Observability integrations](../../integrations/Observability/index.md). |
| **Datadog APM** | Service-to-service calls Datadog APM has observed | A Datadog integration with an API key and application key, linked to an account |
| **New Relic APM** | Outgoing calls in New Relic span data, from the last 24 hours | A New Relic integration with an API key and account id, linked to an account |

eBPF and Traces can add a service or an external dependency the graph did not have yet. Datadog APM and New Relic APM only add calls between resources that are already in the graph.

When several sources see the same call, NudgeBee keeps one edge and records what each source measured. See [Edge details](./nodes-and-relationships.md#edge-details).

## Links between sources

After collecting, NudgeBee connects resources that describe the same thing or depend on each other across sources, for example:

- A Kubernetes node `RUNS_ON` the EC2 or Compute Engine instance behind it.
- A cluster `RUNS_ON` its EKS, GKE or AKS cluster.
- A Kubernetes service account `ASSUMES` the IAM role or GCP service account it is mapped to.
- A persistent volume is backed by (`PROVIDES_STORAGE`) an EBS volume or persistent disk.
- A workload `PULLS_FROM` its ECR repository, and a Cloud Run service from Artifact Registry.
- An AWS load balancer `ROUTES_TO` the Kubernetes service and pods behind it.
- A DNS zone `RESOLVES_TO` the load balancer it points at.

When traces or eBPF show a call to a hostname, NudgeBee replaces the generic external dependency with the real cloud resource where it can, such as the RDS instance or S3 bucket the hostname belongs to.

## How fresh it is

| What | When it updates |
|:---|:---|
| The whole graph | Rebuilt every hour. There is no button to rebuild on demand. |
| A newly connected cluster, account or integration | Appears at the next rebuild after NudgeBee has collected from it. |
| A resource you delete | Disappears at the next rebuild after NudgeBee stops seeing it. |
| A call between services | Taken from what each flow source observes at each rebuild: the last 2 hours of traces, and the last 24 hours of Datadog APM and New Relic APM data. Removed once it has not been seen for 7 days. |
| An external dependency (`ExternalService`) | Removed once nothing has called it for 7 days. |
| An account that is disabled or deleted | Its resources are removed at the next rebuild, or straight away when the account is deleted. |

## Choose what feeds the graph (Coverage)

Tenant admins can choose which cloud accounts and flow sources feed the graph.

1. Open **Troubleshoot → Knowledge Graph** and click **Settings**.
2. On the **Coverage** tab, tick the **Cloud accounts** and **Flow sources** to include. Use **Search accounts** to find an account by name, number or provider.
3. Click **Save**.

How the selection works:

- **Leaving everything ticked means "all"**, including accounts you connect later. If you untick every box, NudgeBee also saves "all", not "none", and says so before you save.
- **Removing takes effect immediately.** When you untick an account, every node and edge it owns is removed on save. When you untick a flow source, every edge it created is removed. The **Save** button turns red and asks you to confirm.
- **Adding takes effect at the next hourly rebuild.** Ticking an account or flow source again does not bring its data back until then.
- Every change is recorded in the audit log under the **Knowledge graph** category.

## Related

- [Explore the Graph](./exploring.md)
- [Nodes and Relationships](./nodes-and-relationships.md)
- [Connect a Kubernetes cluster](../../installation/agent/index.md)
- [Cloud accounts](../Cloud/index.md)
