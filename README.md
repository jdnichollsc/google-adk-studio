# ADK Studio

An open-source development UI for [Google's Agent Development Kit (ADK)](https://google.github.io/adk-docs/). Write agents in Python, test them interactively, and compose durable multi-agent workflows visually — all from one interface.

Think of it as [Mastra Studio](https://mastra.ai), but for Google ADK and Python.

## Why ADK Studio?

Google ADK gives you a powerful Python framework for building AI agents with Gemini. But testing and orchestrating those agents means switching between terminals, API calls, and manual JSON wrangling. ADK Studio fixes that.

- **Code-first agents** — Write your agents as Python files. ADK Studio discovers them automatically and displays them in the UI. No config files, no registration.

- **Interactive testing** — Click an agent, type a message, see the streamed response in real-time. Uses ADK's built-in `/run_sse` endpoint with Gemini.

- **Visual workflow builder** — Drag-and-drop graph editor for composing multi-agent pipelines. Connect agents, tools, conditions, and parallel branches visually, then execute with one click.

- **Durable execution** — Workflows run on [Temporal](https://temporal.io), giving you automatic retries, crash recovery, and human-in-the-loop approval gates. Every step is persisted.

- **Full ADK compatibility** — Built on `get_fast_api_app()` — the same foundation as `adk web`. Your agent code works exactly the same as with the ADK CLI.

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A [Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone and configure

```bash
git clone https://github.com/your-username/google-adk-ui.git
cd google-adk-ui
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GOOGLE_API_KEY=your-gemini-api-key-here
```

### 2. Start the app

```bash
docker compose up --build -d
```

This starts 6 services: PostgreSQL, Temporal, Temporal UI, the FastAPI backend, a Temporal worker, and the React frontend.

### 3. Open the UI

| URL | What |
|-----|------|
| **http://localhost:5173** | ADK Studio (main UI) |
| http://localhost:8000/docs | FastAPI Swagger docs |
| http://localhost:8233 | Temporal UI (workflow debugging) |

You'll see the two example agents (`greeter` and `researcher`) already discovered from the `backend/agents/` directory.

## Create Your First Agent

Create a new directory in `backend/agents/`:

```python
# backend/agents/my_agent/__init__.py
from . import agent

# backend/agents/my_agent/agent.py
from google.adk.agents import Agent

root_agent = Agent(
    model="gemini-2.0-flash",
    name="my_agent",
    description="My custom agent",
    instruction="You are a helpful assistant that answers questions concisely.",
)
```

The agent appears in the UI immediately. Click it, start chatting.

### Add tools

```python
# backend/agents/my_agent/agent.py
from google.adk.agents import Agent
from google.adk.tools import google_search

root_agent = Agent(
    model="gemini-2.0-flash",
    name="my_agent",
    description="Research assistant with web search",
    instruction="You are a research assistant. Use search to find accurate information.",
    tools=[google_search],
)
```

### Multi-agent composition

```python
from google.adk.agents import Agent
from google.adk.agents.workflow_agents import SequentialAgent

writer = Agent(model="gemini-2.0-flash", name="writer", instruction="Write a draft.")
editor = Agent(model="gemini-2.0-flash", name="editor", instruction="Edit and improve the draft.")

root_agent = SequentialAgent(
    name="writing_pipeline",
    description="Write then edit",
    sub_agents=[writer, editor],
)
```

## Project Structure

```
google-adk-ui/
├── backend/
│   ├── agents/                  # Your agents live here (code-first)
│   │   ├── greeter/agent.py     # Example: friendly greeter
│   │   └── researcher/agent.py  # Example: web search agent
│   ├── src/
│   │   ├── main.py              # FastAPI app (extends ADK's get_fast_api_app)
│   │   ├── api/workflows.py     # Workflow CRUD + Temporal dispatch
│   │   ├── temporal/            # Workflow interpreter + worker
│   │   └── db/                  # Database (workflows only)
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── domains/agents/      # Agent discovery + chat testing
│   │   ├── domains/workflows/   # Visual workflow builder (XYFlow)
│   │   ├── domains/sessions/    # Session inspector
│   │   └── domains/runs/        # Execution history
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml
└── .env.example
```

## Architecture

```
You write code                    ADK Studio discovers & displays
─────────────                     ──────────────────────────────
backend/agents/                   Frontend (React + Vite)
├── greeter/agent.py       →     ├── /agents    (list + chat)
├── researcher/agent.py    →     ├── /workflows (visual builder)
└── my_agent/agent.py      →     └── /sessions  (inspector)

ADK get_fast_api_app()            Temporal (durable workflows)
├── /list-apps              →     Graph interpreter workflow
├── /run_sse (streaming)    →     Dynamic activities (any agent/tool)
└── /sessions               →     Retry, crash recovery, human-in-loop
```

**Backend:** Python FastAPI extending ADK's `get_fast_api_app()` — agents are discovered from `backend/agents/`, ADK provides all execution endpoints.

**Frontend:** React 19 + Vite + TypeScript + Tailwind CSS. XYFlow for the workflow graph editor. TanStack Query + Zustand for state.

**Workflow engine:** Temporal with a dynamic interpreter pattern — a single workflow class interprets any JSON graph, no code generation or worker restarts needed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent framework | [Google ADK](https://google.github.io/adk-docs/) (Python) |
| AI model | [Gemini](https://ai.google.dev/) via ADK |
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| Workflow engine | [Temporal](https://temporal.io) (Python SDK) |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4 |
| Graph editor | [XYFlow](https://reactflow.dev/) (React Flow v12) |
| State | Zustand + TanStack Query |
| Infrastructure | Docker Compose (6 services) |

## Development

### Run without Docker (local dev)

**Backend:**

```bash
cd backend
pip install -e ".[dev]"
uvicorn src.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Temporal** (requires [Temporal CLI](https://docs.temporal.io/cli)):

```bash
temporal server start-dev --db-filename temporal.db
```

**Temporal worker:**

```bash
cd backend
python -m src.temporal.worker
```

### Run backend tests

```bash
cd backend
python -m pytest tests/ -v
```

### Useful commands

```bash
docker compose ps              # Check service status
docker compose logs backend    # View backend logs
docker compose logs -f frontend # Follow frontend logs
docker compose down            # Stop everything
docker compose down -v         # Stop + delete volumes
```

## How It Works

### Agent Discovery

ADK Studio uses Google ADK's built-in agent loader. Any directory under `backend/agents/` that contains an `agent.py` file exporting `root_agent` is automatically discovered and made available through the UI.

### Workflow Execution

The visual workflow builder produces a JSON graph definition (nodes + edges). When you click "Run", this graph is sent to a Temporal workflow that interprets it at runtime:

1. A **dynamic workflow** walks the graph node by node
2. Each agent/tool node becomes a **dynamic activity** that loads the agent from the database and executes it via ADK
3. Condition nodes use safe expression evaluation (simpleeval)
4. Parallel nodes fan out with `asyncio.gather`
5. Human approval nodes use Temporal signals + `wait_condition`

No code generation. No worker restarts. Any graph shape works immediately.

## Contributing

Contributions are welcome. Please open an issue to discuss before submitting a PR.

## License

Apache 2.0
