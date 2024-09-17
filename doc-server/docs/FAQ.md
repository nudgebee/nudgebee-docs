---
sidebar_position: 4
---

# FAQ

### What are the open-source tools that NudgeBee uses?

#### Agent
- Prometheus(Or VictoriaMetrics) - Metrics Collection and alerting
- OpenCost for calculating cost metrics for Pods/Workloads etc.
- Trivy for Generating Docker Image Vulnerability related security Recommendations
- Popeye for generating Best Practices related recommendation
- Kubewatch For K8s Events Collection

### What are the ML libraries that NudgeBee uses? What are the dependencies?
- Tensorflow for Recommendation for replicas
- AWS BedRock Using LLAMA(Optional) for AI based recommendation on Logs/Errors

### What are the pre-conditions(software/hardware) for installing NudgeBee on my cluster?

#### For Agent:
- Helm Chart for Installation
- Prometheus, if already configured else Nudgebee agent install it
- Currently Nudgebee uses loki for Log queries, for Log specific features we will require Loki running on the cluster. We don't provide loki as part of Agent Installer.
- Permissions as specified in Helm charts

### What is the typical system requirement for running NB on my cluster? What is the expected cost of operations for running the base NudgeBee

#### For Agent:
Agent Has multiple components, All of them combined take around 6GB memory and 3 Core CPUs
This also includes Prometheus(Alertmanager/KubestateMetrics)
If We remove Prometheus components then it takes around 3GB and 2 Core

#### For Server:
All Server components take around 12GB ram and 4 Core CPUs
This includes running postgres/rabbitmq etc. If customer is managing these dependencies then it will take around 8GB RAM and 2 Core CPUS

### How Nudgebee Optimizations Work with GitOps

Raise PRs From Nudgebee
- We have added support for Raising PRs from specific optimization screens in Nudgebee. 

GitOps(Flux/Argo) Reconciliation
- Disable reconciliation for given resources

Nudgebee Autopilot Reconciliation
- Nudgebee provides annotations, which can be used to ignore specific resources

GitOps Way Of Configuring Nudgebee Optimizations -
- We want to provide this as an option using CRDs, Though its part of RoadMap

### Can Nudgebee Work on K3S/Kind/MiniKube ?
Yes, Please refer to the Installation Guide for Local Testing.

### Does Nudgebee Docker Images have any security vulnerabilities ?
No, Nudgebee uses alpine based images to reduce overall size and security issues. We use AWS ECR & Nudgebee for scanning images maintained by us. We can share a security report for that as per request.

### Does Nudgebee Have VAPT Reports ?
Yes, we use ZAP/Manual PenTesting for our security testing, and can share reports based on request.

### Can I configure Multiple Clusters Within Single Nudgebee Server ?
Yes, configure agents on each targeted cluster.

### What are different Nudgebee Distributions ?
NudgeBee has both SaaS and Self-Hosted Solutions. As an end-user you can use SaaS solution to quickly validate/test product and Self-Hosted solution for long-term deployment (if there are compliance constraints which don't allow any kind of data movement)

### What is Nudgebee Release Cycle ?
We target to have a weekly release cycle with Hotfixes as per requirements. We follow SemVer for our versioning.

### Can your provide more details on Data Retention Policies ?

Currently, Nudgebee stores most of the data in Agents which get deployed on cluster. so data remains within Cluster. Data Retention for Agent Components (Traces/Metrices/Logs) is configurable and can be managed by Customer

#### Agents store following data -

Traces - using clickhouse, you can adjust how long you want to retain clickhouse data, default is 7 days
Metrices - using prometehus, you can adjust prometheus data rentention
Logs - We integrate with existing log services like Loki/ELK, so again depends on their data retention


#### Servers store following data -

Aggregated Metrices - We do aggregattion on daily basis, no rention policy yet, would like to understand usecase
Events - Troubleshooting pages, current retention is 60 days, you can make it configurable
Deleted Pods/Workloads etc - We store deleted workloads/pods etc, no rention policy yet, will share once that is there.. may be by next week

### Does Nudgebee Supports Anomaly Detection ?
No, This is part of RoadMap

### Does Nudgebee Supports Predictive Analysis?
 yes, nudgbee uses predictive analytics for replica rightsizing, & continuous rightsizing
