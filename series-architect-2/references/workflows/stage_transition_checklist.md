# Stage Transition Checklist

Concrete checks to gate progress between stages. All must pass or be explicitly waived by the user (logged in memory.json).

---

## Stage 1 → Stage 2
- Intake form exists and includes: project parameters, target genre, books count, heat/violence parameters, planning mode (Express/Comprehensive), verbosity.
- memory.json initialized with stage=1 complete and parameters persisted.
- Decision: research source selected (user/web/baseline/hybrid) and approved.

## Stage 2 → Stage 3
- Research artifact exists (market or baseline): at least one of `mm_*_market_research.md` or equivalent.
- Confidence recorded; if below threshold, user approved proceeding.
- Key findings summarized in intake or memory.json changelog.

## Stage 3 → Stage 4
- Series framework drafted: `outputs/series_framework.md` present and non-empty.
- Optional: `outputs/series_romance_beats.md`, `outputs/worldbuilding_guide.md` present if applicable.
- If out-of-order content exists (characters/world predates framework), Reconcile Step completed and report generated (or waived).

## Stage 4 → Stage 5
- Dossier template selected and recorded (source: user/library/custom).
- Resource Discovery run; resource_manifest used or refreshed.
- Template sections validated for completeness (no TODO placeholders for mandatory sections).

## Stage 5 → Stage 6
- Canonical compiled dossier generated for the current book.
- Cross-doc consistency check run with discrepancies listed and either resolved or acknowledged by user.
- Optional per-act splits generated only if `split_by_acts: true`.
 - If act splits are generated, all five act files exist and chapter outlines respect Outline Size Defaults (word cap and major events count).

## Stage 6 → Complete
- INDEX regenerated and present.
- Packaging (if requested) prepared.
- memory.json updated with final summary and timestamps.
