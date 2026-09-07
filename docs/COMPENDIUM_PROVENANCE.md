# Clinical Psychopharmacology Master Reference Compendium — Provenance Record

This document establishes the canonical provenance record for the primary clinical reference compendium that serves as the upstream authoritative data source for `Medication-Guide` and `Psychiatry-Exams`.

## Master Artifact Manifest

| Property | Value |
|---|---|
| **Document Title** | CLINICAL PSYCHOPHARMACOLOGY MASTER REFERENCE COMPENDIUM |
| **Declared Format** | PDF 1.7 |
| **Page Count** | 613 pages |
| **File Size** | 9,810,312 bytes |
| **SHA-256 Hash** | `873fdc8ad22fb4ab6bd27ca2451bf71e53cc57deda413942ae5024940193e3cc` |
| **Authoritative Local Path** | `C:\Users\orest\OneDrive\Υπολογιστής\Master Psychopharm.pdf` |

---

## Role in the Clinical Ecosystem

Per `orestispsom/mental-health-core/docs/DRUG_DATA_CROSSWALK.md`:

1. **Upstream Source of Truth:** Every drug record in `Medication-Guide` (`src/data.json`) carries `dataSource: "12-Module Master Psychopharmacology Reference Compendium"`. This compendium also underpins `Psychiatry-Exams`' twelve psychopharmacology modules.
2. **Extraction Discrepancies:** Disagreements between downstream consumers (`Medication-Guide` and `Psychiatry-Exams`) are extractions from this single common source. The compendium settles discrepancies rather than one repository overruling another.
3. **Module Scope:**
   - Modules 02 through 11: 179 two-page drug monographs covering 9 drug families and 35 subgroups.
   - Module 12: 20 structured cross-titration & deprescribing protocols.

---

## Hash Verification Command

To verify the integrity of a candidate copy against this provenance manifest:

```powershell
Get-FileHash -Algorithm SHA256 "path\to\Master Psychopharm.pdf"
```

The output hash must match `873FDC8AD22FB4AB6BD27CA2451BF71E53CC57DEDA413942AE5024940193E3CC` exactly.

---

## Repository Ownership & Publication Governance

- **Decision Floor:** To prevent permanent 9.8 MB binary bloat in git history and respect intellectual property rights, the binary PDF is maintained outside public git history with this manifest serving as the immutable provenance token.
- **Future Placement:** If structured text extraction (Option 1) is undertaken, per-module Markdown should be housed upstream (e.g. in `mental-health-core` or dedicated reference repo) with consumption links in downstream client applications.
