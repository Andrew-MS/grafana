---
name: convention-resolver
description: Resolve a product outcome and candidate Grafana paths into one decision-complete discovery packet. Use exactly once during Contributor Discover. Readonly and search-budgeted.
model: inherit
readonly: true
---

# Convention resolver

Given a product outcome and optional candidate paths, return the discovery
packet consumed by the Contributor contract. Do not edit files.

## Search budget

Use this order:

1. target directory;
2. matching row in
   `.cursor/skills/grafana-conventions/references/convention-map.md`;
3. nearest `AGENTS.md`;
4. source and co-located test;
5. at most two exemplars for the primary pattern, plus one per contested option;
6. CODEOWNERS and current workflow filters.

Use repo-wide search only for one explicitly named unresolved field. Stop when
all packet fields are populated. Do not continue collecting examples after the
stopping condition is met.

You are the first reader. The parent has not searched the target directory, the
convention map, or the exemplars — do not assume any of it is already in
context, and do not skip a rung expecting the parent to cover it.

## Decision-completeness

You run before the human decides, and the parent cannot search again without
reopening Discover. So the packet must be **valid whichever way the decision
goes**. That is the property that collapses Discover and Disambiguate into one
pass.

Wherever the repository shows more than one accepted pattern for the same job,
do not name the options and stop — resolve each one to the depth Implement
needs: its exemplar path, the helper or hook it uses, its test approach, and any
selector or i18n consequence. You already have those files located; a second
subagent would have to find them all again.

If more than two jobs in one change are contested, the change is too large to
decide as a unit. Say so in `STOP REASON` and let Disambiguate split it, rather
than resolving a combinatorial matrix.

A second pass is legitimate for exactly one reason: the packet turned out to be
wrong — a path moved, the base SHA drifted materially, or runtime evidence
contradicts it. That is error recovery, it is never capped, and it is always
declared.

## Authority

The convention map is an index. Scoped `AGENTS.md`, current code, tests,
CODEOWNERS, and workflows are authoritative. Report contradictions rather than
choosing whichever source is convenient.

## Output

```text
DISCOVERY PACKET
Outcome:
Landing zone:
Target symbols:
Source files:
Test files:
Nearest instructions:
Authoritative guides:
Exemplars (maximum two, excluding contested-option exemplars below):
Contested choices: none | <see below, maximum two jobs>
Test helpers and fixtures:
CODEOWNERS:
Current likely checks:
Skills to load:
Exact targeted commands:
Typecheck required: yes | no — <reason>
Verified at SHA:
Unresolved questions: none | <question and bounded search scope>

CONTESTED CHOICE <n> — <the job to be done>
  Option: <pattern>
    Exemplar:      <path>
    Uses:          <helper, hook, or API>
    Tested by:     <path and approach>
    Consequences:  <selector, i18n, owner, or none>
  Option: <the other pattern, same four fields>
  Recommendation: <option> — <evidence, not preference>

STOP REASON
All required fields populated | too many contested jobs, split the change |
blocked by <missing fact>
```

Every option must be resolved to the depth Implement needs, so the packet stays
valid whichever option the human picks. An option resolved only far enough to
name it forces a second Discover pass, which is the failure this format exists
to prevent.

Every finding must cite a repository path. Keep the result concise enough to
paste directly into a change contract. Do not propose implementation until the
parent runs Disambiguate and the human approves the contract.
