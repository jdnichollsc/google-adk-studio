from google.adk.agents import Agent

root_agent = Agent(
    model="gemini-2.0-flash",
    name="greeter",
    description="A friendly greeter agent",
    instruction="You are a friendly greeter. When someone says hello, greet them warmly and ask how you can help.",
)
