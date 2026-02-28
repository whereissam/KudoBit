#!/bin/bash
# Bug review hook — runs after git commit (PostToolUse)
# Launches headless claude -p to review the commit, with progress spinner
# Auto-splits large commits into batches for reliable reviews
# Saves review to file, returns short JSON so Claude reads + presents it

set -euo pipefail

COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null)
if [ -z "$COMMIT_HASH" ]; then
  exit 0
fi

BATCH_SIZE="${REVIEW_BATCH_SIZE:-10}"
DIFF_CMD="git diff ${COMMIT_HASH}~1 ${COMMIT_HASH}"
COMMIT_INFO=$(git log -1 --oneline "$COMMIT_HASH" 2>/dev/null)
CHANGED_FILES=$($DIFF_CMD --name-only 2>/dev/null | grep -E '\.(py|ts|tsx|js|jsx|rs|swift)$' || true)

if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | tr -d ' ')
DIFF_LINES=$($DIFF_CMD --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ insertion|[0-9]+ deletion' | awk '{s+=$1} END{print s+0}')
FILE_LIST=$(echo "$CHANGED_FILES" | sed 's/^/  - /')

REVIEW_FILE="/tmp/bug-review-commit.md"

# Progress spinner (writes to stderr)
spin_pid=""
claude_pid=""
PROMPT_FILE=""
REVIEW_TMPFILE=""
start_spinner() {
  local label="${1:-Bug review: ${FILE_COUNT} files, ~${DIFF_LINES} lines...}"
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local start_time=$SECONDS
  while true; do
    local elapsed=$(( SECONDS - start_time ))
    local mins=$(( elapsed / 60 ))
    local secs=$(( elapsed % 60 ))
    for frame in "${frames[@]}"; do
      printf "\r  ${frame} ${label} %dm%02ds (Ctrl+C to cancel)" "$mins" "$secs" >&2
      sleep 0.1
      elapsed=$(( SECONDS - start_time ))
      mins=$(( elapsed / 60 ))
      secs=$(( elapsed % 60 ))
    done
  done
}
stop_spinner() {
  if [ -n "$spin_pid" ]; then
    kill "$spin_pid" 2>/dev/null || true
    wait "$spin_pid" 2>/dev/null || true
    printf "\r%80s\r" "" >&2
    spin_pid=""
  fi
}
cleanup() {
  stop_spinner
  if [ -n "$claude_pid" ]; then
    kill "$claude_pid" 2>/dev/null || true
    kill -- -"$claude_pid" 2>/dev/null || true
    wait "$claude_pid" 2>/dev/null || true
    claude_pid=""
  fi
  rm -f "$PROMPT_FILE" "$REVIEW_TMPFILE" 2>/dev/null || true
  if [ -n "${RESULTS_DIR:-}" ] && [ -d "$RESULTS_DIR" ]; then
    rm -rf "$RESULTS_DIR"
  fi
}
abort() {
  printf "\r%80s\r" "" >&2
  echo "Bug review cancelled." >&2
  cleanup
  exit 130
}
trap cleanup EXIT
trap abort INT TERM

# Build prompt
PROMPT_FILE=$(mktemp)
REVIEW_TMPFILE=$(mktemp)
RESULTS_DIR=$(mktemp -d)

# --- Single review (small commits) ---
run_single_review() {
  local files="$1"
  local file_list
  file_list=$(echo "$files" | sed 's/^/  - /')

  cat > "$PROMPT_FILE" <<EOF
You are a senior code reviewer performing a bug review on a git commit.

Commit: ${COMMIT_INFO}

Changed files:
${file_list}

Instructions:
1. Run \`$DIFF_CMD\` to see the full diff
2. For each changed code file, also read the full file to understand context

3. **Trace the dependency chain** — this is critical:
   a. For every function/type/interface that was ADDED, CHANGED, or REMOVED:
      - Use Grep to find all callers and importers across the codebase
      - Read those caller files to check if the change breaks them
   b. For every changed function signature (params added/removed/retyped):
      - Verify ALL call sites pass the correct arguments
   c. For changed types/interfaces:
      - Check all files that import or implement them
   d. For changed API routes or response shapes:
      - Check frontend code that calls those endpoints
   e. For changed DB queries or schema:
      - Check all services that read/write those tables or columns

4. Check the changed code itself for:
   - Logic bugs, off-by-one errors, null/undefined handling
   - Missing error handling or uncaught exceptions
   - Security issues (injection, XSS, exposed secrets, path traversal)
   - Race conditions, deadlocks, or async/await issues
   - Type mismatches or wrong API contracts between frontend and backend
   - Broken imports or missing dependencies
   - Edge cases not handled

5. Output a structured review:

## Bug Review: ${COMMIT_INFO}

### Issues Found
(list each issue with severity: critical/warning/info, file, line, and description)

### Chain Reaction Risks
(issues in RELATED files — callers, importers, downstream consumers — that break due to these changes)

### Verdict
(CLEAN / NEEDS ATTENTION / HAS BUGS)

If no issues found, say the code looks clean and explain why you are confident.
EOF

  local batch_file_count
  batch_file_count=$(echo "$files" | wc -l | tr -d ' ')
  local max_turns=$(( 10 + batch_file_count * 3 ))
  if [ "$max_turns" -gt 200 ]; then max_turns=200; fi

  claude -p "$(cat "$PROMPT_FILE")" \
    --allowedTools "Bash(git diff*),Bash(git log*),Bash(git show*),Read,Glob,Grep" \
    --max-turns "$max_turns" 2>/dev/null
}

# --- Batch review for a subset of files ---
run_batch_review() {
  local batch_num="$1"
  local total_batches="$2"
  local batch_files="$3"
  local batch_file_list
  batch_file_list=$(echo "$batch_files" | sed 's/^/  - /')
  local batch_file_count
  batch_file_count=$(echo "$batch_files" | wc -l | tr -d ' ')

  local scoped_diff="$DIFF_CMD -- $batch_files"

  cat > "$PROMPT_FILE" <<EOF
You are a senior code reviewer performing a bug review on a git commit.
This is batch ${batch_num} of ${total_batches} — review ONLY the files listed below.

Commit: ${COMMIT_INFO}

Files in this batch (${batch_file_count} files):
${batch_file_list}

Instructions:
1. Run \`${scoped_diff}\` to see the diff for ONLY these files
2. For each file, also read the full file to understand context

3. **Trace the dependency chain** for these files:
   a. For every function/type/interface that was ADDED, CHANGED, or REMOVED:
      - Use Grep to find all callers and importers across the codebase
      - Read those caller files to check if the change breaks them
   b. For every changed function signature (params added/removed/retyped):
      - Verify ALL call sites pass the correct arguments
   c. For changed types/interfaces:
      - Check all files that import or implement them
   d. For changed API routes or response shapes:
      - Check frontend code that calls those endpoints

4. Check the changed code itself for:
   - Logic bugs, off-by-one errors, null/undefined handling
   - Missing error handling or uncaught exceptions
   - Security issues (injection, XSS, exposed secrets, path traversal)
   - Race conditions, deadlocks, or async/await issues
   - Type mismatches or wrong API contracts
   - Broken imports or missing dependencies
   - Edge cases not handled

5. Output a structured review:

### Batch ${batch_num}/${total_batches} Review

#### Issues Found
(list each issue with severity: critical/warning/info, file, line, and description)
(if no issues, say "No issues found in this batch")

#### Chain Reaction Risks
(issues in RELATED files that break due to changes in this batch)
(if none, say "No chain reaction risks identified")
EOF

  local max_turns=$(( 10 + batch_file_count * 3 ))
  if [ "$max_turns" -gt 100 ]; then max_turns=100; fi

  claude -p "$(cat "$PROMPT_FILE")" \
    --allowedTools "Bash(git diff*),Bash(git log*),Bash(git show*),Read,Glob,Grep" \
    --max-turns "$max_turns" 2>/dev/null
}

# --- Summary pass: combine batch results ---
run_summary() {
  local all_results="$1"

  cat > "$PROMPT_FILE" <<EOF
You are a senior code reviewer. Multiple batches of files from the same commit have been reviewed independently. Combine the results into a single coherent review.

Commit: ${COMMIT_INFO}
Total files reviewed: ${FILE_COUNT}

--- Batch Review Results ---
${all_results}
--- End Batch Results ---

Instructions:
1. Deduplicate any repeated issues
2. Look for cross-batch issues — a change in one batch that breaks something found in another batch
3. Produce the final combined review:

## Bug Review: ${COMMIT_INFO}

### Issues Found
(combined and deduplicated list with severity: critical/warning/info, file, line, description)

### Chain Reaction Risks
(cross-file and cross-batch risks)

### Verdict
(CLEAN / NEEDS ATTENTION / HAS BUGS — based on the worst severity found across all batches)

If no issues found across all batches, say the code looks clean.
EOF

  claude -p "$(cat "$PROMPT_FILE")" --max-turns 5 2>/dev/null
}

# --- Main logic ---
if [ "$FILE_COUNT" -le "$BATCH_SIZE" ]; then
  # Small commit — single pass
  start_spinner &
  spin_pid=$!

  run_single_review "$CHANGED_FILES" > "$REVIEW_TMPFILE" &
  claude_pid=$!
  wait "$claude_pid" 2>/dev/null || true
  claude_pid=""

  stop_spinner
else
  # Large commit — split into batches
  TOTAL_BATCHES=$(( (FILE_COUNT + BATCH_SIZE - 1) / BATCH_SIZE ))

  BATCH_LIST_DIR=$(mktemp -d)
  echo "$CHANGED_FILES" | awk -v size="$BATCH_SIZE" -v dir="$BATCH_LIST_DIR" '
    BEGIN { batch = 1 }
    { print >> (dir "/batch_" batch ".txt"); if (NR % size == 0) batch++ }
  '

  ALL_RESULTS=""
  BATCH_NUM=0

  for batch_file in "$BATCH_LIST_DIR"/batch_*.txt; do
    BATCH_NUM=$((BATCH_NUM + 1))
    batch_chunk=$(cat "$batch_file")
    batch_file_count=$(wc -l < "$batch_file" | tr -d ' ')

    start_spinner "Batch ${BATCH_NUM}/${TOTAL_BATCHES} (${batch_file_count} files)..." &
    spin_pid=$!

    batch_result_file="${RESULTS_DIR}/batch_${BATCH_NUM}.txt"
    run_batch_review "$BATCH_NUM" "$TOTAL_BATCHES" "$batch_chunk" > "$batch_result_file" &
    claude_pid=$!
    wait "$claude_pid" 2>/dev/null || true
    claude_pid=""

    stop_spinner

    batch_result=$(cat "$batch_result_file")
    ALL_RESULTS="${ALL_RESULTS}

=== BATCH ${BATCH_NUM}/${TOTAL_BATCHES} ===
${batch_result}"
  done

  rm -rf "$BATCH_LIST_DIR"

  # Final summary pass
  start_spinner "Combining batch results..." &
  spin_pid=$!

  run_summary "$ALL_RESULTS" > "$REVIEW_TMPFILE" &
  claude_pid=$!
  wait "$claude_pid" 2>/dev/null || true
  claude_pid=""

  stop_spinner
fi

# Save review to file
cp "$REVIEW_TMPFILE" "$REVIEW_FILE"
rm -f "$REVIEW_TMPFILE"
REVIEW_TMPFILE=""

# Return short JSON — Claude reads the file and presents it
jq -n --arg file "$REVIEW_FILE" \
  '{
    decision: "block",
    reason: ("Bug review complete (" + $file + "). Read this file and present the review findings to the user as formatted markdown.")
  }'

exit 0
