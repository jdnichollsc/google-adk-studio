import asyncio
from concurrent.futures import ThreadPoolExecutor

from temporalio.client import Client
from temporalio.worker import Worker

from src.config import settings
from src.temporal.activities import execute_node
from src.temporal.workflows import GraphWorkflow


async def main():
    client = await Client.connect(settings.temporal_address)
    worker = Worker(
        client,
        task_queue="adk-studio-workflows",
        workflows=[GraphWorkflow],
        activities=[execute_node],
        activity_executor=ThreadPoolExecutor(max_workers=10),
    )
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
