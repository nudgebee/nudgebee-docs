---
sidebar_position: 4
sidebar_label: Profiler
keywords: [profiler, cpu profile, memory profile, flamegraph, java flight recorder, thread dump, heap dump, pod profile history]
---

# Profiler

Capture a CPU or memory profile of a running pod to see where its time or memory goes.

**Open it:** a pod's page → **Profiler** tab (Apps & Infra → Pods → click a pod). A workload's **Profilers** row tab shows its profile history.

## Run a profile

| Field | Options |
|---|---|
| **Language** | **Auto-detect**, Java, Python, Go, Ruby, Rust, C++, Node. Preselected from the pod's detected framework, otherwise **Auto-detect**. After a run with Auto-detect the page shows *Detected language: …*. |
| **Profile Type** | Auto-detect, Python, Node and Go: **CPU** or **Memory**. Java: **Java Flight Recorder**, **Thread Dump**, **Heap Histogram**, **Heap Dump** or **Flamegraph**. Other languages: **Flamegraph**. |
| **Profile Duration (seconds, max 600)** | Default 15 |

Click **Submit**. The **Pod Profile History** icon button opens the *Pod Profile* list of earlier profiles. For text results (thread dumps and heap dumps), the **Ask Nubi for analysis** button sends the result to NuBi to explain (named after your assistant).

## If it doesn't work

| Message | What to do |
|---|---|
| *Please select a language first and click submit.* | Pick a language |
| *Value cannot exceed 600* | Shorten the duration — Submit stays enabled, so check the value before running |
| *Fail to generate profiler data* / *Failed to fetch Data* | The profile couldn't be captured — check that the pod is running and try again. With Auto-detect the page adds *If the language could not be detected, select it under Language and submit again.* |
| *No Data Found* | The profile came back empty |

## Related

- [Workloads & Pods](./workloads-and-pods.md)
- [Using the Chat](../ai/nubi-chat.md)
