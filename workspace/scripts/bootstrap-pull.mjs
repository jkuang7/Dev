#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DEV_ROOT = path.resolve(__dirname, "../..");

main();

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    syncDevRepo(args.devRoot);
    runBootstrap(args.bootstrapScript, args.bootstrapArgs);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function parseArgs(argv) {
  const args = {
    devRoot: DEFAULT_DEV_ROOT,
    bootstrapScript: null,
    bootstrapArgs: ["bootstrap"],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dev-root") {
      const value = argv[++index];
      if (!value) {
        throw new Error("Missing value for --dev-root");
      }
      args.devRoot = path.resolve(value);
      continue;
    }

    if (arg === "--bootstrap-script") {
      const value = argv[++index];
      if (!value) {
        throw new Error("Missing value for --bootstrap-script");
      }
      args.bootstrapScript = path.resolve(value);
      continue;
    }

    if (arg === "--") {
      args.bootstrapArgs = argv.slice(index + 1);
      break;
    }

    throw new Error(`Unexpected argument: ${arg}`);
  }

  args.bootstrapScript = args.bootstrapScript ?? path.join(args.devRoot, "workspace", "scripts", "repos-bootstrap.mjs");
  return args;
}

function syncDevRepo(devRoot) {
  const status = runCommandCapture("git", ["-C", devRoot, "status", "--porcelain"], {
    label: "[Dev] status",
  });
  if (status.stdout.trim()) {
    console.warn("[Dev] warning: self-sync skipped (dirty worktree)");
    return;
  }

  const branchResult = runCommandCapture("git", ["-C", devRoot, "symbolic-ref", "--quiet", "--short", "HEAD"], {
    label: "[Dev] branch",
    allowFailure: true,
  });
  if (branchResult.status !== 0) {
    console.warn("[Dev] warning: self-sync skipped (detached HEAD)");
    return;
  }

  const branch = branchResult.stdout.trim();
  if (!branch) {
    console.warn("[Dev] warning: self-sync skipped (no current branch)");
    return;
  }

  runCommand("git", ["-C", devRoot, "fetch", "--prune", "origin"], {
    cwd: devRoot,
    label: "[Dev] fetch",
  });

  const upstreamResult = runCommandCapture(
    "git",
    ["-C", devRoot, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
    {
      label: "[Dev] upstream",
      allowFailure: true,
    },
  );
  const remoteRef = upstreamResult.status === 0 ? upstreamResult.stdout.trim() : `origin/${branch}`;

  const remoteHead = runCommandCapture("git", ["-C", devRoot, "rev-parse", "--verify", remoteRef], {
    label: "[Dev] remote ref",
    allowFailure: true,
  });
  if (remoteHead.status !== 0) {
    console.warn(`[Dev] warning: self-sync skipped (missing ${remoteRef})`);
    return;
  }

  const localHead = runCommandCapture("git", ["-C", devRoot, "rev-parse", "HEAD"], {
    label: "[Dev] head",
  });
  if (localHead.stdout.trim() === remoteHead.stdout.trim()) {
    console.log(`[Dev] self-sync ok (already up to date on ${branch})`);
    return;
  }

  const ffCheck = runCommandCapture("git", ["-C", devRoot, "merge-base", "--is-ancestor", "HEAD", remoteRef], {
    label: "[Dev] fast-forward check",
    allowFailure: true,
  });
  if (ffCheck.status === 0) {
    runCommand("git", ["-C", devRoot, "pull", "--ff-only", "origin", branch], {
      cwd: devRoot,
      label: "[Dev] pull",
    });
    console.log(`[Dev] self-sync ok (fast-forwarded ${branch})`);
    return;
  }

  const aheadCheck = runCommandCapture("git", ["-C", devRoot, "merge-base", "--is-ancestor", remoteRef, "HEAD"], {
    label: "[Dev] ahead check",
    allowFailure: true,
  });
  if (aheadCheck.status === 0) {
    console.warn(`[Dev] warning: self-sync skipped (local ${branch} is ahead of ${remoteRef})`);
    return;
  }

  console.warn(`[Dev] warning: self-sync skipped (local ${branch} diverged from ${remoteRef})`);
}

function runBootstrap(bootstrapScript, bootstrapArgs) {
  const result = spawnSync(process.execPath, [bootstrapScript, ...bootstrapArgs], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`bootstrap failed with exit code ${result.status}`);
  }
}

function runCommand(commandName, args, options) {
  const result = spawnSync(commandName, args, {
    cwd: options.cwd,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      throw new Error(`${options.label} failed: executable not found (${commandName})`);
    }

    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${options.label} failed with exit code ${result.status}`);
  }
}

function runCommandCapture(commandName, args, options) {
  const result = spawnSync(commandName, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      throw new Error(`${options.label} failed: executable not found (${commandName})`);
    }

    throw result.error;
  }

  if (!options.allowFailure && result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(stderr ? `${options.label} failed: ${stderr}` : `${options.label} failed with exit code ${result.status}`);
  }

  return {
    status: result.status ?? 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}
