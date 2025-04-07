# Action: Workload Restart

## Overview

The **Workload Restart** action allows users to gracefully restart a Kubernetes workload such as a Deployment, StatefulSet, or DaemonSet. This action ensures that the workload is restarted without abrupt disruptions, preserving the overall stability of the application.

## User Inputs

There are no additional user inputs required for this action. It operates directly on the selected workload.

## Detailed Explanation

When this action is triggered:

- The automation tool initiates a restart of the targeted Kubernetes workload.
- This is typically achieved by updating an annotation (like `kubectl rollout restart`) which triggers Kubernetes to restart the pods associated with the workload gracefully.
- During the restart, Kubernetes ensures that new pods are started before terminating the old ones, maintaining the desired number of replicas and minimizing downtime.

## Example Use Case

Consider a scenario where an application has loaded a faulty configuration or environment variable that requires a restart to take effect. Instead of manually accessing the cluster and restarting the workload, users can configure this action as part of an automated workflow to handle such cases proactively.

## Notes

- This action is ideal for workloads that require occasional restarts to apply changes or recover from transient issues.
- Ensure that the application can handle rolling restarts without causing inconsistencies or service disruptions.
- The action does not apply to individual pods; it targets the entire workload controller.

---

This documentation provides a clear guide for using the Workload Restart action to automate safe and controlled restarts of Kubernetes workloads.
