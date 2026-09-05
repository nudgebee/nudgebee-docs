---
sidebar_position: 2
sidebar_label: Architecture & System Design
---

# Architecture & System Design

NudgeBee is an enterprise-grade AI observability, incident triage, and automation platform designed around a core philosophy: **"Install Once, Build Forever"** — where the marginal cost of running your $N$-th agent trends toward zero, and the compounding intelligence of the platform increases with every incident, metric, and workflow.

---

## 1. Platform Reference Architecture

![NudgeBee Platform Reference Architecture](/img/platform_reference_architecture.png)

---

### Platform Architecture Reference (9-Layer Model)

| Layer | Functional Domain | Key Capabilities & Components | Deployment Boundary |
|---|---|---|---|
| **Layer 1** | **Personas & Access** | SRE, DevOps, FinOps, SecOps, Platform, CFO via Web Dashboard, Slack/Teams ChatOps, CLI, REST/GraphQL APIs, and SSO. | User Interface |
| **Layer 2** | **Role-Based Agents** | **AI-SRE** (RCA & triage), **AI-FinOps** (cost & rightsizing), **AI-K8sOps** (workload reliability), **AI-CloudOps** (cloud drift & scans), and Custom Agents. | In-VPC Control Plane |
| **Layer 3** | **Builders** | **AI-Ops Automation Builder** (visual runbook/DAG composer) and **AI-Agent Builder** (agent definition & prompt harness). | In-VPC Control Plane |
| **Layer 4** | **Control Plane (The Brain)** | • **Cortex Intelligence**: Knowledge Graph Engine, Multi-Tier Memory (Redis + Graph DB), RAG Vector Retrieval, Continuous Grounding.<br/>• **DAIR Router**: 8-Signal Model Router, Semantic Prompt Cache, PII/DLP Redaction Gate.<br/>• **Runtime & Guardrails**: Agent Harness (*Plan-Act-Observe*), Policy Engine, HITL Approval Surface, Immutable Audit Logs. | In-VPC Control Plane |
| **Layer 5** | **Libraries ("Install Once, Build Forever")** | Library of Pre-Built Agents, Library of Diagnostic Tools/Skills, and Library of Automated Runbooks. | In-VPC Control Plane |
| **Layer 6** | **In-VPC Data Plane** | PostgreSQL (metadata/config), Redis (sessions/cache), ClickHouse (runs/traces), Qdrant (RAG vectors), Graph DB (topology/ownership), Object Store (S3-compatible artifacts), RabbitMQ (event bus). | In-VPC Customer Data Plane |
| **Layer 7** | **Self-Hosted SLM Serving** | Local private Small Language Model serving via **vLLM / Ollama / TGI** (Qwen 3+, Llama 3+, Gemma 4, Nemotron, Granite, BYOM GPU pools). | In-VPC Model Layer |
| **Layer 8** | **Collectors & Ingress** | Relay Server (:8080), `k8s-collector`, `cloud-collector`, OpenTelemetry Collector, and Ticketing/GitOps Sync. | In-VPC & In-Cluster |
| **Layer 9** | **Categorized External Egress** | Collaboration (Slack, Teams), ITSM (Jira, ServiceNow), SCM (GitHub, GitLab), Cloud APIs (AWS, GCP, Azure), Observability backends, and Frontier LLMs (via DAIR + PII Gate). | External Egress |

---

### Layer Deep-Dive

#### Cortex • The Intelligence Layer
Cortex is NudgeBee's semantic reasoning engine. Instead of passing massive, unstructured context to expensive LLMs, Cortex maintains a continuously updated model of your infrastructure:
- **Knowledge Graph Engine**: Maps service dependencies, network topologies, infrastructure layers, and engineering team ownership.
- **Multi-Tier Memory**: Combines millisecond short-term memory (Redis) for live alert context with persistent Graph DB memory for long-term historical incident learning.
- **RAG Retrieval**: Combines dense vector search (Qdrant) with cross-encoder rerankers to ground AI responses in relevant runbooks, docs, and postmortems.
- **Continuous Grounding**: Automatically updates context as pods deploy, git commits merge, or alert rules fire.

#### DAIR • Dynamic Adaptive Inference Router
DAIR optimizes every model invocation across 8 real-time signals: **task complexity, latency SLO, token cost, data sensitivity, cache hit status, model availability, context window size, and reasoning depth**.
- **In-VPC SLM Serving First**: Simple tasks (log summarization, event classification, metric anomaly detection) are routed locally to private Small Language Models (e.g. Qwen 3+, Llama 3+, Gemma) running inside your cluster or VPC GPU pool.
- **Semantic Prompt Cache**: Deduplicates repetitive prompts and queries to prevent redundant model calls.
- **PII / DLP Redaction Gate**: Any query escalated to external frontier models (e.g. AWS Bedrock, OpenAI, Anthropic) passes through an inline DLP sanitizer to redact secrets, tokens, IPs, and user PII before leaving the VPC boundary.

#### Runtime & Guardrails
- **Agent Orchestrator**: Executes structured *Plan → Act → Observe → Evaluate* loops with bounded iteration limits.
- **Policy Engine**: Enforces strict RBAC, blast-radius constraints, and mandatory dry-run execution for mutating operations.
- **Human-In-The-Loop (HITL)**: Provides interactive approval gates directly within Slack, Microsoft Teams, and the Web UI before any remediation action is executed in production.
- **Immutable Audit Log**: Every prompt, tool execution, intermediate reasoning step, and user approval is recorded immutably in PostgreSQL/ClickHouse.

---

## 2. Runtime Microservices Architecture ("What Runs Where")

The diagram below illustrates how NudgeBee's core microservices, datastores, and collectors interact at runtime:

```mermaid
flowchart TB
    classDef browser fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f,rx:8,ry:8;
    classDef app fill:#bae6fd,stroke:#0284c7,stroke-width:2px,color:#0369a1,rx:8,ry:8;
    classDef backend fill:#bbf7d0,stroke:#16a34a,stroke-width:2px,color:#14532d,rx:8,ry:8;
    classDef datastore fill:#f8fafc,stroke:#64748b,stroke-width:2px,color:#1e293b,rx:8,ry:8;
    classDef collector fill:#ddd6fe,stroke:#7c3aed,stroke-width:2px,color:#4c1d95,rx:8,ry:8;
    classDef agent fill:#fecdd3,stroke:#e11d48,stroke-dasharray: 5 5,stroke-width:2px,color:#881337,rx:8,ry:8;

    BROWSER["<b>Browser</b>"]:::browser
    APP["<b>app</b><br/><small>Next.js UI + auth boundary</small>"]:::app

    subgraph SERVICES["Microservices (Internal RPC with tenant + user context stamped on every call)"]
        direction TB
        SERVICES_SERVER["<b>services-server</b><br/><small>Go core backend & RPC handlers</small>"]:::backend
        LLM_SERVER["<b>llm-server</b> (AI Engine)<br/><small>NuBi SRE Agents & investigations</small>"]:::backend
        RAG_SERVER["<b>rag-server</b><br/><small>Knowledge-base retrieval</small>"]:::backend
        LLM_GATEWAY["<b>llm-gateway</b><br/><small>AI Gateway — routing, metering, rate limits</small>"]:::backend
        WORKFLOW_SERVER["<b>workflow-server</b><br/><small>Autopilot & Runbook Automations</small>"]:::backend
        NOTIFICATIONS["<b>notifications</b><br/><small>Slack / Teams / Email Dispatcher</small>"]:::backend
        TICKET_SERVER["<b>ticket-server</b><br/><small>Jira / ServiceNow / PagerDuty</small>"]:::backend
        ML_SERVER["<b>ml-k8s-server</b><br/><small>Right-sizing & anomaly models</small>"]:::backend
        COST_SERVER["<b>cost-server</b><br/><small>OpenCost-based cost allocation</small>"]:::backend
    end

    subgraph STORAGE["Storage & Caching Layer (Shared by ALL services)"]
        POSTGRES["<b>Postgres</b><br/><small>State & Audit</small>"]:::datastore
        REDIS["<b>Redis</b><br/><small>Cache Layer</small>"]:::datastore
    end

    subgraph INFRA["Messaging, Vector & Durable Execution"]
        RABBITMQ["<b>RabbitMQ</b><br/><small>Event Bus & Signal Broker</small>"]:::datastore
        QDRANT["<b>Qdrant</b><br/><small>RAG Vectors & Knowledge Embeddings</small>"]:::datastore
        TEMPORAL["<b>Temporal</b><br/><small>Durable Workflow Execution</small>"]:::datastore
    end

    subgraph COLLECTORS["Collectors & Ingress Hub"]
        K8S_COLLECTOR["<b>k8s-collector</b><br/><small>Cluster state & metrics</small>"]:::collector
        CLOUD_COLLECTOR["<b>cloud-collector</b><br/><small>AWS / Azure / GCP scans</small>"]:::collector
        RELAY_SERVER["<b>relay-server</b><br/><small>WebSocket Gateway (:8080)</small>"]:::collector
    end

    AGENT["<b>nudgebee-agent (in YOUR cluster)</b><br/><small>kubectl • Prometheus • Logs & Traces</small>"]:::agent

    BROWSER --> APP
    APP --> SERVICES_SERVER
    APP --> LLM_SERVER
    APP --> WORKFLOW_SERVER
    APP --> NOTIFICATIONS
    APP --> TICKET_SERVER
    APP --> LLM_GATEWAY

    SERVICES_SERVER -.-> STORAGE
    LLM_SERVER -.-> STORAGE
    WORKFLOW_SERVER -.-> STORAGE
    NOTIFICATIONS -.-> STORAGE
    TICKET_SERVER -.-> STORAGE
    ML_SERVER -.-> STORAGE
    COST_SERVER -.-> STORAGE
    LLM_GATEWAY -.-> STORAGE

    LLM_SERVER -->|knowledge-base search| RAG_SERVER
    RAG_SERVER -->|vector search| QDRANT
    WORKFLOW_SERVER -->|durable execution| TEMPORAL

    K8S_COLLECTOR -->|signals| RABBITMQ
    CLOUD_COLLECTOR -->|signals| RABBITMQ
    RELAY_SERVER -->|signals| RABBITMQ
    RABBITMQ --> SERVICES_SERVER

    K8S_COLLECTOR -.-> STORAGE
    CLOUD_COLLECTOR -.-> STORAGE
    RELAY_SERVER -.-> STORAGE

    AGENT -.->|"outbound only (WSS :443)"| RELAY_SERVER
```

---

## 3. Data Privacy & Network Isolation

- **Zero Inbound Ports**: Monitored agents connect to the Control Plane exclusively via outbound HTTPS / WSS (TCP port 443). No firewall openings or public IPs are required in monitored environments.
- **In-VPC Data Sovereignty**: All cluster metrics, logs, traces, knowledge graph topologies, and audit trails remain within your dedicated storage cluster.
- **Air-Gapped & Offline Ready**: NudgeBee can be deployed entirely air-gapped using local container registries, internal PostgreSQL/Redis, and in-VPC SLMs served by vLLM or Ollama.

---

## Next Steps

- **[Server Installation Guide](/docs/installation/server/)** — Deploy the complete NudgeBee Control Plane onto your Kubernetes cluster using Helm.
- **[Agent Installation Guide](/docs/installation/agent/)** — Install the lightweight NudgeBee Agent into target Kubernetes clusters.
- **[Editions & Pricing](/docs/editions)** — Compare Community, Enterprise, and Cloud SaaS capabilities.
