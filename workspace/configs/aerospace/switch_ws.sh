#!/bin/bash
# switch_ws.sh - mode-aware wrapper for switch_ws callback

set -euo pipefail

source "/Users/jian/Dev/workspace/configs/aerospace/engine_runtime.sh"
dispatch_callback "switch_ws" "$@"
