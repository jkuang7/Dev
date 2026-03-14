import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROMPTS_ROOT = ROOT / "prompts"


class RunDocsContractTests(unittest.TestCase):
    def test_run_spec_mentions_dynamic_gate_expansion(self):
        text = (ROOT / "run.md").read_text(encoding="utf-8")
        self.assertIn("RUNNER_DONE.lock", text)
        self.assertIn("/prompts:run_execute", text)
        self.assertIn("/prompts:run_update", text)
        self.assertIn("/prompts:run_setup", text)
        self.assertIn("TASKS.json", text)
        self.assertIn("RUNNER_CYCLE_PREPARED.json", text)
        self.assertIn("RUNNER_HANDOFF.md", text)
        self.assertIn(".memory/PRD.md", text)
        self.assertIn("temporary migration alias", text)
        self.assertIn("controller dispatches `/prompts:run_execute ...` and then `/prompts:run_update ...`", text)
        self.assertIn("run_setup.md", text)
        self.assertIn("run_execute.md", text)
        self.assertIn("run_update.md", text)

    def test_run_setup_prompt_exists_and_clears_then_sets_up(self):
        text = (PROMPTS_ROOT / "run_setup.md").read_text(encoding="utf-8")
        self.assertIn("runctl --clear", text)
        self.assertIn("confirm_token", text)
        self.assertIn("skip clear and run only", text)
        self.assertIn("Objective Seeding", text)
        self.assertIn("generic, or stale", text)
        self.assertIn("PRD.json", text)
        self.assertIn("TASKS.json", text)
        self.assertIn("Use the latest explicit user goal as the source of truth.", text)
        self.assertIn("For every seeded task:", text)
        self.assertIn("make acceptance fail-closed", text)
        self.assertIn("Task seeding must be narrow enough for a single runner slice:", text)
        self.assertIn("Do not seed broad task titles such as:", text)
        self.assertIn("seed acceptance as fail-closed, not approximate", text)
        self.assertIn("record the exact baseline commit or artifact", text)
        self.assertIn("For subjective polish or UX work that is not baseline matching:", text)
        self.assertIn("seeded first task title if relevant", text)
        self.assertIn("runctl --setup", text)
        self.assertIn("RUNNER_STATE.json", text)
        self.assertIn("TASKS.json", text)
        self.assertIn("Do not start the runner from this prompt.", text)

    def test_run_execute_prompt_exists_and_is_execute_only(self):
        text = (PROMPTS_ROOT / "run_execute.md").read_text(encoding="utf-8")
        self.assertIn("RUNNER_EXEC_CONTEXT.json", text)
        self.assertIn("medium bounded infinite-runner work slice", text)
        self.assertIn("The runner controller will invoke `/prompts:run_update`", text)
        self.assertIn("treat the current `TT-*` as the stable unit of ownership", text)
        self.assertIn("keep the active task open until its acceptance criteria are actually satisfied", text)
        self.assertIn("stay on the same `TT-*` across cycles by default", text)
        self.assertIn("update `TASKS.json` first so the task is marked done before handoff", text)
        self.assertIn("include its canonical task id in the structured runner update", text)
        self.assertIn("if new in-scope acceptance criteria are discovered", text)
        self.assertIn("do not move to a different task while the current task's acceptance is still unmet", text)
        self.assertIn("Any problems with the current implementation?", text)
        self.assertIn("name every real remaining issue", text)
        self.assertIn("treat that as fail-closed", text)
        self.assertIn("do not use `phase_done=yes` for a parity-style task", text)
        self.assertIn("for subjective polish or UX tasks, require direct evidence", text)
        self.assertIn("phase_done=<yes|no>", text)

    def test_run_update_prompt_exists_and_is_update_only(self):
        text = (PROMPTS_ROOT / "run_update.md").read_text(encoding="utf-8")
        self.assertIn("runctl --refresh --quiet", text)
        self.assertIn("runctl --prepare-cycle --quiet", text)
        self.assertIn("preserve or strengthen the active task acceptance/validation contract", text)
        self.assertIn("preserve the active `TT-*` by default until its acceptance is fully cleared", text)
        self.assertIn("keep the current task active when its acceptance criteria are still unmet", text)
        self.assertIn("if execution discovered new in-scope acceptance criteria", text)
        self.assertIn("if the same `TT-*` survives multiple cycles", text)
        self.assertIn("do not let refresh rewrite a fail-closed task into approximate wording", text)
        self.assertIn("must remain fail-closed", text)
        self.assertIn("prepared_marker=<yes|no>", text)
        self.assertIn('::archive{reason="Runner cycle complete; restarting fresh"}', text)

    def test_add_prompt_exists_and_queues_runner_task_intake(self):
        text = (PROMPTS_ROOT / "add.md").read_text(encoding="utf-8")
        self.assertIn("runctl --task add", text)
        self.assertIn("runctl --task set", text)
        self.assertIn("RUNNER_STATE.json", text)
        self.assertIn("TASKS.json", text)
        self.assertIn("If the human gives a repo path ending in `.memory`", text)
        self.assertIn("/Users/jian/Dev/Repos/time-track/.memory", text)
        self.assertIn("If the request is short or underspecified, combine it with the active conversation context", text)
        self.assertIn("Treat the current conversation as the default repo signal", text)
        self.assertIn(".memory/PRD.md", text)
        self.assertIn(".memory/lessons.md", text)
        self.assertIn("Existing Task Triage", text)
        self.assertIn("RUNNER_TASK_INTAKE.json", text)
        self.assertIn("Do not create or refresh runner setup from `/add`.", text)
        self.assertIn("`--allow-preempt` only if the human explicitly asks", text)
        self.assertIn("If more than one plausible runner root exists, ask the human", text)
        self.assertIn("/prompts:run_setup", text)

    def test_legacy_phase_prompts_are_not_required_in_default_install(self):
        for prompt_name in ("run.md", "run_clear.md", "runner-cycle.md", "runner-discover.md", "runner-implement.md", "runner-verify.md", "runner-closeout.md"):
            self.assertFalse((PROMPTS_ROOT / prompt_name).exists())

    def test_install_script_links_add_prompt(self):
        text = (ROOT / "scripts" / "install-codex-run-prompt.sh").read_text(encoding="utf-8")
        self.assertIn('SOURCE_DIR="$REPO_HOME/prompts"', text)
        self.assertIn("for prompt_name in run_setup run_execute run_update add", text)
        self.assertIn("for legacy_prompt in run run_clear runner-cycle runner-discover runner-implement runner-verify runner-closeout", text)
        self.assertIn("ln -s", text)


if __name__ == "__main__":
    unittest.main()
