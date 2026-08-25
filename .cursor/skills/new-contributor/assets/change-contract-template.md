---
slug: change-slug
title: 'Area: Describe the user-visible change'
status: draft
change_type: feature
stack: frontend
requested_by: pm
delivery_policy: auto-draft-on-green
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

| Decision | Why it matters | Options considered | Agent assessment and recommendation | Your choice |
| -------- | -------------- | ------------------ | ----------------------------------- | ----------- |
|          |                |                    |                                     |             |

### Risk and rollout assessment

The agent fills this from repository evidence. The user is not expected to
classify technical risk.

| Signal                    | Finding | Meaning |
| ------------------------- | ------- | ------- |
| User reach                |         |         |
| Data/persistence          |         |         |
| API/schema/security       |         |         |
| Interaction/accessibility |         |         |
| Verification confidence   |         |         |
| Rollback                  |         |         |
| Owner rollout policy      |         |         |

**Technical risk classification:** low / medium / high

**Rollout recommendation:** direct / feature toggle / owner confirmation required

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
implementation through `grafana-implementation`. It does not approve commit
push unless `delivery_policy` is `auto-draft-on-green`. That policy authorizes
only a feature-branch push and draft PR after every required gate passes. It
never authorizes pushing `main`, marking ready, or merge.

The approved Cursor plan is the review baseline. Tactical implementation
deviations are allowed when documented below and the outcome, acceptance
criteria, and non-goals remain intact. Changes to those or to material
rollout/security risk require a human-approved amendment.

---

## Engineering appendix

### A. Discovery packet

This packet is the cache consumed by implementation. Leave no unresolved field
unless it is explicitly named and approved.

| Field                     | Finding  | Repository evidence           |
| ------------------------- | -------- | ----------------------------- |
| Landing zone              |          | `<source-file>`               |
| Target symbols            |          | `<symbol names>`              |
| Source files              |          | `<source paths>`              |
| Test files                |          | `<test paths>`                |
| Nearest instructions      |          | `<nearest-instructions>`      |
| Authoritative guides      |          | `<authoritative-guides>`      |
| Exemplars (maximum two)   |          | `<exemplar-files>`            |
| Test helpers and fixtures |          | `<helper symbols and paths>`  |
| CODEOWNERS                |          | `.github/CODEOWNERS`          |
| Current checks            |          | `.github/workflows/...`       |
| Skills to load            |          | `<skill names>`               |
| Exact targeted commands   |          | `<commands>`                  |
| Typecheck required        | no / yes | `<reason>`                    |
| Verified at               |          | `<base SHA>`                  |
| Unresolved questions      | `none`   | `<question and search scope>` |

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

`grafana-implementation` plus only the stack-specific skills named in the
discovery packet.

**Done:**

**Remaining:**

### H. Outcome and acceptance review

| Plan item              | Result                        | Evidence |
| ---------------------- | ----------------------------- | -------- |
| Original outcome       | met / partially met / not met |          |
| Acceptance criterion 1 | pass / fail                   |          |
| Non-goals              | respected / changed           |          |

**Implementation deviations:**

| Planned | Actual | Reason | Impact on outcome, evidence, risk, and non-goals |
| ------- | ------ | ------ | ------------------------------------------------ |
|         |        |        |                                                  |

**Approved amendments:** none

### I. Post-PR log

Populate only stable join keys. Derive CI and review outcomes from GitHub later.

- PR URL:
- Head SHA:
