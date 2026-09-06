# Medication Guide — Agent Rules

## Reusable knowledge asset detection

While completing the primary medication-guide task, flag only **unusually reusable original clinical synthesis**: prescribing/monitoring algorithms, high-information comparison tables, adverse-effect management frameworks, difficult pharmacology explained clearly, differential pitfalls, patient/family explanations, teaching modules, or clinical-AI evaluation cases.

At a natural pause, use:

> **REUSE CANDIDATE — [topic]**  
> Potential uses: **[2–4 concrete destinations such as professional education, clinician resource/product, article/website, patient/family handoff, clinical-AI evaluation, or clinician software]**.  
> Why: [one sentence].  
> **Capture now, note for later, or ignore?**

Do not derail the primary task. During board preparation, default to **note for later** unless capture takes only a few minutes and reinforces learning. Do not generate a full derivative asset without explicit user opt-in. Avoid generic/routine suggestions and normally surface no more than 1–2 candidates per substantive session.

Preserve provenance and copyright. Do not repurpose proprietary tables/scales, copied textbook wording, or source-locked material as commercial/publishable copy. Any derivative clinical use may require fresh verification, sourcing, permissions, and scope review.


## Canonical shared clinical knowledge

`mental-health-core` (https://github.com/orestispsom/mental-health-core) is the canonical layer for clinical concepts shared across this ecosystem. Reference concept IDs rather than re-deriving shared definitions. Drug monographs are not core content — they live in `Psychiatry-Exams` and `btb-production`. See `MENTAL_HEALTH_CORE.md`.
