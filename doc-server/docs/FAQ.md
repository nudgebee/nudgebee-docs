---
sidebar_position: 100
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

### What are the hard dependencies for the NudgeBee Server?
- **PostgreSQL**: Hard requirement. Stores cluster configurations, user metadata, alert rules, and workflow states. Queries and services fail without it.
- **RabbitMQ**: Hard requirement. Powers internal message queues between backend services and workers. Consumers will not bootstrap without it.
- **Redis**: Optional. Falls back to in-memory caching if omitted.

### Is the NudgeBee Agent mandatory if I already connected a cloud account?
- **Cloud Account Connection** provides inventory discovery across your AWS/Azure/GCP resources and auto-detects existing Kubernetes clusters.
- **The Agent** is required inside each cluster to collect real-time workload metrics, stream pod logs, capture eBPF network telemetry, and perform automated AI root cause analysis.
- For full AI troubleshooting and cost optimizations on a cluster, installing the Agent is required.

### What are the pre-conditions(software/hardware) for installing NudgeBee on my cluster?

#### For Agent:
- Helm chart for installation
- Prometheus, if already configured, else NudgeBee agent installs it
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

### How NudgeBee Optimizations Work with GitOps

Raise PRs from NudgeBee
- We have added support for raising PRs from specific optimization screens in NudgeBee.

GitOps(Flux/Argo) Reconciliation
- Disable reconciliation for given resources.

NudgeBee Autopilot Reconciliation
- NudgeBee provides annotations which can be used to ignore specific resources.

GitOps Way Of Configuring NudgeBee Optimizations -
- We want to provide this as an option using CRDs, though it's part of the roadmap.

### Can NudgeBee work on K3s/Kind/Minikube?
Yes, please refer to the Installation Guide for local testing.

### How are NudgeBee Docker images secured?
NudgeBee uses minimal Alpine-based images to reduce attack surface and image size. Images are scanned for known vulnerabilities as part of the release pipeline. To report a suspected vulnerability, see the [security policy](https://github.com/nudgebee/nudgebee-docs/blob/main/SECURITY.md).

### Is NudgeBee penetration tested?
Yes. NudgeBee undergoes regular security testing, including automated and manual penetration testing, as part of its release process.

### Can I configure multiple clusters within a single NudgeBee server?
Yes, configure agents on each targeted cluster.

### What are the different NudgeBee distributions / editions?
NudgeBee is available in three editions — see the [Editions page](./editions.md) for the full side-by-side comparison.

- **Community** — free, open-source (Apache 2.0), fully functional self-hosted. Pull public images from `ghcr.io/nudgebee`; no license key.
- **Enterprise** — self-hosted with a commercial license. Adds SAML 2.0 SSO, NudgeBee's managed models (`nb-llm` / `nb-slm`), and commercial support.
- **Cloud** (SaaS) — fully managed at [app.nudgebee.com](https://app.nudgebee.com). Fastest way to evaluate.

Use Cloud for fastest evaluation; Community for a free, self-hosted deployment; Enterprise when you need SAML, managed models, or a commercial SLA while staying on-prem.

### What is the NudgeBee release cycle?
We target to have a weekly release cycle with hotfixes as per requirements. We follow SemVer for our versioning.

### Can you provide more details on Data Retention Policies?

Currently, NudgeBee stores most of the data in Agents which get deployed on the cluster, so data remains within the cluster. Data retention for Agent components (traces/metrics/logs) is configurable and can be managed by the customer.

#### Agents store the following data:

Traces - Using ClickHouse, you can adjust how long you want to retain ClickHouse data. The default is 7 days.
Metrics - Using Prometheus, you can adjust Prometheus data retention.
Logs - We integrate with existing log services like Loki/ELK, so again, it depends on their data retention.


#### Servers store the following data:

Aggregated Metrics - Aggregated on a daily basis and retained for long-term trend analysis.
Events - Troubleshooting pages. Default retention is 60 days, and is configurable.
Deleted Pods/Workloads etc. - Records of deleted workloads/pods are retained to support historical analysis.

### Does NudgeBee support Anomaly Detection?
No, this is part of the roadmap.

### Does NudgeBee support Predictive Analysis?
Yes, NudgeBee uses predictive analytics for replica rightsizing and continuous rightsizing.

### How does NudgeBee discover cloud resources across AWS, Azure, and GCP?
NudgeBee automatically discovers cloud resources when you onboard an account. It searches for common services like VMs, load balancers, databases, and storage. The platform syncs with daily billing data and performs periodic updates for continuous resource tracking. For AWS specifically, NudgeBee uses EventBridge to receive real-time notifications for resource updates, creation, and deletion events.​

### Does NudgeBee support Kubernetes resource discovery?
Yes, NudgeBee agents automatically discover all Kubernetes resources across all namespaces in your cluster. The agent runs within your Kubernetes environment and uses the Kubernetes API to continuously track workloads.​

### What observability tools does NudgeBee integrate with?
NudgeBee provides prebuilt, out-of-the-box connectors for major observability platforms. These include Datadog, Prometheus (and all variations), Chronosphere, Signoz, OpenObserve, ELK, AWS CloudWatch, Azure Monitor, and Google Cloud Monitoring. The integrations work seamlessly with your existing stack without requiring replacements.​

### Can I deploy NudgeBee with its own observability stack?
Yes, for new deployments or greenfield environments, NudgeBee ships with a complete observability stack. This includes VictoriaMetrics for metrics collection, ClickHouse with OpenTelemetry for distributed traces, and Loki for log aggregation.​

### How does NudgeBee integrate with existing knowledge base systems?
NudgeBee natively integrates with Atlassian Confluence and ServiceNow knowledge bases. You can also define custom knowledge base sources including Google Docs, Notion, and SharePoint. These sources are used by NudgeBee's AI agents during troubleshooting workflows.​

### Does NudgeBee learn from resolved incidents automatically?
Yes, NudgeBee automatically learns from issues it has resolved. User feedback can be configured to flow directly into the knowledge base, continuously improving the AI agent's troubleshooting capabilities over time.​

### How does NudgeBee handle event deduplication and aggregation?
NudgeBee generates unique fingerprints for each event it receives. These fingerprints form the foundation for intelligent aggregation and deduplication within the platform. This prevents alert fatigue by consolidating related events into single actionable incidents.​

### What is NudgeBee's Knowledge Graph and how does it correlate events?
NudgeBee uses a Knowledge Graph to establish linkages between entities like configurations, logs, metrics, traces, cloud bills, SLO/SLAs, tickets, code, and secrets. When an event occurs, the system searches for related entities and identifies recent events that may have caused the new issue. It then builds a comprehensive event timeline based on these correlations.​

### What event sources can NudgeBee consume for incident management?
NudgeBee consumes events from Prometheus Alertmanager, Kubernetes, Datadog, PagerDuty, and ServiceNow. Users can also send custom events to NudgeBee's webhook endpoints for proprietary or internal monitoring systems.​

### How does NudgeBee's SRE Agent prioritize and analyze incidents?
For each incoming event, NudgeBee's SRE Agent performs deduplication and urgency assessment based on historical incident data. Events are then automatically analyzed for root cause using an AI-based workflow system. Users can extend the analysis by providing custom instructions tailored to their environment.​

### Where can I access NudgeBee's SRE Agent (NuBi)?
NuBi, NudgeBee's SRE agent, is accessible through communication channels like Slack and Microsoft Teams, or directly through the NudgeBee UI. This enables ChatOps workflows where team members can ask questions about infrastructure, logs, and metrics.​

### What are the primary capabilities of NuBi for SRE teams?
NuBi handles ChatOps by responding to user questions about infrastructure, logs, and metrics. It performs live debugging of active incidents and conducts root cause analysis using AI-driven workflows. Teams can create custom agents based on specific requirements, extend existing agent instructions, and provide global context for tenant or account-level behaviors.​

### What types of automated resolutions does NudgeBee support?
NudgeBee generates automated pull requests for code and CI/CD issues. For lower environments, it can automate configuration changes with approval workflows. The platform also handles quick fixes like pod restarts and memory/CPU adjustments automatically.​

### Can I customize NudgeBee's automation workflows?
Yes, users can create custom resolution workflows using NudgeBee's AI-Ops Workflow Builder. You can customize existing workflows or extend them with additional components, APIs, and integrations tailored to your infrastructure.​

### What ITSM and ticketing systems does NudgeBee integrate with?
NudgeBee provides out-of-the-box integration with GitHub Issues, Jira, and ServiceNow (available in the December 2025 release). These integrations support automated ticketing, incident management system integration for listening and responding to incidents, and CMDB/KB integration (Planned for future releases).​

