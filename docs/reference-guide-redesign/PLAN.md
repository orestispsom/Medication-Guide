# Redesign Execution Plan

## Separation of concerns

This project deliberately keeps content editing and visual design separate.

### Stage 1 — TEXT
Objective: produce a clinically coherent, deduplicated master manuscript independent of page styling.

Sequence:
1. Establish canonical content schemas.
2. Rewrite the eight editorial chunks.
3. Verify dynamic clinical claims against authoritative sources.
4. Resolve duplication and contradictions.
5. Normalize terminology, units, certainty language, and jurisdiction labels.
6. Assemble the master manuscript.
7. Estimate page demand from content types.
8. Compress text if the projected layout materially exceeds the target.

Do not solve excess length by reducing font size or padding.

### Stage 2 — DESIGN RULES
Objective: establish the visual system only after the information architecture is stable.

Prototype six representative pages:
1. Module opener + clinical selection map.
2. Comparison / monitoring page.
3. Complex full monograph (Clozapine).
4. Standard full monograph (Olanzapine).
5. Two compact profiles on one page.
6. Switching / emergency protocol.

Test all prototypes:
- printed at 100% on A4;
- normal laptop view;
- tablet view;
- fast scan for dose, monitoring, contraindications, and red flags.

Freeze:
- page grid and margins;
- typography hierarchy and minimum sizes;
- spacing;
- table density;
- semantic colors;
- danger/caution/practice-point components;
- full and compact monograph templates;
- protocol template;
- navigation and cross-reference conventions.

### Stage 3 — FINAL PDF
Objective: lay out the approved manuscript using the frozen design system.

Work by the same eight chunks as Stage 1. Each batch must receive:
- clinical QA;
- editorial QA;
- visual QA;
- cross-reference check.

Whole-book integration:
- page numbers;
- TOC;
- drug index;
- topic index;
- abbreviations;
- evidence/source notes;
- hyperlinks;
- final density pass;
- publication QA.

## Rewrite chunks

| Chunk | Scope | Target pages |
|---|---|---:|
| C1 | Foundations / global prescribing principles | 14 |
| C2 | Antipsychotics | 24 |
| C3 | Antidepressants | 20 |
| C4 | Bipolar / mood stabilizers | 18 |
| C5 | Anxiety / sleep / ADHD / wakefulness | 24 |
| C6 | Substance use / movement / catatonia | 24 |
| C7 | Special populations / neurology / organ impairment | 37 |
| C8 | Switching / discontinuation / deprescribing | 18 |

Front matter and back matter are budgeted separately. The working whole-book target is approximately 200 pages, but readability outranks an arbitrary hard ceiling.

## Standard semantic schemas

### Major drug
- Clinical role
- Indications / treatment position
- Start / usual / target / maximum dose
- Formulations / route
- Pharmacokinetics that change prescribing
- Choose when
- Avoid / caution when
- Common adverse effects
- Serious adverse effects
- Baseline monitoring
- Titration monitoring
- Maintenance monitoring
- Critical interactions
- Special situations
- Mechanism that matters clinically
- 2–4 practice points
- Cross-references
- Evidence/source tags

### Secondary drug
- Clinical role
- Dose
- Key PK
- Best use
- Main liability
- Monitoring
- Critical caveat
- Cross-reference

### Protocol
- When this applies
- Pre-checks
- Timeline / schedule
- Monitoring
- Stop / escalate conditions
- Special cases
- Cross-references
- Sources

## Editorial language rules

Prefer:
- preferred;
- usually preferred;
- reasonable option;
- use cautiously;
- avoid where possible;
- contraindicated.

Avoid unqualified promotional or categorical phrasing such as:
- definitive;
- revolutionary;
- 100%;
- zero risk;
- always/never unless genuinely required.

Clinical safety thresholds and mandatory rules may still use explicit imperative language when supported by authoritative evidence.
