#!/usr/bin/env bash

set -uo pipefail

STACK="auto"
CONTRACT=""
BASE_REF="origin/main"
OUT=""
MODE=""
BASELINE_RED=""
PRINT_ONLY=false
E2E_SPEC=""
E2E_PROJECT="dashboards"
GRAFANA_URL_VALUE="${GRAFANA_URL:-}"

usage() {
  cat <<'EOF'
Usage:
  local-verify.sh --mode baseline|final --contract <slug-or-path>
    [--stack auto|frontend|backend|both] [--base <ref>] [--out <path>]
    [--baseline-red <source-file>:<test-file>] [--print-only]
    [--e2e <spec>] [--e2e-project <project>] [--grafana-url <url>]
EOF
}

while (($#)); do
  case "$1" in
    --stack) STACK="${2:?missing --stack value}"; shift 2 ;;
    --contract) CONTRACT="${2:?missing --contract value}"; shift 2 ;;
    --base) BASE_REF="${2:?missing --base value}"; shift 2 ;;
    --out) OUT="${2:?missing --out value}"; shift 2 ;;
    --mode) MODE="${2:?missing --mode value}"; shift 2 ;;
    --baseline-red) BASELINE_RED="${2:?missing --baseline-red value}"; shift 2 ;;
    --print-only) PRINT_ONLY=true; shift ;;
    --e2e) E2E_SPEC="${2:?missing --e2e value}"; shift 2 ;;
    --e2e-project) E2E_PROJECT="${2:?missing --e2e-project value}"; shift 2 ;;
    --grafana-url) GRAFANA_URL_VALUE="${2:?missing --grafana-url value}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ -z "$CONTRACT" || ! "$MODE" =~ ^(baseline|final)$ ]]; then
  usage >&2
  exit 2
fi

if [[ ! "$STACK" =~ ^(auto|frontend|backend|both)$ ]]; then
  echo "Invalid stack: $STACK" >&2
  exit 2
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "Run this script inside a Git repository." >&2
  exit 2
}
cd "$ROOT"

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Base ref does not exist: $BASE_REF" >&2
  exit 2
fi

BASE_SHA="$(git merge-base HEAD "$BASE_REF")"
HEAD_SHA="$(git rev-parse HEAD)"
SLUG="$(basename "$CONTRACT")"
SLUG="${SLUG%.md}"
OUT="${OUT:-.cursor/verify/${SLUG}.json}"
mkdir -p "$(dirname "$OUT")"

if [[ "$MODE" == "final" && -n "$(git status --porcelain)" ]]; then
  echo "Final verification requires a clean committed HEAD." >&2
  exit 2
fi

TMP_DIR="$(mktemp -d)"
RECORDS="$TMP_DIR/checks.tsv"
CHANGED_LIST="$TMP_DIR/changed-files.txt"
touch "$RECORDS" "$CHANGED_LIST"
trap 'rm -rf "$TMP_DIR"' EXIT

{
  git diff --name-only "$BASE_SHA" HEAD
  if [[ "$MODE" == "baseline" ]]; then
    git diff --name-only
    git ls-files --others --exclude-standard
  fi
} | awk 'NF && !seen[$0]++' | sort >"$CHANGED_LIST"

mapfile -t CHANGED_FILES <"$CHANGED_LIST"
FRONTEND=false
BACKEND=false

for file in "${CHANGED_FILES[@]}"; do
  case "$file" in
    *.ts|*.tsx|*.js|*.jsx|*.scss) FRONTEND=true ;;
    *.go) BACKEND=true ;;
  esac
done

if [[ "$STACK" == "auto" ]]; then
  if $FRONTEND && $BACKEND; then
    STACK="both"
  elif $FRONTEND; then
    STACK="frontend"
  elif $BACKEND; then
    STACK="backend"
  else
    STACK="frontend"
  fi
fi

quote_join() {
  local result="" item
  for item in "$@"; do
    printf -v result '%s%q ' "$result" "$item"
  done
  printf '%s' "${result% }"
}

record_check() {
  local name="$1" required="$2" cmd="$3" status="$4" exit_code="$5" duration="$6" reason="$7"
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$name" "$required" "$status" "$exit_code" "$duration" "$cmd" "$reason" >>"$RECORDS"
}

run_check() {
  local name="$1" required="$2" cmd="$3"
  if $PRINT_ONLY; then
    echo "[print-only] $cmd"
    record_check "$name" "$required" "$cmd" "skipped" "" "0" "print-only"
    return
  fi

  echo "+ $cmd"
  local start end code
  start="$(date +%s%3N)"
  bash -lc "$cmd"
  code=$?
  end="$(date +%s%3N)"
  record_check "$name" "$required" "$cmd" "ran" "$code" "$((end - start))" ""
}

skip_check() {
  record_check "$1" "$2" "$3" "skipped" "" "0" "$4"
}

write_baseline_json() {
  local observed="$1" exit_code="$2" test_name="$3" excerpt="$4" log_path="$5"
  python3 - "$OUT" "$SLUG" "$STACK" "$BASE_REF" "$BASE_SHA" "$observed" "$exit_code" \
    "$test_name" "$excerpt" "$log_path" "$CHANGED_LIST" <<'PY'
import datetime
import json
import pathlib
import subprocess
import sys

(out, slug, stack, base_ref, base_sha, observed, exit_code,
 test_name, excerpt, log_path, changed_path) = sys.argv[1:]
changed = pathlib.Path(changed_path).read_text().splitlines()
payload = {
    "schema_version": 2,
    "contract": slug,
    "mode": "baseline",
    "stack": stack,
    "split_recommended": stack == "both",
    "base_ref": base_ref,
    "base_sha": base_sha,
    "head_sha": None,
    "tree_clean": not bool(subprocess.run(
        ["git", "status", "--porcelain"], capture_output=True, text=True
    ).stdout.strip()),
    "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "changed_files": changed,
    "baseline_red": {
        "cmd": f"targeted test; full output: {log_path}",
        "expected": "fail",
        "observed": observed,
        "exit_code": int(exit_code),
        "matches_expectation": observed == "fail",
        "failing_test": test_name or None,
        "output_excerpt": excerpt or None,
        "log_path": log_path,
    },
    "final_checks": [],
    "all_passed": False,
}
pathlib.Path(out).write_text(json.dumps(payload, indent=2) + "\n")
PY
}

if [[ "$MODE" == "baseline" ]]; then
  if [[ -z "$BASELINE_RED" || "$BASELINE_RED" != *:* ]]; then
    echo "Baseline mode requires --baseline-red <source-file>:<test-file>." >&2
    exit 2
  fi

  SOURCE_FILE="${BASELINE_RED%%:*}"
  TEST_FILE="${BASELINE_RED#*:}"
  LOG_PATH=".cursor/verify/${SLUG}.baseline.log"
  TEST_CMD="yarn jest $(quote_join "$TEST_FILE") --watchAll=false"

  if $PRINT_ONLY; then
    echo "[print-only] stash implementation changes in $SOURCE_FILE"
    echo "[print-only] $TEST_CMD"
    write_baseline_json "error" "2" "" "print-only; no test executed" "$LOG_PATH"
    exit 0
  fi

  mkdir -p "$(dirname "$LOG_PATH")"
  STASH_BEFORE="$(git rev-parse -q --verify refs/stash 2>/dev/null || true)"
  git stash push -m "cursor-baseline-${SLUG}" -- "$SOURCE_FILE" >/dev/null
  STASH_AFTER="$(git rev-parse -q --verify refs/stash 2>/dev/null || true)"
  STASH_CREATED=false
  [[ -n "$STASH_AFTER" && "$STASH_AFTER" != "$STASH_BEFORE" ]] && STASH_CREATED=true

  bash -lc "$TEST_CMD" 2>&1 | tee "$LOG_PATH"
  TEST_EXIT=${PIPESTATUS[0]}

  if $STASH_CREATED; then
    git stash pop --index >/dev/null || {
      echo "Could not restore stashed implementation changes." >&2
      exit 2
    }
  fi

  OBSERVED="fail"
  [[ "$TEST_EXIT" -eq 0 ]] && OBSERVED="pass"
  if [[ "$TEST_EXIT" -ne 0 ]] && rg -q 'Cannot find module|SyntaxError|No tests found|command not found' "$LOG_PATH"; then
    OBSERVED="error"
  fi

  FAILING_TEST="$(awk '/●/{sub(/^.*●[[:space:]]*/, ""); print; exit}' "$LOG_PATH")"
  EXCERPT="$(python3 - "$LOG_PATH" <<'PY'
import pathlib, sys
text = pathlib.Path(sys.argv[1]).read_text(errors="replace")
print(text[-4000:])
PY
)"
  write_baseline_json "$OBSERVED" "$TEST_EXIT" "$FAILING_TEST" "$EXCERPT" "$LOG_PATH"
  echo "Baseline evidence written to $OUT. Read the failure; exit code alone is not proof."
  [[ "$OBSERVED" == "fail" ]]
  exit $?
fi

# Final mode
run_check "self-parse" "true" "bash -n $(quote_join "$0")"

if command -v shellcheck >/dev/null 2>&1; then
  run_check "self-shellcheck" "true" "shellcheck $(quote_join "$0")"
else
  skip_check "self-shellcheck" "false" "shellcheck $(quote_join "$0")" "shellcheck not installed"
fi

if [[ "$STACK" == "frontend" || "$STACK" == "both" ]]; then
  TEST_FILES=()
  SOURCE_FILES=()
  FORMAT_FILES=()
  for file in "${CHANGED_FILES[@]}"; do
    case "$file" in
      *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx) [[ -f "$file" ]] && TEST_FILES+=("$file") ;;
    esac
    case "$file" in
      *.ts|*.tsx|*.js|*.jsx) [[ -f "$file" ]] && SOURCE_FILES+=("$file") ;;
    esac
    case "$file" in
      *.md|*.mdx|*.json|*.js|*.jsx|*.ts|*.tsx|*.scss|*.cjs) [[ -f "$file" ]] && FORMAT_FILES+=("$file") ;;
    esac
  done

  if ((${#TEST_FILES[@]} == 0)); then
    for file in "${SOURCE_FILES[@]}"; do
      [[ "$file" == *.test.* || "$file" == *.spec.* ]] && continue
      stem="${file%.*}"
      for candidate in "${stem}.test.ts" "${stem}.test.tsx"; do
        [[ -f "$candidate" ]] && TEST_FILES+=("$candidate")
      done
    done
  fi

  if ((${#TEST_FILES[@]})); then
    run_check "test" "true" "yarn jest $(quote_join "${TEST_FILES[@]}") --watchAll=false"
  else
    skip_check "test" "true" "yarn jest <co-located-tests> --watchAll=false" "no co-located test found"
  fi

  if ((${#SOURCE_FILES[@]})); then
    run_check "lint" "true" "yarn eslint --no-error-on-unmatched-pattern $(quote_join "${SOURCE_FILES[@]}")"
  fi

  if ((${#FORMAT_FILES[@]})); then
    run_check "format" "true" "yarn prettier --check $(quote_join "${FORMAT_FILES[@]}")"
  fi

  if printf '%s\n' "${CHANGED_FILES[@]}" | rg -q '^public/locales/en-US/grafana\.json$'; then
    run_check "i18n" "true" "yarn i18n-extract && git diff --exit-code -- public/locales/en-US/grafana.json"
  fi
fi

if [[ "$STACK" == "backend" || "$STACK" == "both" ]]; then
  GO_FILES=()
  GO_DIRS=()
  declare -A SEEN_DIRS=()
  for file in "${CHANGED_FILES[@]}"; do
    if [[ "$file" == *.go && -f "$file" ]]; then
      GO_FILES+=("$file")
      dir="$(dirname "$file")"
      if [[ -z "${SEEN_DIRS[$dir]:-}" ]]; then
        GO_DIRS+=("./${dir}/...")
        SEEN_DIRS[$dir]=1
      fi
    fi
  done

  if ((${#GO_DIRS[@]})); then
    run_check "go-test" "true" "go test $(quote_join "${GO_DIRS[@]}")"
    if command -v golangci-lint >/dev/null 2>&1; then
      run_check "go-lint" "true" "golangci-lint run $(quote_join "${GO_DIRS[@]}")"
    else
      skip_check "go-lint" "true" "golangci-lint run $(quote_join "${GO_DIRS[@]}")" "golangci-lint not installed"
    fi
    run_check "go-format" "true" "test -z \"\$(gofmt -l $(quote_join "${GO_FILES[@]}"))\""
  else
    skip_check "go-test" "true" "go test <changed-packages>" "no changed Go files found"
  fi
fi

if [[ -n "$E2E_SPEC" ]]; then
  if [[ -n "$GRAFANA_URL_VALUE" ]]; then
    run_check "e2e" "false" \
      "GRAFANA_URL=$(quote_join "$GRAFANA_URL_VALUE") yarn e2e:pw --project $(quote_join "$E2E_PROJECT") --reporter list $(quote_join "$E2E_SPEC")"
  else
    skip_check "e2e" "false" "yarn e2e:pw $(quote_join "$E2E_SPEC")" "GRAFANA_URL not provided; server startup is never implicit"
  fi
fi

python3 - "$OUT" "$SLUG" "$STACK" "$BASE_REF" "$BASE_SHA" "$HEAD_SHA" \
  "$CHANGED_LIST" "$RECORDS" <<'PY'
import datetime
import json
import pathlib
import sys

out, slug, stack, base_ref, base_sha, head_sha, changed_path, records_path = sys.argv[1:]
out_path = pathlib.Path(out)
baseline = None
if out_path.exists():
    try:
        baseline = json.loads(out_path.read_text()).get("baseline_red")
    except (json.JSONDecodeError, OSError):
        pass

checks = []
for line in pathlib.Path(records_path).read_text().splitlines():
    if not line:
        continue
    name, required, status, exit_code, duration, cmd, reason = line.split("\t", 6)
    checks.append({
        "name": name,
        "cmd": cmd,
        "exit_code": int(exit_code) if exit_code else None,
        "duration_ms": int(duration),
        "status": status,
        "required": required == "true",
        **({"reason": reason} if reason else {}),
    })

all_passed = all(
    (check["status"] == "ran" and check["exit_code"] == 0)
    if check["required"]
    else (check["status"] != "ran" or check["exit_code"] == 0)
    for check in checks
)
payload = {
    "schema_version": 2,
    "contract": slug,
    "mode": "final",
    "stack": stack,
    "split_recommended": stack == "both",
    "base_ref": base_ref,
    "base_sha": base_sha,
    "head_sha": head_sha,
    "tree_clean": True,
    "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "changed_files": pathlib.Path(changed_path).read_text().splitlines(),
    "baseline_red": baseline,
    "final_checks": checks,
    "all_passed": all_passed,
}
out_path.write_text(json.dumps(payload, indent=2) + "\n")
print(f"Verification evidence written to {out_path}")
print(f"all_passed={str(all_passed).lower()} head_sha={head_sha}")
sys.exit(0 if all_passed else 1)
PY
