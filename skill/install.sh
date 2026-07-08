#!/usr/bin/env bash
# Install the vaiven skill for Claude Code at the user level, so "add a vaiven
# figure here" works in any project. Re-run after editing the skill.
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)"
dest="${HOME}/.claude/skills/vaiven"
mkdir -p "$dest"
rsync -a --delete --exclude install.sh "$src"/ "$dest"/
echo "Installed vaiven skill → $dest"
