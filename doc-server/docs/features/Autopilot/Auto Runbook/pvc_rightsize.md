# Action: PV Right Size

## Overview

The **PV Right Size** action in the Automation Platform allows users to automatically increase the size of a Persistent Volume Claim (PVC) based on storage usage patterns. This ensures that workloads do not fail due to lack of storage and helps maintain application availability.

This action supports scaling the PVC size either by an absolute value (in GiB) or by a percentage of the current size. Additionally, users can set a **maximum threshold** to prevent unbounded PVC growth.

> 📌 Note:
> - This action only supports **increasing** the PVC size. Shrinking is not supported due to Kubernetes constraints.
> - This action is only applicable when using an **event-type trigger**.

## User Inputs

| Field              | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| Scale Mode         | Choose between scaling **by value** (e.g., +10Gi) or **by percentage** (e.g., +20%). |
| Max Threshold (Gi) | Defines the maximum size (in GiB) that the PVC can grow to.                |

## Detailed Explanation

The PV Right Size action operates by checking if the current storage utilization justifies an increase in PVC size. When triggered:

- If **Scale By Value** is selected:
  - The PVC size will be increased by a fixed GiB value.
  - Example: A 20Gi PVC with a scale value of 10Gi will resize to 30Gi, if within the Max Threshold.

- If **Scale By Percentage** is selected:
  - The PVC size will be increased by the specified percentage of its current size.
  - Example: A 50Gi PVC scaled by 20% will grow to 60Gi, provided it doesn’t exceed the Max Threshold.

- **Max Threshold** acts as a safety cap to prevent the PVC from growing beyond a user-defined size.

The resizing is done seamlessly and transparently to the running workload, assuming the underlying storage class supports volume expansion.

## Example Use Case

Imagine a scenario where a database workload is experiencing steady growth in data size. To avoid manual intervention or service disruption, a user configures the PV Right Size action to increase the PVC size by 20% whenever usage exceeds a specific threshold. They also set a Max Threshold of 200Gi to ensure storage is consumed within policy limits.

## Notes

- Ensure the storage class used for PVCs supports **volume expansion**.
- This action does not support PVC shrinkage; volume expansion is irreversible.
- Verify that PVCs are not bound to stateful sets with fixed volume templates unless those templates also support resizing.
- Kubernetes may require pod restarts or recreation in some cases for the new volume size to take effect.
- This action is triggered **only** through **event-type triggers**.

---

This documentation guides users in configuring automated, policy-compliant PVC resizing using the PV Right Size action, helping maintain workload reliability and storage efficiency.
