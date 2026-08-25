---
name: grafana-first-pr
description: Prepare a small Grafana contribution using the repository's current conventions, ownership, test strategy, and PR requirements. Use after an approved change contract exists.
---

# Grafana first contribution

## Resolve the path before coding

1. Read `references/convention-map.md`.
2. Read the nearest applicable `AGENTS.md`.
3. Confirm ownership in `.github/CODEOWNERS`.
4. Open a current neighboring implementation and co-located test.
5. Confirm likely checks from `.github/actions/change-detection/action.yml` and
   the referenced workflow guards.
6. Record all findings in the approved contract.

Then read exactly one stack reference:

- Frontend: `references/frontend.md`
- Backend: `references/backend.md`
- Both: read both and recommend `/split-to-prs`.

Load specialized test and selector skills only when their trigger matches the
contract. Do not preload every guide.

## Contribution requirements

- Keep the diff inside the contract's allowed paths and focused on one outcome.
- Add meaningful tests for changed behavior. Observe the named test failing
  without the feature or fix, then passing with it.
- Use the repository's generated-file commands rather than editing generated
  output manually.
- A pre-GA or staged feature needs an explicit feature-toggle decision.
- Title the PR `<Area>: <Summary>`.
- Include `Fixes #<n>` only when the contract records an issue.
- Complete the repository PR template and include the contract and evidence.
- Do not submit translation-only changes.

## Before push

1. Run final verification against committed, clean `HEAD`.
2. Run the contract verifier and `/review`.
3. For security-sensitive paths, run `/review-security`.
4. Confirm the commit signature with `git verify-commit HEAD`; display it with
   `git log --show-signature -1`.
5. Explain that CLA status is checked by the PR bot and cannot be proven
   locally.
6. Show the human the complete summary and stop for explicit push approval.

Never let `/babysit` or another agent push a follow-up without the same approval.
