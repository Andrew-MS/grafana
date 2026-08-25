---
name: grafana-verify
description: Produce deterministic, reviewable evidence for an approved Grafana change using targeted repository commands and a committed clean HEAD.
---

# Grafana verification

Use `scripts/local-verify.sh` only after an approved contract identifies the
stack, allowed paths, test path, and evidence commands.

## Red then green

1. Add the meaningful test first.
2. Run baseline mode before any production source change:

   ```bash
   scripts/local-verify.sh --mode baseline \
     --contract <slug> \
     --baseline-red <source-file>:<test-file>
   ```

3. Read the output. A nonzero exit alone proves nothing; confirm the named Jest
   assertion failed for the expected missing behavior.
4. Implement within the contract bounds and run required generators.
5. Commit the implementation and generated output.
6. Run final mode against clean committed `HEAD`:

   ```bash
   scripts/local-verify.sh --mode final --contract <slug>
   ```

Final mode refuses dirty trees. Its `head_sha` is therefore the commit that must
be pushed and reviewed.

Baseline mode also enforces ordering: it refuses to run when the named source
file already differs from the base, or when the test file has no new change.
Do not stash an implementation to create retroactive red evidence.

## Scope

- Default base: `origin/main`; override with `--base`.
- Default output: `.cursor/verify/<slug>.json`.
- Auto stack detection uses changed file extensions.
- Frontend checks are targeted Jest, ESLint, Prettier, and i18n when locale
  output changed.
- Pass `--typecheck` when the conventions packet requires full TypeScript
  checking, such as public type, selector signature, or cast changes. Do not run
  the monorepo typecheck by reflex.
- Backend checks are targeted package tests, gofmt, and golangci-lint when
  available.
- E2E is opt-in and requires an explicit `GRAFANA_URL`; the script never starts
  a server implicitly.
- `--print-only` displays the planned commands without claiming they passed.

## Evidence boundary

`baseline_red` is human-interpreted context. `all_passed` is computed only from
required final checks. Paste the final verification table and full JSON into the
PR body so ignored scratch files are not the only record.

Before PR, the contract verifier compares the original approved plan directly
with `verify.json`, then emits an outcome-and-acceptance review plus the
deviation log. The plan is included in PR evidence; no duplicate plan hash or
contract projection is required.

Run `scripts/check-references.sh` during contract creation and before the
artifact PR. It detects deleted or moved citations, not semantic drift or CI
trigger correctness.
