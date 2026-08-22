---
sidebar_position: 100
---

# FAQ

### What are the open-source tools that NudgeBee uses?

#### Agent
- **Prometheus** (or VictoriaMetrics) — Metrics collection and alerting
- **Logs Engine** (Loki / OpenObserve / Elasticsearch / Fluentbit) — Log querying and stream aggregation
- **Distributed Tracing** (OpenTelemetry Collector / ClickHouse / Tempo) — Distributed tracing
- **Trivy** — Container image vulnerability scanning
- **Popeye** — Kubernetes cluster sanitizing and best practice audits
- **Kubewatch** — Kubernetes event streaming and lifecycle capture

### What are the ML libraries that NudgeBee uses? What are the dependencies?
- **TensorFlow & Scikit-learn** — Predictive analytics for workload replica and resource rightsizing
- **Cortex & DAIR Router** — In-VPC Small Language Model serving (vLLM / Ollama) with optional routing to AWS Bedrock, OpenAI, Anthropic, or Google Gemini

### What are the hard dependencies for the NudgeBee Server?
- **PostgreSQL**: Hard requirement. Stores cluster configurations, user metadata, alert rules, and workflow states. Queries and services fail without it.
- **RabbitMQ**: Hard requirement. Powers internal message queues between backend services and workers. Consumers will not bootstrap without it.
- **Redis**: Optional. Falls back to in-memory caching if omitted.

### Is the NudgeBee Agent mandatory if I already connected a cloud account?
- **Cloud Account Connection** provides inventory discovery across your AWS/Azure/GCP resources and auto-detects existing Kubernetes clusters.
- **The Agent** is required inside each cluster to collect real-time workload metrics, stream pod logs, capture eBPF network telemetry, and perform automated AI root cause analysis.
- For full AI troubleshooting and cost optimizations on a cluster, installing the Agent is required.

### What are the pre-conditions (software/hardware) for installing NudgeBee on my cluster?

#### For Agent:
- Helm 3.10+ and Kubernetes 1.24+
- Existing Prometheus instance (or install bundled Prometheus via Helm)
- For log-specific triage: Existing log aggregator (Loki, Elasticsearch, OpenObserve) or cluster log access
- Standard cluster RBAC permissions as specified in the Helm chart

### What is the typical system requirement for running NudgeBee?

#### For Agent:
- **Core Agent (Runner + Collector)**: Lightweight — requests **~200m CPU** and **256 MiB RAM**.
- **Optional In-Cluster Monitoring Stack (Prometheus / Alertmanager / KSM)**: **~1–2 CPU cores** and **2–4 GB RAM** depending on metric cardinality.
- **Node Agent (DaemonSet)**: **~50m CPU** and **64 MiB RAM** per worker node for eBPF and node telemetry.

#### For Server:
- **Evaluation / Small Install (Bundled Postgres & RabbitMQ)**: **~4 CPU cores** and **8–12 GB RAM** across all backend pods.
- **Production Install (External Managed Databases)**: **~2–4 CPU cores** and **4–8 GB RAM** for NudgeBee application pods.

### How NudgeBee Optimizations Work with GitOps

- **Raise PRs from NudgeBee**: Create automated pull requests with rightsized resource limits directly to your Git repository.
- **GitOps Reconciliation (Flux / Argo CD)**: Annotate manifests or configure automated PR merges to ensure GitOps state remains the single source of truth.
- **NudgeBee Autopilot Reconciliation**: Apply `nudgebee.io/ignore: "true"` annotations to exclude specific workloads from automated rightsizing.

### Can NudgeBee work on K3s/Kind/Minikube?
Yes, please refer to the [Server Installation Guide](/docs/installation/server/) and [Agent Installation Guide](/docs/installation/agent/installation/) for local evaluation instructions.

### How are NudgeBee Docker images secured?
NudgeBee uses minimal Alpine and distroless base images to minimize the attack surface. All images are signed and scanned for known vulnerabilities as part of the release pipeline. To report a suspected vulnerability, see the [security policy](https://github.com/nudgebee/nudgebee-docs/blob/main/SECURITY.md).

### Is NudgeBee penetration tested?
Yes. NudgeBee undergoes regular security testing, including automated SAST/DAST and third-party penetration testing, as part of its release compliance.

### Can I configure multiple clusters within a single NudgeBee server?
Yes. A single NudgeBee Server can monitor dozens of Kubernetes clusters across multiple clouds and on-premises environments by deploying the lightweight Agent into each target cluster.

### What are the different NudgeBee distributions / editions?
NudgeBee is available in three editions — see the [Editions & Capabilities page](/docs/editions) for the full comparison:

- **Community** — Free self-hosted edition. Server is licensed under **BSL 1.1**; Agents are **Apache 2.0**. Pull public images from `ghcr.io/nudgebee` with no license key required.
- **Enterprise** — Self-hosted with a commercial license. Adds SAML 2.0 SSO, NudgeBee-managed models (`nb-llm` / `nb-slm`), and commercial SLA support.
- **Cloud (SaaS)** — Fully managed at [app.nudgebee.com](https://app.nudgebee.com). Passwordless signup with fastest time to evaluate.

### What is the NudgeBee release cycle?
We follow a weekly release cadence for server and agent enhancements, with hotfixes published as needed. All versions follow Semantic Versioning (`vMAJOR.MINOR.PATCH`).

### Can you provide more details on Data Retention Policies?

Currently, NudgeBee stores most telemetry data inside your cluster or dedicated VPC storage:

#### Agents store the following data:
- **Traces**: Stored in ClickHouse / Tempo. Configurable retention with a default of 7 days.
- **Metrics**: Stored in Prometheus / VictoriaMetrics. Configurable retention based on your storage class.
- **Logs**: Integrated with existing log services (Loki / Elasticsearch / OpenObserve).

#### Servers store the following data:
- **Aggregated Metrics**: Daily rollups for long-term capacity planning and FinOps cost trend analysis.
- **Events & Incidents**: Troubleshooting events with default configurable retention of 60 days.
- **Workload Metadata**: Historical records of deleted pods and workloads to support post-incident analysis.

### Does NudgeBee support Predictive Analysis?
Yes, NudgeBee uses predictive analytics for workload replica rightsizing, resource trend forecasting, and continuous FinOps optimization.

### How does NudgeBee discover cloud resources across AWS, Azure, and GCP?
NudgeBee automatically discovers cloud resources when you onboard an account. It scans common services like VMs, load balancers, managed databases, and object storage. The platform syncs with daily billing data and listens to real-time events (e.g. AWS EventBridge) to track resource creation, modification, and deletion.

### Does NudgeBee support Kubernetes resource discovery?
Yes, NudgeBee agents automatically discover all Kubernetes resources across all namespaces in your cluster via the Kubernetes API.

### What observability tools does NudgeBee integrate with?
NudgeBee provides prebuilt connectors for Datadog, Prometheus, Chronosphere, SigNoz, OpenObserve, Elasticsearch, AWS CloudWatch, Azure Monitor, and Google Cloud Monitoring.

### Can I deploy NudgeBee with its own observability stack?
Yes, for greenfield environments, NudgeBee can bundle Prometheus for metrics collection, ClickHouse with OpenTelemetry for distributed traces, and Loki for log aggregation.

### How does NudgeBee integrate with existing knowledge base systems?
NudgeBee natively integrates with Atlassian Confluence, ServiceNow, Notion, Google Docs, and SharePoint. These sources are indexed into the Semantic Knowledge Graph to ground NuBi's root cause investigations in your team's existing runbooks.

### Does NudgeBee learn from resolved incidents automatically?
Yes, NudgeBee automatically learns from resolved incidents. Resolution notes and verified postmortems flow directly into the knowledge base to continually improve future triage accuracy.

### How does NudgeBee handle event deduplication and aggregation?
NudgeBee generates unique fingerprints for each incoming alert. These fingerprints form the foundation for intelligent aggregation and deduplication, consolidating cascading alert storms into single, actionable incidents.

### What is NudgeBee's Knowledge Graph and how does it correlate events?
NudgeBee uses a live Semantic Knowledge Graph to establish topological links between workloads, pods, nodes, cloud services, metrics, traces, git commits, and tickets. When an incident occurs, the system correlates dependent entities across the timeline to identify the precise triggering change.

### What event sources can NudgeBee consume for incident management?
NudgeBee consumes events from Prometheus Alertmanager, Kubernetes events, Datadog, PagerDuty, ServiceNow, and custom webhooks.

### Where can I access NudgeBee's SRE Agent (NuBi)?
NuBi is accessible directly through the web dashboard, Slack, and Microsoft Teams for seamless ChatOps.

### What are the primary capabilities of NuBi for SRE teams?
NuBi investigates live alerts, runs ad-hoc infrastructure queries, correlates logs and traces, hypothesizes root causes, and suggests actionable remediation commands.

### What types of automated resolutions does NudgeBee support?
NudgeBee can generate automated pull requests for GitOps and CI/CD configurations, trigger approved runbooks (e.g. pod restarts or cache flushes), and execute policy-gated right-sizing actions.

### Can I customize NudgeBee's automation workflows?
Yes, users can compose custom automation DAGs using NudgeBee's visual AI-Ops Workflow Builder.

### What ITSM and ticketing systems does NudgeBee integrate with?
NudgeBee provides out-of-the-box integrations with GitHub Issues, Jira, PagerDuty, and ServiceNow. These integrations support automated ticket creation, bidirectional incident status sync, and knowledge base grounding.

