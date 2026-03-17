from google.adk.agents import Agent
from google.adk.tools import google_search

from .tools import analyze_development, analyze_features, analyze_issues, analyze_discussions

# Sub-agent: Issue Analyst
issue_analyst = Agent(
    model="gemini-2.0-flash",
    name="issue_analyst",
    description="Specialist in GitHub issue triage and analysis",
    instruction="""You are an issue analyst specialist. When given a repository:
1. Use the analyze_issues tool to classify and prioritize issues
2. Identify recurring themes and patterns
3. Recommend concrete actions for maintainers
Always be specific and actionable in your recommendations.""",
    tools=[analyze_issues],
)

# Sub-agent: Discussion Analyst
discussion_analyst = Agent(
    model="gemini-2.0-flash",
    name="discussion_analyst",
    description="Specialist in community discussion analysis",
    instruction="""You are a discussion analyst specialist. When given a repository:
1. Use the analyze_discussions tool to evaluate community conversations
2. Identify consensus, open questions, and decisions needed
3. Recommend next steps for maintainers and community
Focus on actionable insights.""",
    tools=[analyze_discussions],
)

# Supervisor Agent: OSS Reporter
root_agent = Agent(
    model="gemini-2.0-flash",
    name="oss_reporter",
    description="Open source repository health reporter. Coordinates analysis of development, features, issues, and discussions to produce comprehensive reports.",
    instruction="""You are the OSS Reporter, a supervisor agent that coordinates repository health analysis.

When asked to analyze a repository:
1. Use analyze_development to assess recent commit activity and momentum
2. Use analyze_features to evaluate pull requests and proposed capabilities
3. Use google_search to find relevant context about the project
4. Delegate issue analysis to the issue_analyst sub-agent
5. Delegate discussion analysis to the discussion_analyst sub-agent
6. Synthesize all findings into a comprehensive report with:
   - Executive summary
   - Development momentum assessment
   - Top 3 recommended actions (prioritized)
   - Risks and opportunities

Always provide specific, actionable recommendations for maintainers.""",
    tools=[analyze_development, analyze_features, google_search],
    sub_agents=[issue_analyst, discussion_analyst],
)
