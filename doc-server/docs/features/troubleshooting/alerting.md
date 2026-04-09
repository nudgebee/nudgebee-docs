---
sidebar_position: 2
---

# Troubleshooting Action Customisation

Nudgebee provides flexible options to define Prometheus alerts and attach automated troubleshooting actions using playbooks.

---

## 📍 Accessing AlertManager

1. Navigate to the **Monitoring** tab in the Nudgebee dashboard.
2. Click on the **AlertManager** section.

This is where you can view, create, and manage Prometheus alert rules.

---

## ➕ Creating a New Alert

To create and configure a new alert:

1. Click the **"New"** button.
2. Fill out the following details:

   * **Alert Name**: A meaningful name for the alert.
   * **Alert Summary**: A short description of what the alert tracks.
   * **Severity**: Choose from predefined levels like `Critical`, `High`, `Warning`, or `Info`.
   * **PromQL Query**: Enter the Prometheus query that determines the alert condition.
   * **For Duration (optional)**: Set a time window (e.g., `10m`) to ensure the condition holds consistently before the alert fires.

     * This avoids alerting on short-lived or flapping issues.
     * For example, `for: 10m` means the condition must remain true for 10 minutes before alerting.
3. Click **Validate** to check the query syntax and preview the results.
4. Once validated, click **Save** to create the alert.

---

## 🛠️ Attaching Playbooks for Auto-Triage

After an alert is created:

1. Select the alert from the list.
2. Navigate to the **Playbooks** tab.
3. Choose one or more **playbooks** to attach.

Playbooks define automated actions to be performed when the alert is triggered — for example:

* Collect pod logs
* Analyze recent deployment changes
* Inspect CPU/memory usage
* Check related Kubernetes resources

These actions enrich the alert with investigative data, reducing the time to root cause.

---

## 📚 Supported Playbooks

You can find a comprehensive and categorized list of supported playbooks in the [Nudgebee Playbook Catalog](.././playbook-catalog). Each playbook provides:

* A user-friendly display name
* A detailed description
* Required and optional parameters
* Valid input types and defaults

These playbooks support diagnostics across Kubernetes workloads, nodes, clusters, and external services (like PostgreSQL).

Examples include:

* **Logs Enricher** – Stream logs from affected pods (non-scripting)
* **Pod Enricher** – Provides structured pod-level metadata for templating
* **Node Disk Analyzer** – Highlight disk usage and pod-level breakdowns
* **Pod Profiler** – Trigger CPU/memory profiling of a container
* **Prometheus Query Analyzer** – Run on-the-fly queries for real-time insight
* **Nudgebee Runbook Trigger** – Invoke full remediation playbooks

### 🧩 Conditional Actions

Some playbooks return structured data suitable for conditional logic via Jinja templating. These enable intelligent workflows.

#### ✅ `Pod Enricher` – Output Format

Returns an object with:

```json
{
  "name": "pod_details",
  "data": {
    "pod_name": "string",
    "namespace": "string",
    "node": "string",
    "cpuRequest": float,
    "memoryLimit": int,
    "containers": [
      {
        "name": "string",
        "restarts": int,
        "status": {
          "container_statuses": [
            { "state": { "waiting": { "reason": "CrashLoopBackOff" } } }
          ]
        }
      }
    ]
  }
}
```

#### 📌 Example Jinja Conditional

```yaml
    "{{ pod_details.data.containers | selectattr('status.container_statuses') | map(attribute='status.container_statuses') | map('selectattr', 'state.waiting.reason', 'in', ['CrashLoopBackOff', 'ImagePullBackOff']) | list | length > 0 }}"
```

---

## ✅ Summary

With Nudgebee's AlertManager and rich playbook ecosystem, you can:

* Create alerts visually with PromQL
* Delay firing with `for` clause to avoid flapping alerts
* Automatically enrich alerts with real-time diagnostics
* Trigger scripts, queries, and external tools for faster triage

This makes your Kubernetes alerting not just reactive, but intelligent.
