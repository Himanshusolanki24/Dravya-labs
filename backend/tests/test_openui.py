import os
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DRAVYA_HASH_EMBEDDINGS", "1")

from app.openui import looks_like_openui
from app.openui.compile import analysis_to_openui, treatment_to_openui, wrap_openui


class OpenUICompileTests(unittest.TestCase):
    def test_analysis_emits_root_and_chart(self):
        ui = analysis_to_openui({
            "severity": "moderate",
            "dosha_imbalance": "vata",
            "ayurvedic_interpretation": "Dryness and irregular digestion.",
            "herbs": [{"name": "Ashwagandha", "benefits": "Grounding", "dosage": "tea"}],
            "lifestyle_recommendations": ["Warm oil massage"],
            "dietary_advice": ["Warm porridge"],
            "primary_symptoms": ["insomnia"],
        })
        self.assertIn("root = Card", ui)
        self.assertIn("RadarChart", ui)
        self.assertIn("FollowUpBlock", ui)
        self.assertTrue(looks_like_openui(ui))

    def test_wrap_plain_text(self):
        wrapped = wrap_openui("Hello, drink ginger tea.")
        self.assertIn("MarkDownRenderer", wrapped)
        self.assertTrue(looks_like_openui(wrapped))

    def test_treatment_steps(self):
        ui = treatment_to_openui({
            "condition": "PCOS",
            "overview": "Kapha-pitta support",
            "days": [
                {"day_number": 1, "focus": "Stabilize", "tasks": [
                    {"category": "diet", "description": "Warm breakfast"},
                    {"category": "herb", "description": "Cinnamon tea"},
                ]}
            ],
        })
        self.assertIn("PieChart", ui)
        self.assertIn("StepsItem", ui)


if __name__ == "__main__":
    unittest.main()
