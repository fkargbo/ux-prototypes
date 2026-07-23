#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# open-pr.sh  —  Interactive PR opener for ux-prototypes
#
# Usage:
#   ./scripts/open-pr.sh
#
# What it does:
#   1. Shows you the commits that will be included in the PR.
#   2. Prompts you for title, description, Jira ticket, and who agreed to it.
#   3. Pushes your branch and opens a PR with a structured description.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RESET='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────
prompt() {
  local label="$1"
  local default="${2:-}"
  if [[ -n "$default" ]]; then
    echo -en "${CYAN}${label}${RESET} [${default}]: "
  else
    echo -en "${CYAN}${label}${RESET}: "
  fi
  read -r value
  echo "${value:-$default}"
}

multiline_prompt() {
  local label="$1"
  echo -e "${CYAN}${label}${RESET} (enter each item on a new line, blank line to finish):"
  local lines=()
  while IFS= read -r line; do
    [[ -z "$line" ]] && break
    lines+=("- $line")
  done
  printf '%s\n' "${lines[@]}"
}

# ── Pre-flight checks ─────────────────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  echo -e "${YELLOW}⚠️  GitHub CLI (gh) is not installed. Install it from https://cli.github.com${RESET}"
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)
DEFAULT_BASE="alerting-feedback-loop-iterations"

# Show commits that will be in the PR
AHEAD=$(git log --oneline "origin/${CURRENT_BRANCH}..HEAD" 2>/dev/null || true)
if [[ -z "$AHEAD" ]]; then
  echo -e "${YELLOW}⚠️  No commits ahead of origin/${CURRENT_BRANCH}. Nothing to push.${RESET}"
  exit 1
fi

echo ""
echo -e "${BOLD}── Commits to be included in this PR ───────────────────────────────────────${RESET}"
echo "$AHEAD"
echo -e "${BOLD}─────────────────────────────────────────────────────────────────────────────${RESET}"
echo ""

# ── Gather PR details ─────────────────────────────────────────────────────────
echo -e "${BOLD}Let's build your PR. Answer the prompts below:${RESET}"
echo ""

PR_TITLE=$(prompt "PR title (e.g. 'AI Hub 1.0.0: TechPreviewBadge + status alert polish')")
BASE_BRANCH=$(prompt "Base branch to merge into" "$DEFAULT_BASE")
REQUESTER=$(prompt "Your name (requester)" "Foday Kargbo (@fkargbo)")
SESSION_DATE=$(date +'%b %d, %Y')
JIRA_TICKET=$(prompt "Jira ticket (e.g. OLS-3661, or press Enter to skip)" "N/A")

echo ""
echo -e "${BOLD}What changed?${RESET}"
WHAT_CHANGED=$(multiline_prompt "Enter each change")

echo ""
echo -e "${BOLD}Why were these changes made?${RESET}"
WHY=$(prompt "Reason / motivation")

echo ""
echo -e "${BOLD}Any additional reviewers or approvers to mention?${RESET}"
ADDITIONAL_REVIEWERS=$(prompt "Additional agreed-by names (or press Enter to skip)" "")

# ── Build PR body ─────────────────────────────────────────────────────────────
AGREED_BY="- **Requester:** ${REQUESTER}"
if [[ -n "$ADDITIONAL_REVIEWERS" ]]; then
  AGREED_BY="${AGREED_BY}
- **Also agreed by:** ${ADDITIONAL_REVIEWERS}"
fi

PR_BODY="## What changed
${WHAT_CHANGED}

## Why
${WHY}

## Agreed by
${AGREED_BY}
- **Session date:** ${SESSION_DATE}
- **Jira ticket:** ${JIRA_TICKET}

---
*PR opened via \`scripts/open-pr.sh\` from branch \`${CURRENT_BRANCH}\`*"

# ── Preview ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}── PR Preview ───────────────────────────────────────────────────────────────${RESET}"
echo -e "${BOLD}Title:${RESET}  $PR_TITLE"
echo -e "${BOLD}Base:${RESET}   $BASE_BRANCH ← $CURRENT_BRANCH"
echo ""
echo -e "${BOLD}Body:${RESET}"
echo "$PR_BODY"
echo -e "${BOLD}─────────────────────────────────────────────────────────────────────────────${RESET}"
echo ""

CONFIRM=$(prompt "Push and open PR? (y/n)" "y")
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted. No changes pushed."
  exit 0
fi

# ── Push & create PR ──────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}Pushing ${CURRENT_BRANCH} to origin...${RESET}"
git push origin "$CURRENT_BRANCH"

echo -e "${CYAN}Creating PR...${RESET}"
gh pr create \
  --base "$BASE_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --title "$PR_TITLE" \
  --body "$PR_BODY"

echo ""
echo -e "${GREEN}✅  PR created! Opening in browser...${RESET}"
gh pr view --web
