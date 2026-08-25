---
slug: change-slug
title: 'Area: Describe the user-visible change'
status: draft
change_type: feature
stack: frontend
requested_by: pm
created_at: 'YYYY-MM-DDTHH:MM:SSZ'
approved_at:
approved_by:
verify_passed: false
pr_url:
head_sha:
in_bounds:
  - path/to/allowed/**
out_of_bounds:
  - path/to/excluded/**
---

# Change contract: change-slug

## 1. Outcome

**User and problem:**

**User-visible outcome:**

**Success signal:**

**Non-goals:**

## 2. Discovery evidence

This packet is the cache consumed by implementation. Leave no unresolved field
unless it is explicitly named and approved.

| Field                     | Finding | Repository evidence           |
| ------------------------- | ------- | ----------------------------- |
| Landing zone              |         | `<source-file>`               |
| Target symbols            |         | `<symbol names>`              |
| Source files              |         | `<source paths>`              |
| Test files                |         | `<test paths>`                |
| Nearest instructions      |         | `<nearest-instructions>`      |
| Authoritative guides      |         | `<authoritative-guides>`      |
| Exemplars (maximum two)   |         | `<exemplar-files>`            |
| Test helpers and fixtures |         | `<helper symbols and paths>`  |
| CODEOWNERS                |         | `.github/CODEOWNERS`          |
| Current checks            |         | `.github/workflows/...`       |
| Skills to load            |         | `<skill names>`               |
| Exact targeted commands   |         | `<commands>`                  |
| Verified at               |         | `<base SHA>`                  |
| Unresolved questions      | `none`  | `<question and search scope>` |

## 3. Tradeoff decision

| Option | Benefit | Cost or risk |
| ------ | ------- | ------------ |
| A      |         |              |
| B      |         |              |

**Recommendation:**

**Human decision:**

**What would change this decision:**

**Evidence tier decision:** unit / integration / focused E2E / walkthrough

## 4. Scope bounds

The frontmatter globs are machine-readable.

**In bounds:**

- `<approved path or behavior>`

**Out of bounds:**

- `<excluded path or behavior>`

## 5. Acceptance criteria

1. [ ] `verify:test` —
2. [ ] `verify:test` —
3. [ ] `manual` —

## 6. Reproduction and evidence commands

```bash
# Exact targeted commands QA can repeat.
```

**Baseline-red assertion to observe:**

**Manual evidence:**

## 7. Risk and rollback

**User-visible risk:**

**Security review trigger:** none

**Rollback:**

## 8. Assumptions

| Assumption | Level       | How to verify |
| ---------- | ----------- | ------------- |
|            | `must-hold` |               |

## 9. Implementation handoff

**Branch:**

**Base:**

**Approved files:**

**Required skills:**

**Done:**

**Remaining:**

## 10. Post-PR log

Populate only stable join keys. Derive CI and review outcomes from GitHub later.

- PR URL:
- Head SHA:
