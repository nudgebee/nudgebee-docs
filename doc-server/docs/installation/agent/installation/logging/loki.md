---
sidebar_position: 2
---
# Loki


## Overview
Grafana Loki is a set of components that can be composed into a fully featured logging stack.

## Install Loki
The [Monolithic loki](https://grafana.com/docs/loki/latest/setup/install/helm/install-monolithic) installation runs the Grafana Loki single binary within a Kubernetes cluster.
To deploy [Scalable loki](https://grafana.com/docs/loki/latest/setup/install/helm/install-scalable/) to run read, write, and backend targets in a scalable mode. 

## Nudgebee Agent Configuration
By default nudgebee auto discovers Loki if agent is installed in same cluster as Loki. 

If Loki is deployed as external service then need to provide external Loki URL as below in values

```yaml
runner:
  loki:
    url: "http://loki:3100"
    user: ""
    password: ""
    headers: "X-Scope-OrgID:tenant1"
```