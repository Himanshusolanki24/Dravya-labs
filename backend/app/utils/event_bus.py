import asyncio
from typing import Dict, Any

class TaskEventBus:
    def __init__(self):
        # Maps task_id to its corresponding asyncio.Queue
        self.queues: Dict[str, asyncio.Queue] = {}

    def get_queue(self, task_id: str) -> asyncio.Queue:
        if task_id not in self.queues:
            self.queues[task_id] = asyncio.Queue()
        return self.queues[task_id]

    async def publish(self, task_id: str, event: dict[str, Any]):
        """Publish an event dict to a specific task's queue."""
        queue = self.get_queue(task_id)
        await queue.put(event)

    def remove_queue(self, task_id: str):
        """Clean up the queue once the task is done or WebSocket disconnects."""
        if task_id in self.queues:
            del self.queues[task_id]

# Global instance to be used across the app
event_bus = TaskEventBus()
