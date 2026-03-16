# ADK Studio Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an open-source UI tool for Google ADK that lets users create agents, register tools, test them interactively, and compose durable workflows via a visual graph editor backed by Temporal.

**Architecture:** Python FastAPI backend extending ADK's `get_fast_api_app()` with custom routers for agents, tools, workflows. Temporal dynamic interpreter workflow executes visual graph definitions. React + Vite frontend with domain-based organization, XYFlow for the workflow graph editor, shadcn/ui components, TanStack Query + Zustand for state.

**Tech Stack:** Python 3.12, FastAPI, google-adk, temporalio, PostgreSQL, React 19, Vite, TypeScript, @xyflow/react v12, shadcn/ui, Tailwind CSS 4, Zustand, TanStack Query, CodeMirror 6, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-03-15-adk-studio-design.md`

---

## File Structure

### Root

```
google-adk-ui/
├── docker-compose.yml
├── init-db.sql
├── .env.example
├── .gitignore
├── README.md
```

### Backend (`backend/`)

```
backend/
├── Dockerfile
├── Dockerfile.worker
├── pyproject.toml
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
│       └── 001_initial.py
├── agents/
│   └── .gitkeep
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── agents.py
│   │   ├── tools.py
│   │   ├── workflows.py
│   │   └── sessions.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── agent_service.py
│   │   ├── tool_registry.py
│   │   └── workflow_service.py
│   ├── temporal/
│   │   ├── __init__.py
│   │   ├── workflows.py
│   │   ├── activities.py
│   │   └── worker.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── tool.py
│   │   └── workflow.py
│   └── db/
│       ├── __init__.py
│       ├── database.py
│       └── tables.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_health.py
    ├── test_agent_service.py
    ├── test_tools_api.py
    └── test_workflows_api.py
```

### Frontend (`frontend/`)

```
frontend/
├── Dockerfile
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── query-provider.tsx
│   │   ├── use-sse.ts
│   │   └── utils.ts
│   ├── components/
│   │   └── ui/                      # shadcn/ui (auto-generated)
│   ├── domains/
│   │   ├── agents/
│   │   │   ├── components/
│   │   │   │   ├── agent-list.tsx
│   │   │   │   ├── agent-form.tsx
│   │   │   │   └── agent-chat.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-agents.ts
│   │   │   └── pages/
│   │   │       └── agents-page.tsx
│   │   ├── tools/
│   │   │   ├── components/
│   │   │   │   └── tool-list.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-tools.ts
│   │   │   └── pages/
│   │   │       └── tools-page.tsx
│   │   ├── workflows/
│   │   │   ├── components/
│   │   │   │   ├── workflow-canvas.tsx
│   │   │   │   ├── node-palette.tsx
│   │   │   │   └── run-overlay.tsx
│   │   │   ├── nodes/
│   │   │   │   ├── agent-node.tsx
│   │   │   │   ├── tool-node.tsx
│   │   │   │   ├── condition-node.tsx
│   │   │   │   └── terminal-node.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-workflows.ts
│   │   │   │   ├── use-workflow-run.ts
│   │   │   │   └── use-graph-store.ts
│   │   │   ├── utils/
│   │   │   │   ├── graph-layout.ts
│   │   │   │   └── graph-serializer.ts
│   │   │   └── pages/
│   │   │       └── workflow-editor-page.tsx
│   │   ├── sessions/
│   │   │   └── pages/
│   │   │       └── sessions-page.tsx
│   │   └── runs/
│   │       └── pages/
│   │           └── runs-page.tsx
│   └── ds/
│       └── tokens.ts
```

---

## Chunk 1: Foundation

Produces: all services running via `docker compose up`, backend health endpoint, frontend shell with sidebar, git repo.

### Task 1: Init Git + Config Files

**Files:** `.gitignore`, `README.md`, `.env.example`

- [ ] Init git repo: `git init`
- [ ] Create `.gitignore` (Python, Node, Docker, IDE, .env)
- [ ] Create `README.md` with quick start (docker compose up, URLs for frontend/backend/temporal-ui)
- [ ] Create `.env.example` with `GOOGLE_API_KEY` and `GOOGLE_GENAI_USE_VERTEXAI=FALSE`
- [ ] Commit: `chore: initialize repository`

### Task 2: Docker Compose + DB Init

**Files:** `docker-compose.yml`, `init-db.sql`

- [ ] Create `init-db.sql`: `CREATE DATABASE adk_studio; CREATE DATABASE adk_sessions;`
- [ ] Create `docker-compose.yml` with 6 services: postgresql (port 5432, healthcheck), temporal (auto-setup, depends on pg healthy), temporal-ui (port 8233), backend (port 8000, depends on pg+temporal), temporal-worker (depends on temporal+pg), frontend (port 5173)
- [ ] Validate: `docker compose config > /dev/null`
- [ ] Commit: `infra: add docker-compose`

### Task 3: Backend Skeleton

**Files:** `backend/pyproject.toml`, `backend/Dockerfile`, `backend/Dockerfile.worker`, `backend/src/config.py`, `backend/src/__init__.py`

- [ ] Create directory structure: `mkdir -p backend/src/{api,services,temporal,models,db} backend/agents backend/tests`
- [ ] Create `pyproject.toml` with deps: fastapi, uvicorn, google-adk, temporalio, sqlalchemy[asyncio], asyncpg, alembic, pydantic-settings, sse-starlette, simpleeval, httpx
- [ ] Create `config.py` with `pydantic_settings.BaseSettings`: database_url, adk_session_db, temporal_address, google_api_key, cors_origins
- [ ] Create `Dockerfile`: python:3.12-slim, pip install, uvicorn CMD
- [ ] Create `Dockerfile.worker`: python:3.12-slim, pip install, `python -m src.temporal.worker` CMD
- [ ] Touch all `__init__.py` files and `agents/.gitkeep`
- [ ] Commit: `feat(backend): scaffold project`

### Task 4: Database + Alembic

**Files:** `backend/src/db/database.py`, `backend/src/db/tables.py`, `backend/alembic.ini`, `backend/alembic/env.py`, `backend/alembic/versions/001_initial.py`

- [ ] Create `database.py`: async SQLAlchemy engine + session factory from settings.database_url
- [ ] Create `tables.py`: `AgentTable` (id, name, agent_type, config JSONB, timestamps), `ToolTable` (id, name, tool_type, config JSONB, source_code Text, timestamps), `WorkflowTable` (id, name, graph JSONB, timestamps)
- [ ] Create `alembic.ini` and `alembic/env.py` for async migrations
- [ ] Create `001_initial.py` migration: create agents, tools, workflows tables
- [ ] Commit: `feat(backend): add database and alembic migrations`

### Task 5: Pydantic Models

**Files:** `backend/src/models/agent.py`, `backend/src/models/tool.py`, `backend/src/models/workflow.py`

- [ ] Create `agent.py`: `AgentConfig` (name, agent_type enum, model?, instruction?, tools[], sub_agents[], output_key?, max_iterations?, GenerateContentConfig?), `AgentResponse`, `AgentListResponse`
- [ ] Create `tool.py`: `ToolConfig` (name, description, tool_type enum, parameters dict, source_code?), `ToolResponse`, `ToolListResponse`
- [ ] Create `workflow.py`: `WorkflowNode` (id, type enum, data, position, config), `WorkflowEdge` (id, source, target, label?), `WorkflowGraph`, `WorkflowConfig`, `WorkflowResponse`, `WorkflowRunResponse`
- [ ] Commit: `feat(backend): add pydantic models`

### Task 6: FastAPI Main App

**Files:** `backend/src/main.py`, `backend/tests/conftest.py`, `backend/tests/test_health.py`

- [ ] Write test: GET `/api/health` returns `{"status": "ok"}`
- [ ] Run test, verify FAIL
- [ ] Create `main.py`: FastAPI app with CORS middleware (origins from settings) + `/api/health` endpoint
- [ ] Run test, verify PASS
- [ ] Commit: `feat(backend): add FastAPI app with health endpoint`

### Task 7: Frontend Scaffold

**Files:** `frontend/` (Vite scaffold), `frontend/Dockerfile`

- [ ] `npm create vite@latest frontend -- --template react-ts`
- [ ] Install deps: react-router-dom, @tanstack/react-query, zustand, tailwindcss, @tailwindcss/vite
- [ ] Configure `vite.config.ts`: tailwindcss plugin, `@` alias, proxy `/api` to `http://localhost:8000`
- [ ] Setup `index.css` with Tailwind directives + dark theme CSS variables
- [ ] Create `App.tsx`: BrowserRouter + QueryClientProvider + AppShell (sidebar with nav links) + placeholder routes for /agents, /tools, /workflows, /sessions, /runs
- [ ] Create `frontend/Dockerfile`: node:22, npm install, npm run dev
- [ ] Verify: `npm run build` succeeds
- [ ] Commit: `feat(frontend): scaffold React app with router and sidebar`

### Task 8: Docker Compose Smoke Test

- [ ] `docker compose up --build -d`
- [ ] Verify PostgreSQL: `docker compose exec postgresql pg_isready -U adk`
- [ ] Verify backend: `curl http://localhost:8000/api/health` returns ok
- [ ] Verify Temporal UI: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8233` returns 200
- [ ] Verify frontend: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173` returns 200
- [ ] Run migration: `docker compose exec backend alembic upgrade head`
- [ ] `docker compose down`
- [ ] Commit any fixes

---

## Chunk 2: Backend CRUD APIs

Produces: REST APIs for agents, tools, workflows with unit tests.

### Task 9: Agent Service

**Files:** `backend/src/services/agent_service.py`, `backend/tests/test_agent_service.py`

- [ ] Write tests: create agent (verify name, id returned, db.commit called), list agents
- [ ] Run tests, verify FAIL
- [ ] Implement `AgentService`: create (uuid id, insert AgentTable, commit), list_all (select all, order by created_at desc), get (select by id), update (select + modify + commit), delete (select + delete + commit)
- [ ] Run tests, verify PASS
- [ ] Commit: `feat(backend): add agent service`

### Task 10: Agent API Router

**Files:** `backend/src/api/agents.py`, `backend/tests/test_agents_api.py`

- [ ] Create router: GET /api/agents (list), POST /api/agents (create, 201), GET /api/agents/:id (get, 404), PUT /api/agents/:id (update, 404), DELETE /api/agents/:id (delete, 204/404)
- [ ] Register in main.py
- [ ] Write integration test placeholder (create + list + get + delete flow)
- [ ] Run unit tests, verify PASS
- [ ] Commit: `feat(backend): add agent API router`

### Task 11: Tool Service + Router

**Files:** `backend/src/services/tool_registry.py`, `backend/src/api/tools.py`, `backend/tests/test_tools_api.py`

- [ ] Create `ToolRegistry` (same CRUD pattern as AgentService)
- [ ] Create tools router (same endpoint pattern)
- [ ] Register in main.py
- [ ] Write unit tests
- [ ] Run tests, verify PASS
- [ ] Commit: `feat(backend): add tool registry and API`

### Task 12: Workflow Service + Router

**Files:** `backend/src/services/workflow_service.py`, `backend/src/api/workflows.py`, `backend/tests/test_workflows_api.py`

- [ ] Create `WorkflowService` (CRUD for workflow graphs, stores graph as JSONB)
- [ ] Create workflows router (CRUD endpoints). Note: `/run` endpoint comes in Chunk 4
- [ ] Register in main.py
- [ ] Write unit tests
- [ ] Run tests, verify PASS
- [ ] Commit: `feat(backend): add workflow service and API`

---

## Chunk 3: Frontend Agent UI

Produces: agent list, create form, SSE chat testing.

### Task 13: API Client + Types

**Files:** `frontend/src/lib/api-client.ts`, `frontend/src/lib/query-provider.tsx`, `frontend/src/lib/utils.ts`

- [ ] Install: clsx, tailwind-merge
- [ ] Create `utils.ts` with `cn()` helper
- [ ] Create `api-client.ts`: typed fetch wrapper with `api.agents.{list,get,create,update,delete}`, `api.tools.{list,get,create,delete}`, `api.workflows.{list,get,create,update,delete}`. Include TS interfaces for AgentConfig, AgentResponse, ToolConfig, ToolResponse, WorkflowConfig, WorkflowResponse, etc.
- [ ] Create `query-provider.tsx`: QueryClient with retry:1, staleTime:30s
- [ ] Commit: `feat(frontend): add API client and type definitions`

### Task 14: Agent List + Page

**Files:** `frontend/src/domains/agents/hooks/use-agents.ts`, `frontend/src/domains/agents/components/agent-list.tsx`, `frontend/src/domains/agents/pages/agents-page.tsx`

- [ ] Create `use-agents.ts`: useAgents (query), useAgent (query by id), useCreateAgent (mutation + invalidate), useDeleteAgent (mutation + invalidate)
- [ ] Create `agent-list.tsx`: loading/error states, card per agent showing name + type + model, delete button
- [ ] Create `agents-page.tsx`: header with "New Agent" button + AgentList
- [ ] Wire into App.tsx routes
- [ ] Commit: `feat(frontend): add agent list page`

### Task 15: Agent Form

**Files:** `frontend/src/domains/agents/components/agent-form.tsx`

- [ ] Install: react-hook-form, @hookform/resolvers, zod
- [ ] Create `agent-form.tsx`: zod schema (name required, agent_type enum, model, instruction), form with conditional fields based on agent_type (llm shows model+instruction, sequential/parallel show sub-agents, loop shows max_iterations), create button calls useCreateAgent
- [ ] Wire into agents-page (toggle form on "New Agent" click)
- [ ] Commit: `feat(frontend): add agent creation form`

### Task 16: Agent Chat (SSE)

**Files:** `frontend/src/lib/use-sse.ts`, `frontend/src/domains/agents/components/agent-chat.tsx`

- [ ] Create `use-sse.ts`: hook that POSTs to a URL with body, reads response.body as ReadableStream, parses SSE lines (event:/data:), returns messages[] and isStreaming state, supports abort
- [ ] Create `agent-chat.tsx`: chat panel with message history, input field, send button. Sends to ADK's `/run_sse` endpoint. Displays streamed text in real-time.
- [ ] Wire into agent detail view
- [ ] Commit: `feat(frontend): add SSE streaming and agent chat`

---

## Chunk 4: Workflow Builder + Temporal

Produces: XYFlow canvas, node palette, Temporal workflow execution, run status.

### Task 17: XYFlow + Graph Store

**Files:** `frontend/src/domains/workflows/hooks/use-graph-store.ts`, `frontend/src/domains/workflows/utils/graph-layout.ts`

- [ ] Install: @xyflow/react, @dagrejs/dagre
- [ ] Create `use-graph-store.ts`: Zustand store with nodes[], edges[], onNodesChange/onEdgesChange/onConnect handlers, addNode, setGraph, reset
- [ ] Create `graph-layout.ts`: dagre TB layout, NODE_WIDTH=200, NODE_HEIGHT=60
- [ ] Commit: `feat(frontend): add graph store and layout`

### Task 18: Canvas + Custom Nodes

**Files:** `frontend/src/domains/workflows/components/workflow-canvas.tsx`, `frontend/src/domains/workflows/nodes/*.tsx`, `frontend/src/domains/workflows/components/node-palette.tsx`, `frontend/src/domains/workflows/pages/workflow-editor-page.tsx`

- [ ] Create custom nodes: InputNode (green, source handle), OutputNode (red, target handle), AgentNode (card with agent icon, both handles), ToolNode (card with wrench icon), ConditionNode (diamond shape, two source handles for true/false)
- [ ] Create `workflow-canvas.tsx`: ReactFlow with nodeTypes registered, background dots, controls, minimap, graph state from useGraphStore
- [ ] Create `node-palette.tsx`: sidebar with buttons for each node type, onClick adds node to store
- [ ] Create `workflow-editor-page.tsx`: toolbar (Save, Run) + NodePalette + WorkflowCanvas
- [ ] Wire into router
- [ ] Commit: `feat(frontend): add workflow canvas with custom nodes`

### Task 19: Temporal Workflow + Activity + Worker

**Files:** `backend/src/temporal/workflows.py`, `backend/src/temporal/activities.py`, `backend/src/temporal/worker.py`

- [ ] Create `activities.py`: `@activity.defn(dynamic=True)` that dispatches to agent or tool based on activity type prefix. Agent activity: loads config from DB via asyncpg, instantiates ADK Agent, runs via Runner, collects output. Tool activity: placeholder returning inputs.
- [ ] Create `workflows.py`: `@workflow.defn(dynamic=True)` GraphWorkflow with `_walk()` recursive graph walker. Handles: input/output (pass-through), agent/tool (execute_activity), condition (safe expression via simpleeval, follow labeled edges), parallel (asyncio.gather), human_approval (wait_condition + signal), delay (asyncio.sleep). Query `get_status` returns current_step + results.
- [ ] Create `worker.py`: connect to Temporal, create Worker with GraphWorkflow + execute_node on task_queue "adk-studio-workflows"
- [ ] Commit: `feat(backend): add Temporal workflow interpreter and worker`

### Task 20: Workflow Run Endpoints + Frontend Hooks

**Files:** `backend/src/api/workflows.py` (add run endpoints), `frontend/src/domains/workflows/hooks/use-workflows.ts`, `frontend/src/domains/workflows/hooks/use-workflow-run.ts`, `frontend/src/domains/workflows/utils/graph-serializer.ts`

- [ ] Add to workflows router: POST `/:id/run` (start Temporal workflow with graph JSON, return run_id), GET `/:id/runs/:runId` (query Temporal handle for status, or get result if completed)
- [ ] Create `graph-serializer.ts`: converts XYFlow nodes/edges to the JSON format the Temporal workflow expects
- [ ] Create `use-workflows.ts`: useWorkflows, useCreateWorkflow, useSaveWorkflow hooks
- [ ] Create `use-workflow-run.ts`: useStartWorkflowRun (mutation), useWorkflowRunStatus (query with refetchInterval:2000 while running)
- [ ] Update workflow-editor-page: Save button creates/updates workflow, Run button dispatches to Temporal, status badge shows current step
- [ ] Commit: `feat: workflow save, run, and status polling`

### Task 21: E2E Workflow Test

- [ ] `docker compose up --build -d && docker compose exec backend alembic upgrade head`
- [ ] Create agent via curl
- [ ] Create workflow with agent node via curl
- [ ] Run workflow via curl
- [ ] Poll status until completed
- [ ] Verify in Temporal UI (http://localhost:8233)
- [ ] Commit fixes

---

## Chunk 5: Polish

Produces: shadcn/ui components, session inspector, runs page.

### Task 22: shadcn/ui Setup

- [ ] `npx shadcn@latest init` (dark mode, CSS variables)
- [ ] Add components: button, card, dialog, input, label, select, table, tabs, textarea, badge
- [ ] Commit: `feat(frontend): add shadcn/ui`

### Task 23: Refactor to shadcn/ui

- [ ] Replace raw HTML elements in agent-form, agent-list, agent-chat with shadcn Button, Input, Card, Badge, etc.
- [ ] Commit: `refactor(frontend): use shadcn/ui components`

### Task 24: Sessions Page

**Files:** `backend/src/api/sessions.py`, `frontend/src/domains/sessions/pages/sessions-page.tsx`

- [ ] Create sessions router (list sessions, get session state — thin wrapper over ADK session service)
- [ ] Register in main.py
- [ ] Create sessions-page: list sessions by agent, click to see event history + state dict
- [ ] Wire into router
- [ ] Commit: `feat: add session inspector`

### Task 25: Runs Page

**Files:** `frontend/src/domains/runs/pages/runs-page.tsx`

- [ ] Create runs-page: aggregated view of agent test runs + Temporal workflow runs, with status badges, timestamps, links to Temporal UI
- [ ] Wire into router
- [ ] Commit: `feat(frontend): add unified runs page`

### Task 26: Final Integration Test

- [ ] Fresh build: `docker compose down -v && docker compose up --build -d`
- [ ] Run migrations
- [ ] Verify all 5 pages load
- [ ] Full flow: create agent → test chat → build workflow → save → run → see status
- [ ] Commit fixes

---

## Summary

| Chunk | Tasks | Produces |
|-------|-------|---------|
| 1: Foundation | 1-8 | Git repo, Docker Compose, backend+frontend skeletons, all services running |
| 2: Backend APIs | 9-12 | Agent/Tool/Workflow CRUD REST APIs with tests |
| 3: Frontend Core | 13-16 | Agent list, form, SSE chat, API client |
| 4: Workflow Builder | 17-21 | XYFlow canvas, nodes, Temporal execution, run status |
| 5: Polish | 22-26 | shadcn/ui, sessions, runs, integration test |
