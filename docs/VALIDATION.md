# Validation record

2026-11-07. Source package validation is separate from live-window QA.

## Passed

- 16 Node test cases: all three cycle victory paths; all three disc solution spaces; collision, trail, boundary, early portal, turn budget, rotations, misses, restart and final-state idempotence; monotonic best scores.
- Local network/battery parser fixtures: available/offline/unknown, charging/discharging/AC/absent/failed samples.
- Picker replacement/deduplication/title/current-marker behavior.
- 192-face mesh bounds, finite projection, lighting and two-axis transform changes.
- Installer: complete temporary-home import closure, no settings/view mutation, collision refusal, explicit backups, preserved unowned files, pre-exposure validation failure, rollback, retained recovery on failed rollback, symlink rejection and invalid manifest/import rejection.
- 93 isolated native renders using `herdr-app check`: production imports; top, side, tabs, pane, footer, picker, menu, room, cycle, disc; dark/light; empty/populated; all destinations including archive/reset; every game stage and win/loss states. These check eager native descriptions, not paint, geometry or events.

## Observed live QA

Tested the installed package through CUA in an exclusive shared-window slot, with private Herdr screenshots and status checks. The first install exposed a room-sizing issue on a 3840px display; one validated whole-folder update capped dialogs at 940×760 logical pixels while retaining a viewport fraction and scrollable content.

- Dark workspace rendered actual Programs/addresses/statuses. Working, idle and finished-unseen states were observed; blocked status is covered by native fixtures rather than a deliberately induced live interruption.
- All four destinations opened. The portal room showed the actual local system as ready and its real sector. The identity-disc mesh painted natively and visibly changed under both yaw and tilt controls.
- Light-cycle Circuit 01: clicked a collision loss, restarted, then completed the route with a button plus arrow keys. The win displayed 14 turns and saved that best.
- Disc Reflection 01: launched a miss, restarted, rotated the mirror and won. The traced path, one-launch best and Reflection badge were visible.
- Reopened the lounge and observed both earned badges. Bit answered YES to the local-games question. ENCOM archive/year unlocked violet circuitry. The earned ISO-inspired discovery displayed after both badges. The scan reported real model counts.
- Used the two-step reset and verified the QA-created TRON bests/discoveries were empty and classic palette false. No unrelated state was reset.
- Changed only appearance for light-mode inspection. Verified pale chrome, readable game rules/board/controls, light pointer menus and retained dark running Codex terminals, including prompts and formatted output.
- Right-clicked a nonfocused pane header. Its menu carried the clicked pane ID; Focus pane changed actual focus to that pane, confirmed by app status. Restored original focus afterward. TRON has no custom copy/paste entries or optional pane-rename dependency.
- Opened the native layout picker in both appearances: pointer placement, current marker, replacement filtering and Windows 98/Windows XP titles were visible. Selected Windows XP through the picker; status confirmed the switch.
- Real local sample reported available interfaces and 100% charged on AC. No Internet-reachability claim was made.
- Final state matched the recorded baseline: Windows XP, original space/tab/pane, original absent appearance override, no overlays and no errors. Released the cooperative lock and notified the next owner. No app/core restart occurred.

## Validation limits

Stages 02/03 of each game were solved in pure tests and have native board fixtures; only stage 01 of each was completed through live UI. Physical offline, charging, discharging and absent-battery states were not induced; parser fixtures cover them. Linux/Windows were not physically tested. The large live display was tested with bounded/scrolled dialogs; a genuinely small OS window and extreme list lengths remain unverified. Pane split/close and new-agent launch commands were not exercised against the user's active work. No optional pane-rename integration is included.

## Evidence handling

Public previews are original SVG illustrations generated without live data. Private screenshots, logs, settings, shared state and terminal transcripts must never be committed. Research imagery was viewed, not copied into the package.
