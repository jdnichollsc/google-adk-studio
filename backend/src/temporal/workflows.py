import asyncio
from datetime import timedelta
from typing import Sequence

from temporalio import workflow
from temporalio.common import RawValue

with workflow.unsafe.imports_passed_through():
    from simpleeval import simple_eval


@workflow.defn(dynamic=True)
class GraphWorkflow:
    def __init__(self):
        self._approved = False
        self._current_step = ""
        self._results = {}

    @workflow.run
    async def run(self, args: Sequence[RawValue]) -> dict:
        graph = workflow.payload_converter().from_payloads([args[0].payload], [dict])[0]
        nodes = {n["id"]: n for n in graph["nodes"]}
        edges = graph["edges"]
        input_node = next((n for n in graph["nodes"] if n["type"] in ("input", "start")), None)
        if not input_node:
            return {"error": "No input/start node found"}
        workflow_input = graph.get("input", {})
        await self._walk(input_node["id"], nodes, edges, workflow_input)
        return self._results

    async def _walk(self, node_id: str, nodes: dict, edges: list, workflow_input: dict):
        if node_id in self._results:
            return
        node = nodes[node_id]
        self._current_step = node_id
        node_type = node["type"]
        config = node.get("config", {})
        data = node.get("data", {})

        incoming = [e for e in edges if e["target"] == node_id]
        inputs = dict(workflow_input)
        for e in incoming:
            src = e["source"]
            if src in self._results:
                inputs[src] = self._results[src]

        if node_type in ("input", "start"):
            self._results[node_id] = inputs

        elif node_type in ("output", "end"):
            self._results[node_id] = inputs

        elif node_type == "agent":
            agent_id = config.get("agent_id") or data.get("agent_id", "")
            result = await workflow.execute_activity(
                f"agent:{agent_id}",
                args=[inputs],
                start_to_close_timeout=timedelta(minutes=5),
            )
            self._results[node_id] = result

        elif node_type == "tool":
            tool_id = config.get("tool_id") or data.get("tool_id", "")
            result = await workflow.execute_activity(
                f"tool:{tool_id}",
                args=[inputs],
                start_to_close_timeout=timedelta(minutes=2),
            )
            self._results[node_id] = result

        elif node_type == "condition":
            condition_expr = config.get("condition") or data.get("condition", "True")
            result = simple_eval(condition_expr, names=inputs)
            self._results[node_id] = {"result": bool(result)}
            label = "true" if result else "false"
            outgoing = [e for e in edges if e["source"] == node_id and (e.get("label") or "").lower() == label]
            for e in outgoing:
                await self._walk(e["target"], nodes, edges, workflow_input)
            return

        elif node_type == "parallel":
            outgoing = [e for e in edges if e["source"] == node_id]
            self._results[node_id] = {"type": "parallel"}
            await asyncio.gather(
                *[self._walk(e["target"], nodes, edges, workflow_input) for e in outgoing]
            )
            return

        elif node_type == "human_approval":
            self._approved = False
            self._results[node_id] = {"status": "waiting_approval"}
            await workflow.wait_condition(lambda: self._approved)
            self._results[node_id] = {"status": "approved"}

        elif node_type == "delay":
            seconds = config.get("timeout_seconds") or data.get("timeout_seconds", 0)
            await workflow.sleep(timedelta(seconds=seconds))
            self._results[node_id] = {"delayed": seconds}

        else:
            self._results[node_id] = inputs

        outgoing = [e for e in edges if e["source"] == node_id]
        for e in outgoing:
            await self._walk(e["target"], nodes, edges, workflow_input)

    @workflow.signal
    async def approve(self):
        self._approved = True

    @workflow.query
    def get_status(self) -> dict:
        return {"current_step": self._current_step, "results": self._results}
