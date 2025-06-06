# Action: Execute Image

## Overview

The Execute Image action in the Kubernetes Automation Tool allows users to run their own custom-built container images on their Kubernetes cluster to perform specific tasks. This action provides flexibility for users to execute any custom logic encapsulated within a container.

## User Inputs

The following user inputs are required to configure the Execute Image action:

1. **Image Name**:
   - **Text Box**: Enter the name or link of the container image to be executed. The image must be accessible to the cluster.

2. **Image Pull Policy**:
   - **Dropdown**: Select the image pull policy (e.g., Always, IfNotPresent, Never).

3. **Config Map Name**:
   - **Optional**: Provide the name of the ConfigMap to be used by the image.

4. **Secret**:
   - **Optional**: Provide the name of the Secret to be used by the image.

5. **Arguments**:
   - **Optional**: Specify any arguments to be passed to the container image.

6. **Service Account**:
   - **Optional**: Provide the service account to be used by the image pod. If not provided, the pod will use the same service account as the NudgeBee agent.

7. **Namespace**:
   - **Optional**: Specify the namespace in which the image pod should be deployed. If not provided, the pod will run in the same namespace as the NudgeBee agent.

8. **Environment Variables**:
   - **Optional**: Provide any environment variables to be set in the image pod.

## Detailed Explanation

The Execute Image action interface provides a versatile way to run custom container images on Kubernetes resources. Here’s how each part works:

- **Image Name**:
  - Enter the name or link of the container image in the provided text box. Ensure that the image is accessible to the Kubernetes cluster.

- **Image Pull Policy**:
  - Select the appropriate image pull policy. 
    - **Always**: Always pull the image.
    - **IfNotPresent**: Pull the image only if it is not already present on the node.
    - **Never**: Never pull the image; use the image that is already present on the node.

- **Config Map Name**:
  - Optionally, provide the name of a ConfigMap that the image can use for configuration. This allows for dynamic configuration of the container.

- **Secret**:
  - Optionally, provide the name of a Secret to be used by the image. This is useful for passing sensitive information such as API keys or credentials.

- **Arguments**:
  - Optionally, specify any command-line arguments to be passed to the container image. These arguments can modify the behavior of the container.

- **Service Account**:
  - Optionally, provide a service account for the image pod. If not provided, the pod will use the same service account as the NudgeBee agent. This service account will be used to control permissions and access within the Kubernetes cluster.

- **Namespace**:
  - Optionally, specify the namespace in which the image pod should be deployed. If not provided, the pod will run in the same namespace as the NudgeBee agent. This helps in organizing resources within the cluster.

- **Environment Variables**:
  - Optionally, provide environment variables to be set in the image pod. These variables can be used to configure the container’s runtime behavior.

## Example Use Case

Consider a scenario where a user needs to run a custom data processing task on their Kubernetes cluster. By using the Execute Image action, the user can specify their custom-built image that contains the necessary logic for the task. They can also provide necessary configurations, secrets, and arguments to tailor the execution environment as required.

This action allows users to leverage the full power of containerization to run custom tasks efficiently and securely on their Kubernetes clusters.

## Notes

- **Security**: Ensure that the images and secrets used are from trusted sources to avoid security vulnerabilities.
- **Accessibility**: Make sure that the specified image is accessible to the Kubernetes cluster, either by hosting it in a public registry or ensuring proper authentication for private registries.
- **Default Namespace and Service Account**: If not specified, the image pod will run in the same namespace and use the same service account as the NudgeBee agent.

---

This documentation provides a comprehensive guide to using the Execute Image action, helping users effectively run custom container images on their Kubernetes workloads.
