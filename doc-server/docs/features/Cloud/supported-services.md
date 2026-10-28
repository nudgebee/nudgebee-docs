---
sidebar_position: 2
sidebar_label: Supported Cloud Services
---

# Supported Cloud Services

This page lists the AWS, Azure and GCP services NudgeBee collects, and what works for each. Ask NuBi *"is Cosmos DB supported?"* and it answers from this page.

This is the complete list. Other lists in these docs, such as real-time event filters, required APIs, IAM permission statements and the per-service tabs, each cover one feature. A service missing from one of those lists is still supported if it is listed here.

## How to read the tables

| Column | Meaning |
|---|---|
| **Resource type** | How the service is named in NudgeBee's inventory. Azure uses the ARM resource type (for example Cosmos DB is `Microsoft.DocumentDB/databaseAccounts`). Search by this name when a friendly name finds nothing. |
| **Inventory** | Resources are discovered and listed in the account's inventory. |
| **Metrics** | **Default** — NudgeBee charts a standard set of metrics automatically. **On request** — metrics are available when you or NuBi ask for specific metric names. |
| **Checks** | Examples of the built-in recommendations (best practice, security, cost) evaluated for the service. |
| **Fixes** | Recommendations or actions NudgeBee can apply for you, after approval. Others are guidance only. |
| **Events** | **Dedicated** — the service's lifecycle events are turned into NudgeBee events. **Generic** — create, update and delete activity is captured. Cloud alarms and alerts are collected for every service. |

**Cost** is collected from your billing data for **every billed service**, including services that are not listed here. **Account-wide recommendations** from AWS Cost Optimization Hub, Cost Explorer, Compute Optimizer and Trusted Advisor, Azure Advisor, and GCP Recommender also apply to every service those tools cover.

:::note When a new resource appears
Inventory is refreshed on the daily resource sync. A resource created after the last sync appears after the next one, or right away if you use **Sync Now** on the account. See [Cloud Agent Synchronization](./cloud-agent-sync.md) and [Troubleshooting](./troubleshooting.md#5-a-resource-is-missing-from-inventory).
:::

## Azure

| Service | Resource type | Inventory | Metrics | Checks | Fixes | Events |
|---|---|---|---|---|---|---|
| Virtual Machines | `Microsoft.Compute/virtualMachines` | ✓ | Default | idle/underutilized, backup, disk encryption, boot diagnostics, missing alerts | Start/stop/restart/deallocate; boot diagnostics; create missing alerts | Dedicated |
| VM Scale Sets | `Microsoft.Compute/virtualMachineScaleSets` | ✓ | On request | empty scale set, zone redundancy, upgrade policy | Scale up/down; overprovisioning | Generic |
| Managed Disks | `Microsoft.Compute/disks` | ✓ | On request | unattached disks, SKU upgrades, encryption | Remove unattached disks | Generic |
| SQL Database | `Microsoft.Sql/servers` | ✓ | Default | public access, TDE, backups, right-sizing, missing alerts | Pause/resume; public access; TDE; create missing alerts | Dedicated |
| SQL Managed Instance | `Microsoft.Sql/managedInstances` | ✓ ¹ | Default | — | — | Generic |
| Cosmos DB | `Microsoft.DocumentDB/databaseAccounts` | ✓ | On request | automatic failover disabled, single region | Enable automatic failover | Generic |
| Azure Cache for Redis | `Microsoft.Cache/redis` | ✓ | On request | non-SSL port, TLS version, public access, oversized SKU | Disable non-SSL port; minimum TLS 1.2; regenerate keys | Generic |
| MySQL Flexible Server | `Microsoft.DBforMySQL/flexibleServers` | ✓ | On request | backups, stopped server | Backups; start/stop/restart | Generic |
| PostgreSQL Flexible Server | `Microsoft.DBforPostgreSQL/flexibleServers` | ✓ | On request | backups, stopped server | Backups; start/stop/restart | Generic |
| MariaDB | `Microsoft.DBforMariaDB/servers` | ✓ | On request | SSL, backups, stopped server | SSL; backups; start/stop/restart | Generic |
| Storage Accounts | `Microsoft.Storage/storageAccounts` | ✓ | Default | HTTPS only, TLS, public blob access, redundancy and tier | HTTPS only; minimum TLS; disable public blob access; disable shared keys | Dedicated |
| Azure Files | `Microsoft.Storage/storageAccounts/fileServices` | ✓ | On request | unused shares, quota, SMB encryption | Delete unused share | Generic |
| AKS | `Microsoft.ContainerService/managedClusters` | ✓ | On request | RBAC, network policy, Azure Policy, Kubernetes version | Start/stop cluster; enable RBAC | Dedicated |
| Container Apps | `Microsoft.App/containerApps` | ✓ | On request | ingress, managed identity, Key Vault secrets | Ingress; managed identity; replica counts | Generic |
| Container Registry | `Microsoft.ContainerRegistry/registries` | ✓ | On request | admin user, public access, network rules | Admin user; public access; IP rules | Generic |
| App Service | `Microsoft.Web/sites` | ✓ | On request | HTTPS only, client certificates, stopped apps | HTTPS; client certs; start/stop/restart | Dedicated |
| Azure Functions | `Microsoft.Web/sites/functions` | ✓ | On request | HTTPS only, authentication, old runtime | HTTPS; start/stop/restart | Generic |
| App Service Plan | `Microsoft.Web/serverfarms` | ✓ | On request | empty, oversized, premium review | Delete empty plan | Generic |
| Logic Apps | `Microsoft.Logic/workflows` | ✓ | On request | disabled, no triggers/actions | — | Generic |
| Key Vault | `Microsoft.KeyVault/vaults` | ✓ | On request | soft delete, purge protection | — | Generic |
| Virtual Network | `Microsoft.Network/virtualNetworks` | ✓ | On request | DDoS protection, NSG on subnets, address space | — | Generic |
| Network Security Groups | `Microsoft.Network/networkSecurityGroups` | ✓ | On request | permissive inbound rules, unassociated | Delete unassociated NSG | Generic |
| Network Interfaces | `Microsoft.Network/networkInterfaces` | ✓ | On request | orphaned, public IP attached | Delete orphaned NIC | Generic |
| Public IP | `Microsoft.Network/publicIPAddresses` | ✓ | On request | unassociated IP | Delete unassociated IP | Generic |
| Load Balancer | `Microsoft.Network/loadBalancers` | ✓ | On request | unused, health probes, Basic SKU | Delete unused | Generic |
| Application Gateway | `Microsoft.Network/applicationGateways` | ✓ | On request | WAF, HTTP/2, stopped | WAF; HTTP/2; start/stop | Generic |
| Azure Firewall | `Microsoft.Network/azureFirewalls` | ✓ | On request | threat intelligence, DNS proxy | Both | Generic |
| Front Door (classic) | `Microsoft.Network/frontDoors` | ✓ | On request | WAF, HTTPS redirect | Both | Generic |
| Front Door Standard/Premium | `Microsoft.Cdn/profiles` | ✓ | On request | profile with no endpoints | Enable WAF | Generic |
| DNS Zones | `Microsoft.Network/dnsZones` | ✓ | On request | CAA record | Add CAA record | Generic |
| ExpressRoute | `Microsoft.Network/expressRouteCircuits` | ✓ | On request | Global Reach, Standard SKU | Both | Generic |
| DDoS Protection | `Microsoft.Network/ddosProtectionPlans` | ✓ | On request | plan with no VNets | — | Generic |
| Private Endpoints | `Microsoft.Network/privateEndpoints` | ✓ ¹ | On request | — | — | Generic |
| Network Watcher | `Microsoft.Network/networkWatchers` | ✓ | On request | — | — | Generic |
| Event Grid | `Microsoft.EventGrid/topics` | ✓ | On request | public access, managed identity, local auth | — | Generic |
| Log Analytics | `Microsoft.OperationalInsights/workspaces` | ✓ | On request | low retention | Set retention | Generic |
| Azure Monitor | `Microsoft.Insights` | ✓ | On request | disabled alerts, action groups without receivers | — | Generic |
| Metric Alerts | `Microsoft.Insights/metricAlerts` | ✓ | On request | disabled, no action group, broad scope | Enable/disable; evaluation settings | Generic |
| Scheduled Query Rules | `Microsoft.Insights/scheduledQueryRules` | ✓ ¹ | On request | disabled, no action group, empty query | Enable/disable; evaluation settings | Generic |
| Activity Log Alerts | `Microsoft.Insights/activityLogAlerts` | ✓ ¹ | On request | disabled, no conditions, broad scope | Enable disabled alert | Generic |
| Recovery Services Vault | `Microsoft.RecoveryServices/vaults` | ✓ | On request | soft delete, LRS storage | — | Generic |
| Azure Machine Learning | `Microsoft.MachineLearningServices/workspaces` | ✓ | On request | public access, HBI, managed identity | Public access; managed identity | Generic |
| Bot Service | `Microsoft.BotService/botServices` | ✓ | On request | public access, managed identity | Both | Generic |
| Azure Arc machines | `Microsoft.HybridCompute/machines` | ✓ | On request | disconnected, outdated agent, stale status | — | Generic |
| Entra ID role assignments | `Microsoft.Authorization/roleAssignments` | ✓ | — | over-permissive roles, expiring credentials | — | Generic |
| Azure Policy | `Microsoft.Authorization/policyAssignments` | ✓ | — | not enforced, no assignments | — | Generic |
| Defender for Cloud | `Microsoft.Security/pricings` | ✓ | — | Free tier + Defender assessments | Upgrade from free tier | Generic |
| Microsoft Sentinel | `Microsoft.SecurityInsights` | ✓ | — | disabled rules, stale incidents, no connectors | — | Generic |
| Azure Pipelines | `Microsoft.DevOps/pipelines` | ✓ | — | failed builds, failure rate | — | — |
| Managed identities | `Microsoft.ManagedIdentity/userAssignedIdentities` | ✓ | — | — | — | Generic |
| SSH public keys | `Microsoft.Compute/sshPublicKeys` | ✓ | — | — | — | Generic |

Azure Monitor alerts are collected for every resource. Event Grid activity (create, update, delete) is captured for every Azure resource, with dedicated handling for VMs, SQL databases, storage accounts, App Service and AKS.

## AWS

| Service | Inventory | Metrics | Checks | Fixes | Events |
|---|---|---|---|---|---|
| EC2 (incl. EBS, Elastic IPs) | ✓ | Default | idle/underutilized, orphaned volumes, gp2→gp3, IMDSv2, missing alarms | Start/stop/reboot; gp2→gp3; create missing alarms | Dedicated |
| RDS / Aurora | ✓ | Default (+ Performance Insights) | public access, encryption, backups, right-sizing, Graviton, missing alarms | Start/stop/reboot; create missing alarms | Dedicated |
| ECS | ✓ | Default | Container Insights, task definition hygiene, service health, utilization | Redeploy; scale | Dedicated |
| Fargate | ✓ | Default | platform version, task definitions, utilization | — | Via ECS |
| Lambda | ✓ | Default | deprecated runtime, DLQ, concurrency, tracing | — | Dedicated |
| EKS | ✓ | Default | public endpoint, logging, secret encryption | — | — |
| S3 | ✓ | Default | public ACL/policy, versioning, lifecycle | — | — |
| DynamoDB | ✓ | Default | PITR, encryption, capacity mode, autoscaling, TTL | — | — |
| ElastiCache | ✓ | On request | engine version, encryption, Graviton, idle, hit rate | — | — |
| Redshift | ✓ | Default | encryption, public access, audit logging, idle | — | — |
| OpenSearch | ✓ | Default | encryption, dedicated masters, logs | — | — |
| EFS | ✓ | Default | encryption, lifecycle policy | — | — |
| MSK | ✓ | On request | encryption, public access, monitoring | — | — |
| SQS | ✓ | Default | DLQ, encryption | — | Dedicated |
| SNS | ✓ | Default | encryption, public access, delivery logging | — | Dedicated |
| SES | ✓ | On request | DKIM, MAIL FROM, notifications | — | — |
| Elastic Load Balancing (ALB, NLB, CLB) | ✓ | Default | unused, cross-zone, access logs, missing alarms | Create missing alarms | Dedicated |
| CloudFront | ✓ | Default | WAF, HTTPS, origin access control, logging | — | — |
| VPC | ✓ | On request | unallocated Elastic IP | — | — |
| Route 53 | ✓ ¹ | On request | query logging, DNSSEC, health checks | — | — |
| Direct Connect | ✓ | On request | connection, redundancy, BGP | — | — |
| WAF | ✓ | On request | logging, unassociated web ACLs, rate limiting | — | — |
| ECR / ECR Public | ✓ | On request | tag immutability, scan on push | — | — |
| CloudWatch | ✓ | On request | log retention and encryption | — | Alarm state changes |
| CloudTrail | ✓ | On request | multi-region, log validation, encryption | — | — |
| CloudFormation | ✓ | On request | drift, termination protection | — | — |
| KMS | ✓ | On request | key rotation, public key policy | — | — |
| Secrets Manager | ✓ | On request | unused secrets, rotation | — | — |
| IAM | ✓ | — | MFA, root keys, password policy, unused keys | — | — |
| Security Hub | ✓ | On request | Security Hub controls | — | — |
| GuardDuty | ✓ | On request | enabled, S3 and EKS protection | — | — |
| Inspector | ✓ | On request | coverage, critical findings | — | — |
| AWS Config | ✓ | On request | recorder, rules, conformance packs | — | — |
| Systems Manager | ✓ | On request | offline instances, patches, agent version | Run command | — |
| Backup | ✓ | On request | vault encryption, lock, plan rules | — | — |
| Elastic Beanstalk | ✓ | On request | platform version, health | — | — |
| Step Functions | ✓ | On request | failure rate, logging, tracing | — | — |
| SageMaker | ✓ | On request | notebook internet access, encryption | — | — |
| Bedrock | ✓ | On request | invocation logging, encryption | — | — |
| X-Ray, CodeArtifact | ✓ | On request | Encryption, sampling rules, repository policy | — | — |

CloudWatch alarm state changes are collected for every service. EC2, RDS, ECS, Lambda, load balancer, SQS and SNS events arrive through an EventBridge rule that onboarding creates only in **Standard** access mode; in **Read-Only** mode those events are not forwarded unless you [Connect EventBridge](./access-modes-and-real-time-events.md#aws--connect-eventbridge).

:::note AWS fixes need Standard access
AWS fixes and alarm creation need the account to be onboarded in **Standard** access mode (`NudgebeeAccessMode=readwrite` in the CloudFormation template). In read-only mode NudgeBee shows the same recommendations as guidance.
:::

## GCP

| Service | Inventory | Metrics | Checks | Fixes | Events |
|---|---|---|---|---|---|
| Compute Engine | ✓ | Default | stopped VMs, old instances, missing alerts | Start/stop/reboot/reset; create missing alerts | Dedicated |
| Persistent Disk | ✓ | — | orphaned disks, disk type | — | — |
| Cloud Storage | ✓ | Default | public access, versioning, lifecycle, CMEK | Versioning; uniform bucket-level access; create missing alerts | Dedicated |
| Cloud SQL | ✓ | Default | inactive, backups, SSL, HA, missing alerts | Start/stop/restart; create missing alerts | Dedicated |
| GKE | ✓ | Default | autoscaling, workload identity, network policy, missing alerts | Resize; create missing alerts | Dedicated |
| Cloud Run | ✓ | Default | always-on, public ingress, memory, missing alerts | Create missing alerts | Dedicated |
| Cloud Functions | ✓ | Default | inactive, memory, public access, missing alerts | Create missing alerts | Dedicated |
| BigQuery | ✓ | Default | expiration, partitioning, clustering, CMEK | Create missing alerts | — |
| Pub/Sub | ✓ | On request | dead-letter topics, retention, missing alerts | Create missing alerts | — |
| Cloud Load Balancing | ✓ | — | unused forwarding rules, health checks, missing alerts | Create missing alerts | Dedicated |
| Networking (VPC, subnets) | ✓ | — | — | — | — |
| Network interfaces | ✓ | — | multiple interfaces, external IP | — | — |
| Vertex AI | ✓ | — | — | — | — |
| Memorystore, Firestore, Secret Manager, Artifact Registry, Cloud Tasks, Cloud Scheduler, IAM | ✓ ¹ | — | Memorystore: missing alerts | — | — |

Cloud Monitoring incidents are collected for every service.

¹ Discovered once the service appears in the account's billing data, rather than on the first sync after onboarding.

## Related

- [Cloud Agent Synchronization](./cloud-agent-sync.md)
- [Cloud Sync & Missing Data Troubleshooting](./troubleshooting.md)
- [Azure](./Azure.md) · [AWS](./AWS.md) · [GCP](./GCP.md)
