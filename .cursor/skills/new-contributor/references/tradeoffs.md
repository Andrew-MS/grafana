# Disambiguating a contribution

Use this reference only when repository discovery exposes a real choice. Do not
manufacture alternatives for decisions already settled by scoped instructions.

## Questions to answer

1. Does the requested behavior already exist elsewhere in the repository?
2. Which option follows the nearest current pattern?
3. Can a smaller change deliver the same user outcome?
4. What does each option cost in implementation, testing, CI, rollout, and
   maintenance?
5. Can the acceptance criterion be observed by deterministic tooling?
6. What human or repository fact would change the recommendation?

## Presenting the choice

For a first-time contributor, use a decision card that explains consequences,
not just implementation details:

```text
Decision: <plain-language question>

Why you are deciding:
<How this affects users, review confidence, delivery, or future ownership>

Agent assessment:
<Technical risk classification with repository evidence>

Option A — <name>
You gain:
You give up:
Team impact:
Best when:

Option B — <name>
You gain:
You give up:
Team impact:
Best when:

Recommendation:
What would change the recommendation:
Your decision:
```

Use relative impact language—low, medium, high—unless measured data exists. Do
not invent delivery estimates or ask the contributor to interpret internal
terms such as `featuremgmt` without explaining the user and team consequence.

The agent owns the technical recommendation. The human decides product scope,
acceptable exposure, and whether to accept the recommendation.

## Risk and rollout assessment

Do not ask a first-time contributor whether a change is "high risk." Investigate
and present the signals:

| Signal       | Low-risk evidence              | Raises risk                                                      |
| ------------ | ------------------------------ | ---------------------------------------------------------------- |
| User reach   | Isolated or opt-in surface     | Shared component or critical journey                             |
| Data         | No persistence                 | Migration, destructive write, or compatibility concern           |
| Architecture | Frontend-local                 | Backend, API, schema, auth, or dependency change                 |
| Interaction  | Additive behavior              | Existing keyboard, accessibility, or navigation behavior changes |
| Verification | Deterministic local evidence   | Production-only uncertainty or broad browser matrix              |
| Rollback     | One safe revert                | Irreversible or coordinated rollback                             |
| Owner policy | Existing direct-ship precedent | Staged rollout required or unknown                               |

Recommend a feature toggle when risk is raised by persistence, API/schema
changes, security, difficult rollback, broad uncertain behavior, or owner
policy. Recommend direct release for local additive behavior with deterministic
tests and an easy revert.

If owner policy is unknown, record **Owner confirmation required**. Do not
transfer that uncertainty to the new contributor as a technical question.

Split requests that combine changes with different risk profiles. For example,
adding a clear button and changing shared Escape behavior require separate
assessments even if they affect the same component.

## Verifiability gate

Prefer evidence that proves behavior rather than restating the implementation.

- Pure logic and user interactions: unit or integration tests that assert
  concrete results.
- Real layout, scrolling, focus traversal, or browser rendering: focused
  Playwright evidence or a walkthrough against a running application.
- A CSS class or style-string assertion does not prove layout behavior.
- If honest evidence requires a broad browser matrix, split the design and
  evidence work or escalate to the owning team before implementation.

## Common Grafana tradeoffs

- Existing component versus a new component.
- Accessible `Button` or `IconButton` versus a non-semantic clickable icon.
- Unit test versus E2E based on the observable behavior.
- Feature toggle versus direct release based on rollout risk, persistence, and
  migration—not simply because the change is new.
- Auto-draft on green versus manual push approval. Auto-draft still requires
  every acceptance criterion, deterministic gate, contract review, and
  signature check to pass; it never marks ready or merges.
- Frontend and backend in separate PRs because they deploy at different
  cadences.
- Existing selector or accessible role query versus a new versioned selector.

## Model adherence versus mechanical enforcement

State which gates rely on instructions and which are enforced by tools:

| Gate                    | Instruction-only risk                     | Preferred mechanism                                                                                    |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| No code before contract | Agent may interpret urgency as permission | Built-in Plan Mode                                                                                     |
| Red before production   | Agent may add test and source together    | Skill rule: test-only edit, `git diff --quiet` on source, then the plan-named test. Not a custom hook. |
| Scope bounds            | Agent may widen the diff while debugging  | Compare `git diff --name-only` to the approved plan bounds                                             |
| Delivery / push         | Agent or subagent may infer old approval  | Plan-selected `auto-draft-on-green` or `manual-push-approval`; Lefthook and CI are the hard gates      |
| CI success              | Agent may summarize local checks as CI    | Repository CI remains authoritative                                                                    |

When adherence has already failed in dogfood, do not describe another prompt as
enforcement. Prefer a deterministic check, a product mode, a hook, or a human
action. Record the added friction as the cost of that option.
