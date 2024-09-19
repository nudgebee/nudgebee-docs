# Action: Delete Pod Gracefully

## Overview

The Delete Pod Gracefully action in the Kubernetes Automation Tool allows users to delete a pod from a workload gracefully. This action ensures that the pod is terminated in a controlled manner, allowing it to clean up resources and save state if necessary.

## User Inputs

There are no additional user inputs required for this action. It operates on the selected pod and workload directly.

## Detailed Explanation

The Delete Pod Gracefully action interface provides a straightforward way to remove a pod from a Kubernetes workload. Here’s how it works:

- **Graceful Deletion**:
  - When this action is triggered, the selected pod is marked for deletion. Kubernetes ensures that the pod is terminated gracefully, adhering to the specified grace period.
  - During the graceful termination period, the pod receives a termination signal, allowing it to clean up resources, close open connections, and save its state if necessary.
  - After the grace period, Kubernetes forcefully deletes the pod if it has not already terminated.

## Example Use Case

Consider a scenario where a user needs to update an application running in a Kubernetes cluster. Instead of forcefully deleting the old pods, the user can use the Delete Pod Gracefully action to ensure that the pods shut down gracefully, minimizing the impact on the application and maintaining a smooth user experience.

This action is particularly useful in scenarios where stateful applications need to clean up resources or save state before termination, ensuring data integrity and consistency.

## Notes

- **Grace Period**: The default grace period for pod termination is determined by the Kubernetes configuration. Users can specify a different grace period if required.
- **Resource Cleanup**: Ensure that the applications running in the pods are designed to handle termination signals gracefully, performing necessary cleanup operations.

---

This documentation provides a comprehensive guide to using the Delete Pod Gracefully action, helping users ensure controlled and safe termination of pods in their Kubernetes workloads.
