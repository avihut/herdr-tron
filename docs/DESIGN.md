# Architectural Grid redesign

Status: installed; dark/light, native energy on/off, primary workspace navigation and 110% UI scale inspected at 3840×2130. Narrower windows, uneven split sizes and performance acceptance remain pending. This revision replaces the rejected stretched circuit strips and the later repeated header humps.

## What the production research changed

The working reference is *TRON: Legacy*'s architecture, not a generic neon dashboard. The production-design interview describes simple geometric forms and light lines as a consistent language across the world. Kosinski's stated material direction was glass, concrete and steel. Our adaptation uses near-black recesses, darker glass console housings and selective white-cored light seams. [Digital Domain interview](https://motionographer.com/2011/01/24/full-coverage-talking-tron-with-digital-domain/), [Disney production account](https://www.cgw.com/Press-Center/Web-Exclusives/2011/Tron-Legacy.aspx).

GMUNK's Throneship glass uses sparse clipped outlines around broad empty surfaces. Its Board Room/light-table graphics organize information into strongly framed modules. The disc-arena frame gives the identity disc architectural scale. These were visually inspected, not merely inferred from page descriptions. Here they become measured console outlines, an identity-disc navigation dock, and a shared visual language for rooms and terminal controls. [Throne Room](https://gmunk.com/TRON-Throne-Room), [Board Room](https://gmunk.com/TRON-Board-Room), [Disc Game](https://gmunk.com/TRON-Disc-Game).

## Implemented composition

- **Console housings:** 68 logical pixels high, with a clipped lower glass edge, a small address/status housing and light seams meeting the native pane border. Corners remain 45 degrees. Straight lengths change with the actual measured width; corners never stretch.
- **Space between consoles:** 16px native gaps, 2px borders in both focused and unfocused states. Focus changes color, preserving terminal dimensions.
- **Primary workspace navigation:** the main SECTORS list renders actual parent/child spaces with separate disclosure and selection, using the shared machine-scoped hierarchy. The extra footer selector is removed.
- **Tab power bus:** a 52px tab strip, including a 14px light rail, above the existing terminal tree.
- **Identity dock:** a bounded 192-face projected disc, showing the focused Program's real address/status and opening the interactive archive. It shrinks on short sidebars and hides below 440px available height; agent navigation remains available.
- **Dark glass / pale technical mode:** shared geometry, separate readable colors, unchanged dark terminal palette. No transparency behind terminal text.
- **Rooms:** the same illuminated console construction around bounded native dialogs. Existing games, secrets, transforms and explicit pane actions remain intact.

## Energy behavior

The user requested breathing energy, movement between panes and tabs, and permitted extra pane chrome. Native GPUI opacity loops modulate the light bloom over 4.8 seconds. A single bounded highlight travels there and back along each pane's straight rail and the tab bus, with a 5–14 second cycle depending on track length. The identity cradle also breathes. Motion occurs outside terminal text and does not resize terminal content.

This is **ambient energy**, not delivery telemetry. No message bodies are read, and working/idle transitions are not treated as evidence that messages were relayed. Real Program status continues to be shown separately in words and colors. `Energy flowing / Energy still` and the reduced-motion preference disable all ambient loops, retaining static geometry and status. There is no JavaScript animation timer; the native renderer owns the loops. Native lifecycle/performance behavior still needs live observation.

## Exact host limitation

The current host exposes per-pane header mods and native border/gap styling. It supplies neither pane bounds nor a custom gutter-decoration surface. Therefore this implementation animates **within headers and the tab strip**. It does not paint continuous routes across arbitrary split gutters, and independently hosted loops are not claimed to have synchronized phases.

Full cross-pane energy paths require a passive compositor decoration layer with coherent pane/gutter geometry, optional tab anchors, clipping around terminal interiors, and retained native path-distance animation. Actual relay visualization additionally needs a documented delivery-event feed. A host proposal has been coordinated separately; it is not a shipped capability. No root/tree replacement, overlay workaround or generated API modification is used.

## Acceptance still needed

Inspect actual dark/light surfaces, animated motion over time, Energy still, native controls and room text; resize through available narrow/wide/ultrawide sizes; exercise existing uneven splits and supported UI scale without changing pane identities. Capture actual dimensions/scales. Check focus does not reflow terminal text. Compare CPU/frame behavior with motion on/off and when hidden. Restore geometry, zoom, appearance and baseline layout after the exclusive QA slot.

Illustrated previews use source geometry and example content. `previews/energy.svg` demonstrates intended motion in SVG, not a recording of native Herdr. Neither illustrations nor standalone native description checks prove live acceptance.
