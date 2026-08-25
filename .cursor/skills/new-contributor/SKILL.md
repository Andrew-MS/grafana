---
name: new-contributor
description: Interview and guide a first-time contributor from product outcome through repository-grounded decisions and a complete approved Cursor plan, then hand off to the universal grafana-implementation skill.
icon: git-branch
color: blue
---

# New Contributor

Guide the user through the planning half of the repository's end-to-end
contribution experience. Keep the user involved in consequential decisions
rather than silently choosing an implementation. Use built-in Plan Mode for
phases 1–4, then hand the approved plan to `grafana-implementation`, which
applies the same implementation protocol for new and experienced contributors.

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
   recommendation. Explain what the user gains, gives up, and leaves the team to
   maintain. Classify technical risk from repository evidence; do not ask a
   first-time contributor to know whether something is high risk. Ask the user
   to choose product scope or accept the recommendation. Evidence tier,
   control/API choice, scope, and rollout decisions may not remain blank.
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

## Build handoff

When the user clicks **Build**:

1. Load `../grafana-implementation/SKILL.md` in Agent Mode.
2. Attach the approved Cursor plan; it is the task-specific contract and
   discovery cache.
3. Start at its Implement phase. Do not repeat Discover.
4. `new-contributor` stops directing the run. The universal implementation skill
   owns test-first work, deterministic verification, review, evidence, and push
   gates from this point forward.

The plan's implementation handoff must name `grafana-implementation` plus only
the stack-specific skills selected during Discover.

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
