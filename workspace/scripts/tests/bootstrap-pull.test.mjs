import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const DEV_ROOT = "/Users/jian/Dev";
const BOOTSTRAP_PULL = path.join(DEV_ROOT, "workspace", "scripts", "bootstrap-pull.mjs");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });
}

function createOriginRepo(tempRoot) {
  const seedRoot = path.join(tempRoot, "seed");
  const originRoot = path.join(tempRoot, "origin.git");

  fs.mkdirSync(seedRoot, { recursive: true });
  git(["init"], seedRoot);
  git(["config", "user.name", "Test User"], seedRoot);
  git(["config", "user.email", "test@example.com"], seedRoot);
  writeFile(path.join(seedRoot, "README.md"), "v1\n");
  git(["add", "."], seedRoot);
  git(["commit", "-m", "initial"], seedRoot);
  git(["branch", "-M", "main"], seedRoot);
  git(["init", "--bare", originRoot], tempRoot);
  git(["remote", "add", "origin", originRoot], seedRoot);
  git(["push", "--set-upstream", "origin", "main"], seedRoot);

  return { originRoot, seedRoot };
}

function cloneDevRepo(originRoot, tempRoot) {
  const devRoot = path.join(tempRoot, "Dev");
  git(["clone", originRoot, devRoot], tempRoot);
  git(["checkout", "main"], devRoot);
  git(["config", "user.name", "Test User"], devRoot);
  git(["config", "user.email", "test@example.com"], devRoot);
  return devRoot;
}

function advanceOrigin(originRoot, tempRoot, contents) {
  const updateRoot = path.join(tempRoot, "update");
  git(["clone", originRoot, updateRoot], tempRoot);
  git(["checkout", "main"], updateRoot);
  git(["config", "user.name", "Test User"], updateRoot);
  git(["config", "user.email", "test@example.com"], updateRoot);
  writeFile(path.join(updateRoot, "README.md"), contents);
  git(["add", "README.md"], updateRoot);
  git(["commit", "-m", "update"], updateRoot);
  git(["push", "origin", "main"], updateRoot);
}

function createFakeBootstrapScript(tempRoot) {
  const scriptPath = path.join(tempRoot, "fake-bootstrap.mjs");
  writeFile(
    scriptPath,
    `import fs from "node:fs";
import path from "node:path";

const logPath = process.env.TEST_BOOTSTRAP_LOG;
if (!logPath) {
  throw new Error("Missing TEST_BOOTSTRAP_LOG");
}

fs.mkdirSync(path.dirname(logPath), { recursive: true });
fs.writeFileSync(logPath, JSON.stringify({ argv: process.argv.slice(2) }));
`,
  );
  return scriptPath;
}

function runBootstrapPull(args, options = {}) {
  return spawnSync(process.execPath, [BOOTSTRAP_PULL, ...args], {
    cwd: options.cwd ?? DEV_ROOT,
    env: options.env ?? process.env,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });
}

function assertSuccess(result) {
  assert.equal(result.status, 0, `STDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
}

test("bootstrap pull fast-forwards Dev before running bootstrap", () => {
  const tempRoot = makeTempDir("bootstrap-pull-ff-");

  try {
    const { originRoot } = createOriginRepo(tempRoot);
    const devRoot = cloneDevRepo(originRoot, tempRoot);
    advanceOrigin(originRoot, tempRoot, "v2\n");

    const logPath = path.join(tempRoot, "bootstrap-log.json");
    const bootstrapScript = createFakeBootstrapScript(tempRoot);
    const result = runBootstrapPull(
      ["--dev-root", devRoot, "--bootstrap-script", bootstrapScript, "--", "bootstrap"],
      {
        env: {
          ...process.env,
          TEST_BOOTSTRAP_LOG: logPath,
        },
      },
    );

    assertSuccess(result);
    assert.match(result.stdout, /\[Dev\] self-sync ok \(fast-forwarded main\)/);
    assert.equal(fs.readFileSync(path.join(devRoot, "README.md"), "utf8"), "v2\n");
    assert.deepEqual(JSON.parse(fs.readFileSync(logPath, "utf8")), { argv: ["bootstrap"] });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("bootstrap pull skips self-sync on dirty Dev worktree and still runs bootstrap", () => {
  const tempRoot = makeTempDir("bootstrap-pull-dirty-");

  try {
    const { originRoot } = createOriginRepo(tempRoot);
    const devRoot = cloneDevRepo(originRoot, tempRoot);
    writeFile(path.join(devRoot, "README.md"), "dirty\n");

    const logPath = path.join(tempRoot, "bootstrap-log.json");
    const bootstrapScript = createFakeBootstrapScript(tempRoot);
    const result = runBootstrapPull(
      ["--dev-root", devRoot, "--bootstrap-script", bootstrapScript, "--", "bootstrap"],
      {
        env: {
          ...process.env,
          TEST_BOOTSTRAP_LOG: logPath,
        },
      },
    );

    assertSuccess(result);
    assert.match(result.stderr, /\[Dev\] warning: self-sync skipped \(dirty worktree\)/);
    assert.equal(fs.readFileSync(path.join(devRoot, "README.md"), "utf8"), "dirty\n");
    assert.deepEqual(JSON.parse(fs.readFileSync(logPath, "utf8")), { argv: ["bootstrap"] });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
