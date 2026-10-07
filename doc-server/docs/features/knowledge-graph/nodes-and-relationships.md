---
sidebar_position: 3
sidebar_label: Nodes and Relationships
keywords: [knowledge graph, node types, relationship types, edges, node details]
---

# Nodes and Relationships

Every node in the graph is one resource, and every edge is one relationship between two resources, drawn as an arrow from the first to the second. This page explains how to read them and lists every type the graph uses.

## Reading a node

Each node card shows:

- **Icon** — the vendor or language logo, for example PostgreSQL, Redis, Kafka, Go or Java, when NudgeBee can tell; otherwise an icon for the type.
- **Name** — the resource's name.
- **Type line** — the node's type, for example *Workload* or *ComputeInstance*, sometimes with a role such as *Database*, *Cache* or *Queue*, and its location, such as a region.
- **Account line** — the account it belongs to, and its namespace for a Kubernetes resource. A resource you declared by hand outside any connected account reads *Not in a connected account*.

The border is **blue** for workloads and **green** for everything else.

### Type and sub-type

Every node has a **type**, such as `Database`, `ComputeInstance` or `Workload`, that means the same thing in every cloud. Most also have a **sub-type** that says exactly what it is: a `Database` can be an `RDSInstance`, a `CloudSQLInstance` or an `AzureSQLDatabase`; a `Workload` can be a `KubernetesDeployment` or a `KubernetesStatefulSet`. The **Node Type** filter is organized the same way: select a type to see all of it, or expand it to pick sub-types.

## Node details

Click the ⓘ on a node to open **Node Details**.

| Shows | What it is |
|:---|:---|
| **Unique Key** | The identifier NudgeBee uses for the resource across rebuilds, with a copy button. |
| **Last Seen** | When the graph last saw the resource. |
| **Path to this node** | When you have clicked through nodes, the route from the first one to this one, with each relationship. |
| **Labels** | The resource's properties: its labels, tags and collected details such as region, engine or replica count. |

Kubernetes resources have more tabs:

| Resource | Extra tabs |
|:---|:---|
| Namespace, Node, Pod | Utilization Trends, Related Events |
| Workload, Job, CronJob | Utilization Trends, Related Events, Traces (last 24 hours), Logs (last 60 minutes), App Dashboard, Log Group |

## Edge details

Click an edge to open **Edge Details**. It shows the relationship type, when the edge was last seen, and the properties recorded for it. What those are depends on where the edge came from:

| Edge from | Properties you may see |
|:---|:---|
| eBPF | Protocol, latency, status, the source and destination workloads |
| Distributed traces | Protocol, latency, request and failure counts, bytes sent and received, status |
| Datadog APM | Operation, span kind, protocol, the Datadog services at each end |
| New Relic APM | Request count, protocol, the New Relic services at each end |

When more than one source sees the same call, NudgeBee keeps one edge and records the metrics from each source, with the other sources' values prefixed by the source's name, for example `traces_latency_ms`.

## Node types

| Group | Types |
|:---|:---|
| Applications | Service, Workload, ExternalService, ServerlessFunction, Job, CronJob |
| Data | Database, Cache, MessageQueue, Queue, Topic |
| Kubernetes | Cluster, ManagedCluster, Namespace, Node, Pod, K8sService, Ingress, ConfigMap, K8sSecret, K8sServiceAccount, PersistentVolume, PersistentVolumeClaim, ComputeInstancePool, CustomResource |
| Compute and network | ComputeInstance, LoadBalancer, BackendPool, VPC, Subnet, SecurityGroup, NetworkInterface, RouteTable, NetworkGateway, PrivateEndpoint, PublicIP, DNSZone, CDN, APIGateway |
| Storage and build | Storage, ContainerRegistry, ContainerImage, BackupVault, BackupPolicy, HelmChart, Repository |
| Security and operations | ServiceIdentity, SecretVault, EncryptionKey, SecurityService, MonitoringService, LogAggregator, EmailService, AIService, InfraStack |
| People and code | SourceControlOrg, UserAccount, UserGroup, OnCallService |
| Other | CloudResource — a cloud resource that does not fit another type |

`ExternalService` is something your services call that NudgeBee cannot place in a connected account, for example a SaaS API. Where it can, NudgeBee replaces it with the real cloud resource behind the hostname.

Kubernetes Jobs and CronJobs from your cluster inventory appear as **Workload** nodes, with the sub-type (`KubernetesJob`, `KubernetesCronJob`) telling them apart. The `Job` and `CronJob` types are used for scheduled jobs found in other ways, such as GCP Cloud Scheduler jobs.

## Relationship types

Read each one as *source → destination*.

### Communication

| Relationship | Meaning |
|:---|:---|
| `CALLS` | The source sends requests to the destination: an HTTP or gRPC call, a database query. |
| `PUBLISHES_TO` | The source writes messages to a queue or topic. |
| `SUBSCRIBES_TO` | The source reads messages from a queue or topic. |
| `ROUTES_TO` | A load balancer, CDN or gateway sends traffic to a backend. |
| `ROUTES_TO_SERVICE` | An ingress sends traffic to a Kubernetes service. |
| `ROUTES_THROUGH` | Traffic passes through the destination, for example a route table through a gateway. |
| `RESOLVES_TO` | A DNS name resolves to the destination. |
| `EXPOSES` | A workload is exposed through a Kubernetes service. |
| `CONNECTION_REJECTED` | The network refused connections from the source to the destination. |

### Infrastructure

| Relationship | Meaning |
|:---|:---|
| `RUNS_ON` | The source runs on or in the destination: a pod on a node, a node on an EC2 instance, a cluster on EKS, a workload in a namespace, a namespace or node in a cluster. |
| `RUNS_IN` | An ECS service runs in an ECS cluster. |
| `HOSTED_ON` | The source is placed in or attached to the destination, such as a VPC, subnet, host or security group. |
| `BELONGS_TO` | The source is part of the destination, for example a config map in a namespace. |
| `MANAGES` | The source manages the destination, for example a CloudFormation stack and its resources, or a Karpenter node pool and the node claims it creates. |
| `ASSOCIATED_WITH` | The two are attached, for example an elastic IP and an instance. |
| `PROTECTS` | A security group or firewall protects the destination. |

### Storage, configuration and images

| Relationship | Meaning |
|:---|:---|
| `MOUNTS` | A workload mounts a persistent volume claim. |
| `IS_BOUND_TO` | A persistent volume claim is bound to a persistent volume. |
| `PROVIDES_STORAGE` | A persistent volume is backed by a cloud disk. |
| `STORES_IN` | A backup plan stores its backups in a backup vault. |
| `USES_CONFIG` | A workload reads a config map. |
| `USES_SECRET` | A workload reads a secret. |
| `USES_IMAGE` | A workload or function runs a container image. |
| `PULLS_FROM` | A workload pulls images from a container registry. |
| `IS_CONFIGURED_BY` | A workload is deployed from a Helm chart, or a chart comes from a Git repository. |
| `BUILT_FROM` | A workload is built from a Git repository. |

### Identity and security

| Relationship | Meaning |
|:---|:---|
| `USES_SERVICE_ACCOUNT` | A workload runs as a Kubernetes service account. |
| `RUNS_AS` | A compute resource runs as a cloud identity, such as an IAM role. |
| `ASSUMES` | An identity can assume another identity, such as a Kubernetes service account assuming an IAM role. |
| `HAS_ACCESS_TO` | An identity or user has access to a resource or repository. |
| `IS_ENCRYPTED_BY` | A resource is encrypted with a key. |
| `EMITS_LOGS_TO` | A resource sends its logs to a log destination. |

### People and ownership

| Relationship | Meaning |
|:---|:---|
| `OWNS` | A user or team owns a workload, namespace, cluster or cloud resource; an organization, group or user owns a repository; a team owns an on-call service. |
| `MEMBER_OF` | A user or team belongs to a team or organization. |
| `SAME_AS` | A GitHub, GitLab or PagerDuty user is the same person as a NudgeBee user. |

## Related

- [Explore the Graph](./exploring.md)
- [Where the Data Comes From](./data-sources.md) — which source produces which nodes and relationships
