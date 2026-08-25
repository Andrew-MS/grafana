---
slug: folder-picker-clear-search
title: "Folders: Add clear action to folder picker search"
status: draft
change_type: feature
stack: frontend
requested_by: support
created_at: "2026-08-25T00:00:00Z"
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

## 1. Outcome

People searching for a folder can return to browsing the full folder tree with
one action. The search remains focused so they can immediately type again.

Non-goal: changing the overlay's Tab-key behavior or making the new pointer
action keyboard-reachable.

## 2. Discovery evidence

| Question | Finding | Repository evidence |
|---|---|---|
| Landing zone | Existing folder-picker search input | `public/app/core/components/NestedFolderPicker/NestedFolderPicker.tsx` |
| Instructions | Root guidance; no scoped core instructions | `AGENTS.md` |
| Exemplars | Existing clear-search controls disagree on control type | `packages/grafana-ui/src/components/FilterInput/FilterInput.tsx`, `public/app/features/dashboard/components/TransformationsEditor/TransformationsEditor.tsx` |
| Test location | Extend the co-located test | `public/app/core/components/NestedFolderPicker/NestedFolderPicker.test.tsx` |
| Ownership | Frontend navigation | `.github/CODEOWNERS` |
| Skills | Frontend testing; inspect selector rules but reuse existing selectors | `frontend-testing-strategy`, `add-e2e-selectors` |

## 3. Tradeoff decision

Choose a semantic `Button` or `IconButton` after comparing the existing
exemplars. Do not copy the sibling clickable `Icon` accessibility pattern.

## 4. Scope bounds

Only the frontmatter paths are approved. Changing keyboard traversal or
`@grafana/ui` is a separate contract.

## 5. Acceptance criteria

1. [ ] `verify:test` — clearing empties the search value.
2. [ ] `verify:test` — focus returns to the search input.
3. [ ] `verify:test` — the clear action appears only for non-empty search.
4. [ ] `verify:test` — clearing restores the browse-only `Dashboards` root.
5. [ ] `manual` — the same flow works in the dashboard Save drawer.

## 6. Reproduction and evidence commands

```bash
yarn jest public/app/core/components/NestedFolderPicker/NestedFolderPicker.test.tsx --watchAll=false
yarn eslint --no-error-on-unmatched-pattern \
  public/app/core/components/NestedFolderPicker/NestedFolderPicker.tsx \
  public/app/core/components/NestedFolderPicker/NestedFolderPicker.test.tsx
yarn i18n-extract
```

The baseline-red output must name the new test and show that the accessible
Clear search action is absent.

## 7. Risk and rollback

Risk is limited to the folder-picker overlay. Revert the feature commit to
restore current behavior. No security review trigger or feature toggle is
expected.

## 8. Assumptions

| Assumption | Level | How to verify |
|---|---|---|
| Existing search tests can await the debounce without console warnings | `must-hold` | Run targeted Jest twice and once with `CI=true` |
| The Save drawer exposes this picker in a focused Playwright flow | `assumed` | Rehearse against a pre-warmed server |

## 9. Implementation handoff

Create the feature branch from the fork's updated `main`. Load the frontend
testing skill and the first-PR frontend reference. Generate i18n output before
the implementation commit.

## 10. Post-PR log

- PR URL:
- Head SHA:
