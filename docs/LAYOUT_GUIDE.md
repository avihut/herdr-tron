# Creating Herdr layouts and themes

Use this guide when creating a layout, designing a theme, or adding themed features to an existing layout. The aim is a recognizable, useful interface with its own controls, meaningful connections to Herdr's data, and carefully integrated surprises. Read [AGENTS.md](AGENTS.md), then [CLAUDE.md](CLAUDE.md), then this guide. The current user's instructions take precedence.

This is a maintained reference. When the user expands these preferences, or implementation and testing reveal a better approach, update the relevant section here as part of the same task. Keep the effective instructions in the body and a short dated refinement record at the end.

## Start from the source material

For a fictional universe or historical desktop, research its actual interfaces before choosing colors or writing controls. Look at screenshots and motion, then read manuals, production-design discussions, official typography references, and reliable explanations of the world. Use original sources where possible; distinguish fan reconstructions from frames of the original work.

Identify the visual grammar: typography and hierarchy, panel geometry, information density, symbols, palette, warning states, navigation, transitions and sounds. Research details that can become useful interactions or discoverable surprises. A distinctive layout should carry this grammar through the sidebar, tabs, pane frames, context menus, dialogs, layout picker and games.

Source-specific refinement: for TRON, restraint must still preserve recognizable luminous circuitry. Integrate stepped light traces and circuit junctions among terminal sessions, using pane boundaries and gutters as part of the composition, while keeping text, focus indicators and controls clear. Sparse flat borders did not satisfy the brief; neither did decorative strips whose normalized paths stretched independently along each axis or repeated blob-like badges. Base geometry on measured available dimensions, preserve stroke widths and the proportions of bends and junctions, and adapt the number or routing of segments as space changes instead of distorting a fixed motif. Validate actual narrow, wide and ultrawide windows, uneven pane splits and supported UI scales. Circuitry must remain interleaved with the terminal layout, not confined to ornamental bars. This is the user's TRON-specific design correction, not a mandate to add neon to unrelated layouts; the adaptive replacement still requires live size/scale QA.

Current host constraint (checked 2026-11-07): the documented pane wrapper exposes a header mod plus gap, radius, background, border and focus styling; it does not expose a gutter/background mod slot. `PaneInfo` has no measured pane bounds, and a mod's `on_size_change` measures only its own block in logical pixels. Measured per-pane header rails visually meeting native pane borders are supported; arbitrary custom paths spanning the split gutters would need a host extension. Do not invent a hook, paint outside the block, or rebuild the user's pane tree to disguise this limitation. Distinguish the achievable header/border treatment from continuous gutter rendering in previews and delivery notes.

TRON motion refinement: the user wants energy to breathe and flow among panes and tabs, as though messages travel through the console. Extra pane chrome is acceptable to make this legible. Compose a restrained breathing glow with a bounded number of travelling light packets along measured paths; preserve text readability, constant focus geometry and a visible reduced-motion setting that leaves useful static circuitry. Use supported native opacity/position loops, not a JavaScript redraw loop. Current header and tab-bar effects are ambient animation, not evidence of messages sent or received. Bind a factual relay effect only to a supported event carrying real endpoints; agent status changes alone do not establish a relay. Continuous paths crossing arbitrary pane gutters remain a host-extension requirement. See [the proposed pane-decoration extension](PANE_DECORATION_PROPOSAL.md), which is a design brief, not an available API.

Save a concise source list and explain the design decisions in the layout's README. Separate canonical details from invented Herdr adaptations. For example, an EVA livery for Codex is an adaptation; it does not make Codex a canonical pilot. A simulated radio station is entertainment, not a real broadcast.

Choose the appropriate asset method. Draw simple emblems, diagrams and interface shapes as native geometry or original SVG. Use image generation when original bitmap art would materially improve the result. Use installed or appropriately licensed fonts, keep bundled font licenses, and use clear substitutes when a reference font is unavailable. Do not replace useful text with illegible decorative lettering.

## Map the world to Herdr

Every layout presents the same real spaces, tabs, panes, terminals, agents and machines. The metaphor should explain that model and help someone navigate it.

| Herdr concept | Evangelion example | Fallout example | Preserve |
| --- | --- | --- | --- |
| Space | Deployment | Settlement | Real name, machine and selection |
| Tab | Operation | Quest | Real name, active state and panes |
| Agent | EVA unit | Companion | Actual title, address and status |
| Pane | Entry plug terminal | Console | Keyboard focus, splits, zoom and context actions |
| Working | Active unit | Working companion | Actual `working` state |
| Needs input | Angel contact and command request | Attention objective | Actual `blocked` state and route to that agent |
| Completed unseen | MAGI completion channel | Completed objective | Herdr's `done` semantics |
| Idle | Standby | Idle companion | Actual `idle` state |
| Machine | Umbilical link | Map location | Real connection readiness, not fictional geography |

Keep actual names visible beside themed labels. Distinguish multiple agents with their addresses even if they share a costume. Cosmetic choices must not alter an agent's prompts, permissions, model or behavior. Do not invent progress percentages, health readings, review decisions, or completion times when Herdr does not provide them.

Use explicit targets for actions on a row, tab or pane. A right-click menu must act on the object clicked, not whatever happens to have keyboard focus. Use Herdr's normal commands and confirmation behavior. Preserve access to launching agents and terminals, switching spaces/tabs, split/zoom controls, and settings. Set agent navigation order from the displayed agent list so keyboard navigation is coherent.

Check each command's actual argument schema rather than assuming all terminal commands accept a target. In the host verified on 2026-11-07, `herdr-app commands` lists `terminal.copy` and `terminal.paste` with **no arguments**; they act on the focused terminal. A pane-context action must validate the clicked pane still exists and is a terminal, then issue `run("pane.focus", {pane: clickedPane})` before `run("terminal.copy")` or `run("terminal.paste")`. An invented `{terminal: ...}` argument does not provide supported targeting. Test the command sequence with an initially nonfocused target and verify actual behavior during live QA; a mock sequence test alone does not prove native focus timing. Copy uses the terminal's existing selection; the command description says that with nothing selected, the key goes to the program. Recheck this narrow API rule against the current host when updating.

## Give the layout its own controls

Plan the layout tree before implementing it: title bar, workspace navigation, agent list, operation tabs, terminal region, optional monitor and status bar. Reserve macOS traffic-light space. Provide window buttons on platforms that require them. Prefer resizable or collapsible secondary panels and scrollable lists over truncating the number of workspaces or agents.

The terminal remains the main work surface. Keep dense ornamental detail in the surrounding controls. Make empty, busy, blocked, offline and long-name states deliberate. Check a narrow window as well as a large monitor. Avoid large fixed-height popups and unreachable controls at the screen edge.

Bound room and game dialogs by both a content-appropriate pixel maximum and a fraction of the viewport. A fraction alone can produce vast empty panels on ultrawide screens. For example, TRON uses `min(940px, 90% of viewport width)` and `min(760px, 88% of viewport height)`; choose limits for the actual content, keep overflow scrollable and verify small-window reachability separately. These are dialog examples, not universal dimensions. Pointer menus still size to their rows without a forced height.

Keep prose constrained to the dialog width. In Expanse live QA, horizontal scrolling on the entire native dialog body prevented paragraphs from wrapping. Its verified fix gives the prose body `.w_full().min_w(0)` within a constrained parent and isolates horizontal scrolling to bounded-height rows containing fixed geometry, such as a game board or 3D view. Keep explanatory text and controls outside those rows where possible, with vertical scrolling for longer content. This fixes the observed dialog structure; it is not a blanket ban on horizontal scrolling. Inspect actual wrapping in both appearances and test small-window reachability separately.

Follow the native layout-switcher rules in [CLAUDE.md](CLAUDE.md). Every layout must have a switcher inside its own bar or menu, matching the host font, shape and palette. Normally invoke `run("mod.open", { name: "layout-picker" })`; alternatively draw a native menu in the layout's own mod. Pointer menus size to their rows without a forced height.

Every switcher lists `layouts()` once, hides a built-in when its personal replacement exists, uses the shared title conventions, marks `shared("layout")`, and switches through `layout.switch`. In particular, show Windows 98 rather than Win98 Dark. Keep these rules aligned with `mods/layout-picker/main.js`. Do not wrap a root or float a detached switcher over the layout. Update the switcher table in CLAUDE.md after installation.

## Make light and dark usable

Design both appearances deliberately. Check foregrounds, muted labels, borders, selected rows, alerts, icons, menus, dialogs and games in each. Fixed accent colors often need darker light-mode variants. A light version may adapt the original design while preserving its hierarchy and identity.

Treat terminal colors separately from the surrounding controls. Already-running terminal applications can retain explicit dark backgrounds and pale true-color text. Switching the terminal's default background to white can therefore make Codex output, prompts and diffs unreadable even when the sidebar looks correct.

The tested default for these themed layouts is **light controls around dark terminal surfaces**, with a readable dark ANSI palette in both appearances. A genuinely light terminal variant is acceptable only after testing the actual running agents, including their input areas, code blocks, diffs, selections and muted text. Do not claim to have fixed the application's own theme when the change is confined to the terminal palette.

Theme files define terminal `background`, `foreground`, `selection`, `cursor` and ANSI colors; their `colors` overrides supply the panel palette. Validate the result in this installed Herdr version. Keep root look properties on the outermost layout node. Do not leave a testing appearance override or replace unrelated settings after verification.

## Show real network and battery status

Each new layout includes a native network indicator and a battery icon on battery-equipped computers. Put them in a status bar, system tray or equivalent control area that belongs to the design.

- Report the local computer's status separately from remote Herdr machine availability.
- Describe what was measured: an active local interface or available route is not proof of Internet access. Do not hardcode Connected, a network speed, charge percentage or a countdown.
- Show unknown on failed probes. Tooltips can show interface names, the meaning of the indicator and the last sample time.
- Show real battery percentage and distinguish charging, AC-powered, discharging and unknown. Hide the battery on computers known to have no battery. If hardware was detected and a later sample fails, retain an unknown battery indication rather than a stale percentage.
- Use a supported host API if available. On this macOS build, the layouts use read-only `scutil --nwi` and `pmset -g batt`, generally every 30 seconds. Parse normal, missing-hardware and failure outputs. Document unsupported platforms rather than displaying plausible invented values.
- Explain new program execution, external file access or network requests before adding them. Local status displays do not need external telemetry services.

Read current implementations before reusing them. A familiar-looking tray icon may be decorative or may have changed since its earlier version.

## Build worthwhile easter eggs and games

For a substantial fictional or nostalgic layout, include researched details that reward exploration: a hidden character, an in-world maintenance panel, a familiar shutdown refusal, a special completion screen, a secret menu, badges, or a playable mini-game. Preserve the ordinary workspace while someone explores.

Use the installed Windows 98 and Windows XP layouts as examples of integrated games, native menus and discoverability; read their current source without editing it. Their assets and implementation are not automatically part of a new layout.

Prefer a few completed interactions over many decorative buttons. Themed games need real rules, restart, feedback, a reachable win condition and appropriate persistence. Examples from these layouts are a RobCo positional-likeness trainer, an original holotape route puzzle, an Ireul containment puzzle and an Israfel matching drill. Test the rules independently of the UI: solvability, move costs, edge cases, duplicate clicks, lockout, undo, hints, victory and saved scores as applicable.

Keep fictional emergencies inside clearly labeled simulations. A secret should not send agent prompts, kill processes, close workspaces, alter permissions, merge work, or change real files as a surprise. Store preferences, discoveries and game scores in a layout-specific namespace. Use local reset controls for optional progress.

Make primary games discoverable through a normal menu or inventory. Let easter eggs retain some mystery, with gentle hints and a spoiler section in the README. Offer a close or escape path. Keep sounds opt-in and use original or appropriately licensed audio.

## Animate through the native renderer

Use GPUI's native `.frames`, `.spin`, `.loop` and transitions for animation. Working indicators, subdued radar or radio motion, game feedback and deliberate victory effects can add character. Every animation should fit the source material and stay clear of terminal text.

Provide a visible reduced-motion control. Avoid aggressive flashing, constant alarms, automatic full-screen interruptions and noise during work. Native animation stops when not drawn; JavaScript timers that repeatedly call `notify()` for animation redraw the whole window and waste battery. Timers belong to real clocks or telemetry, at the lowest useful frequency. Herdr's own live model already triggers renders; do not poll agents or spaces.

## Implement safely in the shared config

Herdr mods are native GPUI JavaScript, not HTML or a web view. Read the installed `herdr.d.ts` and `gpui-kit.d.ts`; they describe the actual runtime. Use existing mods as examples, but validate every borrowed API in the standalone checker. Never edit the generated type files, frame files, shipped mods or generated AGENTS.md.

For a new mod, create `mod.json` with `"place": "none"` **before** writing `main.js`. Otherwise Herdr can auto-dock it and wrap the current layout's root. Check for name collisions, install new names, keep assets together, and write the layout JSON after its dependencies exist. Avoid changing global key bindings for ordinary layout features.

For updates, stage the complete mod outside the watched `mods/` directory and replace its folder with renames. Preserve local unowned files, keep a backup, and retain recovery files if rollback fails. Prepare all dependencies before exposing the entry point; write themes and the layout after the complete mod. Validate the installed package's transitive local imports in a temporary home, not only the source tree.

Repeated file-by-file hot reloads have exhausted the host's mod runtime in observed XP testing. Reinstalling, switching layouts and creating another test tab did not recover that incident; only restarting Herdr.app did. If `out of memory` or repeated `Null` errors appear, stop live installs, switches and test tabs. Record the error and coordinate recovery. Do not restart the app without the user's authorization, and never restart herdr-core as a workaround. The exact cause of a new incident still needs evidence; do not assume every OOM has the same cause.

Retained child views need their own invalidation when their state changes. In the SCII arcade, an exit handler paused the simulation and detached the child through shared navigation, but its cached playing description survived re-entry. Calling the current child event context’s `notify()` before detaching restored the visible paused/Resume state. Test exit and re-entry through real UI; parent/shared rerenders alone do not prove a retained child refreshed.

Keep pure game and parsing logic in separate modules so it can be tested without launching Herdr. Keep slow work in `cx.spawn`, use the callback's current context, and do not retain `cx` for later use. Guard overlapping host probes and handle failures without inventing successful results.

Coordinate file ownership when other agents are active. Give each layout its own mod, theme and asset paths. Ask before editing another agent's module; prefer a local native picker when the shared picker is owned elsewhere. Coordinate live-window testing so two agents do not switch the window or change appearance at once.

### Shared window lock

Before live installation, reload, layout switching, appearance changes or UI QA, acquire the shared `/private/tmp/herdr-app-qa.lock` through `python3 ~/.config/herdr-app/tools/qa-lock.py acquire --address YOUR_HERDR_ADDRESS --thread YOUR_THREAD_ID --purpose 'specific live work'`. Use `status` first. The helper serializes acquisition; a failed acquisition prints the existing owner and contact instructions. The lock records the holder's Herdr address, thread locator, contact command, purpose, UTC acquisition/heartbeat times and hang-recovery instructions. This is a cooperative protocol, not an app-enforced permission boundary.

Retain the returned token. While actively using the window, run `heartbeat --address YOUR_HERDR_ADDRESS --token TOKEN` at milestones and at least every five minutes. After restoring prior layout/appearance and reporting errors, run `release --address YOUR_HERDR_ADDRESS --token TOKEN`. Source-only work and standalone checks that do not affect the live window do not need this lock. Never manually overwrite/delete it or remove its `.guard` file.

Acquire only when ready to begin; do not reserve the lock while waiting for filesystem/socket/native-check permission. A free QA slot does not grant access. If blocked or unable to proceed, stop live actions, release the lock and report the actual blocker. Keep the coordination queue separate from ownership.

If a heartbeat is over ten minutes old, contact the address in the lock and inspect the holder with authorized `hc get` / `hc read --lines 0`. Age alone is not proof of a hang and never authorizes stealing. Ask the holder to report its current action and app state. For an unresponsive holder, notify the recorded coordinator and user; establish that no live operation remains before a coordinated release. Do not force input through permission prompts, kill agents, restart app/core or bypass access restrictions to reclaim a slot. If restoration is unsafe or incomplete, record that explicitly rather than claiming a clean release. The lock itself includes these recovery instructions.

The installed `hc --skill` identifies `hc` as Herdr.app's core and distinguishes it from the older `herdr` multiplexer. Use the tool and manual for the actual product. A sandbox can block an existing core socket and make `hc` attempt startup; use the authorized access mechanism rather than starting or restarting a second server. Never restart the user's core as a validation shortcut.

When a separate source repository is useful, follow the user's daft workflow, use pnpm, and expose repeated development/install/check commands as mise tasks when using mise. Record whether the authoritative source is a repository or the config files; do not edit generated installed copies when a source workflow already exists.

## Verify the installed result

1. Run `herdr-app check` for every changed mod. Its initial render does not cover layout geometry, deferred content, interactions or later states.
2. Exercise every role in isolated fixtures, including populated lists, empty lists, selected panes, alternate game modes, victory states, and relevant host-status branches. Keep fixtures and mock data out of the installed runtime.
3. Run meaningful pure tests for game mechanics and telemetry parsing. Do not add tests that merely repeat cosmetic implementation details.
4. Tell the user before temporarily switching their window. Record the previous layout and appearance, coordinate with other agents, then inspect the real installed layout using `herdr-app shot` and `herdr-app status`.
5. Inspect both appearances. Check actual Codex and other terminal text as well as layout controls. Check long names, scrolling, menus near edges, smaller widths, and active/blocked/done/idle presentations where available.
6. Click the native switcher: verify its position, style, deduplication, titles and active marker, then actually switch a layout. Test representative navigation, context actions, games and discoveries through the UI.
7. Confirm real network and battery readings. Use parser fixtures for states the current hardware cannot produce; report which branches were not physically observed.
8. Check for runtime errors, restore the previous layout and appearance, close only temporary overlays or test tabs created by this work, and preserve unrelated changes made during testing.

Use CUA for clicks not available through purpose-built Herdr commands. If interaction is interrupted by the person using the app, refresh the UI state before proceeding. Do not infer that a timed-out click succeeded. Report test limits accurately; a fixture pass is not a screenshot or a completed human interaction.

## Document and deliver

Each substantial layout should include:

- A README with how to select it, everyday controls, the Herdr mapping, games, easter egg spoilers, preferences, research links, telemetry behavior and platform limitations.
- A RECIPE following AGENTS.md: what the person sees, how it behaves, what it is built from, pitfalls and acceptance checks.
- A settings preview and useful dark/light screenshots. Keep private terminal contents local unless publication is explicitly requested.
- A short validation record distinguishing static checks, logic tests, observed UI behavior and anything unverified.
- An entry in CLAUDE.md's switcher table.

The completion message should say what was installed, how to select it, the most interesting features, what was tested, and any material limitation. Link the README and this reference rather than repeating every instruction in chat. Restore the user's prior screen unless they ask to keep the new layout active.

## Publish a faithful showcase

When publication is requested, give each layout its own repository with an authoritative source, safe installer, repeatable mise tasks, pnpm tests, tracked daft configuration and applicable licenses. Preserve original artwork and font notices. Refuse accidental overwrites, back up explicit updates, install the manifest before the entry point and layout last, and leave global state and active appearance alone.

Make the README rich and inviting while accurately showing the finished implementation. Start with a clean original preview and a concise identity, then tour the controls, world-to-Herdr mapping, rooms or modes, mini-games and customization. Use collapsible easter-egg spoilers. Include straightforward installation/update steps, source workflow, validation limits, telemetry/platform behavior and research/credits. Distinguish illustrated previews from actual UI captures and implemented features from plans. Never publish private terminal conversations, state, credentials or personal QA captures just to make a showcase look complete.

For room-based interfaces and advisor portraits, research how the original navigation and transitions work before adapting them. For requested 3D, inspect native renderer support and accurately distinguish interactive 3D, pre-rendered 3D assets and 2D illustration. These are design options when the source and request call for them, not requirements to bolt onto every layout.

## Reusable request

> Read `~/.config/herdr-app/AGENTS.md`, then `CLAUDE.md`, then `LAYOUT_GUIDE.md`. Create and install a Herdr layout inspired by **[source or universe]**. Research its actual interfaces and lore; map them to real workspaces, tabs, panes, agents and machines. Build a cohesive native interface with its own layout switcher, real network and battery indicators, readable light/dark appearances, thoughtful motion controls, and integrated easter eggs or playable features where they fit. Validate the installed result, document controls and sources, and restore my previous layout after tests. Incorporate new preferences and verified lessons into `LAYOUT_GUIDE.md` as you work.

## Keep this guide current

When the user refines the workflow, update the relevant instruction in this guide and any affected implementation. Preserve the distinction between a general preference and a request specific to one theme. When testing reveals a limitation, record the narrow observed condition and its verified workaround; remove obsolete advice when it is superseded.

Keep detailed API facts in AGENTS.md and the generated types, and universal house rules in CLAUDE.md. This guide connects them into a design and build workflow. Link to the authoritative rule instead of maintaining conflicting copies. Do not put durable instructions in generated AGENTS.md.

Add a brief date and explanation below for meaningful refinements. Do not keep chat transcripts, temporary agent IDs, permission-prompt history or abandoned plans.

| Date | Refinement |
| --- | --- |
| 2026-11-07 | Established the researched layout workflow from Evangelion and Fallout: faithful design language, real Herdr mappings, games, discoveries, native motion, ownership and live validation. |
| 2026-11-07 | Made measured local network status and hardware-aware battery indicators standard for new layouts. Distinguished link availability from Internet reachability and specified unknown/failure states. |
| 2026-11-07 | Added verification of running agents in light mode. Adopted dark terminal surfaces within light controls where retained Codex dark formatting makes pale terminal backgrounds unreadable. |
| 2026-11-07 | Added the user's requirement to keep this reference linked from house rules and update it as the workflow is expanded or refined. |
| 2026-11-07 | Added public per-layout packaging and rich, faithful README showcases with original previews, implemented-feature tours, game rules, spoiler sections, source workflow and honest validation limits. Recorded room navigation, advisor portraits and accurate 3D terminology as source-dependent design options. |
| 2026-11-07 | Added whole-folder staged updates, installed-import completeness tests, rollback recovery retention, and a stop-and-coordinate rule for observed host runtime exhaustion. |
| 2026-11-07 | Added an atomic cooperative live-window lock with agent/thread contact details, heartbeat and hang coordination. Permission-blocked agents release ownership; queue priority is separate from access and active QA. |
| 2026-11-07 | Verified that current terminal copy/paste commands take no target arguments and operate on focus. Documented explicit clicked-pane focus, stale-target checks and separate sequence/live validation. |
| 2026-11-07 | Incorporated TRON live QA's dialog-sizing lesson: combine pixel caps with viewport fractions to avoid excessive empty space on ultrawide displays; small-window reachability remains a separate check. |
| 2026-11-07 | Incorporated Expanse's dark/light live-verified wrapping fix: constrain prose width and isolate horizontal scrolling to bounded-height fixed-geometry rows instead of the entire dialog body. |
| 2026-11-07 | Recorded the user's TRON-specific refinement: recognizable luminous circuitry must remain visible despite restrained composition; terminal readability still takes priority. |
| 2026-11-07 | Refined TRON after rejection of stretched circuit strips: integrate proportion-preserving measured geometry among pane boundaries/gutters, adapt routing to window size and UI scale, and avoid repeated blob-like badges. Live resize/scale acceptance remains required. |
| 2026-11-07 | Checked the current pane-decoration API limits: header mods can measure their own blocks, but no documented gutter/background mod hook or pane-bound geometry is exposed. Record that limit rather than claiming continuous gutter rendering. |
| 2026-11-07 | Added the user's TRON breathing/flowing-energy direction, with extra pane chrome allowed, bounded native motion, reduced motion and honest separation of ambient packets from real relay events. Documented the missing cross-gutter host capability as a proposal. |

| 2026-11-08 | Verified SCII retained-child exit/re-entry invalidation: notify the child with its current event context before detaching; cover cached display state as well as paused simulation state. |

## Workspace grouping in every layout

Every layout must expose selectable parent and child spaces as the default hierarchy. A parent is a real space with its own tabs and terminals; child spaces nest beneath it. Folder-only grouping is optional and is not a substitute for parent/child workspaces. Render this hierarchy directly in each layout's PRIMARY spaces interface: its existing sidebar rows, desktop folders, board cards, field map or equivalent main navigation. A separate popup selector, toolbar breadcrumb or auxiliary tree does not satisfy this requirement while the main spaces view remains flat. Design the nesting interaction for the layout: console rows expand in place; desktop folders expose child folders with Back/Up navigation and a separate action for the parent's own workspace; boards contain child-space cards; Pasture uses nested fields/signposts. Retain each layout's existing visual grammar rather than replacing it with a generic tree component. Preserve the native layout switcher and the root look properties.

Persist parent relationships in each machine’s `~/.config/herdr-space-tree.json`: `{version: 1, parents: {childLocalSpaceId: parentLocalSpaceId}, at: epochMilliseconds}`. Read them through `shared("space-hierarchy")`, scoped by machine. Reject self-parenting, cycles and cross-machine parents; missing parents display their children at the root rather than hiding them. Keep parents selectable. The workspace tree shows spaces and child spaces only. Tabs are not spaces and stay in the selected space’s normal tab bar; do not display tabs as child-space rows. Closing a parent must not implicitly close its children. This is a shared navigation model; the core still owns independent spaces. Optional folder membership remains in `~/.config/herdr-space-folders.json` and `shared("space-folders")`. Explicit membership wins over path rules; an explicit empty membership means ungrouped. Keep machine-local IDs scoped to their machine. Do not rename spaces to simulate nesting or rely only on Git checkout detection: bare daft repository roots must group correctly. Folder grouping is presentation; space, tab and terminal IDs remain unchanged.

Share hierarchy data and validation, not a one-size-fits-all navigator. The legacy separate `workspace-tree` selector is being retired. Repository-owned layouts vendor `workspace-tree.js` and `workspace-tree-model.js` in their own mod; their installer must package both files. Reuse the hierarchy model and loader, then render primary rows/cards/folders with the layout’s own components. A common role dispatcher or generic tree renderer is not required. The same parent data drives all variants. The tree must be native to each theme, including typography, chrome, border shape, header treatment and selection style; a generic identical popup with recolored text is insufficient. Match LCARS slabs, Windows bevels, wooden Pasture controls, Pip-Boy borders and each science-fiction console as applicable. Use the current theme's colors and inherited UI font, with visible active state, independent child disclosure, scrolling, and explicit space selection. Changes to grouping must appear across layouts and after restart.

Acceptance: test grouped and ungrouped spaces, multiple machines with colliding local IDs, missing/stale memberships, empty lists and long names. Visually inspect the actual rendered hierarchy and exercise expansion and selection in light and dark, then restore the user's layout and appearance. A saved mapping or a passing native check alone is not visual acceptance. For shipped layouts, integrate into their personal replacements; never patch files the app rewrites.

Refinement (2026-11-07): require shared workspace nesting in every layout and theme; verify rendered grouping rather than metadata alone.

Refinement (2026-11-07): parent/child spaces are the default across themes; a folder of peer spaces does not fulfill workspace nesting. Focus indicators retain border and padding dimensions and change color to avoid terminal reflow.

Refinement (2026-11-07): the user explicitly rejected popup-based nesting. Rework each primary spaces interface with theme-specific structure and interaction; do not count an auxiliary selector as completion.

Primary-interface implementation lesson (2026-11-07): keep background hierarchy reads on the primary view only, guard overlapping reads and use each timer/spawn callback’s fresh `cx`. Test parent selection separately from disclosure and preserve tabs. Use ordinary UI controls for live QA; never broadcast a test command that every newly opened copy handles by opening another copy. Allow layout transitions to settle before judging captures; blank transition frames are not visual acceptance. After runtime exhaustion, stop live changes and coordinate app-only recovery with explicit user authorization.
