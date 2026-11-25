# AGENTS.md

## What this is

Vanilla Tetris: `index.html` + `style.css` + ES modules in `src/`. No framework and no build step: modules are served directly by Vite. Because it uses ES modules, open it via `npm run dev` (or any static server), not `file://`.

## Commands

- `npm run dev -- --host` — start Vite on port 5173; prints the LAN URL to open on a phone. `vite.config.js` already sets `server.host: true`, so plain `npm run dev` is network-accessible too.
- `npm run build` / `npm run preview` — optional; not needed to play or verify changes.
- No test, lint, typecheck, or format scripts exist. Verify gameplay manually in a browser.
- Quote paths in shell commands: the project path contains spaces and a dot.

## Code notes

- Entry point is `src/game.js` (loaded as `<script type="module">`). It owns game flow and boot; everything else is a focused module:
  - `config.js` — geometry, colors, shapes, SRS kick tables, scoring, difficulty, gesture tuning.
  - `dom.js` — the only module that queries the DOM; update it when an `index.html` id changes.
  - `state.js` — single mutable `game` object plus `emptyBoard()`.
  - `board.js` — `collidesAt` / `collides` / `ghostY` against `game.board`.
  - `pieces.js` — 7-bag, `spawnPiece()`, `rotateCurrent()`.
  - `render.js` — canvas setup and all drawing (`render`, `renderNext`).
  - `ui.js` — HUD counters and `showOverlay(mode)`.
  - `input.js` — keyboard, pointer gestures, touch buttons. It receives game actions via `initInput(actions)` and must not import game flow.
  - `tweaks.js` — live animation params (Tweakpane is dynamically imported, with a graceful fallback).
- Dependency direction is one-way: `config`/`dom` → `state` → `board`/`pieces` → `render`/`ui`/`input` → `game`. Keep it that way; `ui.js` imports `resetGesture` from `input.js`, and `input.js` imports nothing from `ui.js` or `game.js`.
- Board geometry is 10 columns × 20 rows with 30px logical cells (300×600 canvas). `initCanvas`/`setupCanvas` handle devicePixelRatio; CSS controls display size and hardcodes `aspect-ratio: 1 / 2` and board heights, so update CSS if geometry changes.
- Rotation uses SRS kick tables. Collision during rotation must be checked against the rotated matrix, not `game.current.matrix` (past regression).
- Pieces spawn at `y = -topEmptyRows`; `game.board` stores color strings or `null`.
- Difficulty: level is `floor(lines / 10) + 1`; gravity interval is `dropIntervalForLevel(level)` = `max(110, 800 - (level - 1) * 65)` ms.
- Game states are `idle | playing | paused | over` in `game.status`; the overlay is driven by `showOverlay(mode)`.
- Mobile input: tap on the canvas rotates; horizontal drag moves one cell per 22px; downward drag soft-drops one cell per 24px. Gestures use Pointer Events with one active pointer, and drags call `softDrop(false)` so they never lock a piece.
- Keep `touch-action: none` on `#board`/touch controls and `touch-action: manipulation` on body; this is what disables double-tap zoom (iOS ignores `user-scalable=no`). Touch buttons use `data-action`.
- Line-clear particles are updated in `gameLoop` using `animParams` (cells/second units). Tweakpane is dev-only: `src/tweaks.js` checks `import.meta.env.DEV`, creates its own `.tweaks` container at runtime, and dynamic-imports the library, so production builds ship neither the panel DOM nor the tweakpane chunk.
- No timer or leaderboard by design — do not add them unless requested.
