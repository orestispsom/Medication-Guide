# Psychiatric Medication Guide 📚🧠

> **Evidence-Based Pharmacodynamics, Titration & Deprescribing Platform**  
> *Aligned with the 12-Module Master Clinical Psychopharmacology Reference Compendium*

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Clinical Architecture & Master Compendium Coverage

The **Psychiatric Medication Guide** is a web and mobile-optimized clinical decision-support application built for psychiatrists, psychiatric nurse practitioners, neurology residents, clinical pharmacists, and medical trainees.

The platform is systematically compiled from the 613-page **12-Module Master Clinical Psychopharmacology Reference Compendium**, delivering publication-grade clinical monographs, exact nanomolar receptor affinities, and cross-titration algorithms.

```
                               ┌────────────────────────┐
                               │ Psychiatric Medication │
                               │      Guide (App)       │
                               └───────────┬────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐              ┌──────────────────┐
│   179 Clinical   │             │   20 Module 12   │              │   44 Molecular   │
│ Drug Monographs  │             │ Switch Protocols │              │  Target Profiles │
├──────────────────┤             ├──────────────────┤              ├──────────────────┤
│• 4-Card Benchmark│             │• 4-Phase Calendar│              │• Exact Ki (nM)   │
│• 8 Adverse Risks │             │• Receptor Shifts │              │• Occupancy %     │
│• 4-Step Titration│             │• Risk Meters     │              │• Clinical Action │
│• Black Box Alert │             │• Rescues & Pearls│              │• Neurobiology    │
└──────────────────┘             └──────────────────┘              └──────────────────┘
```

---

## Key Features

### 1. Authoritative Clinical Monographs (179 Medications)
- **4-Card Benchmark Metrics**:
  - Molecular Target & Dopamine/SERT Occupancy thresholds
  - Elimination Half-Life ($t_{1/2}$) and steady-state kinetics
  - Hepatic CYP450 metabolism & renal clearance profiles
  - Therapeutic Blood Windows (e.g. Clozapine $350\text{--}600\text{ ng/mL}$, Lithium $0.6\text{--}1.0\text{ mEq/L}$)
- **Molecular Receptor Profiles**:
  - Binding occupancy bars paired with exact $K_i$ nanomolar affinities across 44 molecular targets.
  - Explicit clinical mechanism annotations (e.g. $5\text{-HT}_{2\text{A}}$ inverse agonism mitigating EPS and negative symptoms).
- **8-Domain Standardized Adverse Risk Footprint**:
  - Color-coded severity matrix (*Severe, Very High, High, Moderate, Low, Near Zero / Sparing*) covering:
    1. Sedation & Somnolence
    2. Weight Gain & Metabolic Risk
    3. Anticholinergic Toxicity
    4. Orthostatic Dizziness
    5. Seizure Induction (Dose-Dependent)
    6. Cardiac QTc Prolongation
    7. Extrapyramidal Symptoms (EPS)
    8. Prolactin Elevation
- **Structured 4-Step Titration Schedules**:
  - Step 1 (Initiation), Step 2 (Escalation), Step 3 (Target Maintenance), Step 4 (Ceiling / Reset / Missed Dose Rule).
  - Includes specific missed-dose directives (e.g. Clozapine $>48\text{h}$ restart rule at 12.5 mg).
- **EHR Note Export**: 1-click `📋 Copy Titration Protocol` formatted for clinical records.
- **Special Populations**: Perinatal lactation/pregnancy, pediatric age limits, geriatric Beers criteria, and renal/hepatic adjustments.

### 2. Module 12: Cross-Titration & Deprescribing Master Tool (20 Protocols)
- **Structured 4-Phase Schedules**: Step-by-step overlap, plateau, step-down, and consolidation phases.
- **Direct Switch Protocol Matcher**: Instant lookup by entering current drug and target drug.
- **Patient Calendar Schedule Calculator**: Enter any start date to auto-compute exact calendar dates for each phase.
- **Receptor Shift Dynamics**: Real-time evaluation of cholinergic, histaminergic, or dopaminergic receptor differentials during transitions.
- **Adverse Risk Stratification Meters**: Quantified vulnerability meters for discontinuation syndromes, serotonin toxicity, sympathetic surges, and rebound crises.
- **Emergency Toxicity & Rescue Interventions**: Standardized rescue dosing (e.g., Ondansetron, Propranolol, Cyproheptadine, Phentolamine, Benztropine).
- **Exportable Patient Schedules**: 1-click clipboard export with exact dates for patient handoffs.

### 3. Clinical Comparison Matrix
- **🧬 Receptor & Ki Matrix**: Full horizontal matrix comparing occupancies and affinities across drug families.
- **🛡️ Adverse Safety Matrix**: Side-by-side severity comparison across all 8 adverse risk domains.
- **⚖️ Head-to-Head Pin View**: Pin 2 to 4 medications (e.g. Clozapine vs Olanzapine vs Aripiprazole) for focused side-by-side cards without horizontal scrolling.

### 4. 44 Molecular Receptor & Target Reference
- Categorized across 10 biological systems: Dopaminergic, Serotonergic, Adrenergic, Histaminergic, Muscarinic/Cholinergic, Transporters, GABAergic/Glutamatergic, Neuropeptides, and Enzymes/Channels.
- Maps biological mechanisms, therapeutic effects, adverse liabilities, and all documented medications binding each target.

### 5. Ergonomic Clinical UI/UX
- **Universal Spotlight Command Palette**: Instant access from any screen via `Ctrl+K`, `Cmd+K`, or `/`.
- **Persistent Bottom Navigation Shell**: 1-tap switching between Home, A–Z Directory, Titration, Compare, Receptors, and Search.
- **Sticky Section Anchor Bar**: Instant jump to monograph sections (`Benchmarks`, `Receptors`, `Adverse`, `Titration`, `Pearls`).
- **Subgroup Previews**: Direct visualization of member drugs on subgroup cards.

---

## Taxonomy & Clinical Families (9 Domains)

1. **Antipsychotics & Dopamine Pathways**: SGAs, FGAs, Partial Agonists, Dual Muscarinic Agonist/Antagonists (Cobenfy), D3-preferring agents.
2. **Antidepressants & Mood Elevators**: SSRIs, SNRIs, NDRIs (Bupropion), NaSSAs (Mirtazapine), Serotonin Multimodal (Vortioxetine, Vilazodone), NMDA Antagonist/Bupropion (Auvelity), Neuroactive Steroids (Zuranolone), TCAs, MAOIs.
3. **Mood Stabilizers & Anticonvulsants**: Lithium, Divalproex/Valproate, Lamotrigine, Carbamazepine, Oxcarbazepine.
4. **Anxiolytics & Hypnotics**: Benzodiazepines (high & low potency), Non-Benzodiazepine Z-Drugs, Dual Orexin Receptor Antagonists (DORAs), Azapirones (Buspirone), Sedating Antidepressants.
5. **ADHD & Wakefulness Promoters**: Methylphenidate formulations, Amphetamine mixed salts, Lisdexamfetamine, Atomoxetine, Alpha-2 Agonists (Clonidine, Guanfacine), Wakefulness Promoters (Modafinil, Armodafinil, Solriamfetol).
6. **Substance Use Disorder Pharmacotherapy**: Opioid Agonist/Partial Agonist (Buprenorphine, Methadone, Naloxone), Alcohol Dependence (Naltrexone, Acamprosate, Disulfiram), Tobacco Cessation (Varenicline, Bupropion, NRT).
7. **Neuropsychiatry & Cognitive Enhancers**: Cholinesterase Inhibitors (Donepezil, Rivastigmine, Galantamine), NMDA Receptor Antagonists (Memantine).
8. **Neurological & Movement Disorder Therapeutics**: VMAT2 Inhibitors (Valbenazine, Deutetrabenazine), Anticholinergics (Benztropine, Trihexyphenidyl), Dopamine Precursors & Agonists.
9. **Antidotes & Interventional Psychopharmacology**: Emergency toxicological rescues (Flumazenil, Naloxone, Cyproheptadine, Dantrolene, Bromocriptine, Phentolamine, Glucagon, Intralipid).

---

## Project Structure

```
Medication-Guide/
├── docs/
│   └── CROSS_TITRATION_CLINICAL_REFERENCE.md  # 20-Protocol clinical reference synthesis
├── scripts/
│   ├── taxonomy.py                           # 9 families & 35 subgroups
│   ├── receptors.py                          # 44 molecular targets & Ki calibrations
│   ├── catalog.py                            # 179 monograph page spreads
│   ├── parsers.py                            # Text & regex extractors
│   ├── run_build.py                          # Extraction runner
│   └── README.md                             # Extraction documentation
├── src/
│   ├── components/
│   │   ├── BackButton.jsx                    # Safe navigation with home link
│   │   ├── DrugCard.jsx                      # Drug summary card with dosing & tags
│   │   ├── FamilyCard.jsx                    # Domain card with subgroup counters
│   │   ├── Navigation.jsx                    # Persistent floating bottom navigation bar
│   │   ├── QuickSearchModal.jsx              # Spotlight command palette (Ctrl+K)
│   │   ├── ReceptorTag.jsx                   # Molecular target chip
│   │   ├── SubgroupCard.jsx                  # Subgroup card with member previews
│   │   └── Toast.jsx                         # Clipboard feedback toast notification
│   ├── screens/
│   │   ├── AllDrugsScreen.jsx                # A–Z directory with letter jumps & filters
│   │   ├── ComparisonTableScreen.jsx         # Tri-mode matrix & Head-to-Head cards
│   │   ├── CrossTitrationScreen.jsx          # Module 12 switch protocols & calendar calculator
│   │   ├── DrugDetailScreen.jsx              # Authoritative 2-page clinical monograph
│   │   ├── FamilyScreen.jsx                  # Clinical family domain screen
│   │   ├── HomeScreen.jsx                    # Global dashboard & high-yield chips
│   │   ├── ReceptorDetailScreen.jsx          # Molecular target detail & drug binding list
│   │   ├── ReceptorListScreen.jsx            # 44-target categorized directory
│   │   └── SubgroupScreen.jsx                # Subgroup medication list
│   ├── App.jsx                               # HashRouter with route scroll restoration
│   ├── data.json                             # 1.25 MB structured psychopharmacology database
│   └── main.jsx                              # Application root entry point
├── index.html                                # HTML shell with Tailwind CSS
├── package.json                              # Vite & React dependencies
└── vite.config.js                            # Vite configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/orestispsom/Medication-Guide.git
cd Medication-Guide

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Data Pipeline & Maintenance

To re-extract or update data from the master compendium PDF:
```bash
# Run the Python extraction pipeline (requires pdfplumber)
python scripts/run_build.py
```
This updates `src/data.json` with all monographs, molecular targets, and cross-titration protocols.

---

## Clinical Disclaimer

This guide is designed as an educational and clinical reference tool for qualified healthcare professionals. Psychopharmacological prescribing decisions require individualized clinical assessment, diagnostic formulation, patient consent, and laboratory monitoring. Always verify dosing against current institutional protocols, regulatory packaging inserts, and local practice guidelines.