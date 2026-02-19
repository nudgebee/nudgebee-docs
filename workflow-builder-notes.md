# Workflow Builder — User-Facing Feature Notes

## 1. Entry Points and Navigation

### Primary Navigation
- **Sidebar label:** "Workflow"
- **Sidebar icon:** White workflow icon
- **Sidebar path:** `/auto-pilot` (links to auto-pilot page which contains the workflow section)
- **Direct URL to workflow list:** `/workflow?accountId={accountId}` (accessible from within the Workflow Builder layout)

### Workflow Builder Layout
The Workflow Builder has its own dedicated layout (`WorkflowBuilderLayout`) separate from the main app layout. When the user is on any `/workflow/...` route, the main app sidebar is hidden and replaced by a compact workflow-specific sidebar with:
- **App** — Returns to the main application
- **New** — Creates a new workflow (`/workflow/new`)
- **Workflows** — Goes to the workflows listing page (`/workflow`)
- **Template** — Placeholder for a template feature (currently disabled)

### Landing Page
The landing page is the **Workflow Listing Page** at `/workflow?accountId={accountId}`.

---

## 2. UI Layout and Screens

### Workflow Listing Page (`/workflow`)

**Header area contains:**
- "Search by Workflow Name" text input (with 2-second debounce)
- "Search by Tags" text input (with 2-second debounce)
- **Status** dropdown filter: `All`, `Active`, `Inactive`, `Paused`
- **Last Exec. Status** dropdown filter: `All`, `Running`, `Completed`, `Failed`, `Canceled`, `Terminated`, `Timed Out`, `Continued As New`, `Unspecified`
- **Trigger Type** dropdown filter: `All`, `Manual`, `Schedule`, `Webhook`
- **Refresh** button (icon)
- **Configs** button (secondary, opens Configuration Manager)
- **Create Workflow** button (primary, opens Create Workflow Options modal)

**Table columns:**
| Column | Width | Content |
|--------|-------|---------|
| Name | 30% | Workflow name (clickable link to executions view), "Created: [relative time] · [creator name]", "Updated: [relative time] · [updater name]" |
| Last Execution | 15% | Status label + relative time, OR italic "No Executions yet" |
| Trigger Type | 10% | Icon + capitalized trigger type name for each trigger |
| Tags | 18% | Tag labels (max 2 visible, "+N more" button), OR italic "Unlabeled" |
| Status | 10% | Colored label: active (green), paused (orange), inactive (red), draft (grey) |
| Actions | 5% | "Edit" button + three-dots menu |

**Three-dots menu items (per workflow, only for users with write access):**
- **Manual run** — Opens trigger workflow modal
- **Pause** — Opens pause confirmation dialog (only shown for schedule/event/webhook workflows that are NOT paused)
- **Resume** — Opens resume confirmation dialog (only shown for paused workflows)
- **Delete** — Opens delete confirmation dialog

**Pagination:** 10 rows per page by default. Supports page navigation with offset-token-based pagination.

---

### Create Workflow Options Modal

**Title:** "Automate your Infra Operations"

Two cards displayed side by side:

1. **"Create from scratch"** — Subtitle: "Build exactly what you need". Navigates to `/workflow/new`.
2. **"Ask nubi AI to generate"** — Subtitle: "Let AI generate a workflow for you". Opens the AI Generate Workflow modal.

> Note: A "Use a Template" card exists in the code but is commented out. The listing page shows "Templates feature coming soon!" if accessed.

---

### AI Generate Workflow Modal

**Stages:**
1. **Input stage** — User types a natural language description of the workflow they want to build.
2. **Generating stage** — Shows animated progress messages rotating every 15 seconds:
   - "Understanding your request..."
   - "Planning workflow structure..."
   - "Building workflow definition..."
   - "Validating and refining..."
   Also shows elapsed time counter.
3. **Plan review stage** — AI presents a plan. Default options: "Approve and Build", "Request Changes". User can approve or provide feedback.
4. **Text followup stage** — AI asks a text-based question. User provides a free-text response.
5. **Error stage** — Shows error message with option to retry.

**User can cancel generation at any time.**

After completion, the generated workflow JSON is loaded into the workflow editor at `/workflow/new?loadFromAI=true`.

---

### Workflow Editor / Canvas (`/workflow/{workflowId}` or `/workflow/new`)

**Header bar** (60px high, full width):
- **Back arrow** — Returns to `/auto-pilot?accountId={accountId}#workflow`
- **Workflow title** — Displayed as text. Click the pencil icon to edit inline. Press Enter to save, Escape to cancel.
- **Tab toggle** (centered, only for existing workflows): `Editor` | `Executions`
- **Status dropdown** (right side): `ACTIVE` (green), `INACTIVE` (red), `PAUSED` (orange), `DRAFT` (grey)
- **"Continue with AI"** button — only visible if the workflow was AI-generated and has a conversation session

**Canvas area** (ReactFlow):
- Drag-and-drop node-based visual editor
- **MiniMap** — bottom-right corner (small overview of the workflow)
- **Controls** — zoom in/out, fit view (built-in ReactFlow controls, bottom-left)
- **Background** — Dot grid pattern
- Snap to grid enabled (19x15 grid)
- Nodes are draggable and connectable
- Canvas supports zoom and pan

**Empty state** (new workflow, no nodes):
- Centered card: "Add Your Workflow Trigger Node"
- Subtitle: "Begin by adding a trigger node to specify how your workflow starts."
- **"Add Trigger"** button — opens Trigger Selector popup

**Warning state** (existing workflow, no trigger nodes):
- Shows a trigger warning message with an "Add Trigger" button

**Bottom action toolbar** (fixed at bottom center, only when nodes exist):
- **"Add Action"** button (secondary) — only when at least one trigger node exists. Opens Node Categories sidebar.
- Divider
- **"Run"** button (primary) — only for existing (saved) workflows. Saves workflow first, then triggers execution. Shows "Running..." while executing.
- **"Dry Run"** button (secondary) — Tooltip: "Validate your workflow without making any changes. No system state is affected."
- Divider
- **AI Chat** icon button (nubi icon) — toggles AI Chat sidebar. Only visible when WORKFLOWS feature flag is enabled.
- **Save** icon button (disk icon) — Tooltip: "Save Workflow"
- **Settings** icon button (gear icon) — Tooltip: "Workflow Settings". Opens Settings modal.

**JSON Panel** (right side, sliding):
- Toggle button labeled "JSON" on the right edge of the canvas
- Shows the full workflow definition as editable JSON (CodeMirror editor)
- "Apply" button to sync JSON changes back to the visual editor
- "Revert" button if the last change was from AI/LLM

**AI Chat Sidebar** (left side, sliding, feature-flag-controlled):
- Toggle button labeled "AI Chat" on the left edge
- NuBi Chat interface for conversational workflow editing
- Context-aware — sends current workflow definition to the AI backend

**Execution Status Bar** — shown during manual run, overlays the top of the canvas showing real-time task execution status with animated indicators on nodes.

---

### Node Categories Sidebar (Add Action popup)

**Title:** "Add Node to Workflow"

**Search bar:** Placeholder: "Search actions..."

**Categories** (displayed as expandable accordions, dynamically loaded from API):
| Category | Color | Description |
|----------|-------|-------------|
| Cloud | Blue (#3b82f6) | Cloud provider operations |
| Database | Purple (#8b5cf6) | Database operations |
| Notifications | Amber (#f59e0b) | Notification delivery |
| Observability | Cyan (#06b6d4) | Monitoring and observability |
| Scripting | Green (#10b981) | Script execution |
| Integrations | Orange (#f97316) | External integrations |
| Tickets | Blue (#3b82f6) | Ticket management |
| AI/LLM | Purple (#a855f7) | AI and LLM operations |
| Data | Yellow (#FFCC00) | Data transformation |
| Core | Indigo (#6366f1) | Core workflow operations |
| CI/CD | Purple (#8b5cf6) | CI/CD operations |
| Networking | Rose (#f43f5e) | Network operations |
| Message Queue | Pink (#ec4899) | Message queue operations |
| Source Control | Indigo (#6366f1) | Source control operations |
| Cryptography | Violet (#7c3aed) | Cryptographic operations |
| Events | Emerald (#059669) | Event handling |
| AWS | AWS Orange (#ff9900) | AWS-specific |
| GCP | Google Blue (#4285f4) | GCP-specific |
| Azure | Azure Blue (#0078d4) | Azure-specific |
| Kubernetes | K8s Blue (#326ce5) | Kubernetes-specific |
| Slack | Slack Purple (#4A154B) | Slack-specific |

Each category expands to show individual task types (subcategories) with label, description, and icon. Clicking a task adds it as a node on the canvas.

**Empty search state:** "No actions found" / "Try adjusting your search terms"

---

### Trigger Selector Popup

**Title:** "Select Trigger a Node"

Four options:
1. **Manual Trigger** — "Start workflow manually" (green, user icon)
2. **Webhook** — "HTTP endpoint trigger" (orange, webhook icon)
3. **Schedule** — "Time-based trigger" (blue, calendar icon)
4. **Event Trigger** — "Event-based trigger" (amber, ⚡ emoji)

---

### Trigger Configuration Sidebar

**Title:** "Trigger Configuration - {Type}"

Opens when a trigger node is clicked on the canvas.

#### Manual Trigger
- **Card title:** "Manual Trigger Configuration"
- **Description:** "Configure inputs that will be provided when manually triggering this workflow"
- **Input Parameters (JSON)** — textarea, placeholder `{"param1": "value1", "param2": 42}`
- Help box explains: Define JSON inputs, available to tasks as variables, leave empty `{}` for no inputs

#### Schedule Trigger
- **Card title:** "Schedule Configuration"
- **Description:** "Configure when this workflow should run automatically"
- **Cron Expression** (required) — text field, placeholder `0 9 * * 1-5`, description: "Define the schedule using cron format (minute hour day month weekday)"
- **Note:** "All scheduled times are calculated in UTC timezone."
- **Overlap Policy** — dropdown, options:
  - Skip (Default)
  - Buffer One
  - Buffer All
  - Allow All
  - Cancel Other
  - Terminate Other
- **Description:** "Behavior when a new schedule run is due while previous run is still active"
- **Catchup Window** — text field, default `60s`, description: "Duration to look back for missed schedule runs after outage (Go format)"
  - Validation: Must be Go duration format (e.g., "10m", "1h", "24h")
- **Common Cron Examples** help box:
  - `0 9 * * 1-5` — Every weekday at 9:00 AM
  - `*/15 * * * *` — Every 15 minutes
  - `0 0 * * 0` — Every Sunday at midnight
  - `0 12 1 * *` — First day of every month at noon

#### Webhook Trigger
- **Card title:** "Webhook Configuration"
- **Description:** "Configure webhook integration for this workflow"
- **Integration Name** (required) — text field
  - Validation: Only letters, numbers, dots, hyphens, and underscores
- If webhook is set up, displays **Webhook URL** (copyable) and integration name
- If not set up, shows guidance: "Create a workflow_webhook integration in Settings → Integrations"

#### Event Trigger
- **Card title:** "Event Configuration"
- **Description:** "Configure which events should trigger this workflow"
- **Event Type / Aggregation Key** — dropdown, dynamically loaded from Kubernetes events
  - Description: "Select the event type or aggregation key to listen for"
- **Filter Expression (Optional)** — textarea, placeholder `{{ event.source == "my-source" }}`
  - Description: "Use template syntax to filter events"
  - Validation: Must use template syntax `{{ }}` with balanced braces
- Help box: Explains events are from Kubernetes, filter examples provided

---

### Action Details Sidebar

Opens when an action (task) node is clicked on the canvas.

**Two tabs:** `Parameters` | `Settings`

**Parameters tab:**
- Dynamically generated form fields based on the task definition schema from the API
- Field types automatically detected: dropdown (for accounts, integrations, notifications, tickets, enums), switch (boolean), number, timestamp, JSON editor, array editor, key-value editor, code editor (with language detection: bash, JavaScript, SQL, JSONata, JSON), textarea (for scripts, commands, expressions, queries), password fields, duration inputs, multi-select chips, nested schema editors
- **Template expressions** supported: Users can reference outputs from previous tasks using drag-and-drop or `{{ }}` syntax
- **Previous tasks outputs** shown in left column for reference and drag-and-drop
- **Workflow Configs** — shows available configurations that can be referenced via `{{ Configs.key_name }}`
- For **notifications.im** tasks: Shows provider icons (Slack, MS Teams, Google Chat) and channel/team dropdowns
- For **core.switch** tasks: Shows switch variable field and case/branch configuration

**Settings tab (advanced configuration):**
- **Conditional Execution (if)** — Template expression field for conditional logic
- **Timeout** — Duration field for task-specific timeout
- **Set State** — JSON field for persistent state configuration
- **Set Variables** — Key-value field for workflow variables
- **Matrix** — Matrix execution configuration
- **Hooks** — Task hooks configuration
- **Failure Policy** — Action + retry configuration

**Testing capabilities per task:**
- **Run Task** — Execute a single task in isolation (not available for: core.group, core.switch, core.foreach, core.call-workflow, ai.router, core.approval, core.wait, ai.llm_event_investigate)
- **Dry Run to Task** — Run all previous tasks plus this task without side effects (not available for: k8s.vertical_rightsize, k8s.horizontal_rightsize, k8s.pv_rightsize)
- Results shown inline with JSON/formatted toggle

---

### Workflow Settings Modal

**Title:** "Workflow Settings"
**Subtitle:** "Configure workflow execution parameters"

**Section 1: Execution Settings**
- **Timeout (seconds)** — Number input with quick presets: 1m (60), 5m (300), 15m (900), 30m (1800), 1h (3600). Default: 300 (5 minutes). Description: "Maximum time the workflow is allowed to run before timing out"
- **Max Interval (seconds)** — Number input with quick presets: 30s (30), 1m (60), 5m (300), 10m (600). Default: 60. Description: "Maximum time between retry attempts"
- **Retries** — Dropdown: 0-5 retries. Default: 3. Description: "Number of times to retry workflow execution on failure"

**Section 2: Workflow Parameters**
- **Manual Trigger Variables** — Read-only preview of defined input variables (shown only when inputs exist). Description: "These input variables will be available when users manually trigger this workflow"
- **Input Parameters** — Add/remove input parameters:
  - **Parameter ID** — Text field, placeholder: "Parameter ID (e.g. slack_channel)"
  - **Type** — Dropdown: String, Integer, Boolean, JSON, Array
  - **Description** — Text field, placeholder: "Description of this parameter"
  - **Default Value** — Dynamic editor based on type (text, number, boolean dropdown, JSON editor, array editor)
  - "Add Parameter" button. Validation: ID must be unique, value must match type.
  - Empty state: "No input parameters defined yet"
- **Output Parameters** — JSON editor. Description: "Define output values as JSON object with key-value pairs (template expressions)". Example: `{"final_message": "Processed {{ Task.output.count }} items"}`
- **Tags** — Text field + "Add" button. Tags displayed as removable labels. Description: "Add tags to categorize and organize workflows". AI session tags (ai_session_id:*) are hidden from the UI.

**Buttons:** "Cancel" | "Save Settings"

---

### Configuration Manager Modal

**Accessed from:** "Configs" button on the workflow listing page

Manages key-value configuration pairs that can be referenced in workflows using `{{ Configs.key_name }}`.

**Table shows:** Key, Value, Type, Labels, Created, Updated
**Actions per config:** Edit, Delete
**Form fields for create/edit:**
- Key (required)
- Value (required)
- Type (default: "config")
- Labels
- Metadata

Validation: Key must be unique when creating a new config.

---

### Trigger Workflow Modal (Manual Run from listing page)

**Title:** "Trigger Workflow: {workflowName}"

- Shows **Trigger Type** (capitalized)
- Description varies by trigger type:
  - Manual: "Trigger this workflow manually with custom input parameters."
  - Schedule: "Trigger this scheduled workflow immediately, bypassing the schedule."
  - Webhook: "Trigger this webhook workflow manually with custom payload."
  - Event: "Trigger this event-driven workflow manually with custom event data."
- **Expected Input Variables** section — shows configured input variables with their ID, type, description, and default value. If none configured: "No input variables are configured for this workflow."
- **Input Parameters (JSON)** — Multi-line text area. Description: "Provide JSON input parameters that will be passed to the workflow execution. Leave empty {} for no inputs."
  - Placeholders vary by trigger type (webhook shows payload structure, event shows event structure)
- **Examples** help box: simple parameters, complex data, empty inputs
- **Buttons:** "Cancel" | "Trigger Workflow" (shows "Triggering..." while loading)

---

### Execution / Run History View (`/workflow/{workflowId}?tab=executions`)

**Three-panel layout:**

**Left panel (320px) — Execution List:**
- **Header:** "Executions" with Refresh button and Retry button
- **Status filter dropdown:** All, Running, Completed, Failed, Canceled, Terminated, Timed Out, Continued As New, Unspecified
- Pagination: Previous / Next buttons
- Each execution row shows:
  - Execution ID (truncated, with copy button)
  - Status label (colored)
  - Start time (relative)
  - Duration
  - Trigger type and triggered_by info
- Selected execution is highlighted

**Center panel — Execution Canvas:**
- Read-only ReactFlow canvas showing the workflow graph
- Nodes are color-coded by execution status:
  - COMPLETED/COMPLETE — green
  - COMPLETE_WITH_ERROR/CONTINUED_AS_NEW — yellow
  - FAILED — red
  - TERMINATED — dark red
  - TIMED_OUT — orange
  - RUNNING/IN_PROGRESS/SCHEDULED — blue (primary)
  - CANCELED — grey
  - SKIPPED — dark grey
  - UNSPECIFIED — light grey
- Deleted tasks (tasks that existed during execution but were removed from the workflow) shown as "ghost nodes"
- Clicking a node selects it and shows its details in the right panel

**Right panel (resizable, 400-900px, default 700px) — Task Details:**
- **Execution info** (when no task selected):
  - Status, duration, execution ID (copyable), start time, close time, parent workflow ID, trigger type, triggered by
  - Error message (if any)
  - Execution input and output (with JSON/formatted toggle)
  - Logs (expandable accordion)
- **Task info** (when a task is selected):
  - Task type with icon
  - Task ID (copyable)
  - Status label with duration
  - Start time / End time
  - **Input** accordion — expandable, shows task input with JSON/formatted toggle and copy button
  - **Output** accordion — expandable, shows task output with JSON/formatted toggle and copy button
  - **Error** — shown if task failed
  - **Logs** — expandable

**Retry execution:** "Retry" button in the execution list header. Creates a new execution with the same inputs. Success message: "Execution restarted successfully". The new execution is auto-selected and highlighted.

---

## 3. Core User Concepts

- **Workflow** — An automated process consisting of triggers and tasks. Has a name, status, tags, and a visual graph definition. Workflows can be created from scratch or generated by AI.
- **Trigger** — The starting point of a workflow. Defines how and when the workflow runs. A workflow can have multiple triggers. Types: Manual, Schedule, Webhook, Event.
- **Task** (also called "Action" or "Node" in the UI) — A single step in a workflow that performs an operation. Tasks are connected to form a directed acyclic graph (DAG). Each task has a type, parameters, and can reference outputs from previous tasks.
- **Node** — The visual representation of a trigger or task on the canvas. Nodes can be dragged, connected, and configured.
- **Connection** / **Edge** — A line connecting two nodes, defining execution order. Connections flow from source to target. Conditional edges are styled differently (colored, thicker).
- **Execution** — A single run of a workflow. Has a status, start/end time, and per-task results. Executions can be triggered manually or by automated triggers.
- **Dry Run** — Executes the workflow without making any real changes. Used for validation and testing.
- **Input Parameters** — Variables that can be passed into a workflow at trigger time. Defined in workflow settings with an ID, type, description, and default value.
- **Output Parameters** — Values produced by the workflow, defined using template expressions referencing task outputs.
- **Template Expressions** — Syntax like `{{ Task.output.value }}` or `{{ Configs.key }}` used to reference dynamic values. Also used for conditional expressions like `{{ variable == "value" }}`.
- **Config** / **Configuration** — Key-value pairs managed centrally and referenced across workflows using `{{ Configs.key_name }}`.
- **Tags** — Labels attached to workflows for categorization and filtering. Format: plain string or `key:value`.
- **Status** — The state of a workflow: ACTIVE (running on triggers), INACTIVE (not running), PAUSED (triggers suspended, can be resumed), DRAFT (under construction).
- **Switch** / **Conditional** — A special node type that branches execution based on a switch variable and case values.
- **Sub-workflow** (`core.group`) — A task that contains nested tasks, acting as a group.
- **Approval** (`core.approval`) — A task that pauses execution until a user approves.
- **NuBi AI** — The AI assistant integrated into the Workflow Builder for generating and editing workflows conversationally.

---

## 4. Trigger Types

### Manual Trigger
- **Display name:** "Manual Trigger"
- **Description:** "Start workflow manually"
- **Color:** Green (#10b981)
- **Configuration:** Input Parameters (JSON object) — optional. Pre-populated from workflow input schema defaults.
- **Behavior:** Workflow runs when a user clicks "Run" in the editor or "Manual run" from the listing page.

### Schedule Trigger
- **Display name:** "Schedule"
- **Description:** "Time-based trigger"
- **Color:** Blue (#3b82f6)
- **Configuration:**
  - Cron Expression (required) — standard 5-field cron format, UTC timezone
  - Overlap Policy — dropdown: Skip (default), Buffer One, Buffer All, Allow All, Cancel Other, Terminate Other
  - Catchup Window — Go duration format (default: "60s")
- **Behavior:** Workflow runs automatically on the defined schedule. Can be paused and resumed.

### Webhook Trigger
- **Display name:** "Webhook"
- **Description:** "HTTP endpoint trigger"
- **Color:** Orange (#f97316)
- **Configuration:**
  - Integration Name (required) — must match a configured workflow_webhook integration
- **Behavior:** Workflow runs when the generated webhook URL receives an HTTP request. Webhook URL is displayed with a copy button once the integration is linked.
- **Prerequisite:** Requires a workflow_webhook integration configured in Settings → Integrations.

### Event Trigger
- **Display name:** "Event Trigger"
- **Description:** "Event-based trigger"
- **Color:** Amber (#f59e0b)
- **Configuration:**
  - Event Type / Aggregation Key — dropdown, loaded from Kubernetes event filter values
  - Filter Expression (optional) — template syntax, e.g., `{{ event.source == "integration-test" }}`
- **Behavior:** Workflow runs when a matching event is detected. Can be paused and resumed.

---

## 5. Task / Node Types

### Built-in Task Types (with display descriptions)

| Task Type Key | Display Name | Category | Description |
|---------------|-------------|----------|-------------|
| `scripting.run_script` | Execute script | Scripting | Run custom scripts (supports bash, JavaScript, Python, and more) |
| `integrations.http` | HTTP request | Integrations | Make HTTP requests to external services |
| `notifications.im` | IM notification | Notifications | Send instant messages via Slack, MS Teams, or Google Chat |
| `tickets.create` | Create ticket | Tickets | Create tickets/issues in configured ticket management systems |
| `data.transform` | Transform data | Data | Transform and process data |
| `cloud.aws.cli` | AWS CLI | Cloud | Execute AWS CLI commands |
| `cloud.azure.cli` | Azure CLI | Cloud | Execute Azure CLI commands |
| `cloud.gcp.cli` | GCP CLI | Cloud | Execute Google Cloud CLI commands |
| `cloud.k8s.cli` | Kubectl | Cloud / Kubernetes | Execute kubectl commands |
| `cicd.argocd.cli` | ArgoCD CLI | CI/CD | Execute ArgoCD CLI operations |
| `observability.logs` | Query logs | Observability | Query and analyze logs |
| `observability.matrices` | Query metrics | Observability | Query metrics data |
| `llm.summary` | LLM summary | AI/LLM | Generate AI summaries |
| `llm.investigate` | LLM investigation | AI/LLM | AI-powered investigation |
| `core.group` | Sub-workflow | Core | Group of nested tasks (sub-workflow) |
| `core.approval` | Manual approval | Core | Pause execution until manually approved |
| `core.switch` | Conditional | Core | Branch execution based on conditions |
| `core.foreach` | For Each | Core | Loop over items |
| `core.call-workflow` | Call Workflow | Core | Invoke another workflow |
| `core.wait` | Wait | Core | Pause execution for a duration |
| `mq.rabbitmq.cli` | RabbitMQ CLI | Message Queue | Execute RabbitMQ operations |
| `dbms.redis.cli` | Redis CLI | Database | Execute Redis operations |
| `scm.github.cli` | GitHub CLI | Source Control | Execute GitHub operations |
| `ai.router` | AI Router | AI/LLM | Route to AI-based decisions |
| `ai.llm_event_investigate` | AI Event Investigate | AI/LLM | AI investigation of events |

> Note: Task types are dynamically loaded from the API. The list above represents the known built-in types found in the codebase. Additional types may be registered at the backend level.

### Task Configuration
All tasks have configuration forms dynamically generated from their `input_schema` returned by the API. Common field patterns include:
- **account** fields → Show cloud account dropdown
- **integration** fields → Show integration dropdown
- **notification** fields → Show notification provider dropdown
- **ticket** fields → Show ticket configuration dropdown
- **namespace** fields → Show Kubernetes namespace dropdown
- **kind** fields → Show Kubernetes resource type dropdown
- **script/command** fields → Show code editor with syntax highlighting
- **environment/headers** fields → Show key-value editor

---

## 6. Step-by-Step Flows

### Creating a New Workflow (from scratch)

1. User navigates to the Workflow listing page (`/workflow`)
2. User clicks **"Create Workflow"** button (top right)
3. **Create Workflow Options** modal appears with two cards
4. User clicks **"Create from scratch"**
5. User is navigated to `/workflow/new?accountId={accountId}`
6. The Workflow Editor loads with an empty canvas
7. Empty state card appears: "Add Your Workflow Trigger Node" with **"Add Trigger"** button
8. User clicks **"Add Trigger"**
9. **Trigger Selector Popup** appears with 4 trigger options
10. User selects a trigger type (e.g., "Manual Trigger")
11. A trigger node is added to the canvas. Popup closes.
12. The bottom toolbar appears with **"Add Action"**, **"Dry Run"**, **"Save"**, and **"Settings"** buttons
13. User clicks the trigger node to configure it → Trigger Configuration Sidebar opens
14. User configures trigger parameters and closes the sidebar
15. User clicks **"Add Action"** to add tasks
16. **Node Categories Sidebar** appears with searchable categories
17. User expands a category (e.g., "Scripting") and clicks a task (e.g., "Execute script")
18. A new action node appears on the canvas. Sidebar closes.
19. User drags from the trigger node's output port to the action node's input port to connect them
20. User clicks the action node to configure it → Action Details Sidebar opens
21. User fills in parameters (e.g., script content) and closes the sidebar
22. User can add more tasks and connect them in sequence
23. User clicks the **Save** icon in the bottom toolbar
24. Success message: `Workflow "New Workflow" created successfully`
25. URL changes to `/workflow/{newWorkflowId}?accountId={accountId}` (edit mode)
26. The "Run" button now appears in the toolbar

### Creating a Workflow with AI

1. User clicks **"Create Workflow"** on the listing page
2. User clicks **"Ask nubi AI to generate"** card
3. **AI Generate Workflow Modal** opens
4. User types a description (e.g., "Create a workflow that checks AWS EC2 instances and sends a Slack notification if any are idle")
5. User clicks submit
6. Modal shows "Understanding your request..." with progress indicator
7. AI may present a **plan** for review. User sees the plan text and options:
   - "Approve and Build" — continues generation
   - "Request Changes" — lets user provide feedback
8. On completion, modal closes. Success message: "Workflow generated successfully!"
9. User is redirected to `/workflow/new?loadFromAI=true`
10. Workflow canvas loads with the AI-generated nodes and connections
11. NuBi Chat sidebar opens for continued AI conversation about the workflow

### Adding and Configuring a Task

1. User clicks **"Add Action"** in the bottom toolbar
2. Node Categories Sidebar opens as a centered popup
3. User can search via the search bar or browse categories
4. User clicks a specific task type (e.g., "HTTP request" under "Integrations")
5. A new node appears at a calculated position on the canvas. Sidebar closes.
6. User clicks the new node
7. **Action Details Sidebar** opens on the right
8. Form fields are displayed based on the task's schema
9. User fills in required fields (red validation errors shown for missing required fields)
10. User can switch to **"Settings" tab** for advanced options (conditional execution, timeout, retry, etc.)
11. User can use **template expressions** by referencing previous task outputs (shown in left column of sidebar)
12. User can **drag output fields** from the previous tasks pane into template text fields
13. Configuration saves automatically as user types (no explicit save button for task config)

### Connecting Tasks Together

1. User hovers over a node's output port (bottom/right of node) — port highlights
2. User clicks and drags from the output port
3. A connection line follows the cursor
4. User drops on another node's input port (top/left of node)
5. Connection is established as a smooth-step edge
6. **Cycle detection:** If the connection would create a circular dependency, both nodes flash briefly and the connection is rejected silently
7. **Conditional edges:** If the target node has a conditional expression (`if` field), the edge is styled differently (colored, thicker) with a condition label

### Deleting a Connection

Edges have a delete button that appears on hover (DeletableEdge component).

### Setting Up a Trigger

See "Trigger Configuration Sidebar" section above. After adding a trigger node:
1. User clicks the trigger node on the canvas
2. Trigger Configuration Sidebar opens
3. User configures trigger-specific fields
4. Configuration saves in real-time as user types

### Running / Executing a Workflow

**From the editor (existing workflow):**
1. User clicks **"Run"** in the bottom toolbar
2. Workflow is automatically saved first
3. If new workflow: workflow is created, then triggered. Success: "Workflow created successfully, starting manual run..."
4. If existing: workflow is updated, then triggered. Success: "Workflow saved successfully, starting manual run..."
5. Execution starts. "Run" button shows "Running..."
6. Execution Status Bar appears at top of canvas
7. Nodes update with real-time status colors (RUNNING → COMPLETED/FAILED)
8. Polling occurs every 4 seconds for up to 10 minutes
9. On completion, status messages appear:
   - COMPLETED: "Workflow execution completed successfully!"
   - COMPLETE_WITH_ERROR: "Workflow execution completed with errors"
   - FAILED: "Workflow execution failed"
   - CANCELED: "Workflow execution was canceled"
   - TERMINATED: "Workflow execution was terminated"
   - TIMED_OUT: "Workflow execution timed out"

**From the listing page:**
1. User clicks three-dots menu on a workflow row
2. User selects **"Manual run"**
3. **Trigger Workflow Modal** opens
4. User reviews/edits input parameters JSON
5. User clicks **"Trigger Workflow"**
6. Success: `Workflow "{name}" triggered successfully!`

**Dry Run:**
1. User clicks **"Dry Run"** in the bottom toolbar
2. Tooltip: "Validate your workflow without making any changes. No system state is affected."
3. Workflow is validated (not saved)
4. Dry run result modal appears showing per-task status and outputs
5. Success: "Dry run completed successfully" or shows error details

### Viewing Execution History

1. User clicks the **"Executions"** tab in the workflow header (only for saved workflows)
2. View switches to the three-panel Executions View
3. Left panel: list of executions with status, time, and duration
4. User clicks an execution to select it
5. Center panel: read-only canvas showing nodes colored by task status
6. Right panel: execution details, inputs/outputs
7. User clicks a node on the canvas to see that specific task's details
8. **Retry:** User clicks the Retry icon button in the execution list header to re-run the selected execution

### Editing an Existing Workflow

1. From the listing page, user clicks **"Edit"** button on a workflow row
2. User is navigated to `/workflow/{workflowId}?accountId={accountId}`
3. Workflow editor loads with the saved nodes and connections
4. User can modify trigger configuration, add/remove/reconfigure tasks, update connections
5. User saves changes via the Save button in the bottom toolbar

### Renaming a Workflow

1. In the editor header, user clicks the pencil icon next to the workflow title
2. Title becomes an editable text field
3. User types the new name
4. User presses Enter to save or Escape to cancel
5. Green checkmark and red X buttons also available for save/cancel

### Deleting a Workflow

1. From the listing page, user clicks three-dots menu on a workflow row
2. User selects **"Delete"**
3. Confirmation modal: `Delete Workflow "{name}"` — "Are you sure you want to delete this workflow? This action cannot be undone."
4. User clicks **"Delete"** to confirm or **"Cancel"** to abort
5. Success: `Workflow "{name}" deleted successfully`
6. Listing refreshes

### Pausing a Workflow

1. From the listing page, user clicks three-dots menu (only for schedule/event/webhook workflows)
2. User selects **"Pause"**
3. Confirmation: "Are you sure you want to pause this scheduled workflow? It will stop executing until resumed."
4. Success: `Workflow "{name}" paused successfully`

### Resuming a Workflow

1. From the listing page, user clicks three-dots menu on a paused workflow
2. User selects **"Resume"**
3. Confirmation: "Are you sure you want to resume this scheduled workflow? It will start executing according to its schedule."
4. Success: `Workflow "{name}" resumed successfully`

### Changing Workflow Status (from editor)

1. In the editor header, user clicks the status dropdown (right side)
2. Options: ACTIVE (green), INACTIVE (red), PAUSED (orange), DRAFT (grey)
3. User selects the desired status
4. Status updates immediately in the UI (saved on next Save)

---

## 7. Configuration Options and Settings

### Workflow-Level Settings (via Settings Modal)

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Timeout | Number (seconds) | 300 (5 min) | Maximum workflow execution time |
| Max Interval | Number (seconds) | 60 (1 min) | Maximum time between retries |
| Retries | Number (0-5) | 3 | Number of retry attempts on failure |
| Input Parameters | List of {id, type, description, default} | Empty | Parameters passed at trigger time |
| Output Parameters | JSON object | Empty | Template expressions for workflow outputs |
| Tags | List of strings | Empty | Labels for categorization (supports `key:value` format) |
| Status | Enum | DRAFT (new) | ACTIVE, INACTIVE, PAUSED, DRAFT |

### Input Parameter Types

| Type | Description | Default Value Editor |
|------|-------------|---------------------|
| String | Text value | Text field |
| Integer | Whole number | Number field |
| Boolean | True/false | Dropdown (True/False) |
| JSON | Arbitrary JSON | CodeMirror JSON editor |
| Array | Ordered list | Array item editor (add/remove items) |

### Task-Level Advanced Settings

| Setting | Type | Description |
|---------|------|-------------|
| Conditional Execution (if) | Template expression | Skip task if condition evaluates to false |
| Timeout | Duration string | Task-specific timeout override |
| Set State | JSON | Persistent state that survives workflow retries |
| Set Variables | Key-value | Variables available to subsequent tasks |
| Matrix | JSON | Execute task multiple times with different parameter combinations |
| Hooks | JSON | Pre/post execution hooks |
| Failure Policy | Action + Retry | What to do on failure (action + retry configuration) |

### Validation Rules and Error Messages

**Workflow save validation:**
- "Workflow name is required" — if name is empty
- "At least one task is required" — if no action nodes exist
- "{N} task(s) have validation errors" — if any tasks have invalid configuration

**JSON editor validation:**
- "Cannot save: JSON is invalid. Please fix errors or switch to Editor tab."
- "Cannot save: You have unapplied JSON changes. Click 'Apply' first."

**Trigger configuration validation:**
- Schedule cron: no specific validation message in UI (field is required)
- Webhook integration name: "Integration name is required for webhook triggers" / "Integration name should contain only letters, numbers, dots, hyphens, and underscores"
- Event filter: "Filter expression has unmatched template braces {{ }}" / "Filter expression should use template syntax like {{ event.property == \"value\" }}"
- Manual inputs: "Inputs must be a valid JSON object" / "Invalid JSON format. Please provide a valid JSON object."
- Catchup window: "Duration must be in Go format (e.g., \"10m\", \"1h\", \"24h\")"

**Trigger workflow modal validation:**
- "Input must be a valid JSON object"
- "Invalid JSON format. Please provide a valid JSON object."
- "Invalid workflow or account ID"

**Execution errors:**
- "Failed to delete workflow"
- "Failed to pause workflow"
- "Failed to resume workflow"
- "Failed to trigger workflow"
- "Failed to get execution ID from workflow trigger"
- "No workflow data returned from AI"
- "Failed to generate workflow"
- "Failed to load AI-generated workflow. Creating empty workflow instead."
- "Failed to retry execution"
- "Workflow execution failed"
- "Workflow execution timed out"
- "Workflow execution was terminated"
- "Workflow execution was canceled"
- "Workflow execution completed with errors"

**Connection validation:**
- Circular dependency: No text error shown. Both source and target nodes briefly flash (800ms) to indicate rejection.

**Config Manager validation:**
- "Key and value are required"
- "A configuration with key \"{key}\" already exists"

### Unsaved Changes Protection
The editor tracks unsaved changes. When the user tries to navigate away with unsaved changes, a confirmation dialog appears. The dialog can be confirmed (navigate away, losing changes) or canceled (stay on page).
