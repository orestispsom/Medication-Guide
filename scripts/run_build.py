# scripts/run_build.py
import fitz
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from taxonomy import FAMILIES, SUBGROUPS
from receptors import RECEPTORS
from catalog import MONOGRAPH_ENTRIES
from parsers import parse_monograph, parse_protocol

PDF_PATH = r'C:\Users\orest\OneDrive\Υπολογιστής\Master Psychopharm.pdf'
OUTPUT_PATH = r'src/data.json'

doc = fitz.open(PDF_PATH)
print(f"Compendium PDF loaded: {len(doc)} pages.")

# Load existing data.json to preserve rich indications/CYP mappings
existing_drugs_dict = {}
try:
    with open('src/data.json', 'r', encoding='utf-8') as f_in:
        old_data = json.load(f_in)
        for d in old_data.get('drugs', []):
            existing_drugs_dict[d['id']] = d
    print(f"Loaded {len(existing_drugs_dict)} existing drug records for enrichment.")
except Exception as e:
    print(f"No existing data loaded: {e}")

print(f"Parsing {len(MONOGRAPH_ENTRIES)} monograph spreads...")
parsed_drugs = []
seen_ids = set()

for p1, p2, fam_id, fam_name, sgroup, sgroup_id in MONOGRAPH_ENTRIES:
    try:
        drug = parse_monograph(doc, p1, p2, fam_id, fam_name, sgroup, sgroup_id, existing_drugs_dict)
        if drug['id'] in seen_ids:
            drug['id'] = f"{drug['id']}-{fam_id}"
        seen_ids.add(drug['id'])
        parsed_drugs.append(drug)
    except Exception as e:
        print(f"Error parsing monograph at p.{p1}-{p2}: {e}")

print(f"Successfully parsed {len(parsed_drugs)} drug monographs.")

print("Parsing Module 12 Cross-Titration Protocols...")
parsed_protocols = []
for i in range(20):
    p1 = 574 + i*2
    p2 = p1 + 1
    try:
        proto = parse_protocol(doc, p1, p2, i+1)
        parsed_protocols.append(proto)
    except Exception as e:
        print(f"Error parsing protocol {i+1} at p.{p1}-{p2}: {e}")

print(f"Successfully parsed {len(parsed_protocols)} transition protocols.")

complete_data = {
    'families': FAMILIES,
    'subgroups': SUBGROUPS,
    'receptors': RECEPTORS,
    'drugs': parsed_drugs,
    'protocols': parsed_protocols
}

with open(OUTPUT_PATH, 'w', encoding='utf-8') as f_out:
    json.dump(complete_data, f_out, indent=2, ensure_ascii=False)

print(f"Saved authoritative database to {OUTPUT_PATH}. File size: {os.path.getsize(OUTPUT_PATH)/1024:.1f} KB")
