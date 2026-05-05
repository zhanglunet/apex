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
