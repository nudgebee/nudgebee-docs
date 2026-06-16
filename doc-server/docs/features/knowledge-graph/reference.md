---
sidebar_position: 6
sidebar_label: Reference & Tips
---

# Reference & Tips

## Node Categories

**Application Layer:**

- Workload, Service, ExternalService, ServerlessFunction

**Kubernetes Resources:**

- Cluster, Namespace, Pod, Node, K8sService, Ingress, ConfigMap, Secret, PersistentVolume, PersistentVolumeClaim

**Cloud Resources:**

- LoadBalancer, Database, Storage, VPC, Subnet, SecurityGroup, IAMRole, IAMPolicy

## Limits and Performance

- **Up to 1,500 nodes** can be displayed at once
- A **Graph Too Large to Render** warning appears when your selection exceeds 1,500 nodes
- Use the filters panel to narrow the view when working with large infrastructures

## Tips for Effective Use

1. **Start broad, then filter** - Begin with Account and Node Type filters to focus on relevant resources
2. **Use a Node + Level** - Pick a Node and keep Level at "1 – Direct neighbors" for the most readable starting point, then increase the level to go deeper
3. **Use labels for precision** - Kubernetes labels help find specific applications or environments
4. **Traverse by clicking** - Click a node to recenter the graph, and use the Path breadcrumb and Back button to retrace your steps
5. **Search to jump** - Use the Search nodes dropdown to find a node instantly in a busy graph
6. **Trace visually** - Hover over nodes to see their direct connections highlighted
7. **Check relationship types** - Open the Relationships legend to understand what each edge type means
8. **Tune your Coverage** - In Settings, enable the cloud accounts and flow sources (eBPF, Traces, Datadog APM, New Relic APM) that matter, and declare Manual Dependencies for connections automated discovery misses
