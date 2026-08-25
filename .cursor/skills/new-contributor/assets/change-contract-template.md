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

## What you are approving

### Outcome

- **Who is affected:**
- **Problem:**
- **User-visible outcome:**
- **Success signal:**

### Decisions

Every row must be resolved before CreatePlan.

| Decision | Options considered | Recommendation | Your choice | Why |
| -------- | ------------------ | -------------- | ----------- | --- |
|          |                    |                |             |     |

### Scope and non-goals

- **In scope:**
- **Not in scope:**

### Evidence promise

- **Deterministic evidence:**
- **Browser/manual evidence:**
- **CI authority:**
- **Rollout choice:**

### Approval effect

Clicking **Build** approves this complete contract and starts test-first
implementation. It does not approve commit push, PR readiness, or merge.

---

## Engineering appendix

### A. Discovery packet

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

### B. Machine-readable scope bounds

The frontmatter globs are consumed by verification.

**In bounds:**

- `<approved path or behavior>`

**Out of bounds:**

- `<excluded path or behavior>`

### C. Acceptance criteria

1. [ ] `verify:test` —
2. [ ] `verify:test` —
3. [ ] `manual` —

### D. Reproduction and evidence commands

```bash
# Exact targeted commands QA can repeat.
```

**Baseline-red assertion to observe:**

**Manual evidence:**

### E. Risk and rollback

**User-visible risk:**

**Security review trigger:** none

**Rollback:**

### F. Assumptions

| Assumption | Level       | How to verify |
| ---------- | ----------- | ------------- |
|            | `must-hold` |               |

### G. Implementation handoff

**Branch:**

**Base:**

**Approved files:**

**Required skills:**

**Done:**

**Remaining:**

### H. Post-PR log

Populate only stable join keys. Derive CI and review outcomes from GitHub later.

- PR URL:
- Head SHA:
