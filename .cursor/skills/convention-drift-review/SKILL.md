---
name: convention-drift-review
description: Review recently merged work for conventions the index has fallen behind on, and propose routing-row updates with citations. Run on a schedule or after a large merge. Proposes changes; never applies them silently.
---

# Convention drift review

The reference guard catches paths that moved. The root `AGENTS.md` reminds an
author to index a new convention. Neither catches the case where reality moved
on and nobody remembered. This closes that loop.

It proposes. It does not decide, and it does not edit another team's
instructions.

## Run it

Two collectors, both deterministic, both reporting **signals not conclusions**.

```bash
# What merged work did to the shape of the repository. git only.
node .cursor/skills/convention-drift-review/scripts/collect-drift-signals.mjs --since "30 days ago"

# What reviewers had to say that our context should have said first. Needs gh.
node .cursor/skills/convention-drift-review/scripts/collect-review-signals.mjs --since 7
```

**`collect-drift-signals.mjs`** reports structural drift: new or moved scoped
`AGENTS.md` files, skills and agents that appeared or vanished, `CODEOWNERS`
changes, changes to workflows the map cites by name, and active directories no
routing row covers.

**`collect-review-signals.mjs`** reports the sharper signal. A human review
comment is by definition something that was not right the first time: BugBot did
not catch it, the index did not route to it, and a round trip was spent
explaining it. It groups top-level human comments by the routing row that owns
the file, and counts bot comments separately — those were already caught before
human review, so they are not a context gap.

If either prints `Propose nothing.`, that half found nothing. If both do, stop.
Say nothing, open nothing.

The two disagree usefully. Structural drift finds directories that changed a lot;
review signals find directories people had to _argue_ about. When both point at
the same routing row, that is the strongest evidence available here.

## Turn signals into proposals

For each signal, in order:

1. **Find the merged work behind it.** For structural signals, `git log
--oneline -- <path>`. For review signals, open the linked comment thread.
   A signal you cannot trace to merged work is not evidence.
2. **Read the change and the discussion, not just the diffstat.** A new
   `AGENTS.md` tells you the authority; the thread tells you why it exists and
   who owns it.
3. **Require repetition before treating a comment as a convention.** One
   reviewer's preference is an opinion. The same correction on the same routing
   row, from more than one thread, is a context gap. A single strongly worded
   comment is the most common false positive here.
4. **Check the answer is already settled.** Propose context only where the
   repository already agrees. If reviewers are still arguing, the outcome is a
   question for the owning team, not a routing row.
5. **Decide whether routing actually changed.** Routing is: which paths, which
   authority, which skills, which owner, which checks. If only wording changed
   inside an existing authority, there is nothing to propose — the map is an
   index, not a copy.
6. **Write the row.** Propose the exact table row, in the format the map already
   uses, with every column filled from evidence you read.

## Rules

- **No proposal without a citation.** Every proposed row cites the merged pull
  request or commit that justifies it. A proposal that only cites this skill's
  own output is circular.
- **Routing columns only.** Never copy an authority's prose into the map. If an
  authority is itself wrong, that is an issue for the owning team, not an edit
  you make.
- **Never edit a scoped `AGENTS.md`.** Those belong to the teams that own those
  directories. Propose to the map, and raise anything else with the owner.
- **One pull request per run**, against the map and, when a skill genuinely
  moved, its routing lines. Nothing else.
- **Check for an open proposal first.** `gh pr list --state open --search
"convention drift"`. If a prior run already proposed a row, extend or close
  that pull request rather than opening a second one. GitHub is the dedupe
  state; this skill keeps none.
- **Cap the run at five proposed rows.** More than that means the map needs a
  deliberate rework by a human, not an incremental patch. Say that instead.
- **Silence is a valid outcome, and the common one.** An automation that files
  something every week gets muted, and a muted automation is worse than none.

## Coverage gaps

`Active directories no routing row covers` is ranked by churn, so the top entry
is where the map's admitted incompleteness costs the most. It is a prompt for
judgement, not a defect: some directories genuinely need no row. Propose one only
when a contributor landing there would be misrouted without it.

## Automation

`.github/workflows/context-drift-report.yml` runs both collectors weekly and
publishes the result to a single tracking issue, commenting on the existing one
rather than opening a new one. It publishes nothing when there are no signals.

That workflow is the verifiable half: plain Node, git, and `gh` with the default
token. The judgement half is this skill, run against that issue by whichever
agent runner the organization uses — a Cursor scheduled or background agent, or a
human on a Monday. No agent step is committed, because the runner and token
cannot be verified from this repository, and an unverifiable workflow step is the
kind of evidence this whole workflow refuses to manufacture.

**GitHub disables scheduled workflows on forks.** On a fork, run it with
`workflow_dispatch`. Monthly is usually the right cadence for structural drift;
weekly suits review signals, because comment threads get harder to reconstruct
as they age.

## Ceiling

- Churn is a proxy for importance, and sometimes a bad one: a mechanical rename
  across 400 files reads as a hot directory.
- Comment volume is a proxy for a context gap, and sometimes a bad one: a large
  or contentious pull request attracts comments regardless of conventions.
- Neither collector reads meaning. A counted comment may be discussion rather
  than a defect, and nothing here distinguishes the two; only the thread does.
  Whether a comment caused rework is deliberately not computed — it would need a
  per-pull-request fan-out this collector avoids on purpose.
- Bot comments are excluded from proposals on the assumption that BugBot caught
  them pre-review. If BugBot is not enabled, that assumption is wrong and its
  comments should be read too.

All of which is why every signal has to be traced back to the merged pull
request before anything is proposed.
