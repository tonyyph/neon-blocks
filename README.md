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

## Modes

| Mode     | Rules                                                                 | Record          |
| -------- | --------------------------------------------------------------------- | --------------- |
| Marathon | Endless, faster every 10 lines                                        | score           |
| Sprint   | Clear 40 lines                                                        | fastest time    |
| Ultra    | Two minutes                                                           | score           |
| Dig      | Ten garbage rows with one hole each; clear them all                   | fastest time    |
| Cascade  | After a clear, loose groups fall as rigid shapes; new full rows chain | score, chain    |
| Mutators | Each level brings a twist: Fog, Mirror, Ghosts or Turbo               | score           |
| Daily    | Three minutes; the date fixes the seed and the twist for everyone     | first run a day |

**Zone** (Marathon, Ultra, Mutators, Daily): clears charge a meter (16 lines fill it). At half or
more, the Zone button freezes gravity for up to 20 s; clears bank at the bottom as Zone lines and
burst together when it ends for 75 × lines² × level (an Octoris at 8, a Decahexatris at 16).

Mode rules live in `src/game/modes.ts`; the reducer reads them, so a new mode is mostly a new
config entry. Cascade settling is `src/game/cascade.ts`, Zone banking `src/game/zone.ts`, garbage
`src/game/garbage.ts`.

## Progress

Records per mode, all-time totals, the last ten games, the Daily history and streak, and 22
achievements are folded in by one pure function, `applyGameResult` (`src/progress/records.ts`),
and stored under `neonblocks.progress.v2`. The v1 high score migrates into Marathon's record on
first launch. The game-over card can be shared as an image (`react-native-view-shot` +
`expo-sharing`).

## Themes

Eight themes in two collections, switched from the menu or Settings. Each changes the palette,
the block shape, the panel shape, the title treatment, the backdrop art and the typefaces.

| Theme          | Collection | Panels        | Blocks              | Backdrop                  |
| -------------- | ---------- | ------------- | ------------------- | ------------------------- |
| Night City     | Cyberpunk  | cut corners   | hollow neon tubes   | circuit traces            |
| Neon Rain      | Cyberpunk  | cut corners   | glossy              | slanted rain              |
| Outrun         | Cyberpunk  | cut corners   | bevelled            | striped sun, horizon grid |
| Amber Terminal | Cyberpunk  | cut corners   | chips, dashed ghost | heavy scanlines           |
| Blueprint      | Crafted    | square        | hatched outlines    | graph paper               |
| Sugar Rush     | Crafted    | round (light) | jelly sweets        | polka dots                |
| Kintsugi       | Crafted    | notched       | lacquer, gold seam  | seigaiha waves            |
| Cathedral      | Crafted    | arched        | stained glass       | rose window               |

Cyberpunk themes add the glitch title, the board scan bar and HUD corner brackets; the scan bar
and glitch stop under Reduce Motion.

Fonts (all SIL Open Font License, bundled one weight at a time): Orbitron, Chakra Petch, Share
Tech Mono, Architects Daughter, Baloo 2, Cinzel, Cormorant Garamond, UnifrakturMaguntia.

Two tests guard every theme: `themes.test.ts` checks WCAG contrast for text, button labels and
pieces against the well; `fonts.test.ts` re-measures each bundled font file and fails if any text
style's line height is tighter than the font's own line box (tall fonts such as Baloo 2 need
1.6× their size or they clip).

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

`pnpm test` runs 160 tests over the modes, Zone, Cascade, progress and achievements, the theme palettes and font metrics, the gesture maths (axis lock, step counting, flick detection), the board, collision, movement, SRS rotation and kicks, line
clears, scoring, levels, 7-bag, lock delay, hold rules, game over and storage parsing. The UI
has no automated tests; see the manual checklist in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## Privacy

See [PRIVACY.md](PRIVACY.md). The app collects no data.

## Not in v1

- On-screen buttons as an alternative control scheme (`controlMode` is reserved for it)
- T-spin detection and scoring
- Music, sound volume slider
- Tablet layouts (`supportsTablet` is false)
