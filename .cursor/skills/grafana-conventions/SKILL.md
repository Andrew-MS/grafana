---
name: grafana-conventions
description: Resolve a Grafana path to its current instructions, owners, test patterns, exemplars, skills, and likely checks. Use during Discover and consume its packet during implementation.
---

# Grafana conventions

This skill is an index and resolver, not a source of truth. Current scoped
instructions, code, tests, CODEOWNERS, and workflows remain authoritative.

## Discover procedure

1. Start with candidate paths from the product outcome.
2. Read `references/convention-map.md` to locate likely authorities.
3. Read the nearest applicable `AGENTS.md`.
4. Confirm ownership in `.github/CODEOWNERS`.
5. Read the source, co-located test, and at most two current exemplars.
6. Confirm likely checks from `.github/actions/change-detection/action.yml` and
   current workflow guards.
7. Read exactly one stack reference:
   - Frontend: `references/frontend.md`
   - Backend: `references/backend.md`
   - Both: read both and recommend `/split-to-prs`.
8. Return the structured discovery packet required by the change-contract
   template.

## Search stopping conditions

Stop when the packet names:

- landing zone and target symbols;
- source and test paths;
- nearest instructions and current guides;
- no more than two exemplars;
- test helpers or fixtures;
- owner and current checks;
- skills and exact targeted commands;
- base SHA and any explicitly unresolved question.

Use one readonly `convention-resolver` subagent. Do not repeat its broad searches
in the parent. Repo-wide search is allowed only for a named unresolved field.

## During implementation

Read the approved packet and its named files. Do not rerun Discover unless a
file is missing, the base SHA changed materially, or runtime evidence
contradicts the packet. Record the contradiction and reopen Discover instead of
silently broadening the search.
