---
slug: folder-picker-clear-search
title: 'Folders: Add clear action to folder picker search'
status: draft
change_type: feature
stack: frontend
requested_by: support
delivery_policy: auto-draft-on-green
created_at: '2026-08-25T00:00:00Z'
approved_at:
approved_by:
verify_passed: false
pr_url:
head_sha:
in_bounds:
  - public/app/core/components/NestedFolderPicker/NestedFolderPicker.tsx
  - public/app/core/components/NestedFolderPicker/NestedFolderPicker.test.tsx
  - public/locales/en-US/grafana.json
  - e2e-playwright/dashboards-suite/folder-picker-clear-search.spec.ts
out_of_bounds:
  - public/app/core/components/NestedFolderPicker/useTreeInteractions.ts
  - packages/grafana-ui/**
---

# Example change contract: folder picker clear search

> This is an illustrative draft, not rehearsal evidence. A fresh Plan Mode run
> must rediscover and approve its contents before implementation.

## What you are approving

### Outcome

- **Who is affected:** People choosing a folder while saving or moving a dashboard.
- **Problem:** Search replaces the browse tree and returning requires manually deleting the query.
- **User-visible outcome:** One clear action restores the full tree while search remains focused.
- **Success signal:** The query is empty, the browse root returns, focus stays in search, and the action disappears.

### Decisions

| Decision       | Why it matters                                     | Options considered                         | Agent assessment and recommendation                                               | Your choice         |
| -------------- | -------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- | ------------------- |
| Clear control  | Discoverability versus input space                 | Button, IconButton, clickable Icon         | IconButton: compact semantic control; do not copy clickable Icon                  | IconButton          |
| Keyboard scope | Changes accessibility behavior in every host       | Change Tab behavior or preserve it         | Preserve: keyboard traversal is a separate, broader contract                      | Preserve            |
| Evidence tier  | Affects review confidence and future maintenance   | Unit only, unit + walkthrough, focused E2E | Unit + walkthrough: behavior is deterministic; host layout needs one visual check | Unit + walkthrough  |
| Rollout        | Affects release overhead and rollback              | Feature toggle or direct                   | Direct: additive local UI, no persistence/API/migration, easy revert              | Direct              |
| Draft delivery | Controls whether implementation pauses before push | Auto-draft on green or manual approval     | Auto-draft: every required check and AC review must pass; feature branch only     | Auto-draft on green |

### Risk and rollout assessment

| Signal                    | Finding                                     | Meaning                                   |
| ------------------------- | ------------------------------------------- | ----------------------------------------- |
| User reach                | Shared picker across several flows          | Broad visibility, but one bounded control |
| Data/persistence          | None                                        | No migration or corruption risk           |
| API/schema/security       | None                                        | Frontend-only release                     |
| Interaction/accessibility | Adds pointer control; Tab remains unchanged | No existing keyboard behavior changes     |
| Verification confidence   | Unit-observable plus real-host walkthrough  | Small evidence gap, closed manually       |
| Rollback                  | Revert one feature commit                   | Easy rollback                             |
| Owner rollout policy      | No staged-rollout precedent found           | Direct release unless owner objects       |

**Technical risk classification:** low

**Rollout recommendation:** direct

### Scope and non-goals

- **In scope:** Existing search input suffix, co-located behavior tests, generated locale key.
- **Not in scope:** Tab behavior, shared `@grafana/ui`, new selectors, or other pickers.

### Evidence promise

- **Deterministic:** Named red test, targeted Jest, lint, format, and i18n.
- **Manual:** Save-drawer walkthrough showing clear, restored tree, and focus.
- **CI authority:** Current frontend, i18n, and owner-gated workflows.
- **Approval effect:** Build starts test-first implementation. Auto-draft on
  green pre-authorizes a feature-branch draft PR after every required gate
  passes.

The approved Cursor plan remains the review baseline. Tactical implementation
deviations are logged against it. Only an outcome, acceptance, non-goal, or
material-risk change requires a human-approved amendment.

---

## Engineering appendix

### A. Discovery packet

| Field                   | Finding                                                                                                | Repository evidence                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Landing zone and symbol | Open-state search `Input` in `NestedFolderPicker`                                                      | `public/app/core/components/NestedFolderPicker/NestedFolderPicker.tsx`                                                                                       |
| Source files            | Picker component only                                                                                  | `public/app/core/components/NestedFolderPicker/NestedFolderPicker.tsx`                                                                                       |
| Test files              | Extend the co-located test                                                                             | `public/app/core/components/NestedFolderPicker/NestedFolderPicker.test.tsx`                                                                                  |
| Instructions            | Root guidance; no scoped core instructions                                                             | `AGENTS.md`                                                                                                                                                  |
| Exemplars               | Two existing clear-search controls disagree on control type                                            | `packages/grafana-ui/src/components/FilterInput/FilterInput.tsx`, `public/app/features/dashboard/components/TransformationsEditor/TransformationsEditor.tsx` |
| Test helpers            | Existing render helper and mock server; exact search fixture must be confirmed before plan publication | co-located test and test-utils imports                                                                                                                       |
| Ownership               | Frontend navigation                                                                                    | `.github/CODEOWNERS`                                                                                                                                         |
| Skills                  | Conventions, frontend testing, and selector reuse                                                      | `grafana-conventions`, `frontend-testing-strategy`, `add-e2e-selectors`                                                                                      |
| Targeted commands       | Co-located Jest, ESLint, and i18n extraction                                                           | section 6                                                                                                                                                    |
| Typecheck required      | no                                                                                                     | No public type, selector, or cast change                                                                                                                     |
| Verified at             | Record the current base SHA during a real Plan run                                                     | `git rev-parse HEAD`                                                                                                                                         |
| Unresolved              | None                                                                                                   | decisions above                                                                                                                                              |

### B. Scope bounds

Only the frontmatter paths are approved. Changing keyboard traversal or
`@grafana/ui` is a separate contract.

### C. Acceptance criteria

1. [ ] `verify:test` — clearing empties the search value.
2. [ ] `verify:test` — focus returns to the search input.
3. [ ] `verify:test` — the clear action appears only for non-empty search.
4. [ ] `verify:test` — clearing restores the browse-only `Dashboards` root.
5. [ ] `manual` — the same flow works in the dashboard Save drawer.

### D. Reproduction and evidence commands

```bash
yarn jest public/app/core/components/NestedFolderPicker/NestedFolderPicker.test.tsx --watchAll=false
yarn eslint --no-error-on-unmatched-pattern \
  public/app/core/components/NestedFolderPicker/NestedFolderPicker.tsx \
  public/app/core/components/NestedFolderPicker/NestedFolderPicker.test.tsx
yarn i18n-extract
```

The baseline-red output must name the new test and show that the accessible
Clear search action is absent.

### E. Risk and rollback

Risk is limited to the folder-picker overlay. Revert the feature commit to
restore current behavior. No security review trigger or feature toggle is
expected.

### F. Assumptions

| Assumption                                                            | Level       | How to verify                                   |
| --------------------------------------------------------------------- | ----------- | ----------------------------------------------- |
| Existing search tests can await the debounce without console warnings | `must-hold` | Run targeted Jest twice and once with `CI=true` |
| The Save drawer exposes this picker in a focused Playwright flow      | `assumed`   | Rehearse against a pre-warmed server            |

### G. Implementation handoff

After Build, load `grafana-implementation`, the frontend testing skill, and the
conventions frontend reference. Create the feature branch from the fork's
updated `main`. Generate i18n output before the implementation commit.

### H. Outcome and acceptance review

| Plan item               | Result  | Evidence                      |
| ----------------------- | ------- | ----------------------------- |
| Original outcome        | pending | final walkthrough             |
| Clear empties search    | pending | targeted Jest                 |
| Focus remains in search | pending | targeted Jest and walkthrough |
| Browse root returns     | pending | targeted Jest and walkthrough |
| Non-goals               | pending | changed-files review          |

**Implementation deviations:** none yet

**Approved amendments:** none

### I. Post-PR log

- PR URL:
- Head SHA:
