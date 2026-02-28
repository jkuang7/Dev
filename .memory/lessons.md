# Lessons

Use this file to capture repeatable debugging and implementation lessons for this project.

## Entry template

## YYYY-MM-DD - Short title
- Context:
- Symptom:
- Root cause:
- Fix:
- Verification:
- Regression test:
- Follow-up:

## 2026-02-26 - Launchd scripts need explicit PATH for Homebrew tools
- Context: Migrated monitor brightness automation from Lunar to MonitorControl + launchd scripts.
- Symptom: LaunchAgent login run failed with `no supported brightness backend found` while manual shell run succeeded.
- Root cause: launchd environment did not include Homebrew binary paths (`/opt/homebrew/bin`).
- Fix: Added explicit PATH export in `/Users/jian/scripts/monitorcontrol-brightness.sh`.
- Verification: `launchctl kickstart -k gui/$(id -u)/com.jian.monitorcontrol.login` then log showed successful apply output.
- Regression test: Script dry-run and live-run executed after PATH fix; launchctl job list confirmed agents loaded.
- Follow-up: Keep PATH export in all launchd-executed scripts that depend on Homebrew binaries.

## 2026-02-26 - Disable skhd immediately on keyboard lockups
- Context: Tried binding monitor brightness toggle to F1/fn+1 using skhd.
- Symptom: User reported keyboard became unusable while skhd was active.
- Root cause: Hotkey daemon + key capture experiments (including observe/debug attempts) created an unsafe input state for user workflow.
- Fix: Stopped skhd service, booted out launch agent, killed skhd process, removed skhd launch plist and ~/.skhdrc.
- Verification: `launchctl list` no longer shows `com.koekeishiya.skhd`, `pgrep` shows no skhd process, no skhd launch/config files in place.
- Regression test: N/A (runtime service configuration issue, no automated test harness in this repo).
- Follow-up: Use app-native shortcuts for monitor tools; avoid global hotkey daemons unless explicitly approved.

## 2026-02-26 - Neo keyboard hotkeys need media-key literals plus fallback
- Context: Needed a single hotkey to toggle day/night brightness profiles via script.
- Symptom: F1/fn+1 behavior was inconsistent and prior wide key capture attempts caused unsafe keyboard behavior.
- Root cause: Non-standard keyboard layers emitted media-key events differently than plain F-key assumptions.
- Fix: Use minimal `skhd` bindings for `brightness_down`, `f1`, and `fn - 1` only, with an emergency stop bind; avoid broad keycode capture.
- Verification: `skhd -k "f1"` and `skhd -k "brightness_down"` both toggled `/Users/jian/.local/state/monitor-brightness-mode` and appended apply logs.
- Regression test: Replayed two synthetic presses and confirmed state transitioned `night -> day -> night`.
- Follow-up: Keep MonitorControl native keyboard hook disabled (`keyboardBrightness=3`) to avoid double-handling.

## 2026-02-26 - MonitorControl-only mode requires disabling script controllers
- Context: User reported no visible brightness changes and requested MonitorControl-only control (no other brightness software).
- Symptom: F1/profile toggles logged as applied but did not reliably change display brightness.
- Root cause: Multiple control paths were active (`skhd` hotkey script + launchd schedule/login jobs calling `m1ddc/ddcctl`) while MonitorControl native keyboard handling was disabled.
- Fix: Disabled `com.jian.monitorcontrol.login`, `com.jian.monitorcontrol.schedule`, and `com.koekeishiya.skhd`; enabled MonitorControl native keyboard mode by setting `keyboardBrightness=0`; kept only `com.jian.monitorcontrol.app` active.
- Verification: `launchctl list` shows only MonitorControl agents/processes, `launchctl print-disabled` confirms script/skhd jobs disabled, and preferences show `keyboardBrightness=0`.
- Regression test: Runtime service state verification only (no automated UI-level keypress assertion available in this workspace).
- Follow-up: If F1 behavior regresses, verify MonitorControl Accessibility permission and keep non-MonitorControl brightness daemons disabled.

## 2026-02-26 - F1 toggle requires skhd path with MonitorControl keyboard capture off
- Context: User needed explicit F1 toggle behavior (day/night script toggle), not only native incremental brightness keys.
- Symptom: After switching to MonitorControl-only mode, user reported F1 toggle not working.
- Root cause: F1 toggle action is implemented in `skhd` (`f1`/`brightness_down` -> `/Users/jian/scripts/monitorcontrol-toggle.sh`), so disabling `skhd` removes that toggle path.
- Fix: Re-enabled `com.koekeishiya.skhd`, restored MonitorControl keyboard capture setting to `keyboardBrightness=3` to avoid key-handler conflicts, kept schedule/login launchd jobs disabled.
- Verification: `skhd -k "f1"` and `skhd -k "brightness_down"` updated `/Users/jian/.local/state/monitor-brightness-mode` and appended new apply lines to `/tmp/monitorcontrol-hotkey.log`; user confirmed F1 works.
- Regression test: Synthetic hotkey trigger via `skhd -k` for both `f1` and `brightness_down`.
- Follow-up: Keep `~/.skhdrc` bindings minimal and avoid re-enabling schedule/login jobs unless explicitly needed.
