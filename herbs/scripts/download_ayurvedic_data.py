"""
🌿 Dravya Labs — Ayurvedic Dataset Downloader & Converter
==========================================================
Downloads the Amidha Ayurveda Herb Database (700+ herbs) from GitHub,
converts JSON → structured Ayurvedic CSV for model training.

Source: https://github.com/sciencewithsaucee-sudo/herb-database
License: Open Source (Creative Commons)

Run:
    python scripts/download_ayurvedic_data.py
"""

import json
import os
import sys
import urllib.request
import csv

# ─── Configuration ────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
HERBS_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_CSV = os.path.join(HERBS_DIR, "ayurvedic_herbs.csv")
RAW_JSON = os.path.join(HERBS_DIR, "raw_amidha_herbs.json")

SOURCE_URL = "https://raw.githubusercontent.com/sciencewithsaucee-sudo/herb-database/main/herb.json"

# ─── Well-known Latin name mapping (Ayurvedic name → Botanical) ───
LATIN_NAMES = {
    "tulsi": "Ocimum tenuiflorum",
    "amla": "Phyllanthus emblica",
    "ashwagandha": "Withania somnifera",
    "giloy": "Tinospora cordifolia",
    "shatavari": "Asparagus racemosus",
    "bhringraj": "Eclipta prostrata",
    "jatamansi": "Nardostachys jatamansi",
    "chandana": "Santalum album",
    "kutaj": "Holarrhena pubescens",
    "rasona (garlic)": "Allium sativum",
    "rasona": "Allium sativum",
    "kanchanar": "Bauhinia variegata",
    "karpura (camphor)": "Cinnamomum camphora",
    "karpura": "Cinnamomum camphora",
    "pushkarmool": "Inula racemosa",
    "bakuchi": "Psoralea corylifolia",
    "vidarikand": "Pueraria tuberosa",
    "ajmoda": "Apium graveolens",
    "patola": "Trichosanthes dioica",
    "vrikshamla": "Garcinia indica",
    "kumuda": "Nymphaea nouchali",
    "shigru": "Moringa oleifera",
    "parpataka": "Fumaria indica",
    "indrayava": "Holarrhena pubescens",
    "kapikachhu": "Mucuna pruriens",
    "bala": "Sida cordifolia",
    "tamalpatra": "Cinnamomum tamala",
    "chitrak": "Plumbago zeylanica",
    "tagar": "Valeriana wallichii",
    "khadira": "Acacia catechu",
    "twak (cinnamon)": "Cinnamomum verum",
    "twak": "Cinnamomum verum",
    "ela": "Elettaria cardamomum",
    "sariva": "Hemidesmus indicus",
    "gorakhmundi": "Sphaeranthus indicus",
    "kokilaksha": "Asteracantha longifolia",
    "yavani": "Trachyspermum ammi",
    "bhunimba": "Andrographis paniculata",
    "chavya": "Piper retrofractum",
    "palasha": "Butea monosperma",
    "karanja": "Pongamia pinnata",
    "eranda": "Ricinus communis",
    "guggulu": "Commiphora wightii",
    "bhallataka": "Semecarpus anacardium",
    "vasaka": "Adhatoda vasica",
    "laksha": "Laccifer lacca",
    "talisapatra": "Abies webbiana",
    "tamalaki": "Phyllanthus niruri",
    "shirisha": "Albizia lebbeck",
    "babbula": "Acacia nilotica",
    "kumkuma": "Crocus sativus",
    "bilva": "Aegle marmelos",
    "ashoka": "Saraca asoca",
    "devadaru": "Cedrus deodara",
    "haridra": "Curcuma longa",
    "brahmi": "Bacopa monnieri",
    "neem": "Azadirachta indica",
    "nimba": "Azadirachta indica",
    "arjuna": "Terminalia arjuna",
    "triphala": "Triphala (compound)",
    "pippali": "Piper longum",
    "maricha": "Piper nigrum",
    "shunthi": "Zingiber officinale",
    "guduchi": "Tinospora cordifolia",
    "yashtimadhu": "Glycyrrhiza glabra",
    "nagarmotha": "Cyperus rotundus",
    "agnimantha": "Premna integrifolia",
    "rohitaka": "Tecomella undulata",
    "chopchini": "Smilax china",
    "danti": "Baliospermum montanum",
    "ahiphena": "Papaver somniferum",
    "mandura bhasma": "Mandura Bhasma (Iron)",
}

# ─── Hindi name mapping ───
HINDI_NAMES = {
    "tulsi": "तुलसी",
    "amla": "आंवला",
    "ashwagandha": "अश्वगंधा",
    "giloy": "गिलोय",
    "shatavari": "शतावरी",
    "bhringraj": "भृंगराज",
    "jatamansi": "जटामांसी",
    "chandana": "चंदन",
    "kutaj": "कुटज",
    "rasona (garlic)": "लहसुन",
    "rasona": "लहसुन",
    "kanchanar": "कांचनार",
    "karpura (camphor)": "कपूर",
    "karpura": "कपूर",
    "pushkarmool": "पुष्करमूल",
    "bakuchi": "बाकुची",
    "vidarikand": "विदारीकंद",
    "ajmoda": "अजमोदा",
    "patola": "पटोला",
    "vrikshamla": "वृक्षाम्ल",
    "kumuda": "कुमुद",
    "shigru": "शिग्रु",
    "parpataka": "पर्पटक",
    "indrayava": "इंद्रयव",
    "kapikachhu": "कपिकच्छु",
    "bala": "बला",
    "tamalpatra": "तमालपत्र",
    "chitrak": "चित्रक",
    "tagar": "तगर",
    "khadira": "खदिर",
    "twak (cinnamon)": "दालचीनी",
    "twak": "दालचीनी",
    "ela": "इलायची",
    "sariva": "सारिवा",
    "gorakhmundi": "गोरखमुंडी",
    "kokilaksha": "कोकिलाक्ष",
    "yavani": "अजवाइन",
    "bhunimba": "भूनिंब",
    "chavya": "चव्य",
    "palasha": "पलाश",
    "karanja": "करंज",
    "eranda": "एरंड",
    "guggulu": "गुग्गुलु",
    "bhallataka": "भल्लातक",
    "vasaka": "वासक",
    "laksha": "लाक्षा",
    "talisapatra": "तालीसपत्र",
    "tamalaki": "तमालकी",
    "shirisha": "शिरीष",
    "babbula": "बबूल",
    "kumkuma": "कुमकुम",
    "bilva": "बिल्व",
    "ashoka": "अशोक",
    "devadaru": "देवदारु",
    "haridra": "हल्दी",
    "brahmi": "ब्राह्मी",
    "neem": "नीम",
    "nimba": "नीम",
    "arjuna": "अर्जुन",
    "pippali": "पिप्पली",
    "maricha": "मरिच",
    "shunthi": "सोंठ",
    "guduchi": "गुडूची",
    "yashtimadhu": "मुलेठी",
    "nagarmotha": "नागरमोथा",
    "agnimantha": "अग्निमंथ",
    "rohitaka": "रोहितक",
    "chopchini": "चोपचीनी",
    "danti": "दंती",
    "ahiphena": "अहिफेन",
    "mandura bhasma": "मंडूर भस्म",
}

# ─── Therapeutic category classification based on Prabhava ───
PRABHAVA_CATEGORY_MAP = {
    "rasayan": "Rejuvenation",
    "rasayana": "Rejuvenation",
    "medhya": "Neurological",
    "balya": "Strengthening",
    "vrishya": "Reproductive",
    "deepana": "Digestive",
    "pachana": "Digestive",
    "grahi": "Digestive",
    "vatanulomana": "Digestive",
    "kasahara": "Respiratory",
    "shwasahara": "Respiratory",
    "krimighna": "Anti-parasitic",
    "jwaraghna": "Anti-pyretic",
    "shoolaghna": "Analgesic",
    "shoolahara": "Analgesic",
    "shothahara": "Anti-inflammatory",
    "raktashodhak": "Blood Purification",
    "raktapittaghna": "Blood Purification",
    "raktaprasadak": "Blood Purification",
    "raktavardhak": "Blood Purification",
    "kushtaghna": "Dermatological",
    "varnya": "Dermatological",
    "mutrala": "Urinary",
    "lekhana": "Metabolic",
    "medohara": "Metabolic",
    "hridaya": "Cardiac",
    "hrudya": "Cardiac",
    "chakshushya": "Ophthalmological",
    "virechana": "Purgative",
    "rechana": "Purgative",
    "vedanasthapana": "Analgesic",
    "stanyashodhana": "Reproductive",
    "stanyajanana": "Reproductive",
    "shukrala": "Reproductive",
    "yonishodhana": "Gynaecological",
    "stambhana": "Gynaecological",
    "nidrajanaka": "Neurological",
    "vishaghna": "Anti-toxic",
    "vranashodhak": "Wound Healing",
    "asthisandhanakara": "Musculoskeletal",
    "raktastambhaka": "Hemostatic",
    "dantya": "Dental",
    "granthihara": "Anti-tumour",
    "brimhaniya": "Nutritive",
    "pittaghna": "Pitta Pacifying",
    "yakrituttejaka": "Hepatoprotective",
}

# ─── Safety / Contraindication rules based on Virya & Dosha ───
VIRYA_CONTRAINDICATIONS = {
    "Ushna": "Use with caution in Pitta aggravation, high acidity, inflammatory conditions",
    "Sheeta": "Use with caution in Kapha aggravation, cold conditions, low digestive fire",
}


def classify_categories(prabhava_list):
    """Map prabhava actions to therapeutic categories."""
    cats = set()
    for p in prabhava_list:
        key = p.strip().lower()
        if key in PRABHAVA_CATEGORY_MAP:
            cats.add(PRABHAVA_CATEGORY_MAP[key])
    return sorted(cats) if cats else ["General Wellness"]


def build_contraindications(herb):
    """Build contraindication text from herb properties."""
    contras = []
    
    # Virya-based
    virya = herb.get("virya", "")
    if virya in VIRYA_CONTRAINDICATIONS:
        contras.append(VIRYA_CONTRAINDICATIONS[virya])
    
    # Dosha aggravation-based
    aggravate = herb.get("aggravate", [])
    if "Pitta" in aggravate:
        contras.append("May aggravate Pitta dosha; avoid in burning sensation, ulcers, bleeding disorders")
    if "Vata" in aggravate:
        contras.append("May aggravate Vata dosha; avoid in dry skin, constipation, anxiety conditions")
    if "Kapha" in aggravate:
        contras.append("May aggravate Kapha dosha; avoid in congestion, obesity, lethargy conditions")
    
    # General safety
    contras.append("Consult an Ayurvedic practitioner before use during pregnancy or lactation")
    
    return "; ".join(contras)


def build_therapeutic_uses(herb):
    """Build therapeutic uses string from preview and prabhava."""
    uses = []
    # Extract from preview
    preview = herb.get("preview", "")
    if preview:
        uses.append(preview)
    
    # Map prabhava to uses
    for p in herb.get("prabhav", []):
        key = p.strip().lower()
        if key in PRABHAVA_CATEGORY_MAP:
            uses.append(PRABHAVA_CATEGORY_MAP[key])
    
    return "; ".join(sorted(set(uses)))


def download_json():
    """Download the Amidha Ayurveda Herb Database."""
    print(f"📥 Downloading Amidha Ayurveda Herb Database...")
    print(f"   Source: {SOURCE_URL}")
    
    try:
        req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "DravyaLabs/1.0"})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read().decode("utf-8")
        
        with open(RAW_JSON, "w", encoding="utf-8") as f:
            f.write(data)
        
        herbs = json.loads(data)
        print(f"   ✅ Downloaded {len(herbs)} herbs")
        return herbs
        
    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        
        # Try loading from cached file
        if os.path.exists(RAW_JSON):
            print(f"   📂 Loading from cached file: {RAW_JSON}")
            with open(RAW_JSON, "r", encoding="utf-8") as f:
                herbs = json.load(f)
            print(f"   ✅ Loaded {len(herbs)} herbs from cache")
            return herbs
        
        sys.exit(1)


def convert_to_csv(herbs):
    """Convert JSON herb data to structured Ayurvedic CSV."""
    print(f"\n🔄 Converting {len(herbs)} herbs to Ayurvedic CSV...")
    
    rows = []
    seen_names = set()
    
    for herb in herbs:
        name = herb.get("name", "").strip()
        if not name or name.lower() in seen_names:
            continue
        seen_names.add(name.lower())
        
        # Flatten arrays to comma-separated strings
        rasa = ", ".join(herb.get("rasa", []))
        guna = ", ".join(herb.get("guna", []))
        virya = herb.get("virya", "")
        vipaka = herb.get("vipaka", "")
        prabhava = ", ".join(herb.get("prabhav", []))
        
        pacify = ", ".join(herb.get("pacify", []))
        aggravate = ", ".join(herb.get("aggravate", []))
        tridosha = herb.get("tridosha", False)
        
        # Look up additional info
        name_lower = name.lower()
        latin_name = LATIN_NAMES.get(name_lower, "")
        hindi_name = HINDI_NAMES.get(name_lower, "")
        
        # Classify therapeutic categories
        categories = classify_categories(herb.get("prabhav", []))
        
        # Build contraindication text
        contraindications = build_contraindications(herb)
        
        # Build therapeutic uses text
        therapeutic_uses = build_therapeutic_uses(herb)
        
        row = {
            "name": name,
            "latin_name": latin_name,
            "hindi_name": hindi_name,
            "preview": herb.get("preview", ""),
            "rasa": rasa,
            "guna": guna,
            "virya": virya,
            "vipaka": vipaka,
            "prabhava": prabhava,
            "pacify_dosha": pacify,
            "aggravate_dosha": aggravate,
            "tridosha": tridosha,
            "category": ", ".join(categories),
            "therapeutic_uses": therapeutic_uses,
            "contraindications": contraindications,
            "source_url": herb.get("link", ""),
            # One-hot dosha columns for ML features
            "pacify_vata": 1 if "Vata" in herb.get("pacify", []) or herb.get("tridosha", False) else 0,
            "pacify_pitta": 1 if "Pitta" in herb.get("pacify", []) or herb.get("tridosha", False) else 0,
            "pacify_kapha": 1 if "Kapha" in herb.get("pacify", []) or herb.get("tridosha", False) else 0,
            "aggravate_vata": 1 if "Vata" in herb.get("aggravate", []) else 0,
            "aggravate_pitta": 1 if "Pitta" in herb.get("aggravate", []) else 0,
            "aggravate_kapha": 1 if "Kapha" in herb.get("aggravate", []) else 0,
        }
        rows.append(row)
    
    # Write CSV
    if not rows:
        print("   ❌ No herb rows generated!")
        sys.exit(1)
    
    fieldnames = list(rows[0].keys())
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    file_size = os.path.getsize(OUTPUT_CSV) / 1024
    print(f"   ✅ Saved: {OUTPUT_CSV}")
    print(f"   📊 {len(rows)} unique herbs, {file_size:.1f} KB")
    
    return rows


def print_summary(rows):
    """Print dataset summary statistics."""
    print(f"\n{'=' * 60}")
    print(f"🌿 Ayurvedic Herb Dataset Summary")
    print(f"{'=' * 60}")
    print(f"   Total herbs: {len(rows)}")
    
    # Dosha distribution
    vata_herbs = sum(1 for r in rows if r["pacify_vata"])
    pitta_herbs = sum(1 for r in rows if r["pacify_pitta"])
    kapha_herbs = sum(1 for r in rows if r["pacify_kapha"])
    tridosha_herbs = sum(1 for r in rows if r["tridosha"])
    
    print(f"\n   Dosha Pacification:")
    print(f"     Vata:     {vata_herbs} herbs")
    print(f"     Pitta:    {pitta_herbs} herbs")
    print(f"     Kapha:    {kapha_herbs} herbs")
    print(f"     Tridosha: {tridosha_herbs} herbs")
    
    # Virya distribution
    ushna = sum(1 for r in rows if r["virya"] == "Ushna")
    sheeta = sum(1 for r in rows if r["virya"] == "Sheeta")
    print(f"\n   Virya (Potency):")
    print(f"     Ushna (Hot):   {ushna} herbs")
    print(f"     Sheeta (Cold): {sheeta} herbs")
    
    # Rasa distribution
    from collections import Counter
    all_rasas = []
    for r in rows:
        all_rasas.extend([x.strip() for x in r["rasa"].split(",") if x.strip()])
    rasa_counts = Counter(all_rasas)
    print(f"\n   Rasa (Taste) Distribution:")
    for rasa, count in rasa_counts.most_common():
        print(f"     {rasa}: {count}")
    
    # Category distribution
    all_cats = []
    for r in rows:
        all_cats.extend([x.strip() for x in r["category"].split(",") if x.strip()])
    cat_counts = Counter(all_cats)
    print(f"\n   Therapeutic Categories:")
    for cat, count in cat_counts.most_common(10):
        print(f"     {cat}: {count}")
    
    # Sample entries
    print(f"\n   Sample Entries:")
    for r in rows[:3]:
        print(f"     🌿 {r['name']} ({r['latin_name'] or '?'})")
        print(f"        Rasa: {r['rasa']} | Virya: {r['virya']} | Vipaka: {r['vipaka']}")
        print(f"        Pacifies: {r['pacify_dosha']} | Aggravates: {r['aggravate_dosha']}")
    
    print(f"\n{'=' * 60}")
    print(f"✅ Dataset ready for training!")
    print(f"   Next: python training/train_local.py")
    print(f"{'=' * 60}")


def main():
    herbs = download_json()
    rows = convert_to_csv(herbs)
    print_summary(rows)


if __name__ == "__main__":
    main()
