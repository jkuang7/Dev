#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROBLEMS_DIR="$SCRIPT_DIR/problems"
WORKSPACE_DIR="$SCRIPT_DIR/workspace"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: ./practice.sh <command> [problem-name]"
    echo ""
    echo "Commands:"
    echo "  list              Show all available problems"
    echo "  start <name>      Copy starter to workspace and show README"
    echo "  reset <name>      Delete workspace copy and re-copy starter"
    echo "  reveal <name>     Show the solution README"
    echo ""
    echo "Examples:"
    echo "  ./practice.sh list"
    echo "  ./practice.sh start rate-limiter"
    echo "  ./practice.sh reset rate-limiter"
    echo "  ./practice.sh reveal rate-limiter"
}

list_problems() {
    echo -e "${BLUE}Available Problems${NC}"
    echo "=================="
    echo ""

    if [ ! -d "$PROBLEMS_DIR" ] || [ -z "$(ls -A "$PROBLEMS_DIR" 2>/dev/null)" ]; then
        echo "No problems found in $PROBLEMS_DIR"
        exit 0
    fi

    for problem in "$PROBLEMS_DIR"/*/; do
        if [ -d "$problem" ]; then
            name=$(basename "$problem")
            readme="$problem/README.md"
            if [ -f "$readme" ]; then
                # Extract first line after # heading
                desc=$(grep -m1 "^[^#]" "$readme" 2>/dev/null | head -1 || echo "No description")
            else
                desc="No description"
            fi
            echo -e "${GREEN}$name${NC}"
            echo "  $desc"
            echo ""
        fi
    done
}

start_problem() {
    local name="$1"

    if [ -z "$name" ]; then
        echo -e "${RED}Error: Problem name required${NC}"
        echo "Usage: ./practice.sh start <problem-name>"
        exit 1
    fi

    local problem_dir="$PROBLEMS_DIR/$name"
    local starter_dir="$problem_dir/starter"
    local workspace_dest="$WORKSPACE_DIR/$name"

    if [ ! -d "$problem_dir" ]; then
        echo -e "${RED}Error: Problem '$name' not found${NC}"
        echo "Run './practice.sh list' to see available problems"
        exit 1
    fi

    if [ ! -d "$starter_dir" ]; then
        echo -e "${RED}Error: No starter code found for '$name'${NC}"
        exit 1
    fi

    # Create workspace if it doesn't exist
    mkdir -p "$WORKSPACE_DIR"

    # Check if already started
    if [ -d "$workspace_dest" ]; then
        echo -e "${YELLOW}Warning: workspace/$name already exists${NC}"
        echo "Use './practice.sh reset $name' to start fresh"
        exit 1
    fi

    # Copy starter to workspace
    cp -r "$starter_dir" "$workspace_dest"

    echo -e "${GREEN}Started: $name${NC}"
    echo ""

    # Show problem README
    if [ -f "$problem_dir/README.md" ]; then
        echo -e "${BLUE}=== Problem Description ===${NC}"
        echo ""
        cat "$problem_dir/README.md"
        echo ""
    fi

    echo -e "${BLUE}=== Next Steps ===${NC}"
    echo ""
    echo "  cd workspace/$name"
    echo "  npm install"
    echo "  npm test"
    echo ""
    echo "Good luck!"
}

reset_problem() {
    local name="$1"

    if [ -z "$name" ]; then
        echo -e "${RED}Error: Problem name required${NC}"
        echo "Usage: ./practice.sh reset <problem-name>"
        exit 1
    fi

    local problem_dir="$PROBLEMS_DIR/$name"
    local starter_dir="$problem_dir/starter"
    local workspace_dest="$WORKSPACE_DIR/$name"

    if [ ! -d "$problem_dir" ]; then
        echo -e "${RED}Error: Problem '$name' not found${NC}"
        exit 1
    fi

    # Remove existing workspace copy
    if [ -d "$workspace_dest" ]; then
        rm -rf "$workspace_dest"
        echo "Removed existing workspace/$name"
    fi

    # Copy fresh starter
    cp -r "$starter_dir" "$workspace_dest"

    echo -e "${GREEN}Reset: $name${NC}"
    echo ""
    echo "Fresh start ready at workspace/$name"
    echo ""
    echo "  cd workspace/$name"
    echo "  npm install"
    echo "  npm test"
}

reveal_solution() {
    local name="$1"

    if [ -z "$name" ]; then
        echo -e "${RED}Error: Problem name required${NC}"
        echo "Usage: ./practice.sh reveal <problem-name>"
        exit 1
    fi

    local problem_dir="$PROBLEMS_DIR/$name"
    local solution_dir="$problem_dir/solution"

    if [ ! -d "$problem_dir" ]; then
        echo -e "${RED}Error: Problem '$name' not found${NC}"
        exit 1
    fi

    if [ ! -d "$solution_dir" ]; then
        echo -e "${RED}Error: No solution found for '$name'${NC}"
        exit 1
    fi

    echo -e "${YELLOW}=== Solution: $name ===${NC}"
    echo ""

    # Show solution README if exists
    if [ -f "$solution_dir/README.md" ]; then
        cat "$solution_dir/README.md"
        echo ""
    fi

    # List solution files
    echo -e "${BLUE}=== Solution Files ===${NC}"
    echo ""
    for file in "$solution_dir"/*.ts "$solution_dir"/*.js; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo -e "${GREEN}--- $filename ---${NC}"
            cat "$file"
            echo ""
        fi
    done
}

# Main
case "${1:-}" in
    list)
        list_problems
        ;;
    start)
        start_problem "$2"
        ;;
    reset)
        reset_problem "$2"
        ;;
    reveal)
        reveal_solution "$2"
        ;;
    -h|--help|help)
        usage
        ;;
    *)
        usage
        exit 1
        ;;
esac
