---
sidebar_position: 4
---

# Upgrade

Upgrading your NudgeBee Server ensures you benefit from the latest features, security updates, and bug fixes.

---

## Prerequisites

Before upgrading, ensure:

- **Helm** is installed and configured.
- **Kubernetes** cluster is accessible and healthy.
- **kubectl** is configured for your target cluster.
- You have a backup of your current configuration.

You can always upgrade to the latest version of NudgeBee Server. You dont need to do incremental upgrades.
If you want to upgrade to a specific version, please ensure that the version is compatible with your current setup (e.g., by consulting the official release notes or compatibility guide). NudgeBee does not support downgrades.
- You have the latest `values.yaml` file from the NudgeBee repository or your custom configuration.
- You have the NudgeBee license key available as an environment variable `NUDGEBEE_LICENSE_KEY`.
- You have the `KUBE_CONTEXT` environment variable set to the context of your Kubernetes cluster.
- You have the `CHART_VERSION` environment variable set to the version of NudgeBee you want to upgrade to (if not using the latest version).
- You have the `nudgebee` namespace created in your Kubernetes cluster. If not, it will be created during the upgrade process.

---

## 1. Backup Current Configuration

Export your current Helm values:

```bash
helm get values nudgebee --namespace nudgebee > previous-values.yaml
```

Save any custom manifests or secrets you applied manually.

---
## 2. Helm Registry Login
```shell
helm registry login https://registry.nudgebee.com --username nudgebee --password $NUDGEBEE_LICENSE_KEY
```

---
## 3. Upgrade NudgeBee

```shell
helm upgrade nudgebee oci://registry.nudgebee.com/nudgebee -f values.yaml  --install --namespace nudgebee --create-namespace --wait --kube-context $KUBE_CONTEXT
```

If you want to upgrade specific version of nudgebee then please use below helm command
Note - Currently, nudgebee doesnt support downgrades, so ensure you are upgrading to a version that is compatible with your current setup.

```shell
helm upgrade nudgebee oci://registry.nudgebee.com/nudgebee --version $CHART_VERSION -f values.yaml  --install --namespace nudgebee --create-namespace --wait --kube-context $KUBE_CONTEXT
```

---
## 4. Troubleshooting

If upgrades failed ie. helm timeouts, then review the following steps and after resolving the issues, you can retry the upgrade command again.

- **Helm Release Status**: 
  ```bash
  helm status nudgebee --namespace nudgebee
  ```
- **Pod Status**: 
  ```bash
  kubectl get pods --namespace nudgebee
  ```
- **Events**: 
  ```bash
  kubectl get events --namespace nudgebee
  ```


---

For more details, refer to the [Installation Guide](../installation).

