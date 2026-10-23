---
id: upgrade-planner
title: Upgrade Planner
sidebar_label: Upgrade Planner
sidebar_position: 3
---

# Upgrade Planner

Upgrade Planner analyzes your Kubernetes clusters, evaluates compatibility across APIs and Helm releases, and generates guided upgrade plans with pre-flight and post-flight health checks.

## Where to find it

Navigate to **Clusters** and select your cluster, then open the **Cluster Upgrade** tab.

## How it works

### Target Version Selection

When creating an upgrade plan, if you specify a target version, the system uses it. Otherwise, it defaults to the current version plus one increment. If an account has no recorded Kubernetes version, plan creation fails.

### Plan and Task Statuses

Plans are initially created with a status of `Pending`. Tasks default to `Open` or can be set to `InProgress`. When saving new plans, tasks maintain their configured sequence and their required (`is_required`) property.

### Pre-Flight and Post-Flight Health Checks

The system runs pre-flight (`pre_flight`) and post-flight (`post_flight`) health checks asynchronously after plan creation. Node group checks vary across providers (EKS, GKE, and AKS).

### Kubernetes API Deprecations

API deprecations are evaluated by querying available API resources and matching them against a deprecation registry across the version range between your current version and the target version.

### Helm Release Compatibility

For Helm compatibility checks, the system retrieves Helm secrets, selects the highest revision per release using the `namespace/releaseName` key format, and evaluates chart `kubeVersion` constraints against the target version. For Helm chart upgrades, scans detect outdated charts and create recommendations keyed by release name, chart name, namespace, and installed version.

### Version Skew and Component Checks

For `kube-proxy`, clusters running Kubernetes v1.25 or newer permit a maximum skew of 3 minor versions. Versions older than v1.25 allow at most 2 minor versions. A minor version difference of 3 or greater produces a High severity recommendation, while smaller differences produce Low or Medium severity recommendations.

## Use it

1. Select the target cluster in **Cluster Upgrade**.
2. Click the create plan action and confirm creation in the confirmation modal. Generating a plan replaces any existing plan for the same current and target versions and starts asynchronous health checks.
3. Navigate through the vertical steps and view the tasks within each step.
4. To download a copy of the plan, click the export action to save a JSON file formatted as `upgrade-plan-<current_version>-to-<target_version>.json`.
