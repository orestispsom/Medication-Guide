# Stage 1A — Full Source Inventory

Status: **COMPLETE**

Source: 613-page *Master Clinical Psychopharmacology Reference Compendium*.

Purpose: map the source before rewriting, identify structural duplication, and convert the source into a manageable set of editorial rewrite units.

## Structural findings

- Source pages: **613**
- Clinical monograph pages: **400**
- Foundational / decision pages: **146**
- Clinical protocol pages: **40**
- Standalone module separator/syllabus pages: **24**
- Two-page monograph units: **200**
- Distinct monograph headings: **150**
- Repeated monograph units by heading: **50**
- Editorial units generated: **320**
- Final working page budget: **~200 pages**

## Main conclusion

The dominant source of bloat is structural, not simply typographic. The source repeatedly allocates two pages to drug/protocol units and repeats full profiles across indication- or population-specific modules. The redesign therefore removes the rule that every drug equals two pages and every module receives a fixed page count.

The rewrite should preserve high-value clinical material while collapsing:

- duplicate module separator + syllabus pages;
- repeated foundational explanations;
- duplicate full drug monographs;
- mechanism paragraphs that can be expressed as concise clinically meaningful rows;
- repeated safety/monitoring material that belongs in a canonical profile or global matrix.

## Provisional monograph disposition

- Full one-page core profiles: **41**
- Half-page secondary profiles: **47**
- Compact/class matrix entries: **40**
- Context-only overlays: **33**
- Moved to another canonical home: **23**
- Converted from drug monograph to protocol/rescue entry: **16**

These are planning classifications, not frozen clinical/product decisions.

## Working page budget

| Section | Target pages |
|---|---:|
| Front matter | 6 |
| C1 Foundations | 14 |
| C2 Antipsychotics | 24 |
| C3 Antidepressants | 20 |
| C4 Bipolar / Mood Stabilizers | 18 |
| C5 Anxiety / Sleep / ADHD | 24 |
| C6 SUD / Movement / Catatonia | 24 |
| C7 Special Populations / Neuro / Organ | 37 |
| C8 Switching / Deprescribing | 18 |
| Back matter / index | 15 |
| **Working total** | **200** |

The budget is an editorial constraint, not a mandate to crowd pages. If readability requires modest deviation, revise the manuscript or accept a small page-count deviation rather than reducing legibility.

## Inventory model

Stage 1A uses four working views:

### Page inventory
Every source page was classified by module, page role, source type, topic, editorial unit, canonical chunk/destination, action, and proposed representation. The source-page provenance is carried into the chunk files below as source page/range fields; detailed rewriting should continue to preserve these source ranges.

### Editorial units
The primary Stage 1B+ work queue. Consecutive pages that represent one conceptual spread/monograph/protocol are grouped into one editorial unit. Rewriting should proceed from these units, not sequential PDF pages.

### Canonical drug map
Repeated monograph headings are mapped to a single preferred home. Later appearances should become indication/population/organ/switching overlays when that is clinically sufficient.

### Cuts and merges queue
Explicit list of standalone pages or units already judged to require deletion, merging, relocation, or a different representation.

## Editorial-unit files

- [`C1-foundations-units.md`](C1-foundations-units.md)
- [`C2-antipsychotics-units.md`](C2-antipsychotics-units.md)
- [`C3-antidepressants-units.md`](C3-antidepressants-units.md)
- [`C4-bipolar-mood-stabilizers-units.md`](C4-bipolar-mood-stabilizers-units.md)
- [`C5-anxiety-sleep-adhd-units.md`](C5-anxiety-sleep-adhd-units.md)
- [`C6-sud-movement-catatonia-units.md`](C6-sud-movement-catatonia-units.md)
- [`C7-special-populations-neuro-organ-units.md`](C7-special-populations-neuro-organ-units.md)
- [`C8-switching-deprescribing-units.md`](C8-switching-deprescribing-units.md)

Together these are the durable Stage 1A rewrite queue. They preserve the source page ranges and planned editorial disposition needed to resume the project from GitHub alone.

## Stage 1B entry condition

Start with **C1 Foundations**. Establish the reusable PK/PD/CYP/receptor/TDM vocabulary before rewriting therapeutic chapters. Later modules should reference these foundations instead of restating them.

## Important limitation

Stage 1A is an editorial/structural audit. It does **not** validate the truth of every dose, threshold, interaction, mechanism, licensing statement, or guideline claim in the source. Dynamic clinical content must be re-verified against current authoritative sources during the text rewrite and publication QA stages.
