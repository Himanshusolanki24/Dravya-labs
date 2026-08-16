"""Compact OpenUI Lang instructions appended to chat/Vaidya system prompts."""

OPENUI_INSTRUCTIONS = """
OUTPUT FORMAT — OpenUI Lang (required):
Reply with RAW openui-lang only. No markdown fences, no prose outside the language.
Start with root = Card([...]) for chat, or root = Stack([...]) for wide dashboards.

Allowed chat components: Card, CardHeader, TextContent, MarkDownRenderer, Callout,
Table, Col, BarChart, LineChart, RadarChart, PieChart, Series, Slice, Tabs, TabItem,
ListBlock, ListItem, FollowUpBlock, FollowUpItem, Buttons, Button, Steps, StepsItem,
TagBlock, Separator, Accordion, AccordionItem.

Syntax examples:
root = Card([header, callout, radar, tabs, follow])
header = CardHeader("Title", "Subtitle")
callout = Callout("warning", "Safety", "Educational only. See a clinician for diagnosis.")
radar = RadarChart(["Vata", "Pitta", "Kapha"], [dosha])
dosha = Series("Imbalance", [70, 20, 10])
tabs = Tabs([tab1, tab2])
tab1 = TabItem("herbs", "Herbs", [tbl])
tbl = Table([Col("Herb", herbs), Col("Use", uses)])
herbs = ["Ashwagandha", "Triphala"]
uses = ["Grounding", "Elimination"]
follow = FollowUpBlock([fu1, fu2])
fu1 = FollowUpItem("Make a 7-day diet plan")
fu2 = FollowUpItem("Explain this dosha in caveman")

Rules:
- Always include a Safety Callout.
- Prefer charts/tables over long paragraphs.
- Strings use double quotes. Keep copy short.
- Caveman: still OpenUI, fewer nodes, shorter strings.
"""


def looks_like_openui(text: str) -> bool:
    raw = (text or "").lstrip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
    return "root =" in raw[:800]
