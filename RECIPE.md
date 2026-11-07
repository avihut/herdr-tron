# TRON / Grid Command

A native Herdr layout framed by restrained Legacy-inspired circuitry: a readable workspace with status discs, a quiet game lounge, an interactive solid disc and a real system directory.

![Original workspace illustration](previews/dark.svg)

## What you see

A 54px title bar reserves 72px for macOS window buttons and carries TRON's native layout picker, Command, Destinations, sidebar toggle and Settings. A 248px resizable sidebar lists sectors and Programs. Its lists scroll independently; full names remain available in tooltips. A 38px route strip precedes the main terminal area. Pane headers are 32px and include split, zoom and explicit context controls. A 36px footer reports actual status counts, local link/battery samples and motion preference.

The dark palette uses #080f16, #101c27, #7de7fa and #e7f6fc. The light palette uses #e7f0f4, #f5f9fb, #006b80 and #102b3a. Both retain #0b121b terminal backgrounds and identical dark ANSI colors. UI typography uses Herdr's available Geist font. Rounded panels and thin separators organize content; neon frames do not surround every control.

## How it behaves

Program discs and labels show Herdr working, blocked, done and idle states. Only working discs have a native opacity loop, disabled by reduced motion. Clicking a Program focuses its actual address. Right-click actions retain the row/tab/pane clicked. Creation uses Herdr commands and the built-in new-menu. Herdr retains normal confirmation behavior for closing structural objects.

The pointer picker is content-sized, follows replacement/title/deduplication rules, marks the actual selected layout, and switches through layout.switch. It does not wrap the layout root.

Four dialog destinations provide an attention queue/preferences, local game lounge/archive, interactive 3D disc selector, and system directory. The disc has 192 lit, depth-sorted projected faces with manual yaw and pitch. It has no render timer. Game controls implement all rules in README, victory/loss feedback, restart and persistent per-stage bests. Archive commands are local buttons only. Discovery reset requires confirmation.

## Built from

- `layouts/tron.json`: root column; title, body row (sidebar and work column), footer. Work holds routes and active-tab terminal pane frames. Root owns appearance and terminal-menu selection.
- `mods/tron/main.js`: native View roles top/side/tabs/pane/footer/picker/menu/room/cycle/disc.
- `host.js`: centralized imports from Herdr. No fixture host is installed.
- `games.js`: pure cycle movement, mirror tracing and score reducers.
- `geometry.js`: original XYZ disc mesh, transforms, Lambert lighting and projection.
- `system.js`: scutil/pmset parsers, layout listing rules and status words.
- `themes/tron-dark.json`, `tron-light.json`: terminal palette plus panel semantic colors.
- `scripts/install.js`: complete staged installer with import/native validation, collision refusal, backups, unowned-file preservation and rollback recovery retention.
- `scripts/check.js`: production imports plus isolated native state fixtures. `scripts/preview.js` writes original SVG illustrations.

Only the footer executes `/usr/sbin/scutil --nwi` and `/usr/bin/pmset -g batt`, at 30-second cadence with an overlap guard, in cx.spawn. There are no external network calls, sound files, DOM APIs, WebGL or shared pane-rename dependency. All progress/preferences use `tron.v1.*`.

## Watch out

The native checker does not lay out, paint, or click the interface. A fixture pass is not live QA. A sandbox may hang the standalone renderer; a timeout must fail clearly and any permission escalation must use the normal review mechanism. Never start or restart herdr-core as a workaround.

Use the host's exclusive QA lock before live mutation. Stage outside watched mods and publish whole folders, never source files individually. Preserve unrelated settings and restore the previous layout/appearance after testing. Stop immediately if host OOM or repeated Null errors appear.

Keep game grids bounded (9×7 and 7×7). Narrow dialogs scroll vertically; their boards need roughly 400px of usable width. Non-macOS probes remain unknown. Network-interface availability is not Internet connectivity. No battery state is invented when parsing fails. Physical-state claims must come from observation, not fixtures.

## Done when

- Pure tests prove every game stage can win; walls/trails/limits/misses/restarts/duplicate final actions and score improvement are covered.
- Parser fixtures cover actual/absent/unknown hardware, failures and local network states.
- Installer tests prove import completeness, preserved user files, collision refusal, rollback and retained recovery after rollback failure.
- All native roles pass in dark/light and empty/populated fixtures, including the model, archive, reset and terminal game states.
- Live QA verifies the picker, rooms, game moves and completed wins, disc transforms, source-state indicators, readable terminals in both appearances and final restoration with no errors.
- Documentation explicitly identifies any remaining unverified behavior, and public artifacts contain no private session data.
