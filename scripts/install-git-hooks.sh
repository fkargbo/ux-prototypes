#!/usr/bin/env bash
# Point this repo at committed hooks under scripts/git-hooks/ (pre-push submodule guard, etc.).
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
git config core.hooksPath scripts/git-hooks
echo "Configured: git config core.hooksPath scripts/git-hooks"
echo "Hooks in this repo now run from: $root/scripts/git-hooks"
echo "(Only scripts in that directory run — default sample hooks in .git/hooks are not used.)"
