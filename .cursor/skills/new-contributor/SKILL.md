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
Discovery: packet | reopened — <the contradiction that justified reopening>
Code changed: yes|no
```

The phases are Understand, Discover, Disambiguate, Contract, Implement, Verify,
Review, and PR. Verify means the plan's named repository commands plus Lefthook,
not a separate evidence runner. Announce every transition. Never leave the user
guessing whether the agent is researching, waiting for a decision, editing,
testing, recording, or asking to push.

The `Discovery:` line reads `packet` while the run is consuming the resolver's
output. Any search after the packet exists must flip it to `reopened` and name
the contradiction that justified it. This is a visibility convention, not
enforcement; no hook can observe what an agent reads.

## Lane 1: contract in Plan Mode

When attached to a message in built-in Plan Mode:

1. **Understand** as an interview. Ask one or two product questions at a time:
   who experiences the problem, what outcome matters, how success is observed,
   and what is explicitly not required. If an AskQuestion tool is unavailable,
   ask directly in chat; CreatePlan is never a substitute for a question.

   Never offer functionality the request did not ask for. An out-of-scope
   question confirms an exclusion the user already implied; it never presents a
   new capability as an option. "Should Escape also clear the search?" is not
   scope clarification when the request said one-click — it is a feature
   proposal, and offering it manufactures the scope it pretends to bound. If a
   neighbouring capability looks worth having, name it as a follow-up in the
   plan's non-goals instead of putting it on the menu.

2. **Discover** with exactly one readonly `convention-resolver` subagent. Pass
   the outcome and any candidate paths the request already names, so the single
   pass is aimed rather than exploratory. Require its structured discovery
   packet. Do not read the target directory, the convention map, or exemplars in
   the parent first — that is the resolver's job, and doing it twice is the
   whole cost the subagent exists to avoid.
3. **Disambiguate** unclear scope and conflicting patterns using
   `references/tradeoffs.md` and the packet's `CONTESTED CHOICE` blocks, where
   each option is already resolved to implementable depth. Present the tradeoff
   and take the decision; do not return to the repository to compare the options.
   Classify technical risk from repository evidence; do not ask a first-time
   contributor to know whether something is high risk. Needing to search here
   means the packet was incomplete — reopen Discover and say so, rather than
   quietly running a second pass.

   Every decision below must be resolved before Contract, but they are not all
   the user's to make:

   | Human decides                                       | Agent decides and records                       |
   | --------------------------------------------------- | ----------------------------------------------- |
   | Desired outcome                                     | Test tier and targeted commands                 |
   | Product scope and non-goals                         | Selector strategy                               |
   | Acceptable behavioural tradeoffs                    | Implementation primitive (control, API, helper) |
   | Consequential exposure: rollout and delivery policy | Likely checks and technical risk classification |

   Escalate an agent-owned decision to the human only when it materially changes
   the product outcome, an acceptance criterion, or risk — for example when a
   control choice changes the accessible name a screen reader announces, or when
   a selector change pulls in another CODEOWNER. Say which it is and why.

   Present human decisions one at a time in interview form: user impact, Option
   A/B, recommendation, cost/risk, and what would change the recommendation.
   Explain what the user gains, gives up, and leaves the team to maintain.
   Record agent-owned decisions in the plan with their evidence; do not turn
   them into questions. A first-time contributor should never be asked to pick
   between `IconButton` and `Button` on their own judgement.

   For delivery policy, see `../grafana-implementation/SKILL.md` §4.

4. **Contract** only after Understand, Discover, and Disambiguate are complete.
   First show a decision recap and confirm there are no unanswered questions.
   Call CreatePlan once. Put the human-facing approval summary at the top and
   the engineering discovery packet below it. The saved Cursor plan is the
   authoritative contract. Do not write `.cursor/contracts/` in Plan Mode and
   never ask the user to edit YAML.
5. Stop at the native plan approval UI. Clicking **Build** approves the complete
   plan for implementation. It never authorizes `main`, ready status, or merge.
   What Build does and does not pre-authorize is defined once in
   `../grafana-implementation/SKILL.md` §4.

Plan Mode is the tool-level boundary. Do not switch modes or edit production
files while the contract is incomplete or unapproved.

## Build handoff

When the user clicks **Build**:

1. Load `../grafana-implementation/SKILL.md` in Agent Mode.
2. Attach the approved Cursor plan; it is the authoritative task-specific
   contract and discovery cache.
3. Start at its Implement phase. Do not repeat Discover.
4. `new-contributor` stops directing the run. The universal implementation skill
   owns test-first work, the plan's named commands, Lefthook, review, evidence,
   and push gates from this point forward.

The plan's implementation handoff must name `grafana-implementation` plus only
the stack-specific skills selected during Discover.

## Search budget

One `convention-resolver` pass for the whole contribution. The parent does not
search before it and does not repeat it after.

One pass is enough because the packet is **decision-complete**: the resolver runs
before the human decides, so it resolves every contested option to the depth
Implement needs rather than resolving the one it guessed. Disambiguate then reads
options that are already resolved, and Implement reads the option that was
chosen. Neither returns to the repository.

The escalation ladder lives in `../../agents/convention-resolver.md` and belongs
to the resolver alone. Duplicating it here would make the parent walk the first
three rungs and then pay a subagent to walk them again.

After the packet exists, the parent may search repo-wide only for a field the
packet names as unresolved. Anything broader is a reopen: flip the `Discovery:`
line to `reopened`, name the contradiction, and say what changed. Reopening is
always allowed — it is never silent. The one case that genuinely needs it is a
packet that turned out to be wrong: a moved path, a materially drifted base SHA,
or runtime evidence that contradicts it.

Implementation consumes the packet and never spawns a second resolver.

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
