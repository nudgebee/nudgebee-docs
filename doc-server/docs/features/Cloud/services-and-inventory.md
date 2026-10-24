---
sidebar_position: 7.2
sidebar_label: Services & Inventory
keywords: [cloud services, cloud inventory, ec2 instances, rds, s3 buckets, ecs, azure vm, cloud sql, compute engine, resource list]
---

# Services & Inventory

Which services NudgeBee collects, and what works for each, is listed in [Supported Cloud Services](./supported-services.md). This page describes the screens.

## Services tab

**Infra → Cloud → Services** lists every service in the account.

- **Columns:** **Service Name**, **Resources**, **Recommendations**, **Total Cost**, **% Change** (against the previous period of the same length) and **Estimated Savings**. Sorted by cost, highest first.
- **Filters:** date range (last 30 days by default, up to 6 months back), **Service Name**, **Region**, **Tag Key**, and **Download**.
- **Expand a service** for three tabs:
  - **Resources** — Resource Name, Type, Region, Tags, Recommendations, Total Cost and Estimated Savings, filterable by Type, Region and Tag Key. Open a resource's **Details** for its ID (copyable), status, creation and first/last seen times, and its open recommendations and potential savings.
  - **Cost Trend**
  - **Recommendations**

Cost is shown in the account's billing currency; savings estimates are shown in USD.

## Service tabs

Each main service has its own tab (for example **EC2**, **RDS**, **S3** and **ECS** on AWS — see the [tab map](./index.md#tabs)) with four sub-tabs:

| Sub-tab | Shows |
|---|---|
| **Summary** | Counts for the service (for compute: instances, instance types, disks, network interfaces, and spot or reserved where the provider has them), instance states, the top instance types, errors, optimizations, recent events, the service's cost trend and live metrics from the provider |
| **Optimize** | The service's recommendations — **Right Sizing**, **Configuration**, **Security** and **Infra Upgrade**. See [Optimize](./optimize.md). |
| **Events** | The account's events for this service |
| **Instances** | The resources, described below |

On every **Instances** list — compute, databases, storage and ECS — **Refresh** (write access) reloads the list from the cloud provider.

### Compute instances (EC2, VM, Compute Engine)

- **Columns:** **Instance ID**, **Instance Name**, **CPU usage**, **Memory usage**, **State**, **Cost**, **Tags**, **Launch Time**. CPU and memory usage need the provider's monitoring agent on the instance (CloudWatch Agent on AWS, Ops Agent on GCP).
- **Filters:** search by instance ID or name, **State**, **Region**, **Tag Key**, **Tag Value**.
- **Expand an instance** for **Details** (networking, disks, security groups or equivalents, and alarms), **Monitoring**, **Events** and **Action History**.
- Actions: see [Resource Actions](./resource-actions.md).

### Databases (RDS, Azure SQL, Azure SQL Managed Instances, Cloud SQL)

- **Columns:** **Instance Name**, **State**, **Engine**, **vCPU / Memory**, **Launch Time**, **Storage**, **Tags**, **Storage Type**.
- **Filters:** search by instance name, **State**, **Region**, **Tag Key**, **Tag Value**.
- **Expand an instance** for **Details**, **Monitoring**, **Events**, **Performance Insights** (top queries, wait events and load — turn on Performance Insights or the provider's equivalent if it's empty), **Logs** and **Action History**.

### Storage (S3, Blob Container, Cloud Storage)

- **Columns:** **Bucket Name**, **State**, **Tags**, **Created At**, **Cost**.
- **Filters:** search by bucket name, **State**, **Region**, **Tag Key**, **Tag Value**.
- **Expand a bucket** for **Monitoring** and **Events**.

### ECS (AWS)

Switch between **Clusters**, **Services** and **Tasks**:

| View | Columns | Expand for |
|---|---|---|
| **Clusters** | Cluster Name, Status, Services, Tasks, Container Instances, Tags, First Seen | Cluster Info, Monitoring, Capacity Providers, Settings, Tags |
| **Services** | Service Name, Capacity Provider, Replicas, Status, Tags, CreatedAt | Monitoring, Network Configuration, Deployment Configuration, Service Events, Deployments, Action History |
| **Tasks** | Task ID, Status, Launch Type, Tags, Started At | Monitoring, Task Info, Containers, Logs, Network, Tags |

## When something is missing

A new resource appears after the next sync, or sooner with **Sync Now** — see [Cloud Agent Synchronization](./cloud-agent-sync.md) and [A resource is missing from inventory](./troubleshooting.md#5-a-resource-is-missing-from-inventory).

## Related

- [Supported Cloud Services](./supported-services.md)
- [Resource Actions](./resource-actions.md)
- [Cloud Accounts](./index.md)
