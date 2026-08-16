from typing import Any

from app.openui import OPENUI_INSTRUCTIONS, looks_like_openui


def wrap_openui(text: str) -> str:
    if looks_like_openui(text):
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
        return cleaned.strip()
    escaped = (text or "No content.").replace("\\", "\\\\").replace('"', '\\"')
    return (
        'root = Card([md])\n'
        f'md = MarkDownRenderer("{escaped[:6000]}")\n'
    )


def _q(value: Any) -> str:
    return '"' + str(value or "").replace("\\", "\\\\").replace('"', "'") + '"'


def _list(values: list[str]) -> str:
    return "[" + ", ".join(_q(v) for v in values) + "]"


def _dosha_vector(label: str) -> tuple[int, int, int]:
    key = (label or "").lower()
    mapping = {
        "vata": (80, 12, 8),
        "pitta": (12, 80, 8),
        "kapha": (8, 12, 80),
        "vata-pitta": (46, 46, 8),
        "pitta-kapha": (8, 46, 46),
        "vata-kapha": (46, 8, 46),
        "tridoshic": (34, 33, 33),
    }
    return mapping.get(key, (40, 30, 30))


def analysis_to_openui(analysis: dict[str, Any]) -> str:
    severity = analysis.get("severity") or "moderate"
    dosha = analysis.get("dosha_imbalance") or "unknown"
    warning = analysis.get("emergency_warning") or ""
    interp = analysis.get("ayurvedic_interpretation") or ""
    herbs = analysis.get("herbs") or []
    lifestyle = analysis.get("lifestyle_recommendations") or []
    diet = analysis.get("dietary_advice") or []
    symptoms = analysis.get("primary_symptoms") or []
    v, p, k = _dosha_vector(str(dosha))
    callout_kind = "error" if severity in ("emergency", "urgent") else "warning"
    callout_title = "Urgent" if severity in ("emergency", "urgent") else "Safety"
    callout_body = warning or "Educational Ayurvedic guidance only. Not a medical diagnosis."

    herb_names = [h.get("name") or "Herb" for h in herbs] or ["—"]
    herb_use = [(h.get("benefits") or h.get("how_to_consume") or "—")[:80] for h in herbs] or ["—"]
    herb_dose = [h.get("dosage") or "—" for h in herbs] or ["—"]
    life_items = lifestyle[:6] or ["Keep meals regular", "Sleep on a steady schedule"]
    diet_items = diet[:6] or ["Warm, freshly cooked food"]
    follow = [
        "Build a 7-day diet from this dosha",
        "Which herbs should I skip?",
        "Start a treatment plan",
    ]
    lines = [
        "root = Card([header, alert, radar, tabs, follow])",
        f"header = CardHeader({_q('Wellness snapshot')}, {_q(f'{severity} · {dosha}')})",
        f"alert = Callout({_q(callout_kind)}, {_q(callout_title)}, {_q(callout_body)})",
        f'radar = RadarChart(["Vata", "Pitta", "Kapha"], [doshaSeries])',
        f"doshaSeries = Series({_q('Imbalance')}, [{v}, {p}, {k}])",
        "tabs = Tabs([tabOver, tabHerbs, tabDiet, tabLife])",
        "tabOver = TabItem(\"overview\", \"Overview\", [interp, symptoms])",
        f"interp = TextContent({_q(interp[:500] or 'See the tabs for herbs, diet, and lifestyle.')}, \"default\")",
        f"symptoms = TagBlock({_list([str(s) for s in symptoms[:8]] or ['general wellness'])})",
        "tabHerbs = TabItem(\"herbs\", \"Herbs\", [herbTbl])",
        "herbTbl = Table([Col(\"Herb\", herbNames), Col(\"Why\", herbWhy), Col(\"Dose\", herbDose)])",
        f"herbNames = {_list(herb_names)}",
        f"herbWhy = {_list(herb_use)}",
        f"herbDose = {_list(herb_dose)}",
        "tabDiet = TabItem(\"diet\", \"Diet\", [dietList])",
        "dietList = ListBlock([" + ", ".join(f"diet{i}" for i in range(len(diet_items))) + "])",
    ]
    for i, item in enumerate(diet_items):
        lines.append(f"diet{i} = ListItem({_q(item[:80])})")
    lines.append("tabLife = TabItem(\"life\", \"Lifestyle\", [lifeList])")
    lines.append("lifeList = ListBlock([" + ", ".join(f"life{i}" for i in range(len(life_items))) + "])")
    for i, item in enumerate(life_items):
        lines.append(f"life{i} = ListItem({_q(item[:80])})")
    lines.append("follow = FollowUpBlock([" + ", ".join(f"fu{i}" for i in range(len(follow))) + "])")
    for i, item in enumerate(follow):
        lines.append(f"fu{i} = FollowUpItem({_q(item)})")
    return "\n".join(lines)


def treatment_to_openui(plan: dict[str, Any], completed: int = 0) -> str:
    days = plan.get("days") or []
    total = sum(len(d.get("tasks") or []) for d in days) or 1
    pct = int(round(100 * completed / total))
    cats = {"herb": 0, "diet": 0, "lifestyle": 0, "therapy": 0}
    for day in days:
        for task in day.get("tasks") or []:
            cat = (task.get("category") or "lifestyle").lower()
            cats[cat] = cats.get(cat, 0) + 1
    labels = [c for c, n in cats.items() if n]
    values = [cats[c] for c in labels] or [1]
    labels = labels or ["tasks"]
    step_ids = []
    lines = [
        "root = Card([header, mix, pie, steps])",
        f"header = CardHeader({_q(plan.get('condition') or 'Treatment')}, {_q((plan.get('overview') or '')[:160])})",
        f"mix = TextContent({_q(f'{pct}% complete · {completed}/{total} tasks')}, \"small-heavy\")",
        f'pie = PieChart({_list(labels)}, {values}, "donut")',
    ]
    for day in days[:10]:
        n = day.get("day_number") or 0
        focus = day.get("focus") or f"Day {n}"
        tasks = day.get("tasks") or []
        details = "; ".join((t.get("description") or "")[:60] for t in tasks[:4]) or "Rest and observe."
        sid = f"day{n}"
        step_ids.append(sid)
        lines.append(f"{sid} = StepsItem({_q(f'Day {n}: {focus}'[:60])}, {_q(details[:180])})")
    lines.append("steps = Steps([" + ", ".join(step_ids) + "])")
    return "\n".join(lines)
