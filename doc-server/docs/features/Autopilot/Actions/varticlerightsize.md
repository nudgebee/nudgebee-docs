# Action: VerticalRightsize

## Overview

The VerticalRightsize action in the Kubernetes Automation Tool allows you to scale the CPU and memory resources of a Kubernetes workload either up or down. This action ensures that your workloads have the optimal resource allocations based on their performance needs.

## User Inputs

The following user inputs are required to configure the VerticalRightsize action:

1. **Scale Direction**:
   - **Toggle Button**: Indicates whether the user wants to scale the resources up or down.
   
2. **Resource Sections**:
   - The UI is divided into two sections: one for CPU and the other for Memory.

3. **CPU Configuration**:
   - **Increase/Decrease**: Adjust the CPU by a percentage value.
   - **Minimum Value**: Define the minimum CPU limit in millicores (m).
   - **Maximum Value**: Define the maximum CPU limit in millicores (m).
   - **Remove Limit**: Option to remove the CPU limit altogether.

4. **Memory Configuration**:
   - **Increase/Decrease**: Adjust the memory by a percentage value.
   - **Minimum Value**: Define the minimum memory limit in mebibytes (Mi).
   - **Maximum Value**: Define the maximum memory limit in mebibytes (Mi).

5. **Combination**:
   - You can choose to increase or decrease both CPU and memory simultaneously, or adjust them individually.

## Detailed Explanation

The VerticalRightsize action interface is designed for ease of use and clarity. Here’s how each part works:

- **Scale Direction Toggle**: 
  - **Scale Down**: Decreases the resource allocation.
  - **Scale Up**: Increases the resource allocation.
  
- **CPU Section**:
  - **Increase/Decrease**: Use this to specify the percentage by which to increase or decrease the CPU resources.
  - **Minimum/Maximum Values**: These fields allow you to set bounds for how low or high the CPU resources can be adjusted. This ensures that the resource allocation remains within a safe and efficient range.
  - **Remove Limit**: Selecting this option removes the CPU limit, allowing the workload to use as much CPU as it needs.

- **Memory Section**:
  - **Increase/Decrease**: Use this to specify the percentage by which to increase or decrease the memory resources.
  - **Minimum/Maximum Values**: These fields allow you to set bounds for how low or high the memory resources can be adjusted. This ensures that the resource allocation remains within a safe and efficient range.

## Example Use Case

Consider a scenario where a particular application experiences increased load during peak hours and requires more CPU and memory. During off-peak hours, the resources can be scaled down to save costs. The VerticalRightsize action allows you to configure these adjustments dynamically based on real-time requirements.

By providing precise control over the resource allocation, the VerticalRightsize action helps in maintaining optimal performance and cost-efficiency in your Kubernetes environment.

---

This documentation provides a comprehensive guide to using the VerticalRightsize action, helping users effectively manage their Kubernetes resources.
