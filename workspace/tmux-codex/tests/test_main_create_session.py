import io
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.main import create_session


class CreateSessionTests(unittest.TestCase):
    def test_create_session_checks_runner_prompt_install_before_launch(self):
        tmux_instance = MagicMock()

        with (
            patch("src.main.ensure_runner_prompt_install", return_value=None) as ensure_prompts,
            patch("src.main.get_tmux_config", return_value=None),
            patch("src.main.TmuxClient", return_value=tmux_instance),
            patch("src.main.os.getcwd", return_value="/tmp/project"),
            patch("src.main.print"),
        ):
            create_session([])

        ensure_prompts.assert_called_once_with()
        tmux_instance.create_session.assert_called_once()
        tmux_instance.attach.assert_called_once()

    def test_create_session_stops_when_runner_prompt_install_cannot_be_repaired(self):
        tmux_instance = MagicMock()
        stdout = io.StringIO()

        with (
            patch(
                "src.main.ensure_runner_prompt_install",
                return_value="Installed runner prompt is not linked to canonical source.",
            ),
            patch("src.main.get_tmux_config", return_value=None),
            patch("src.main.TmuxClient", return_value=tmux_instance),
            patch("sys.stdout", stdout),
        ):
            create_session([])

        tmux_instance.create_session.assert_not_called()
        tmux_instance.attach.assert_not_called()
        output = stdout.getvalue()
        self.assertIn("Prompt install check failed", output)
        self.assertIn("not linked to canonical source", output)


if __name__ == "__main__":
    unittest.main()
