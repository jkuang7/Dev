#!/usr/bin/env bash
set -euo pipefail

REPO_HOME="${TMUX_CLI_HOME:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
SOURCE_DIR="${CODEX_HOME:-/Users/jian/Dev/workspace/codex}/prompts"
DEST_DIR="$HOME/.codex/prompts"
mkdir -p "$DEST_DIR"
for prompt_name in run add runner-cycle runner-discover runner-implement runner-verify runner-closeout; do
  SRC="$SOURCE_DIR/$prompt_name.md"
  DEST="$DEST_DIR/$prompt_name.md"

  if [[ -e "$DEST" || -L "$DEST" ]]; then
    rm -f "$DEST"
  fi

  install -m 0644 "$SRC" "$DEST"
  echo "Installed prompt: $DEST <= $SRC"
done
