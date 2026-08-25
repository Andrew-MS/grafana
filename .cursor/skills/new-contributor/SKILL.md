---
name: new-contributor
description: Interview and guide a first-time contributor from product outcome through repository-grounded decisions, an approved Cursor plan, test-first implementation, evidence, review, and PR. Start in built-in Plan Mode and reload after Build.
icon: git-branch
color: blue
---

# New Contributor

Guide the user through the repository's end-to-end contribution experience.
Keep the user involved in consequential decisions rather than silently choosing
an implementation. Use built-in Plan Mode for phases 1–4, then the built-in
Build transition and Agent Mode for phases 5–8.

If invoked outside Plan Mode with only a product request and no approved Cursor
plan, do not explore or edit. Ask the user to switch to Plan Mode and attach
`/new-contributor`. A generic "complete the request" instruction never bypasses
this entry gate.

## Journey navigator

Start every user-facing response with:

```text
New Contributor journey: <phase-number>/8 — <phase>
Completed: <completed phases or "none">
Current: <what is happening now>
Need from you: <one decision or "nothing">
Next: <next phase and gate>
Code changed: yes|no
```

The phases are Understand, Discover, Disambiguate, Contract, Implement, Verify,
Review, and PR. Announce every transition. Never leave the user guessing whether
the agent is researching, waiting for a decision, editing, testing, recording,
or asking to push.

## Lane 1: contract in Plan Mode

When attached to a message in built-in Plan Mode:

1. **Understand** as an interview. Ask one or two product questions at a time:
   who experiences the problem, what outcome matters, how success is observed,
   and what is explicitly not required. If an AskQuestion tool is unavailable,
   ask directly in chat; CreatePlan is never a substitute for a question.
2. **Discover** with the readonly `convention-resolver` subagent and
   `../grafana-conventions/references/convention-map.md`. Require its structured
   discovery packet. Do not duplicate its repo-wide searches in the parent.
3. **Disambiguate** unclear scope and conflicting patterns using
   `references/tradeoffs.md`. Present one decision at a time in interview form:
   user impact, Option A/B, recommendation, cost/risk, and what would change the
   recommendation. Ask the user to choose or accept the recommendation. Evidence
   tier, control/API choice, scope, and rollout decisions may not remain blank.
4. **Contract** only after Understand, Discover, and Disambiguate are complete.
   First show a decision recap and confirm there are no unanswered questions.
   Call CreatePlan once. Put the human-facing approval summary at the top and
   the engineering discovery packet below it. The saved Cursor plan is the
   authoritative contract. Do not write `.cursor/contracts/` in Plan Mode and
   never ask the user to edit YAML.
5. Stop at the native plan approval UI. Clicking **Build** approves the complete
   plan for implementation but never approves a future push.

Plan Mode is the tool-level boundary. Do not switch modes or edit production
files while the contract is incomplete or unapproved.

## Lane 2: implementation after Build

When Cursor transitions to Agent Mode through **Build**, reload this skill. The
approved Cursor plan remains the task-specific contract.

1. Require the approved Cursor plan to be attached. Refuse to edit if it lacks
   a resolved discovery packet, human decisions, scope bounds, numbered
   acceptance criteria, and an evidence plan.
2. Materialize `.cursor/contracts/<slug>.md` automatically as a machine-readable
   projection of the approved plan. Record approval from the explicit handoff
   message; this file is not a second decision surface and the user never edits
   it.
3. Read only the files, symbols, instructions, exemplars, and skills named in
   the discovery packet. Do not repeat Discover. Search locally only when
   runtime evidence contradicts the packet; reopen Discover for stale or
   incomplete contracts.
4. Load `../grafana-conventions/SKILL.md`, then only the stack and specialized
   testing references named by the contract.
5. **Implement test-first.** Edit test files only. Run baseline verification and
   show the named expected assertion failure. Production edits are forbidden
   until that evidence exists.
6. Implement only within approved paths. Return to Disambiguate for scope or
   evidence-tier changes.
7. Generate required output, commit, and run final verification against clean
   `HEAD`.
8. **Review** with the readonly `contract-verifier`. Use `/review` before push
   only when the user requests local source review. After human push approval,
   open a draft PR and use BugBot as the default source reviewer before asking
   humans to review. Use `/review-security` only for the verifier's risk classes.
9. For a user-visible change, run the approved browser evidence and create the
   walkthrough recording in the same agent that owns the browser and recording
   state. Do not hand off an active recording.
10. Show final verification, signature, BugBot plan, and walkthrough evidence.
    Ask a new, explicit push question. Contract or implementation approval never
    counts as push approval. No subagent or `/babysit` may infer it.
11. After approval, push and open the draft PR with the contract, verification
    table, full `verify.json`, and walkthrough evidence. Use `/subscribe` for CI
    and `/babysit` for later activity; every additional push needs approval.

## Search budget

Discover uses this escalation order:

1. target directory;
2. matching convention-index row;
3. nearest instructions, source, co-located test, and at most two exemplars;
4. one structured convention-resolver subagent;
5. repo-wide search only for a named unresolved field.

Stop when the discovery packet is complete. Implementation consumes the packet
instead of searching again.

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

## Delivery requirements

- Follow `CONTRIBUTING.md`, `contribute/create-pull-request.md`, and the tracked
  PR template for process.
- Title the PR `<Area>: <Summary>`; include `Fixes #<n>` only when the approved
  plan records an issue.
- Generate required output before the implementation commit; never hand-edit a
  generated file.
- Verify the committed SHA with `git verify-commit HEAD`. Missing SSH signer
  configuration is an environment failure and blocks the push gate. CLA remains
  a PR-bot/human check.
- A new explicit user response is required for every push. “Implement,”
  “complete the plan,” a control choice, or contract approval is not push
  approval.

## Durable evidence order

Named baseline red → implementation → committed final verification → contract
verifier → approved browser evidence → walkthrough recording → signing check →
explicit human push approval → draft PR → BugBot → human review → CI
subscription.
