#!/bin/bash
# on_window.sh - mode-aware wrapper for on_window callback

set -euo pipefail

source "/Users/jian/Dev/workspace/configs/aerospace/engine_runtime.sh"
dispatch_callback "on_window" "$@"
