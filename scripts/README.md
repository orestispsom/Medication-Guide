# Reference Compendium Extraction Pipeline

This directory contains the automated data extraction pipeline used to parse and compile `src/data.json` from the 613-page `Master Psychopharm.pdf` (12-Module Master Clinical Psychopharmacology Reference Compendium).

## Architecture

- `taxonomy.py`: Defines the 9 authoritative clinical drug families and 35 subgroups.
- `receptors.py`: Defines the 44 molecular targets (receptors, transporters, channels, and enzymes) with color tags and clinical action descriptions.
- `catalog.py`: Defines the complete page catalog mapping 179 two-page drug monographs across Modules 02 through 11.
- `parsers.py`: PDF text parsers for:
  - Benchmark metrics (Occupancy, t½, Metabolism, Therapeutic Window)
  - Molecular receptor affinities ($K_i$ values and occupancy %)
  - 8-domain adverse risk footprints
  - Structured 4-step titration schedules
  - Black box warnings and food requirements
  - Special populations & organ impairment rules
  - Module 12: 20 cross-titration & deprescribing protocols (4-phase schedules, receptor shift dynamics, risk meters, emergency rescue actions)
- `run_build.py`: Orchestrates PDF reading, parsing, cross-referencing, and JSON output generation.

## Execution

```bash
python scripts/run_build.py
```
