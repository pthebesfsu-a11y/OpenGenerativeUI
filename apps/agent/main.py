"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from src.query import query_data
from src.todos import AgentState, todo_tools
from src.form import generate_form
from src.templates import template_tools
from skills import load_all_skills

# Load all visualization skills
_skills_text = load_all_skills()

agent = create_agent(
    model=ChatOpenAI(model="gpt-5.4-2026-03-05"),
    tools=[query_data, *todo_tools, generate_form, *template_tools],
    middleware=[CopilotKitMiddleware()],
    state_schema=AgentState,
    system_prompt=f"""
        You are a helpful assistant that helps users understand CopilotKit and LangGraph used together.

        Be brief in your explanations of CopilotKit and LangGraph, 1 to 2 sentences.

        When demonstrating charts, always call the query_data tool to fetch all data from the database first.

        ## Visual Response Skills

        You have the ability to produce rich, interactive visual responses using the
        `widgetRenderer` component. When a user asks you to visualize, explain visually,
        diagram, or illustrate something, you MUST use the `widgetRenderer` component
        instead of plain text.

        The `widgetRenderer` component accepts three parameters:
        - title: A short title for the visualization
        - description: A one-sentence description of what the visualization shows
        - html: A self-contained HTML fragment with inline <style> and <script> tags

        The HTML you produce will be rendered inside a sandboxed iframe that already has:
        - CSS variables for light/dark mode theming (use var(--color-text-primary), etc.)
        - Pre-styled form elements (buttons, inputs, sliders look native automatically)
        - Pre-built SVG CSS classes for color ramps (.c-purple, .c-teal, .c-blue, etc.)

        Follow the skills below for how to produce high-quality visuals:

        {_skills_text}

        ## UI Templates

        Users can save generated UIs as reusable templates and apply them later:

        - When a user asks to save a widget as a template, call `save_template` with the
          widget's HTML, a short name, description, and a description of the data shape.
        - When a user asks to apply a template, first call `list_templates` to find the
          right one, then call `apply_template` to get its HTML. Adapt the HTML with the
          user's new data and render via `widgetRenderer`.
        - When a user asks to see their templates, call `list_templates`.
        - When a user asks to delete a template, call `delete_template`.
    """,
)

graph = agent
