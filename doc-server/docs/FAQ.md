---
sidebar_position: 4
---

# FAQ

### What are the open-source tools that NudgeBee uses?

#### Agent
- Prometheus (or VictoriaMetrics) - Metrics Collection and alerting
- OpenCost for calculating cost metrics for Pods/Workloads etc.
- Trivy for generating Docker image vulnerability related security recommendations
- Popeye for generating best practices related recommendations
- Kubewatch for K8s events collection

### What are the ML libraries that NudgeBee uses? What are the dependencies?
- TensorFlow for recommendations for replicas
- AWS Bedrock using LLAMA (optional) for AI-based recommendations on logs/errors

### What are the pre-conditions(software/hardware) for installing NudgeBee on my cluster?

#### For Agent:
- Helm chart for installation
- Prometheus, if already configured, else Nudgebee agent installs it
- Currently, NudgeBee uses Loki for log queries. For log-specific features, we will require Loki running on the cluster. We don't provide Loki as part of the Agent Installer.
- Permissions as specified in Helm charts

### What is the typical system requirement for running NB on my cluster? What is the expected cost of operations for running the base NudgeBee

#### For Agent:
Agent has multiple components. All of them combined take around 6GB memory and 3 core CPUs
This also includes Prometheus(Alertmanager/KubestateMetrics)
If we remove Prometheus components, then it takes around 3GB and 2 cores

#### For Server:
All server components take around 12GB RAM and 4 core CPUs
This includes running postgres/rabbitmq etc. If the customer is managing these dependencies, then it will take around 8GB RAM and 2 core CPUs

### How Nudgebee Optimizations Work with GitOps

Raise PRs from Nudgebee
- We have added support for raising PRs from specific optimization screens in Nudgebee.

GitOps(Flux/Argo) Reconciliation
- Disable reconciliation for given resources.

Nudgebee Autopilot Reconciliation
- NudgeBee provides annotations which can be used to ignore specific resources.

GitOps Way Of Configuring Nudgebee Optimizations -
- We want to provide this as an option using CRDs, though it's part of the roadmap.

### Can Nudgebee work on K3s/Kind/Minikube?
Yes, please refer to the Installation Guide for local testing.

### Does Nudgebee Docker images have any security vulnerabilities?
No, Nudgebee uses Alpine-based images to reduce overall size and security issues. We use AWS ECR and Nudgebee for scanning images maintained by us. We can share a security report for that as per request.

### Does Nudgebee have VAPT reports?
Yes, we use ZAP/manual pen testing for our security testing and can share reports based on request.

### Can I configure multiple clusters within a single NudgeBee server?
Yes, configure agents on each targeted cluster.

### What are different NudgeBee distributions?
NudgeBee has both SaaS and self-hosted solutions. As an end-user, you can use the SaaS solution to quickly validate/test the product and the self-hosted solution for long-term deployment (if there are compliance constraints which don't allow any kind of data movement).

### What is the Nudgebee release cycle?
We target to have a weekly release cycle with hotfixes as per requirements. We follow SemVer for our versioning.

### Can you provide more details on Data Retention Policies?

Currently, Nudgebee stores most of the data in Agents which get deployed on the cluster, so data remains within the cluster. Data retention for Agent components (traces/metrics/logs) is configurable and can be managed by the customer.

#### Agents store the following data:

Traces - Using ClickHouse, you can adjust how long you want to retain ClickHouse data. The default is 7 days.
Metrics - Using Prometheus, you can adjust Prometheus data retention.
Logs - We integrate with existing log services like Loki/ELK, so again, it depends on their data retention.


#### Servers store the following data:

Aggregated Metrics - We do aggregation on a daily basis. No retention policy yet. Would like to understand the use case.
Events - Troubleshooting pages. Current retention is 60 days. You can make it configurable.
Deleted Pods/Workloads etc. - We store deleted workloads/pods etc. No retention policy yet. Will share once that is there, maybe by next week.

### Does Nudgebee support Anomaly Detection?
No, this is part of the roadmap.

### Does NudgeBee support Predictive Analysis?
Yes, NudgeBee uses predictive analytics for replica rightsizing and continuous rightsizing.
