# Neon Blocks

A falling-block puzzle game for iOS and Android, built with Expo (SDK 57), React Native and
TypeScript. It runs fully offline and has no accounts, ads, tracking or in-app purchases.

## Run locally

```bash
corepack enable          # pnpm 10.18.3 is pinned in package.json
pnpm install
pnpm start               # then press i (iOS simulator) or a (Android), or scan with Expo Go
```

Everything the app uses ships in Expo Go, so no development build is needed to play.

> If Expo Go on a simulator times out reaching your LAN IP, open `exp://127.0.0.1:8081` instead
> (`xcrun simctl openurl booted exp://127.0.0.1:8081`).

## Scripts

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `pnpm test`      | Jest unit tests for game logic and storage parsing      |
| `pnpm typecheck` | `tsc --noEmit` (strict)                                 |
| `pnpm lint`      | `expo lint` (ESLint 9 + Prettier)                       |
| `pnpm verify`    | typecheck + lint + test, the gate before any release    |
| `pnpm format`    | Prettier write                                          |
| `pnpm assets`    | Regenerate icon, adaptive icon, splash and favicon PNGs |
| `pnpm sounds`    | Regenerate the sound effects in `assets/sounds`         |

## Features

- 10 × 20 board with 2 hidden spawn rows; all 7 tetrominoes with their own colours
- Super Rotation System, both directions, with full JLSTZ and I wall-kick tables
- 7-bag randomizer, next queue of 3, hold (once per piece), ghost piece
- Gravity by level (`max(100, 1000 − (level − 1) × 80)` ms), level up every 10 lines
- 500 ms lock delay that move/rotate can restart up to 15 times per row reached, so a piece
  cannot be stalled forever
- Scoring: soft drop +1/row, hard drop +2/row, 100/300/500/800 × level, back-to-back Tetris
  +50%, combo +50 × combo × level
- Line clear flash, clear call-outs (Tetris, back-to-back, combo), hard-drop jolt, menu
  button press scale, fading overlays
- Gesture controls over the whole play area: drag left/right to move (one column per cell of
  finger travel), drag down to soft drop, flick down to hard drop, swipe up to hold, tap to
  rotate (left half counter-clockwise, right half clockwise). Each drag locks to one axis so a
  sideways drag never soft-drops. A small legend replaces the old button row
- Menu, game, pause, game over (with new-high-score badge), settings and how-to-play screens
- Settings: sound, haptics, ghost piece, reset high score (with confirmation)
- High score, games played, best lines and best level persisted with AsyncStorage
- Auto-pause when the app leaves the foreground; Android back button pauses the game

## Themes

Four cyberpunk themes, switched from the menu (theme chip or Themes) or Settings. Each one changes
the palette, the block shape, the backdrop art and, for the terminal theme, the typeface.

| Theme          | Palette                      | Blocks              | Backdrop                  |
| -------------- | ---------------------------- | ------------------- | ------------------------- |
| Night City     | hazard yellow, cyan, crimson | hollow neon tubes   | circuit traces            |
| Neon Rain      | magenta, cyan on indigo      | glossy              | slanted rain              |
| Outrun         | hot pink, orange on violet   | bevelled            | striped sun, horizon grid |
| Amber Terminal | amber phosphor               | chips, dashed ghost | heavy scanlines           |

Shared across all: cut-corner (chamfered) panels and buttons, a HUD frame with corner brackets
around the board, a slow scan bar sweeping the well, RGB-split glitch titles, and a fixed-width
score readout with dim leading zeros. The scan bar and title glitch stop when the system asks for
reduced motion.

Fonts: Orbitron (display and numbers), Chakra Petch (UI), Share Tech Mono (terminal theme). All are
SIL Open Font License, bundled via `@expo-google-fonts/*` one weight at a time, so the app stays
offline.

To add a theme, add an entry to `SPECS` in `src/theme/themes.ts`. `src/theme/__tests__/themes.test.ts`
checks every theme for text contrast (WCAG AA), button-label contrast, piece-versus-well contrast
and seven distinct piece colours, so a new palette cannot ship unreadable.

## Architecture

```
src/
  game/        Pure game logic. No React, no side effects. Fully unit tested.
    reducer.ts   (state, action) → state. Owns gravity, lock delay, clears, hold, game over.
    board.ts collision.ts rotation.ts ghost.ts randomBag.ts scoring.ts level.ts pieces.ts
    selectors.ts Row signatures the board renders from.
  store/       Zustand stores: game (wraps the reducer), settings, stats
  hooks/       Game loop, gesture controls, haptics, sound, game-over recording
  storage/     AsyncStorage load/save with validation; failures never crash the game
  components/  Board, Controls, Preview, Overlay, ui primitives
  screens/     MainMenu, Tetris, Settings, HowToPlay
  app/         App root and AppNavigator (a small state machine, not a library)
  theme/       Themes, fonts, type scale, spacing, colour helpers
tools/         Asset generators (icons, sounds)
```

Decisions worth knowing before changing things:

- **The reducer is pure and time-driven.** The loop in `useGameLoop` dispatches
  `tick(deltaMs)` from a single `requestAnimationFrame` chain that exists only while playing.
  The RNG seed lives in state (`utils/random.ts`), so a game replays exactly in tests.
- **Side effects are events, not code in the reducer.** Each action leaves a list of
  `events` (`hardDrop`, `lineClear`, `gameOver` …) on the state. Sound, haptics and the board
  jolt subscribe to the store and react to them.
- **The board renders by row signature.** Each visible row becomes a 10-character string
  (`.` empty, `T` block, `t` ghost) and rows are memoised on it, so a falling piece
  re-renders only the rows it touches.
- **Line clears pause for 220 ms.** Full rows flash, then collapse, then the next piece
  spawns. Input is ignored during the flash, as in most guideline games.
- **No navigation library.** Four screens and no deep links. The game store outlives screen
  changes, so Settings opens from the pause menu and returns to the same paused game. The
  folder is called `src/app/` because the brief asked for it; Expo CLI prints that it would
  use it for Expo Router, which is harmless because expo-router is not installed.
- **Assets are generated.** Never hand-edit a PNG or WAV; change the tool and re-run it.
  Opaque icon outputs are RGB with no alpha, which App Store review requires.

## Tests

`pnpm test` runs 92 tests over the theme palettes (contrast), the gesture maths (axis lock, step counting, flick detection), the board, collision, movement, SRS rotation and kicks, line
clears, scoring, levels, 7-bag, lock delay, hold rules, game over and storage parsing. The UI
has no automated tests; see the manual checklist in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## Privacy

See [PRIVACY.md](PRIVACY.md). The app collects no data.

## Not in v1

- On-screen buttons as an alternative control scheme (`controlMode` is reserved for it)
- T-spin detection and scoring
- Music, sound volume slider
- Tablet layouts (`supportsTablet` is false)
