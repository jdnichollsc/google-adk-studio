# ADK Studio - Design Specification

**Date:** 2026-03-15
**Status:** Draft
**Project:** google-adk-ui

## Overview

ADK Studio is an open-source UI tool for Google's Agent Development Kit (ADK). It provides a visual interface to create, configure, test, and orchestrate ADK agents — similar to what Mastra provides for its own agent framework, but purpose-built for Google ADK with Temporal Workflows powering durable execution.

### Goals

1. **Agent Designer** — Visual creation and configuration of ADK agents (model, instructions, tools, sub-agents)
2. **Workflow Builder** — Drag-and-drop graph editor for composing durable, multi-step agent pipelines backed by Temporal
3. **Tool Registry** — Register, configure, and test ADK tools
4. **Runner & Testing** — Execute agents inline, stream responses, inspect events
5. **Session Inspector** — View and manage ADK session state
6. **Unified Run Viewer** — Monitor both direct agent runs and Temporal workflow executions

### Non-Goals (for now)

- Cloud deployment (GCP/Cloud Run) — local Docker Compose only for initial version
- A2A remote agent management
- Multi-user collaboration
- Authentication/authorization

---

## Architecture

### High-Level

```
docker-compose.yml
├── frontend        (React + Vite, port 5173)
├── backend         (FastAPI + ADK, port 8000)
├── temporal        (Temporal server, port 7233)
├── temporal-ui     (Temporal web UI, port 8233)
├── temporal-worker (Python worker for workflow execution)
└── postgresql      (Shared DB, port 5432)
```

The frontend talks exclusively to the backend on port 8000. The Temporal UI on 8233 is available for deep-link debugging of workflow runs.

### Backend Architecture

The backend extends ADK's own FastAPI application via `get_fast_api_app()`, which provides built-in endpoints for agent execution (`/run`, `/run_sse`), session management, and agent listing. Custom routers are mounted alongside for workflow, tool, and project management.

```
FastAPI (extends ADK's get_fast_api_app)
│
├── /run, /run_sse, /sessions  ← ADK built-in (free)
│
├── /api/agents                ← Agent CRUD + config management
├── /api/tools                 ← Tool registry
├── /api/workflows             ← Workflow CRUD + Temporal dispatch
├── /api/runs                  ← Unified run history
└── /api/projects              ← Project/file management
```

### Three Backend Domains

1. **ADK Native** — Agent creation, tool registration, sessions, direct agent execution via ADK Runner. All pure Google ADK Python. Uses `DatabaseSessionService` with PostgreSQL for persistent sessions.

2. **Temporal Workflow Engine** — Only for the visual workflow builder. Uses the **Interpreter Pattern**: a single `dynamic=True` Temporal workflow interprets JSON graph definitions at runtime. A single `dynamic=True` activity dispatches to any ADK agent or tool. No code generation, no worker restarts needed for new workflow shapes.

3. **Project Manager** — Manages the file-based project structure that ADK expects (agent directories, `__init__.py`, `.env` configuration).

### Frontend Architecture

Single-page application following Mastra's domain-based organization pattern.

```
src/
├── domains/           Feature modules
│   ├── agents/        Agent designer (form, chat, list)
│   ├── workflows/     Workflow builder (graph canvas, node palette)
│   ├── tools/         Tool registry
│   ├── sessions/      Session inspector
│   └── runs/          Unified run viewer
├── components/        Shared layout (Sidebar, Header, Shell)
├── lib/               API client, query provider, utilities
└── ds/                Design tokens (colors, typography)
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19+ | UI framework |
| Vite | latest | Build tool, dev server |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | latest | Component library (Radix UI primitives) |
| React Router | 7 | Client-side routing |
| @xyflow/react | 12 | Workflow graph editor |
| @dagrejs/dagre | latest | Auto-layout for workflow graphs |
| Zustand | latest | Client state (graph state, UI state) |
| TanStack Query | latest | Server state (API data, caching) |
| CodeMirror | 6 | Code display/editing (agent Python code) |
| react-hook-form | latest | Agent configuration forms |
| zod | latest | Client-side schema validation |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.12+ | Runtime |
| FastAPI | latest | HTTP server (extends ADK's built-in app) |
| google-adk | 1.18+ | Agent engine (Agent, Runner, Tools, Sessions) |
| temporalio | 1.23+ | Workflow execution SDK |
| google-genai | latest | Gemini model access |
| sse-starlette | latest | Server-Sent Events streaming |
| pydantic | 2+ | Data validation, API schemas |
| sqlalchemy | latest | Database access (if needed beyond ADK) |
| alembic | latest | Database schema migrations |
| simpleeval | latest | Safe expression evaluation for workflow conditions |

### Infrastructure (Docker Compose)

| Service | Image | Purpose |
|---------|-------|---------|
| postgresql | postgres:16 | Sessions DB + Temporal DB |
| temporal | temporalio/auto-setup | Temporal server (uses PostgreSQL) |
| temporal-ui | temporalio/ui | Temporal web UI for debugging |
| backend | Custom Dockerfile | FastAPI + ADK |
| temporal-worker | Custom Dockerfile | Python Temporal worker |
| frontend | Custom Dockerfile (node:22) | Vite dev server |

### Type Synchronization

FastAPI auto-generates an OpenAPI spec. We use a code generator (e.g., `openapi-typescript` or `orval`) to produce typed TypeScript API clients from the spec, eliminating manual type duplication.

---

## Detailed Design

### 1. Agent Designer

**Purpose:** Visual creation and configuration of ADK agents.

**Data Model:**
```python
# What the UI manages — maps directly to ADK Agent constructor
AgentConfig:
    id: str                    # unique identifier
    name: str                  # agent name
    agent_type: str            # "llm" | "sequential" | "parallel" | "loop"
    # LLM agent fields (required when agent_type == "llm"):
    model: str | None          # e.g., "gemini-2.0-flash"
    description: str
    instruction: str | None    # system instruction
    tools: list[str]           # tool IDs from the registry
    sub_agents: list[str]      # IDs of other agents
    output_key: str | None     # optional state key for output
    generate_content_config: GenerateContentConfig | None
    # Loop agent fields:
    max_iterations: int | None # required for loop agents

GenerateContentConfig:
    temperature: float | None
    top_p: float | None
    top_k: int | None
    max_output_tokens: int | None
    extra: dict | None         # escape hatch for advanced settings
```

The form UI shows/hides fields based on `agent_type`:
- **llm**: Shows model, instruction, tools, config
- **sequential/parallel**: Shows sub_agents selection only
- **loop**: Shows sub_agents + max_iterations

**UI Sections (multi-page form, Mastra CMS pattern):**
- **Identity** — Name, description, model selection
- **Instructions** — System instruction editor (CodeMirror)
- **Tools** — Select from registered tools
- **Sub-Agents** — Select from other agents
- **Config** — Model parameters, output_key, etc.
- **Test** — Inline chat panel for testing the agent

**Backend Flow:**
1. UI sends `AgentConfig` JSON to `POST /api/agents`
2. Backend persists the config to the `agents` table in PostgreSQL (source of truth)
3. Backend instantiates the Agent object from the config and registers it in the in-memory runtime registry
4. Agent becomes available for execution via `/run_sse` and as a workflow node
5. Optionally, the backend can export agents as ADK Python files (`agents/{name}/agent.py`) for CLI compatibility, but the database is the source of truth

**Registry Synchronization (Backend ↔ Worker):**
The Temporal worker runs as a separate container and needs access to agent/tool definitions. On activity start, the dynamic activity queries the `adk_studio` PostgreSQL database directly to load the agent/tool config, instantiates the ADK Agent object, and executes it. This ensures the worker always has the latest definitions without restart. Agent configs are small, so the DB query overhead is negligible compared to LLM call latency.

**Testing:**
The inline chat panel streams responses via SSE from ADK's built-in `/run_sse` endpoint. Events display in real-time with role-based formatting (user, model, tool calls, tool results).

### 2. Workflow Builder

**Purpose:** Visual drag-and-drop editor for composing durable multi-step agent pipelines.

**Graph Data Model:**
```typescript
// Frontend graph state (Zustand store)
WorkflowGraph {
    id: string
    name: string
    nodes: Node[]       // XYFlow nodes
    edges: Edge[]       // XYFlow edges
}

Node {
    id: string
    type: "agent" | "tool" | "condition" | "parallel" |
          "loop" | "human_approval" | "delay" | "input" | "output"
    data: {
        label: string
        config: NodeConfig  // type-specific configuration
    }
    position: { x: number, y: number }
}
```

**Node Types:**

| Type | Visual | Configuration | Maps To |
|------|--------|--------------|---------|
| Input | Terminal (green) | Input schema | Workflow entry point |
| Output | Terminal (red) | Output mapping | Workflow exit point |
| Agent | Rounded rect + agent icon | Agent ID, input mapping | Temporal activity → ADK Runner |
| Tool | Rounded rect + wrench icon | Tool ID, arguments | Temporal activity → Tool function |
| Condition | Diamond | Python expression, evaluated with predecessor outputs as locals | Graph branch in interpreter |
| Parallel | Fork icon | Fan-out config | `asyncio.gather()` in workflow |
| Loop | Cycle icon | Max iterations, exit condition | While loop in interpreter |
| Human Approval | Person icon | Approval prompt | `workflow.wait_condition` + signal |
| Delay | Clock icon | Duration | `workflow.sleep()` |

**Data Flow Between Nodes:**
Each node receives a dict where keys are the IDs of predecessor nodes and values are their outputs. Nodes can optionally specify an `input_mapping` in their config to transform this dict into the format they expect. Edges carry a `label` field used by condition nodes: outgoing edges from a condition node must have a label of `"true"` or `"false"` to indicate which branch to follow based on the expression result.

**Graph Editor Features:**
- Drag nodes from a palette sidebar onto the canvas
- Connect nodes by dragging from output handles to input handles
- Auto-layout via Dagre (top-to-bottom)
- Node selection → properties panel for configuration
- Real-time validation (disconnected nodes, missing configs)
- Zoom, pan, minimap

**Execution Flow:**
1. User clicks "Run Workflow"
2. Frontend serializes the graph to JSON: `{ nodes: [...], edges: [...] }`
3. `POST /api/workflows/{id}/run` sends the graph JSON to the backend
4. Backend starts a Temporal workflow with the graph JSON as input
5. Frontend streams execution status via SSE or polls Temporal queries
6. Nodes update in real-time: idle → running → success/failed
7. Deep-link to Temporal UI available for each run

### 3. Temporal Integration (Interpreter Pattern)

**Core Principle:** A single dynamic workflow interprets any JSON graph. No code generation.

**Dynamic Workflow (Graph Walker, not topological sort):**

The interpreter uses a recursive graph walker instead of a linear topological sort. This correctly handles conditions (skip untaken branches), parallel fan-out (concurrent subgraphs), and loops (re-enter subgraph until exit condition). The walker starts at the "input" node and follows outgoing edges dynamically based on node type.

Condition expressions use a safe evaluator (e.g., `simpleeval` or `asteval`) — never raw `eval()`. The evaluator only allows comparison operators, boolean logic, and access to predecessor output keys.

```python
from simpleeval import simple_eval  # safe expression evaluation

@workflow.defn(dynamic=True)
class GraphWorkflow:
    def __init__(self):
        self._approved = False
        self._current_step = ""
        self._results = {}

    @workflow.run
    async def run(self, args: Sequence[RawValue]) -> dict:
        graph = workflow.payload_converter().from_payload(args[0].payload, dict)
        nodes = {n["id"]: n for n in graph["nodes"]}
        edges = graph["edges"]

        # Find the input node (entry point)
        input_node = next(n for n in graph["nodes"] if n["type"] == "input")
        await self._execute_node(input_node["id"], nodes, edges, graph.get("input", {}))
        return self._results

    async def _execute_node(self, node_id: str, nodes: dict, edges: list, workflow_input: dict):
        node = nodes[node_id]
        self._current_step = node_id

        # Collect inputs: dict of {predecessor_id: predecessor_output}
        incoming = [e for e in edges if e["target"] == node_id]
        inputs = {e["source"]: self._results.get(e["source"], {}) for e in incoming}
        if node["type"] == "input":
            inputs = workflow_input

        # Execute based on node type
        if node["type"] in ("input", "output"):
            self._results[node_id] = inputs

        elif node["type"] == "agent":
            self._results[node_id] = await workflow.execute_activity(
                f"agent:{node['config']['agent_id']}",
                inputs,
                start_to_close_timeout=timedelta(seconds=node["config"].get("timeout", 120)),
            )

        elif node["type"] == "tool":
            self._results[node_id] = await workflow.execute_activity(
                f"tool:{node['config']['tool_id']}",
                inputs,
                start_to_close_timeout=timedelta(seconds=30),
            )

        elif node["type"] == "condition":
            # Safe expression evaluation — no arbitrary code execution
            result = simple_eval(node["config"]["expression"], names=inputs)
            self._results[node_id] = {"branch": result}
            # Follow only the matching branch edge
            branch_label = "true" if result else "false"
            outgoing = [e for e in edges if e["source"] == node_id and e.get("label") == branch_label]
            for edge in outgoing:
                await self._execute_node(edge["target"], nodes, edges, workflow_input)
            return  # Don't follow default outgoing edges

        elif node["type"] == "parallel":
            # Fan out: execute all outgoing targets concurrently
            outgoing = [e for e in edges if e["source"] == node_id]
            await asyncio.gather(*[
                self._execute_node(e["target"], nodes, edges, workflow_input)
                for e in outgoing
            ])
            self._results[node_id] = {e["target"]: self._results.get(e["target"]) for e in outgoing}
            return  # Children already executed

        elif node["type"] == "loop":
            max_iter = node["config"].get("max_iterations", 10)
            for i in range(max_iter):
                # Execute the loop body (sub-nodes connected from this node)
                body_edges = [e for e in edges if e["source"] == node_id and e.get("label") != "exit"]
                for e in body_edges:
                    await self._execute_node(e["target"], nodes, edges, workflow_input)
                # Check exit condition with safe evaluator
                if simple_eval(node["config"].get("exit_condition", "False"), names=self._results):
                    break
            self._results[node_id] = {"iterations": i + 1}

        elif node["type"] == "human_approval":
            self._approved = False
            await workflow.wait_condition(lambda: self._approved)
            self._results[node_id] = {"approved": True}

        elif node["type"] == "delay":
            await workflow.sleep(timedelta(seconds=node["config"]["seconds"]))
            self._results[node_id] = {"waited": node["config"]["seconds"]}

        # Follow outgoing edges to next nodes (default sequential flow)
        outgoing = [e for e in edges if e["source"] == node_id]
        for edge in outgoing:
            if edge["target"] not in self._results:  # Skip already-executed nodes
                await self._execute_node(edge["target"], nodes, edges, workflow_input)

    @workflow.signal
    async def approve(self) -> None:
        self._approved = True

    @workflow.query
    def get_status(self) -> dict:
        return {"current_step": self._current_step, "results": self._results}
```

**Dynamic Activity:**
```python
@activity.defn(dynamic=True)
async def execute_node(args: Sequence[RawValue]) -> dict:
    node_type = activity.info().activity_type
    inputs = activity.payload_converter().from_payload(args[0].payload, dict)

    if node_type.startswith("agent:"):
        agent_id = node_type.split(":", 1)[1]
        agent = agent_registry.get(agent_id)
        runner = Runner(
            agent=agent,
            session_service=session_service,
            app_name="adk-studio",
        )
        session = await runner.session_service.create_session(
            app_name="adk-studio", user_id="workflow"
        )
        result = ""
        async for event in runner.run_async(
            session_id=session.id, user_content=inputs.get("input", "")
        ):
            if hasattr(event, "content") and event.content:
                result += event.content
        return {"output": result}

    elif node_type.startswith("tool:"):
        tool_id = node_type.split(":", 1)[1]
        tool = tool_registry.get(tool_id)
        return tool.execute(inputs)
```

**Durability guarantees:**
- Every LLM call and tool invocation is persisted by Temporal
- Worker crash → automatic resume from last completed step
- Network failure → automatic retry with configurable backoff
- Human approval → durable wait with zero compute cost

### 4. Tool Registry

**Purpose:** Central registry for all tools available to agents and workflows.

**Tool Types:**
- **Built-in** — `google_search` and other ADK built-ins
- **Custom Functions** — User-defined Python functions with type hints
- **MCP Tools** — Tools from MCP servers (future)

**Data Model:**
```python
ToolConfig:
    id: str
    name: str
    description: str
    type: "builtin" | "custom" | "mcp"
    parameters: dict      # JSON Schema for inputs
    source_code: str      # For custom tools, the Python function
```

**Custom Tool Execution:** Custom tools are saved as Python source code and loaded as dynamic modules at runtime via `importlib.util.spec_from_file_location()`. The source is written to a sandboxed temp directory, imported as a module, and the tool function is extracted. This avoids arbitrary code execution in the server process. Dependency management for custom tools is out of scope for MVP — tools must use libraries already installed in the backend container.

**UI:** Table listing all tools with name, type, description, and a "Test" button that opens an inline form to execute the tool with sample inputs.

### 5. Session Inspector

**Purpose:** View and manage ADK session state for debugging.

**Features:**
- List all sessions by agent
- View session event history (conversation turns)
- Inspect session state dictionary (with prefix scoping: session, user:, app:, temp:)
- Delete sessions

**Backend:** Uses ADK's `DatabaseSessionService` connected to the shared PostgreSQL.

### 6. Unified Run Viewer

**Purpose:** Single view for monitoring all executions.

**Two run types in one list:**
- **Agent Runs** — Direct agent executions via the test chat. Shows events, streaming tokens, tool calls.
- **Workflow Runs** — Temporal workflow executions. Shows step-by-step progress, per-node status, inputs/outputs. Links to Temporal UI for deep debugging.

**Real-time updates:**
- Agent runs: SSE from ADK's `/run_sse`
- Workflow runs: Poll Temporal queries (`get_status`) or SSE bridge from backend

---

## API Design

### Agent Endpoints

```
GET    /api/agents              List all agents
POST   /api/agents              Create agent (generates ADK files)
GET    /api/agents/:id          Get agent config
PUT    /api/agents/:id          Update agent config
DELETE /api/agents/:id          Delete agent
POST   /api/agents/:id/test     Quick test (returns single response)
```

Agent execution (streaming) uses ADK's built-in `/run_sse`.

### Tool Endpoints

```
GET    /api/tools               List all tools
POST   /api/tools               Register custom tool
GET    /api/tools/:id           Get tool details
PUT    /api/tools/:id           Update tool
DELETE /api/tools/:id           Delete tool
POST   /api/tools/:id/test     Test tool with sample input
```

### Workflow Endpoints

```
GET    /api/workflows                    List all workflows
POST   /api/workflows                    Create workflow (save graph JSON)
GET    /api/workflows/:id                Get workflow graph
PUT    /api/workflows/:id                Update workflow graph
DELETE /api/workflows/:id                Delete workflow
POST   /api/workflows/:id/run            Start workflow (Temporal)
GET    /api/workflows/:id/runs           List runs (Temporal history)
GET    /api/workflows/:id/runs/:runId    Get run status (Temporal query)
POST   /api/workflows/:id/runs/:runId/approve  Send approval signal
GET    /api/workflows/:id/runs/:runId/temporal-url  Deep-link to Temporal UI
```

### Session Endpoints

ADK built-in session endpoints plus:
```
GET    /api/sessions                     List sessions by agent
GET    /api/sessions/:id/state           Get session state
DELETE /api/sessions/:id                 Delete session
```

---

## Data Storage

### PostgreSQL (shared instance, separate databases)

**`adk_studio` database:**
- `agents` — Agent configurations (JSON)
- `tools` — Custom tool definitions (JSON + source code)
- `workflows` — Workflow graph definitions (JSON)

**`adk_sessions` database:**
- Managed by ADK's `DatabaseSessionService`

**`temporal` database:**
- Managed by Temporal server (auto-setup)

---

## Project Structure

```
google-adk-ui/
├── frontend/
│   ├── src/
│   │   ├── domains/
│   │   │   ├── agents/
│   │   │   │   ├── components/
│   │   │   │   │   ├── agent-form.tsx        # Multi-section config form
│   │   │   │   │   ├── agent-chat.tsx        # Inline test chat
│   │   │   │   │   ├── agent-list.tsx        # Agent table
│   │   │   │   │   └── model-picker.tsx      # Gemini model selector
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── use-agents.ts         # TanStack Query: list agents
│   │   │   │   │   ├── use-agent.ts          # TanStack Query: single agent
│   │   │   │   │   └── use-agent-stream.ts   # SSE hook for agent responses
│   │   │   │   └── types.ts
│   │   │   ├── workflows/
│   │   │   │   ├── components/
│   │   │   │   │   ├── workflow-canvas.tsx    # XYFlow graph editor
│   │   │   │   │   ├── node-palette.tsx      # Draggable node sidebar
│   │   │   │   │   ├── step-detail.tsx       # Node properties panel
│   │   │   │   │   └── run-viewer.tsx        # Workflow run status
│   │   │   │   ├── nodes/
│   │   │   │   │   ├── agent-node.tsx        # Custom XYFlow agent node
│   │   │   │   │   ├── tool-node.tsx
│   │   │   │   │   ├── condition-node.tsx
│   │   │   │   │   ├── parallel-node.tsx
│   │   │   │   │   ├── loop-node.tsx
│   │   │   │   │   ├── approval-node.tsx
│   │   │   │   │   ├── delay-node.tsx
│   │   │   │   │   └── terminal-node.tsx     # Input/Output nodes
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── use-workflows.ts
│   │   │   │   │   ├── use-workflow-run.ts
│   │   │   │   │   └── use-graph-store.ts    # Zustand graph state
│   │   │   │   └── utils/
│   │   │   │       ├── graph-layout.ts       # Dagre auto-layout
│   │   │   │       ├── graph-serializer.ts   # Graph → JSON for Temporal
│   │   │   │       └── graph-validator.ts    # Validate graph (connected, no orphans)
│   │   │   ├── tools/
│   │   │   │   ├── components/
│   │   │   │   │   ├── tool-list.tsx
│   │   │   │   │   ├── tool-form.tsx
│   │   │   │   │   └── tool-tester.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── use-tools.ts
│   │   │   ├── sessions/
│   │   │   │   ├── components/
│   │   │   │   │   ├── session-list.tsx
│   │   │   │   │   └── session-state.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── use-sessions.ts
│   │   │   └── runs/                       # Aggregated history view (all runs)
│   │   │       ├── components/
│   │   │       │   ├── run-list.tsx         # Combined agent + workflow run history
│   │   │       │   └── run-detail.tsx       # Per-run detail (events or step status)
│   │   │       └── hooks/
│   │   │           └── use-runs.ts
│   │   ├── components/
│   │   │   ├── app-shell.tsx             # Main layout
│   │   │   ├── sidebar.tsx               # Navigation sidebar
│   │   │   └── header.tsx
│   │   ├── lib/
│   │   │   ├── api-client.ts             # Generated from OpenAPI spec
│   │   │   ├── query-provider.tsx        # TanStack Query setup
│   │   │   └── sse.ts                    # SSE utility hook
│   │   ├── ds/
│   │   │   ├── tokens.ts                # Design tokens
│   │   │   └── theme.css                # Tailwind theme overrides
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── agents.py                # Agent CRUD router
│   │   │   ├── tools.py                 # Tool registry router
│   │   │   ├── workflows.py             # Workflow CRUD + Temporal dispatch
│   │   │   ├── sessions.py              # Session management router
│   │   │   └── runs.py                  # Unified run history
│   │   ├── services/
│   │   │   ├── agent_service.py         # ADK Agent/Runner lifecycle
│   │   │   ├── tool_registry.py         # Tool discovery + registration
│   │   │   ├── workflow_service.py      # Temporal client + graph dispatch
│   │   │   └── project_manager.py       # File-based project management
│   │   ├── temporal/
│   │   │   ├── workflows.py             # Dynamic interpreter workflow
│   │   │   ├── activities.py            # Dynamic ADK agent/tool activities
│   │   │   └── worker.py               # Worker setup + registration
│   │   ├── models/
│   │   │   ├── agent.py                 # Pydantic models for agents
│   │   │   ├── tool.py                  # Pydantic models for tools
│   │   │   └── workflow.py              # Pydantic models for workflows
│   │   ├── db/
│   │   │   ├── database.py              # SQLAlchemy setup
│   │   │   └── models.py               # DB table definitions
│   │   └── main.py                      # FastAPI app entry point
│   ├── agents/                          # ADK agent directory (generated)
│   │   └── .gitkeep
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── Dockerfile.worker               # Separate Dockerfile for Temporal worker
│
├── docker-compose.yml
├── init-db.sql                          # Creates adk_studio + adk_sessions databases
├── .env.example
├── .gitignore
└── README.md
```

---

## Docker Compose Configuration

**`init-db.sql`** (creates the separate databases):
```sql
CREATE DATABASE adk_studio;
CREATE DATABASE adk_sessions;
-- Temporal's auto-setup creates its own 'temporal' database automatically
-- via the DBNAME env var, so we do NOT create it here.
```

**`docker-compose.yml`:**
```yaml
services:
  postgresql:
    image: postgres:16
    environment:
      POSTGRES_USER: adk
      POSTGRES_PASSWORD: adk
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U adk"]
      interval: 5s
      timeout: 5s
      retries: 5

  temporal:
    image: temporalio/auto-setup:latest
    depends_on:
      postgresql:
        condition: service_healthy
    environment:
      DB: postgresql
      DB_PORT: 5432
      POSTGRES_USER: adk
      POSTGRES_PWD: adk
      POSTGRES_SEEDS: postgresql
    ports:
      - "7233:7233"

  temporal-ui:
    image: temporalio/ui:latest
    depends_on:
      - temporal
    environment:
      TEMPORAL_ADDRESS: temporal:7233
    ports:
      - "8233:8080"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    depends_on:
      postgresql:
        condition: service_healthy
      temporal:
        condition: service_started
    environment:
      DATABASE_URL: postgresql://adk:adk@postgresql:5432/adk_studio
      ADK_SESSION_DB: postgresql://adk:adk@postgresql:5432/adk_sessions
      TEMPORAL_ADDRESS: temporal:7233
      GOOGLE_GENAI_USE_VERTEXAI: "FALSE"
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
      CORS_ORIGINS: "http://localhost:5173"
    ports:
      - "8000:8000"
    volumes:
      - ./backend/src:/app/src
      - ./backend/agents:/app/agents

  temporal-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    depends_on:
      temporal:
        condition: service_started
      postgresql:
        condition: service_healthy
    environment:
      TEMPORAL_ADDRESS: temporal:7233
      DATABASE_URL: postgresql://adk:adk@postgresql:5432/adk_studio
      ADK_SESSION_DB: postgresql://adk:adk@postgresql:5432/adk_sessions
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
    volumes:
      - ./backend/src:/app/src
      - ./backend/agents:/app/agents

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    depends_on:
      - backend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public

volumes:
  pgdata:
```

**CORS:** The backend uses FastAPI's `CORSMiddleware` configured via the `CORS_ORIGINS` env var to allow requests from the frontend dev server (`http://localhost:5173`).

**Frontend Dockerfile** (handles `npm install`):
```dockerfile
FROM node:22
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```
Source directories are volume-mounted for hot-reload; `node_modules` stays inside the container from the build step.

---

## Error Handling

### Agent Execution
- ADK events may contain error states — UI displays these inline in the chat panel
- Network errors on SSE stream → auto-reconnect with exponential backoff
- Model API errors → display error message with retry button

### Workflow Execution
- Temporal handles activity retries automatically (default: unlimited with backoff)
- Non-retryable errors (e.g., invalid agent config) raise `ApplicationError(non_retryable=True)`
- Workflow-level failures visible in the run viewer with per-node error details
- Human approval timeouts configurable per node

### Tool Execution
- Tool test failures display the Python traceback
- Tools with missing dependencies show clear error messages

---

## Testing Strategy

### Backend
- **Unit tests** — pytest for services, models, utilities
- **Integration tests** — pytest with test database for API endpoints
- **Temporal tests** — Temporal's test framework for workflow/activity logic

### Frontend
- **Component tests** — Vitest + React Testing Library for domain components
- **E2E tests** — Playwright for critical flows (create agent → test → build workflow → run)

---

## Implementation Priority (MVP)

### Phase 1: Foundation
- Docker Compose setup (all services running)
- Backend skeleton (FastAPI + ADK integration, basic routers)
- Frontend skeleton (Vite + React + routing + sidebar)
- Agent CRUD (create, list, edit, delete)

### Phase 2: Agent Designer
- Agent configuration form (model, instructions, tools)
- Inline chat testing (SSE streaming)
- Tool registry (list built-in tools, register custom)

### Phase 3: Workflow Builder
- XYFlow canvas with node palette
- Drag-and-drop node creation
- Edge connections + auto-layout
- Graph serialization to JSON

### Phase 4: Temporal Execution
- Dynamic interpreter workflow
- Dynamic activity (agent/tool execution)
- Workflow run viewer with live status
- Human approval signal flow

### Phase 5: Polish
- Session inspector
- Unified run history
- Error handling + UX improvements
- Documentation

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend language | Python | ADK Python is v1.18+ stable; TS SDK is v0.5 pre-GA, missing persistence, A2A, server embedding |
| Extend vs wrap ADK | Extend `get_fast_api_app()` | Get ADK's built-in endpoints for free; mount custom routes alongside |
| Workflow execution | Temporal Interpreter Pattern | Single dynamic workflow interprets JSON graphs; no code generation, no worker restarts |
| Frontend graph library | @xyflow/react v12 | Industry standard, React Flow UI integrates with shadcn/ui |
| Component library | shadcn/ui + Tailwind | Code ownership, React Flow UI compatibility, rapid development |
| State management | Zustand (client) + TanStack Query (server) | React Flow uses Zustand internally; TanStack Query for API caching |
| Type sync | OpenAPI spec → generated TS client | FastAPI generates OpenAPI automatically; eliminates manual type duplication |
| Database | PostgreSQL (shared) | Single DB instance for ADK sessions, app data, and Temporal persistence |
| Streaming | SSE (primary) | ADK uses SSE natively via `/run_sse`; WebSocket only if bidirectional needed later |
| Code editor | CodeMirror 6 | 10-30x lighter than Monaco; sufficient for code display/editing |
| Local dev | Docker Compose | All services run locally; no cloud dependencies for development |
