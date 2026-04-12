# /mem - Initialize or Reset .memory/

Resource Hint: haiku

**Usage**: `/mem {project}` or `/mem --reset {project}`

---

## Workflow

1. Resolve project path: `$DEV/Repos/{project}`
2. If `.memory/` exists and no `--reset`: report current state and stop
3. If `--reset`: `rm -rf .memory/` then recreate
4. Create `.memory/` with empty four-file set:

```bash
mkdir -p "$DEV/Repos/{project}/.memory"
touch "$DEV/Repos/{project}/.memory"/{context,lessons,patterns,principles}.md
```

5. Verify `.memory/` is in project's `.gitignore`. If not, warn.

## Output

```
.memory/ initialized: Repos/{project}/.memory/
  context.md    (session continuity)
  lessons.md    (gotchas, failed approaches)
  patterns.md   (what works)
  principles.md (high-level rules)
```

If `--reset`: prefix with `Reset: wiped existing .memory/`

## No Args

If no project given, list all projects with .memory/ status:

```bash
for d in "$DEV/Repos"/*/; do
  name=$(basename "$d")
  [[ "$name" == .* ]] && continue
  if [ -d "$d/.memory" ]; then
    echo "  $name  [initialized]"
  else
    echo "  $name  -"
  fi
done
```
