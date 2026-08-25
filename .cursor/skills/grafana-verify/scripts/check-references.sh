#!/usr/bin/env bash

set -euo pipefail

SELF_TEST=false
if [[ "${1:-}" == "--self-test" ]]; then
  SELF_TEST=true
elif (($#)); then
  echo "Usage: check-references.sh [--self-test]" >&2
  exit 2
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "Run this script inside a Git repository." >&2
  exit 2
}

python3 - "$ROOT" "$SELF_TEST" <<'PY'
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1]).resolve()
self_test = sys.argv[2] == "true"
files = sorted((root / ".cursor/skills").glob("**/*.md"))
files += sorted((root / ".cursor/agents").glob("*.md"))

link_re = re.compile(r"\[[^\]]*\]\(([^)#]+)(?:#[^)]+)?\)")
code_re = re.compile(r"`([^`\n]+)`")
path_re = re.compile(
    r"(?P<path>(?:\.\.?/)?(?:[A-Za-z0-9_.-]+/)*"
    r"[A-Za-z0-9_.-]+\.(?:md|tsx|ts|go|yaml|yml|json|ini|cue|sh)"
    r"(?::(?P<line>[0-9]+))?)"
)

citations = []
for citing in files:
    text = citing.read_text(errors="replace")
    for line_no, line in enumerate(text.splitlines(), 1):
        for target in link_re.findall(line):
            if "://" not in target and "<" not in target and ">" not in target:
                citations.append((citing, line_no, target))
        for code in code_re.findall(line):
            if "<" in code or ">" in code or "://" in code:
                continue
            for match in path_re.finditer(code):
                target = match.group("path")
                bare = target.split(":", 1)[0]
                if "/" not in bare and bare not in {
                    "AGENTS.md",
                    "package.json",
                    "playwright.config.ts",
                }:
                    continue
                citations.append((citing, line_no, target))

if self_test:
    citations.append((root / ".cursor/skills/synthetic.md", 1, "missing/reference.md:999"))

seen = set()
failures = []
synthetic_failure = False

for citing, citing_line, raw in citations:
    key = (str(citing), citing_line, raw)
    if key in seen:
        continue
    seen.add(key)

    target = raw.rstrip(".,;)")
    expected_line = None
    match = re.match(r"^(.*):([0-9]+)$", target)
    if match:
        target = match.group(1)
        expected_line = int(match.group(2))

    candidates = []
    target_path = pathlib.Path(target)
    if target.startswith("../") or target.startswith("./"):
        candidates.append((citing.parent / target_path).resolve())
    else:
        candidates.append((root / target_path).resolve())
        candidates.append((citing.parent / target_path).resolve())

    resolved = next(
        (candidate for candidate in candidates if candidate.exists() and candidate.is_file()),
        None,
    )
    if resolved is None:
        failure = f"{citing.relative_to(root)}:{citing_line} -> {raw}"
        failures.append(failure)
        synthetic_failure |= raw == "missing/reference.md:999"
        continue

    if expected_line is not None:
        actual_lines = sum(1 for _ in resolved.open(errors="replace"))
        if actual_lines < expected_line:
            failures.append(
                f"{citing.relative_to(root)}:{citing_line} -> {raw} "
                f"(file has {actual_lines} lines)"
            )

if self_test:
    if not synthetic_failure:
        print("Self-test failed: the synthetic missing reference was not detected.", file=sys.stderr)
        sys.exit(1)
    failures = [failure for failure in failures if "missing/reference.md:999" not in failure]
    if not failures:
        print("Reference guard self-test passed.")
        sys.exit(0)

if failures:
    print("Unresolved repository references:", file=sys.stderr)
    for failure in failures:
        print(f"- {failure}", file=sys.stderr)
    sys.exit(1)

print(f"Checked {len(seen)} repository references across {len(files)} files.")
PY
