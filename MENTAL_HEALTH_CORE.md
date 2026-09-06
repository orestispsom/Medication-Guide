# Canonical shared knowledge: `mental-health-core`

`https://github.com/orestispsom/mental-health-core` is the canonical layer for clinical concepts shared across this ecosystem.

## Current state of this repository

This repository contains five files: a built SPA bundle, `AGENTS.md`, and a one-line README. There is **no source content** — the bundle carries only fragmentary drug data.

That means, honestly, that there is currently nothing here to consume the core with and nothing to contribute to it. This document exists so that whoever works here next knows where the canonical knowledge is, rather than re-deriving it.

## What would be relevant when this repository has source

Three concepts are directly applicable to a medication guide:

- [`MHC-C-020`](https://github.com/orestispsom/mental-health-core/blob/main/concepts/withdrawal-rebound-relapse.md) — withdrawal, rebound and relapse, and why confusing them leads to restarting drugs people did not need;
- [`MHC-C-021`](https://github.com/orestispsom/mental-health-core/blob/main/concepts/hyperbolic-tapering.md) — proportional dose reduction and the last-mile problem;
- [`MHC-C-029`](https://github.com/orestispsom/mental-health-core/blob/main/concepts/psychoeducation.md) — what makes medication information therapeutic rather than merely complete.

## What would stay here

Presentation, layout, interaction, and the guide's own editorial voice.

Drug monographs — doses, licensing, monitoring, interactions — are **not** core content. `Psychiatry-Exams` already holds a detailed drug-dossier schema and real dossiers, and `btb-production` holds the clinical blueprints. Duplicating either here or in the core would create exactly the divergence the core exists to prevent.

## An open question

Whether this repository should acquire a source-content directory, or be recognised as a build artefact rather than a knowledge repository, is recorded as [`OPEN_QUESTIONS.md` Q7](https://github.com/orestispsom/mental-health-core/blob/main/docs/OPEN_QUESTIONS.md).

## How to use it

**Look up a concept.** Human: `concepts/<slug>.md` in the core. Machine: `index/concepts.json`, which is the whole core in one file. Search `aliases` too.

**Reference by `id`, not by name.** `MHC-C-###` is permanent. Slugs can change; old ones move to `aliases`.

**Add local interpretation as an overlay.** An overlay names the core concept and adds what the core does not own — audience language, exam framing, product claims, UI labels, market state. It may add. It may not restate, narrow, or contradict the core definition.

**Contribute improvements by pull request** against the core. Do not fork a definition locally. If you need to contradict the core, that is a conflict, not an overlay.

**Pin to a tag.** Current release: `v0.1.0`.

## Two things the core will not do

**It will not approve a clinical claim.** All 30 V0 concepts are `READY_FOR_FOUNDER_REVIEW`. Nothing has been clinically reviewed, so nothing in the core licenses a public clinical claim yet.

**It will not supply market evidence.** The core has no market fields and never will. Clinical plausibility is not demand, whitespace, or opportunity.

## Telling evidence from heuristic from hypothesis

Every concept carries three separate fields, which must not be collapsed:

| Field | Question |
|---|---|
| `epistemic_status` | What kind of knowledge is this? |
| `certainty` | How confident, within that kind? |
| `review.state` | Has a qualified human signed it off? |

The five epistemic values — `ESTABLISHED_EVIDENCE`, `SUPPORTED_CLINICAL_PRINCIPLE`, `EXPERT_PRACTICE`, `BTB_CLINICAL_HEURISTIC`, `SPECULATIVE` — are the ones already in use in `btb-intelligence`, adopted unchanged.

## Avoiding a second conflicting definition

Before defining a shared clinical term in this repository, search the core index including aliases.

- exists and is right → reference it;
- exists and is wrong → pull request against the core;
- exists but you need local framing → overlay;
- does not exist and two repositories need it → propose it;
- does not exist and only this repository needs it → keep it local.

## Reference

- Audit that produced this: [`docs/AUDIT-2026-09-06.md`](https://github.com/orestispsom/mental-health-core/blob/main/docs/AUDIT-2026-09-06.md)
- Ownership matrix: [`docs/OWNERSHIP_MATRIX.md`](https://github.com/orestispsom/mental-health-core/blob/main/docs/OWNERSHIP_MATRIX.md)
- Consuming guide: [`docs/CONSUMING.md`](https://github.com/orestispsom/mental-health-core/blob/main/docs/CONSUMING.md)
- Conflict rules: [`docs/SOURCE_PRECEDENCE.md`](https://github.com/orestispsom/mental-health-core/blob/main/docs/SOURCE_PRECEDENCE.md)
- Contributing: [`CONTRIBUTING.md`](https://github.com/orestispsom/mental-health-core/blob/main/CONTRIBUTING.md)
