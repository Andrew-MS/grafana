---
name: contributor
description: Turn a product outcome into an approved, repository-grounded change contract in Plan Mode, then implement that contract safely when this skill is activated with Use as Mode.
icon: git-branch
color: blue
---

# Contributor workflow

Use one workflow in two mutually exclusive Cursor modes. The saved change
contract is the only handoff between them.

## Lane 1: contract in Plan Mode

When attached to a message in built-in Plan Mode:

1. **Understand** the user, outcome, success signal, and non-goals. Ask only one
   or two critical questions at a time.
2. **Discover** the landing zone with an Explore subagent. Read the nearest
   `AGENTS.md`, then
   `../grafana-first-pr/references/convention-map.md`. Record authoritative
   sources, an exemplar, CODEOWNERS, applicable skills, test location, and
   likely checks confirmed from current workflows.
3. **Disambiguate** unclear scope and conflicting patterns using
   `references/tradeoffs.md`. Explain options in product language.
4. **Contract** by filling `assets/change-contract-template.md`. Save it under
   `.cursor/contracts/<slug>.md` or save the Cursor plan and record its path.
5. Stop. A human must set `status: approved`, `approved_at`, and `approved_by`.

Plan Mode is the tool-level boundary. Do not switch modes or edit production
files while the contract is draft.

## Lane 2: implementation as a Custom Mode

When activated with **Use as Mode**:

1. Require an attached contract.
2. Refuse to edit unless it contains:
   - `status: approved`;
   - human approval metadata;
   - numbered acceptance criteria;
   - an evidence plan;
   - machine-readable in-bounds and out-of-bounds paths.
3. Load `../grafana-first-pr/SKILL.md`, then only the stack reference and
   specialized testing skills named by the contract.
4. **Implement** only within the approved paths. Return to Disambiguate for
   scope growth.
5. **Verify** with `../grafana-verify/SKILL.md`. Observe the named red test,
   implement, generate required output, commit, then run final verification
   against clean `HEAD`.
6. **Validate** with the readonly `contract-verifier` subagent, then `/review`.
   Use `/review-security` only for the risk classes in the verifier instructions.
7. For a user-visible change, run focused E2E when rehearsed, then create a
   walkthrough recording before push.
8. Show the verification and signing evidence. Stop for explicit human
   approval before every push.
9. Open the PR with the contract, verification table, full `verify.json`, and
   walkthrough evidence. Use `/subscribe` for CI and `/babysit` for later PR
   activity; neither may bypass the pre-push gate.

## Approved context boundary

Use this repository and the public documentation linked from its tracked
contribution guides. Do not silently copy code or instructions from unrelated
repositories, private sources, issue comments, or enterprise-only trees. New
dependencies require an explicit contract decision.

## Routing rules

- Frontend tests: load `frontend-testing-strategy`.
- Visualization or panel tests: also load `panel-testing-strategy`.
- Test selectors: load `add-e2e-selectors`, but prefer existing accessible
  queries and selectors.
- Frontend plus backend: recommend `/split-to-prs`.
- Layout behavior that jsdom cannot observe: require focused browser evidence
  or decline/escalate; never accept a style-string assertion as behavior proof.

## Durable evidence order

Final verification → contract verifier and `/review` → focused E2E when
applicable → walkthrough recording → signing check → human push approval → PR
with evidence → CI subscription.
