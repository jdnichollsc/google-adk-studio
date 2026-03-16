from google.adk.agents import Agent
from google.adk.tools import google_search

root_agent = Agent(
    model="gemini-2.0-flash",
    name="researcher",
    description="A research agent that can search the web",
    instruction="You are a research assistant. Use Google Search to find information and provide concise, accurate answers.",
    tools=[google_search],
)
