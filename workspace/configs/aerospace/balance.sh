#!/bin/bash
# balance.sh - mode-aware wrapper for balance callback

set -euo pipefail

source "/Users/jian/Dev/workspace/configs/aerospace/engine_runtime.sh"
dispatch_callback "balance" "$@"
