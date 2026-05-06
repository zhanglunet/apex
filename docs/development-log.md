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

## 2026-05-05 - v0.1.5 Workbench Smoke Coverage Plan

### Goal

Increase confidence in continuous iteration by extending smoke tests beyond API workflow checks. The app now has multiple workbench pages, and a small UI routing regression should be caught before release.

### Scope

- Add smoke assertions for page availability.
- Cover `/dashboard`, `/inbox`, `/runs/[id]`, `/failure-ops`, `/evals`, and `/memory`.
- Cover filtered workbench URLs such as `/failure-ops?status=OPEN`, `/evals?status=PAUSED`, and `/memory?type=EVENT`.
- Keep tests lightweight HTTP checks, not browser automation.
- Bump package version from `0.1.4` to `0.1.5`.

### Acceptance Criteria

- Smoke test fails if any core workbench page returns non-OK.
- Smoke test logs each page check.
- Existing API workflow checks still pass.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added lightweight page availability checks to `scripts/smoke-test.ts`.
- Covered Dashboard, Inbox, Run Detail, Failure Ops, Evals, and Memory Library.
- Covered filtered URLs for Failure Ops, Evals, and Memory Library.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.

## 2026-05-05 - v0.1.6 API Input Guard Plan

### Goal

Prevent low-quality or invalid records from entering the R1 quality loop. Failure Cards and saved revisions become downstream Eval Cases and quality history, so API endpoints should reject empty descriptions, empty saved output, and unsupported enum-like values.

### Scope

- Add small shared validation helpers for allowed values and required text.
- Validate Failure Card `failureType`, `severity`, and `description`.
- Validate saved RouteRun `editedOutput`.
- Validate Failure Card status updates.
- Extend smoke test with negative API assertions.
- Bump package version from `0.1.5` to `0.1.6`.

### Acceptance Criteria

- Empty Failure Card descriptions return HTTP 400.
- Unsupported Failure Card severity/status values return HTTP 400.
- Empty RouteRun edited output returns HTTP 400.
- Existing happy-path smoke workflow still passes.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `lib/validation.ts` with shared text and enum-like value guards.
- Added Failure Card creation validation for type, severity, and description.
- Added Failure Card status update validation.
- Added RouteRun edited output validation.
- Extended smoke test with negative API assertions for empty and invalid inputs.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.

## 2026-05-05 - v0.1.7 Runs Workbench Plan

### Goal

Add a full RouteRun workbench. Users can currently reach only recent runs from Dashboard or runs attached to uploaded files in Inbox, which makes older reviewed work hard to find during continuous use.

### Scope

- Add `/runs` page listing all RouteRuns.
- Add status filtering for `DRAFT`, `GENERATING`, `READY`, and `REVIEWED`.
- Show source filename, updated time, and quality status for each run.
- Add Runs navigation to `AppShell`.
- Link Dashboard Route Runs stat to `/runs`.
- Extend smoke test to check `/runs` and `/runs?status=REVIEWED`.
- Bump package version from `0.1.6` to `0.1.7`.

### Acceptance Criteria

- `/runs` lists RouteRuns newest first.
- `/runs?status=REVIEWED` filters reviewed runs.
- Each row links to the Run Detail page.
- Quality labels reuse the shared quality report helper.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `/runs` RouteRun workbench with status filtering.
- Added Runs navigation to `AppShell`.
- Linked Dashboard stats into their relevant workbenches.
- Reused shared quality labels in the RouteRun list.
- Extended smoke test to check `/runs` and `/runs?status=REVIEWED`.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.

## 2026-05-05 - v0.1.8 Export Guard Plan

### Goal

Harden Markdown export so the system does not create empty export files or return unclear server errors for bad requests. Exported Markdown is a handoff artifact, so it should only be created when a RouteRun has real output.

### Scope

- Validate `routeRunId` in `/api/export`.
- Return HTTP 400 when a run has no generated or edited output.
- Return HTTP 404 when the target RouteRun does not exist.
- Keep successful export behavior unchanged.
- Extend smoke test with negative export assertions.
- Bump package version from `0.1.7` to `0.1.8`.

### Acceptance Criteria

- Missing `routeRunId` returns HTTP 400.
- Exporting a draft run with no output returns HTTP 400.
- Exporting a valid reviewed run still returns Markdown content.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added request validation to `/api/export`.
- Added explicit 404 handling for missing RouteRuns.
- Added export content validation to prevent empty Markdown exports.
- Extended smoke test with missing id and empty output export assertions.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.

## 2026-05-05 - v0.1.9 Safe Quality Panel Plan

### Goal

Make Run Detail resilient to malformed historical `qualityJson`. Dashboard and Runs already use a safe quality parser, but RunEditor still calls `JSON.parse` directly and can crash the page if stored quality data is invalid.

### Scope

- Reuse `parseQualityReport` in `RunEditor`.
- Remove the local duplicate `QualityReport` type from `RunEditor`.
- Keep Quality Panel behavior unchanged for valid reports.
- Treat invalid or missing quality data as not generated.
- Bump package version from `0.1.8` to `0.1.9`.

### Acceptance Criteria

- Run Detail does not throw when `qualityJson` is malformed.
- Valid Quality Panel reports render as before.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Updated `RunEditor` to use `parseQualityReport`.
- Removed duplicate local Quality Report typing from the client component.
- Kept Quality Panel rendering unchanged for valid reports.
- Verified `npm run build` on 2026-05-05.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-05.

## 2026-05-06 - v0.1.10 README Release Notes Plan

### Goal

Keep public project documentation readable as autonomous iteration continues. The README currently stores release progress as one long sentence, which is hard to scan and easy to damage during future updates.

### Scope

- Replace the long inline V1.1 release sentence with a compact Release Notes table.
- Keep the detailed development history in `docs/development-log.md`.
- Bump package version from `0.1.9` to `0.1.10`.

### Acceptance Criteria

- README shows `v0.1.1` through `v0.1.10` as table rows.
- The stage status remains clear and references `docs/development-log.md`.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Replaced the long inline V1.1 version sentence with a Release Notes table.
- Added `v0.1.10` to README release history.
- Kept detailed iteration records in this development log.
- Verified `npm run build` on 2026-05-06.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-06.

## 2026-05-06 - v0.1.11 Health Endpoint Plan

### Goal

Add a lightweight operational health endpoint for local development and future deployment checks. The app now has enough moving parts that a single endpoint should confirm the service version and database connectivity.

### Scope

- Add `GET /api/health`.
- Return package version, status, timestamp, and core table counts.
- Include health endpoint in smoke test.
- Bump package version from `0.1.10` to `0.1.11`.

### Acceptance Criteria

- `/api/health` returns HTTP 200 when database access works.
- Response includes `version`, `status`, and object counts.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `GET /api/health`.
- Returned package version, status, timestamp, and core object counts.
- Added health endpoint coverage to smoke test.
- Verified `npm run build` on 2026-05-06.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-06.

## 2026-05-06 - v0.1.12 Evidence Model Plan

### Goal

Start V1.2 Evidence Layer by adding the EvidenceItem data model and deterministic extraction helper. This prepares the codebase for writing evidence objects during R1 generation without changing runtime behavior in the same patch.

### Scope

- Add `EvidenceItem` to Prisma schema.
- Add `EvidenceItem` table and indexes to `prisma/init.sql`.
- Add `lib/evidence.ts` with Evidence section/status types.
- Add deterministic evidence classification and extraction from `MeetingJson`.
- Bump package version from `0.1.11` to `0.1.12`.

### Acceptance Criteria

- Prisma schema contains `EvidenceItem` and `RouteRun.evidenceItems`.
- `prisma/init.sql` can create the EvidenceItem table.
- Evidence helper classifies `SUPPORTED`, `WEAK`, and `MISSING` without LLM calls.
- `npm run build` passes.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `EvidenceItem` and `RouteRun.evidenceItems` to Prisma schema.
- Added EvidenceItem table and indexes to `prisma/init.sql`.
- Added `lib/evidence.ts` with deterministic Evidence extraction and classification.
- Verified `npm run db:generate` on 2026-05-06.
- Verified `npm run build` on 2026-05-06.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-06.

## 2026-05-06 - v0.1.13 Evidence Write Plan

### Goal

Connect Evidence extraction to the R1 generation flow. After this version, generated meeting output should create Evidence Items automatically, making V1.2 visible in persisted data instead of only helper code.

### Scope

- Run `extractEvidenceItems` inside `/api/generate`.
- Delete existing Evidence Items for a RouteRun before writing regenerated evidence.
- Create Evidence Items from key changes, action items, open questions, and quality warnings.
- Add Evidence Item count to `/api/health`.
- Extend smoke test to verify Evidence Items are created.
- Bump package version from `0.1.12` to `0.1.13`.

### Acceptance Criteria

- R1 generation creates Evidence Items.
- Re-generation replaces the run's Evidence Items instead of duplicating them.
- `/api/health` includes `counts.evidenceItems`.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Connected `extractEvidenceItems` to `/api/generate`.
- Regeneration now deletes old Evidence Items before writing new ones.
- Added Evidence Item count to `/api/health`.
- Extended smoke test to verify Evidence Items are created.
- Verified `npm run db:push` on 2026-05-06.
- Verified `npm run build` on 2026-05-06.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-06.

## 2026-05-06 - v0.1.14 Run Evidence Panel Plan

### Goal

Expose Evidence Items inside Run Detail so users can inspect the evidence status of a generated meeting output without leaving the task workspace.

### Scope

- Query Evidence Items in `app/runs/[id]/page.tsx`.
- Pass Evidence Items to `RunEditor`.
- Add Evidence Panel with SUPPORTED / WEAK / MISSING counts.
- Render claim, evidence text, section, status, and source hint.
- Bump package version from `0.1.13` to `0.1.14`.

### Acceptance Criteria

- Run Detail shows Evidence Panel for generated runs.
- Empty runs show a clear Evidence empty state.
- Evidence status is visually distinct.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Run Detail now queries Evidence Items.
- `RunEditor` renders Evidence Panel with status counts.
- Evidence cards show section, status, claim, evidence text, and source hint.
- Verified `npm run build` on 2026-05-06.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-06.

## 2026-05-06 - v0.1.15 Evidence Workbench Plan

### Goal

Add an Evidence Workbench so evidence gaps can be reviewed across all R1 runs instead of only inside a single Run Detail page.

### Scope

- Add `/evidence` page.
- Support status and section filters.
- Add Evidence navigation to `AppShell`.
- Add Evidence health metrics to Dashboard.
- Extend smoke test to cover Evidence routes.
- Bump package version from `0.1.14` to `0.1.15`.

### Acceptance Criteria

- `/evidence` lists Evidence Items newest first.
- `/evidence?status=MISSING` filters missing evidence.
- `/evidence?section=ACTION_ITEM` filters by section.
- Dashboard links to Evidence health filters.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `/evidence` Evidence Workbench with status and section filters.
- Added Evidence navigation to `AppShell`.
- Added Dashboard Evidence health metrics and filter links.
- Extended smoke test to cover Evidence routes.
- Verified `npm run build` on 2026-05-06.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-06.

## 2026-05-06 - v0.1.16 Evidence Failure Loop Plan

### Goal

Connect Evidence gaps to the existing Failure Ops loop. Missing or weak evidence should not remain a read-only warning; it should be convertible into a Failure Card for review and eventual Eval Case creation.

### Scope

- Add `GET /api/evidence` for smoke and future integrations.
- Add `POST /api/evidence/[id]/failure-card`.
- Add Evidence Workbench action to create a Failure Card from WEAK or MISSING evidence.
- Extend smoke test to create a Failure Card from a missing Evidence Item.
- Bump package version from `0.1.15` to `0.1.16`.

### Acceptance Criteria

- Missing Evidence Items can create Failure Cards.
- Created Failure Cards use `MISSING_EVIDENCE`.
- Evidence API can filter by status.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `GET /api/evidence` with status and section filters.
- Added `POST /api/evidence/[id]/failure-card`.
- Added Evidence Workbench action for creating Failure Cards from evidence gaps.
- Extended smoke test to create a Failure Card from a missing Evidence Item.
- Verified `npm run build` on 2026-05-06.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-06.

## 2026-05-06 - v0.1.17 V1.2 Release Notes Plan

### Goal

Package the V1.2 Evidence Layer iteration into clear documentation so the product direction, delivered capabilities, validation scope, and next-stage recommendations are easy to review.

### Scope

- Add `docs/v1.2-release-notes.md`.
- Update README Release Notes with `v0.1.17`.
- Link the new release notes from README.
- Bump package version from `0.1.16` to `0.1.17`.

### Acceptance Criteria

- V1.2 release notes summarize `v0.1.12` through `v0.1.17`.
- README links to the release notes.
- `npm run build` and `npm run test:smoke` pass.
- The release is committed, tagged, and pushed to `https://github.com/zhanglunet/apex`.

### Completion Record

- Added `docs/v1.2-release-notes.md`.
- Added `v0.1.17` to README Release Notes.
- Linked V1.2 release notes from README.
- Verified `npm run build` on 2026-05-06.
- Verified `APP_URL=http://localhost:3001 npm run test:smoke` on 2026-05-06.
