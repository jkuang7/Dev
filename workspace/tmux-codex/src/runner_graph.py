"""Script-owned dependency graph artifacts for runner planning and reseeding."""

from __future__ import annotations

import fnmatch
import hashlib
import json
import os
import shlex
import subprocess
from pathlib import Path
from typing import Any

from .runner_state import RunnerStatePaths, read_json, utc_now, write_json

GRAPH_SOURCE_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
GRAPH_MODE_DEPENDENCY_CRUISER = "dependency_cruiser"
DEFAULT_PHASE_BOUNDARIES = ["seam", "shim", "consumer_migration", "convergence", "removal"]
DEFAULT_GRAPH_POLICY = "hybrid"
DEFAULT_ACTIONABLE_FRONTIER = "one_open"


def _as_text(value: Any) -> str:
    return str(value or "").strip()


def _normalize_relpath(path: str) -> str:
    normalized = path.replace("\\", "/").strip()
    while normalized.startswith("./"):
        normalized = normalized[2:]
    return normalized.lstrip("/")


def _normalize_text_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    items: list[str] = []
    for item in value:
        text = _normalize_relpath(_as_text(item))
        if text:
            items.append(text)
    return items


def _normalize_label_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    items: list[str] = []
    for item in value:
        text = _as_text(item)
        if text:
            items.append(text)
    return items


def _graph_artifact_files(paths: RunnerStatePaths) -> list[Path]:
    return [
        paths.dep_graph_json,
        paths.graph_active_slice_json,
        paths.graph_boundaries_json,
        paths.graph_hotspots_json,
    ]


def clear_runner_graph_artifacts(paths: RunnerStatePaths) -> None:
    for path in _graph_artifact_files(paths):
        path.unlink(missing_ok=True)


def _load_graph_config(project_root: Path) -> dict[str, Any] | None:
    context_pack = read_json(project_root / ".codex" / "context-pack.json")
    if not isinstance(context_pack, dict):
        return None
    raw = context_pack.get("graphConfig")
    if not isinstance(raw, dict) or not bool(raw.get("enabled")):
        return None

    mode = _as_text(raw.get("graph_mode") or raw.get("mode")).lower()
    if mode != GRAPH_MODE_DEPENDENCY_CRUISER:
        return None

    roots = _normalize_text_list(raw.get("graph_roots") or raw.get("roots"))
    if not roots:
        return None

    config_path = _normalize_relpath(_as_text(raw.get("configPath") or ".dependency-cruiser.cjs"))
    tool_command = _as_text(raw.get("toolCommand") or "pnpm exec depcruise")
    grouping = _as_text(raw.get("graph_grouping") or raw.get("grouping") or "folder_prefix")
    entry_policy = _as_text(raw.get("graph_entry_policy") or raw.get("entryPolicy") or "source_only")
    ignore_paths = _normalize_text_list(raw.get("ignore_paths") or raw.get("ignorePaths"))
    boundaries_raw = raw.get("boundaries")
    boundaries: list[dict[str, Any]] = []
    if isinstance(boundaries_raw, list):
        for item in boundaries_raw:
            if not isinstance(item, dict):
                continue
            label = _as_text(item.get("label"))
            prefixes = _normalize_text_list(item.get("prefixes"))
            if label and prefixes:
                boundaries.append({"label": label, "prefixes": prefixes})
    cluster_overrides_raw = raw.get("clusterOverrides")
    cluster_overrides: list[dict[str, Any]] = []
    if isinstance(cluster_overrides_raw, list):
        for item in cluster_overrides_raw:
            if not isinstance(item, dict):
                continue
            label = _as_text(item.get("label"))
            prefixes = _normalize_text_list(item.get("prefixes"))
            if label and prefixes:
                cluster_overrides.append({"label": label, "prefixes": prefixes})

    slice_priority = _normalize_label_list(raw.get("slicePriority"))
    phase_boundaries = _normalize_label_list(raw.get("phaseBoundaries")) or list(DEFAULT_PHASE_BOUNDARIES)
    graph_policy = _as_text(raw.get("graphPolicy") or DEFAULT_GRAPH_POLICY).lower() or DEFAULT_GRAPH_POLICY
    actionable_frontier = (
        _as_text(raw.get("actionableFrontier") or DEFAULT_ACTIONABLE_FRONTIER).lower() or DEFAULT_ACTIONABLE_FRONTIER
    )

    return {
        "enabled": True,
        "mode": GRAPH_MODE_DEPENDENCY_CRUISER,
        "roots": roots,
        "config_path": config_path,
        "tool_command": tool_command,
        "grouping": grouping or "folder_prefix",
        "entry_policy": entry_policy or "source_only",
        "ignore_paths": ignore_paths,
        "boundaries": boundaries,
        "cluster_overrides": cluster_overrides,
        "slice_priority": slice_priority,
        "phase_boundaries": phase_boundaries,
        "graph_policy": graph_policy,
        "actionable_frontier": actionable_frontier,
    }


def load_graph_config_for_project(project_root: Path) -> dict[str, Any] | None:
    return _load_graph_config(project_root)


def _should_ignore_path(relative_path: str, ignore_paths: list[str]) -> bool:
    normalized = _normalize_relpath(relative_path)
    if any(part in {"node_modules", ".git", ".next", "dist", "coverage"} for part in Path(normalized).parts):
        return True
    for pattern in ignore_paths:
        token = _normalize_relpath(pattern)
        if not token:
            continue
        if fnmatch.fnmatch(normalized, token):
            return True
        if token in normalized:
            return True
    return False


def _iter_graph_source_files(project_root: Path, config: dict[str, Any]) -> list[Path]:
    files: list[Path] = []
    for root_text in config["roots"]:
        root = (project_root / root_text).resolve()
        if not root.exists() or not root.is_dir():
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            rel_dir = _normalize_relpath(os.path.relpath(dirpath, project_root))
            dirnames[:] = [
                name
                for name in dirnames
                if not _should_ignore_path(_normalize_relpath(f"{rel_dir}/{name}" if rel_dir != "." else name), config["ignore_paths"])
            ]
            for filename in filenames:
                path = Path(dirpath) / filename
                if path.suffix.lower() not in GRAPH_SOURCE_SUFFIXES:
                    continue
                rel = _normalize_relpath(os.path.relpath(path, project_root))
                if _should_ignore_path(rel, config["ignore_paths"]):
                    continue
                files.append(path)
    files.sort()
    return files


def _compute_graph_input_digest(project_root: Path, config: dict[str, Any]) -> str:
    digest = hashlib.sha1(usedforsecurity=False)
    digest.update(json.dumps(config, sort_keys=True).encode("utf-8"))
    for rel in (
        "package.json",
        "pnpm-lock.yaml",
        "tsconfig.json",
        ".codex/context-pack.json",
        config["config_path"],
    ):
        path = (project_root / rel).resolve()
        if not path.exists() or not path.is_file():
            continue
        stat = path.stat()
        digest.update(f"meta:{_normalize_relpath(os.path.relpath(path, project_root))}:{stat.st_size}:{stat.st_mtime_ns}".encode("utf-8"))
    for path in _iter_graph_source_files(project_root, config):
        stat = path.stat()
        rel = _normalize_relpath(os.path.relpath(path, project_root))
        digest.update(f"src:{rel}:{stat.st_size}:{stat.st_mtime_ns}".encode("utf-8"))
    return digest.hexdigest()


def _group_for_path(relative_path: str, config: dict[str, Any]) -> str:
    normalized = _normalize_relpath(relative_path)
    for override in config.get("cluster_overrides", []):
        prefixes = override.get("prefixes") or []
        if any(normalized.startswith(prefix) for prefix in prefixes):
            return _as_text(override.get("label")) or "unknown"
    for boundary in config.get("boundaries", []):
        prefixes = boundary.get("prefixes") or []
        if any(normalized.startswith(prefix) for prefix in prefixes):
            return _as_text(boundary.get("label")) or "unknown"
    if config.get("grouping") == "folder_prefix":
        parts = Path(normalized).parts
        if len(parts) >= 3 and parts[0] == "desktop" and parts[1] == "src":
            return parts[2]
        if len(parts) >= 5 and parts[0] == "libs" and parts[1] == "desktop":
            return f"{parts[2]}/{parts[4] if parts[3] == 'src' and len(parts) > 4 else parts[3]}"
        if len(parts) >= 2:
            return "/".join(parts[:2])
    return "unknown"


def _run_dependency_cruiser(project_root: Path, config: dict[str, Any]) -> dict[str, Any] | None:
    command = shlex.split(config["tool_command"])
    if not command:
        return None
    full_command = [
        *command,
        "--config",
        config["config_path"],
        "--output-type",
        "json",
        *config["roots"],
    ]
    try:
        completed = subprocess.run(
            full_command,
            cwd=project_root,
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError:
        return None
    if completed.returncode != 0:
        return None
    try:
        payload = json.loads(completed.stdout)
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def _normalize_graph_payload(project_root: Path, raw_payload: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    modules_raw = raw_payload.get("modules")
    if not isinstance(modules_raw, list):
        return {"modules": [], "cycles": []}
    seen_paths: set[str] = set()
    module_entries: list[dict[str, Any]] = []
    dep_map: dict[str, list[str]] = {}
    dependent_map: dict[str, set[str]] = {}
    cycle_paths: set[str] = set()

    for raw_module in modules_raw:
        if not isinstance(raw_module, dict):
            continue
        source = _normalize_relpath(_as_text(raw_module.get("source")))
        if not source or source.startswith("../") or source in seen_paths:
            continue
        seen_paths.add(source)
        dependencies: list[str] = []
        circular = False
        for raw_dep in raw_module.get("dependencies", []):
            if not isinstance(raw_dep, dict):
                continue
            resolved = _normalize_relpath(_as_text(raw_dep.get("resolved") or raw_dep.get("module")))
            if not resolved or resolved.startswith("../"):
                continue
            if _should_ignore_path(resolved, config["ignore_paths"]):
                continue
            if resolved not in dependencies:
                dependencies.append(resolved)
            dependent_map.setdefault(resolved, set()).add(source)
            if bool(raw_dep.get("circular")):
                circular = True
                cycle_paths.add(source)
                cycle_paths.add(resolved)
        dep_map[source] = dependencies
        module_entries.append(
            {
                "path": source,
                "group": _group_for_path(source, config),
                "dependencies": dependencies,
                "circular": circular,
            }
        )

    module_entries.sort(key=lambda item: item["path"])
    modules: list[dict[str, Any]] = []
    for entry in module_entries:
        dependents = sorted(dependent_map.get(entry["path"], set()))
        modules.append(
            {
                "path": entry["path"],
                "group": entry["group"],
                "dependencies": entry["dependencies"],
                "dependents": dependents,
                "fan_in": len(dependents),
                "fan_out": len(entry["dependencies"]),
                "circular": bool(entry["circular"]),
            }
        )

    cycles = sorted(cycle_paths)
    return {"modules": modules, "cycles": cycles}


def _build_boundary_summary(modules: list[dict[str, Any]]) -> dict[str, Any]:
    edge_map: dict[tuple[str, str], dict[str, Any]] = {}
    group_counts: dict[str, int] = {}
    for module in modules:
        group = _as_text(module.get("group")) or "unknown"
        group_counts[group] = group_counts.get(group, 0) + 1
    module_lookup = {str(module["path"]): module for module in modules}
    for module in modules:
        from_group = _as_text(module.get("group")) or "unknown"
        for dep in module.get("dependencies", []):
            dep_module = module_lookup.get(dep)
            if not dep_module:
                continue
            to_group = _as_text(dep_module.get("group")) or "unknown"
            if to_group == from_group:
                continue
            key = (from_group, to_group)
            bucket = edge_map.setdefault(key, {"from": from_group, "to": to_group, "count": 0, "examples": []})
            bucket["count"] += 1
            if len(bucket["examples"]) < 3:
                bucket["examples"].append(f"{module['path']} -> {dep}")
    edges = sorted(edge_map.values(), key=lambda item: (-int(item["count"]), item["from"], item["to"]))
    groups = [
        {"label": label, "module_count": count}
        for label, count in sorted(group_counts.items(), key=lambda item: (-item[1], item[0]))
    ]
    return {"groups": groups, "cross_group_edges_top20": edges[:20]}


def _build_hotspots_summary(modules: list[dict[str, Any]], cycles: list[str]) -> dict[str, Any]:
    fan_in = sorted(modules, key=lambda item: (-int(item.get("fan_in", 0)), item["path"]))[:10]
    fan_out = sorted(modules, key=lambda item: (-int(item.get("fan_out", 0)), item["path"]))[:10]
    circular = [module for module in modules if bool(module.get("circular"))][:10]
    return {
        "fan_in_top10": [
            {"path": module["path"], "group": module["group"], "fan_in": module["fan_in"]}
            for module in fan_in
        ],
        "fan_out_top10": [
            {"path": module["path"], "group": module["group"], "fan_out": module["fan_out"]}
            for module in fan_out
        ],
        "circular_modules_top10": [
            {"path": module["path"], "group": module["group"]}
            for module in circular
        ],
        "cycle_module_paths_top20": cycles[:20],
    }


def _matches_task_patterns(relative_path: str, patterns: list[str]) -> bool:
    normalized = _normalize_relpath(relative_path)
    for pattern in patterns:
        candidate = _normalize_relpath(pattern)
        if not candidate:
            continue
        if fnmatch.fnmatch(normalized, candidate):
            return True
        if candidate.endswith("*") and normalized.startswith(candidate.rstrip("*")):
            return True
        if candidate.endswith("/**") and normalized.startswith(candidate[:-3]):
            return True
    return False


def _build_active_slice_summary(
    *,
    modules: list[dict[str, Any]],
    selected_task: dict[str, Any] | None,
    boundary_summary: dict[str, Any],
) -> dict[str, Any]:
    task_id = _as_text((selected_task or {}).get("task_id"))
    touch_paths = _normalize_text_list((selected_task or {}).get("touch_paths"))
    module_lookup = {str(module["path"]): module for module in modules}
    seed_modules = [module for module in modules if _matches_task_patterns(str(module["path"]), touch_paths)]
    if not seed_modules and isinstance(selected_task, dict):
        title_hint = _as_text(selected_task.get("title")).lower()
        seed_modules = [
            module
            for module in modules
            if any(part and part in str(module["path"]).lower() for part in title_hint.replace("-", " ").split()[:3])
        ][:4]

    dependency_neighbors: dict[str, dict[str, Any]] = {}
    dependent_neighbors: dict[str, dict[str, Any]] = {}
    cluster_counts: dict[str, int] = {}
    seed_paths: list[str] = []
    for module in seed_modules:
        group = _as_text(module.get("group")) or "unknown"
        cluster_counts[group] = cluster_counts.get(group, 0) + 1
        seed_paths.append(str(module["path"]))
        for dep in module.get("dependencies", []):
            dep_module = module_lookup.get(dep)
            if dep_module and dep not in dependency_neighbors:
                dependency_neighbors[dep] = dep_module
        for dep in module.get("dependents", []):
            dep_module = module_lookup.get(dep)
            if dep_module and dep not in dependent_neighbors:
                dependent_neighbors[dep] = dep_module

    cluster_label = None
    if cluster_counts:
        cluster_label = sorted(cluster_counts.items(), key=lambda item: (-item[1], item[0]))[0][0]

    adjacent_group_counts: dict[str, int] = {}
    boundary_warnings: list[str] = []
    for neighbor in list(dependency_neighbors.values()) + list(dependent_neighbors.values()):
        group = _as_text(neighbor.get("group")) or "unknown"
        if group and group != cluster_label:
            adjacent_group_counts[group] = adjacent_group_counts.get(group, 0) + 1
    for edge in boundary_summary.get("cross_group_edges_top20", []):
        if not isinstance(edge, dict):
            continue
        examples = edge.get("examples") or []
        if any(seed in example for seed in seed_paths for example in examples):
            boundary_warnings.append(
                f"{edge.get('from')} crosses into {edge.get('to')} ({edge.get('count')} edges)"
            )
    adjacent_groups = [
        label
        for label, _count in sorted(adjacent_group_counts.items(), key=lambda item: (-item[1], item[0]))[:3]
    ]
    active_slice = {
        "selected_task_id": task_id or None,
        "graph_cluster_label": cluster_label,
        "matched_modules": seed_paths[:8],
        "dependencies_1hop": [
            {"path": module["path"], "group": module["group"]}
            for module in sorted(dependency_neighbors.values(), key=lambda item: str(item["path"]))[:8]
        ],
        "dependents_1hop": [
            {"path": module["path"], "group": module["group"]}
            for module in sorted(dependent_neighbors.values(), key=lambda item: str(item["path"]))[:8]
        ],
        "graph_adjacent_families_top3": adjacent_groups,
        "graph_boundary_warnings_top3": boundary_warnings[:3],
    }
    active_slice["graph_active_slice_digest"] = hashlib.sha1(
        json.dumps(active_slice, sort_keys=True, separators=(",", ":")).encode("utf-8"),
        usedforsecurity=False,
    ).hexdigest()
    return active_slice


def _build_slice_reason(
    *,
    task: dict[str, Any] | None,
    active_slice: dict[str, Any],
    dirty_paths: list[str],
    config: dict[str, Any],
) -> str | None:
    task_id = _as_text((task or {}).get("task_id"))
    cluster_label = _as_text(active_slice.get("graph_cluster_label"))
    matched_modules = [str(item).strip() for item in active_slice.get("matched_modules", []) if str(item).strip()]
    adjacent = [str(item).strip() for item in active_slice.get("graph_adjacent_families_top3", []) if str(item).strip()]
    if not cluster_label and not matched_modules:
        if task_id:
            return (
                f"Graph could not localize {task_id}; keep the slice bounded to its declared touch_paths until a clearer "
                "cluster emerges."
            )
        return None

    dirty_overlap = 0
    for path in dirty_paths:
        if cluster_label and _group_for_path(path, config) == cluster_label:
            dirty_overlap += 1
            continue
        if any(path == module or path.startswith(f"{module}/") for module in matched_modules):
            dirty_overlap += 1

    if cluster_label and dirty_overlap > 0:
        return (
            f"Hybrid graph choice: {task_id or 'selected task'} stays on the `{cluster_label}` cluster because "
            f"{dirty_overlap} dirty path(s) already align with that neighborhood."
        )
    if cluster_label and adjacent:
        return (
            f"Graph-local slice: keep `{task_id or 'selected task'}` inside `{cluster_label}` and fail closed before "
            f"widening into `{adjacent[0]}`."
        )
    if cluster_label:
        return f"Graph-local slice: `{task_id or 'selected task'}` is anchored to `{cluster_label}`."
    return None


def summarize_task_graph_slice(
    *,
    project_root: Path,
    paths: RunnerStatePaths,
    task: dict[str, Any] | None,
    dirty_paths: list[str] | None = None,
) -> dict[str, Any]:
    config = _load_graph_config(project_root)
    if config is None:
        return {
            "graph_enabled": False,
            "graph_cluster_label": None,
            "graph_adjacent_families_top3": [],
            "graph_boundary_warnings_top3": [],
            "graph_active_slice_digest": None,
            "graph_slice_reason": None,
            "matched_modules": [],
            "dirty_overlap_count": 0,
        }

    cached_graph = read_json(paths.dep_graph_json)
    boundary_payload = read_json(paths.graph_boundaries_json)
    modules = cached_graph.get("modules") if isinstance(cached_graph, dict) else []
    cross_group_edges = boundary_payload.get("cross_group_edges_top20") if isinstance(boundary_payload, dict) else []
    if not isinstance(modules, list):
        modules = []
    if not isinstance(cross_group_edges, list):
        cross_group_edges = []

    active_slice = _build_active_slice_summary(
        modules=modules,
        selected_task=task,
        boundary_summary={"cross_group_edges_top20": cross_group_edges},
    )
    dirty_list = [_normalize_relpath(path) for path in (dirty_paths or []) if _as_text(path)]
    reason = _build_slice_reason(
        task=task,
        active_slice=active_slice,
        dirty_paths=dirty_list,
        config=config,
    )

    dirty_overlap_count = 0
    cluster_label = _as_text(active_slice.get("graph_cluster_label"))
    matched_modules = [str(item).strip() for item in active_slice.get("matched_modules", []) if str(item).strip()]
    for path in dirty_list:
        if cluster_label and _group_for_path(path, config) == cluster_label:
            dirty_overlap_count += 1
        elif any(path == module or path.startswith(f"{module}/") for module in matched_modules):
            dirty_overlap_count += 1

    return {
        "graph_enabled": True,
        "graph_cluster_label": active_slice.get("graph_cluster_label"),
        "graph_adjacent_families_top3": active_slice.get("graph_adjacent_families_top3") or [],
        "graph_boundary_warnings_top3": active_slice.get("graph_boundary_warnings_top3") or [],
        "graph_active_slice_digest": active_slice.get("graph_active_slice_digest"),
        "graph_slice_reason": reason,
        "matched_modules": matched_modules,
        "dirty_overlap_count": dirty_overlap_count,
    }


def build_runner_graph_artifacts(
    *,
    project_root: Path,
    paths: RunnerStatePaths,
    selected_task: dict[str, Any] | None,
    dirty_paths: list[str] | None = None,
) -> dict[str, Any]:
    config = _load_graph_config(project_root)
    if config is None:
        clear_runner_graph_artifacts(paths)
        return {
            "graph_enabled": False,
            "graph_digest": None,
            "graph_active_slice_digest": None,
            "graph_cluster_label": None,
            "graph_adjacent_families_top3": [],
            "graph_boundary_warnings_top3": [],
        }

    input_digest = _compute_graph_input_digest(project_root, config)
    cached = read_json(paths.dep_graph_json)
    normalized_payload: dict[str, Any] | None = None
    graph_digest: str | None = None

    if (
        isinstance(cached, dict)
        and _as_text(cached.get("input_digest")) == input_digest
        and _as_text(cached.get("mode")) == GRAPH_MODE_DEPENDENCY_CRUISER
        and isinstance(cached.get("modules"), list)
    ):
        normalized_payload = cached
        graph_digest = _as_text(cached.get("graph_digest")) or None
    else:
        raw_payload = _run_dependency_cruiser(project_root, config)
        if raw_payload is None:
            clear_runner_graph_artifacts(paths)
            return {
                "graph_enabled": False,
                "graph_digest": None,
                "graph_active_slice_digest": None,
                "graph_cluster_label": None,
                "graph_adjacent_families_top3": [],
                "graph_boundary_warnings_top3": [],
            }
        normalized = _normalize_graph_payload(project_root, raw_payload, config)
        graph_digest = hashlib.sha1(
            json.dumps(normalized, sort_keys=True, separators=(",", ":")).encode("utf-8"),
            usedforsecurity=False,
        ).hexdigest()
        normalized_payload = {
            "mode": GRAPH_MODE_DEPENDENCY_CRUISER,
            "input_digest": input_digest,
            "graph_digest": graph_digest,
            "generated_at": utc_now(),
            "roots": config["roots"],
            "config_path": config["config_path"],
            "modules": normalized["modules"],
            "cycles": normalized["cycles"],
        }
        write_json(paths.dep_graph_json, normalized_payload)

    modules = normalized_payload.get("modules") if isinstance(normalized_payload, dict) else []
    cycles = normalized_payload.get("cycles") if isinstance(normalized_payload, dict) else []
    modules = modules if isinstance(modules, list) else []
    cycles = cycles if isinstance(cycles, list) else []
    boundary_summary = _build_boundary_summary(modules)
    boundary_payload = {
        "graph_digest": graph_digest,
        "generated_at": utc_now(),
        **boundary_summary,
    }
    hotspot_summary = _build_hotspots_summary(modules, [str(item) for item in cycles if str(item).strip()])
    hotspot_payload = {
        "graph_digest": graph_digest,
        "generated_at": utc_now(),
        **hotspot_summary,
    }
    active_slice = _build_active_slice_summary(
        modules=modules,
        selected_task=selected_task,
        boundary_summary=boundary_summary,
    )
    dirty_list = [_normalize_relpath(path) for path in (dirty_paths or []) if _as_text(path)]
    graph_slice_reason = _build_slice_reason(
        task=selected_task,
        active_slice=active_slice,
        dirty_paths=dirty_list,
        config=config,
    )
    active_slice_payload = {
        "graph_digest": graph_digest,
        "generated_at": utc_now(),
        "graph_slice_reason": graph_slice_reason,
        **active_slice,
    }
    write_json(paths.graph_boundaries_json, boundary_payload)
    write_json(paths.graph_hotspots_json, hotspot_payload)
    write_json(paths.graph_active_slice_json, active_slice_payload)

    return {
        "graph_enabled": True,
        "graph_digest": graph_digest,
        "graph_active_slice_digest": active_slice.get("graph_active_slice_digest"),
        "graph_cluster_label": active_slice.get("graph_cluster_label"),
        "graph_adjacent_families_top3": active_slice.get("graph_adjacent_families_top3") or [],
        "graph_boundary_warnings_top3": active_slice.get("graph_boundary_warnings_top3") or [],
        "graph_slice_reason": graph_slice_reason,
    }


def run_runner_build_graph_command(
    *,
    project_root: Path,
    paths: RunnerStatePaths,
    selected_task: dict[str, Any] | None,
) -> dict[str, Any]:
    return build_runner_graph_artifacts(
        project_root=project_root,
        paths=paths,
        selected_task=selected_task,
        dirty_paths=None,
    )
