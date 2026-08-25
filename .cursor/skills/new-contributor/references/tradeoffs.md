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

Use plain language:

|                     | Option A | Option B |
| ------------------- | -------- | -------- |
| User benefit        |          |          |
| Pattern fit         |          |          |
| Implementation cost |          |          |
| Evidence available  |          |          |
| Risk or rollback    |          |          |

Then state:

- **Recommendation:** one option and why.
- **What would change my mind:** the missing fact that could reverse it.
- **Decision owner:** the person who must approve the tradeoff.

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
- Frontend and backend in separate PRs because they deploy at different
  cadences.
- Existing selector or accessible role query versus a new versioned selector.

## Model adherence versus mechanical enforcement

State which gates rely on instructions and which are enforced by tools:

| Gate                    | Instruction-only risk                     | Preferred mechanism                                                  |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| No code before contract | Agent may interpret urgency as permission | Built-in Plan Mode                                                   |
| Red before production   | Agent may add test and source together    | `grafana-verify` refuses changed source                              |
| Scope bounds            | Agent may widen the diff while debugging  | Contract verifier over changed paths                                 |
| Push approval           | Agent or subagent may infer old approval  | New explicit push response; consider a narrow hook or human-run push |
| CI success              | Agent may summarize local checks as CI    | Repository CI remains authoritative                                  |

When adherence has already failed in dogfood, do not describe another prompt as
enforcement. Prefer a deterministic check, a product mode, a hook, or a human
action. Record the added friction as the cost of that option.
