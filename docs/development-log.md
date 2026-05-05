# APEX Development Log

## 2026-05-05 - v0.1.1 Eval Case Guard Plan

### Goal

Ship a small reliability release for the R1 quality loop. The current Failure Ops workflow can generate duplicate Eval Cases from the same Failure Card. This version should make Eval Case creation idempotent and make the quality workbench show whether a Failure Card has already been converted.

### Scope

- Prevent duplicate Eval Case creation for the same `failureCardId`.
- Return the existing Eval Case when a duplicate creation request is submitted.
- Show existing Eval Case count in the Failure Ops actions area.
- Disable the "生成 Eval Case" action once the card already has an Eval Case.
- Bump package version from `0.1.0` to `0.1.1`.
- Update README with the current release record.

### Acceptance Criteria

- Calling `POST /api/eval-cases` twice with the same `failureCardId` does not create duplicate rows.
- Failure Ops clearly shows when a Failure Card has already produced an Eval Case.
- Smoke test still passes against the local app.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Notes

- Keep schema unchanged for this patch. A database-level unique constraint can be considered later if we split manual eval cases from failure-derived eval cases.
- Keep UI changes local to the existing Failure Ops page and action component.

### Completion Record

- Implemented idempotent `POST /api/eval-cases` behavior for failure-derived Eval Cases.
- Added route-run ownership validation before creating an Eval Case.
- Updated Failure Ops actions to show Eval Case count and disable duplicate generation.
- Added duplicate Eval Case coverage to `npm run test:smoke`.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.

## 2026-05-05 - v0.1.2 Eval Ops Plan

### Goal

Turn the Eval Cases list from a read-only inventory into a small operational workbench. After Failure Cards are converted into Eval Cases, users need to filter active samples and retire or reactivate samples without editing the database.

### Scope

- Add `PATCH /api/eval-cases/[id]` for status updates.
- Add status filtering to `/evals`.
- Add per-row Eval Case actions for status changes.
- Show failure metadata and scoring rubric details where available.
- Extend smoke test to update an Eval Case status.
- Bump package version from `0.1.1` to `0.1.2`.

### Acceptance Criteria

- `/evals?status=ACTIVE` lists only active Eval Cases.
- An Eval Case can be changed between `ACTIVE`, `PAUSED`, and `RETIRED` from the UI.
- `PATCH /api/eval-cases/[id]` rejects unsupported statuses.
- Smoke test covers Eval Case status update.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `PATCH /api/eval-cases/[id]` with status validation.
- Added `/evals` status filtering.
- Added Eval Case row actions for `ACTIVE`, `PAUSED`, and `RETIRED`.
- Displayed source failure metadata and scoring rubric notes on Eval Cases.
- Extended `npm run test:smoke` to validate Eval Case status updates.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.

## 2026-05-05 - v0.1.3 Quality Health Dashboard Plan

### Goal

Make Dashboard useful as a quality-control entry point, not only a volume summary. The current R1 loop now has quality checks, Failure Cards, and Eval Cases, but Dashboard does not expose quality risk or regression coverage at a glance.

### Scope

- Add shared helpers for parsing RouteRun `qualityJson` safely.
- Show blocking quality run count on Dashboard.
- Show Open Failure Card count and Active Eval Case count on Dashboard.
- Add a compact Quality Health section with direct links to the right workbench.
- Show per-run quality status in the recent task list.
- Bump package version from `0.1.2` to `0.1.3`.

### Acceptance Criteria

- Dashboard surfaces quality blockers without opening individual runs.
- Recent tasks show whether quality checks passed, have blockers, or are not generated yet.
- Invalid or missing `qualityJson` does not crash Dashboard.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `lib/quality-report.ts` for safe quality report parsing and status labels.
- Added Dashboard quality metrics for blocking runs, Open Failures, and Active Evals.
- Added a compact Quality Health section with links into Failure Ops and Evals.
- Added per-run quality badges in the recent task list.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.

## 2026-05-05 - v0.1.4 Memory Library Plan

### Goal

Make Memory Objects usable beyond an individual RouteRun. R1 generation already writes `memoryCandidates` into `MemoryObject`, but users cannot browse, filter, or revisit accumulated memory across meetings.

### Scope

- Add `/memory` page for all Memory Objects.
- Add type filtering for `COMPANY`, `PERSON`, `EVENT`, `THESIS`, and `ACTION`.
- Add Memory navigation to `AppShell`.
- Add Dashboard memory count and link to the Memory Library.
- Show source RouteRun links for each Memory Object.
- Bump package version from `0.1.3` to `0.1.4`.

### Acceptance Criteria

- `/memory` lists all Memory Objects ordered by newest first.
- `/memory?type=EVENT` filters by memory type.
- Each Memory Object links back to its source RouteRun.
- Dashboard exposes total Memory Object count.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `/memory` Memory Library page with type filtering.
- Added Memory navigation to `AppShell`.
- Added Dashboard Memory Object count and link to Memory Library.
- Added source RouteRun links for each Memory Object.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.
