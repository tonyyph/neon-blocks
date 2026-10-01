# Release checklist — Neon Blocks 1.0.0

## Before building

- [ ] Decide on the final name; "Neon Blocks" is a working title. Avoid "Tetris" anywhere
      in the name, description, keywords or screenshots: it is a trademark of The Tetris
      Company, which actively files takedowns
- [ ] Replace or approve the generated placeholder icon and splash (`pnpm assets`)
- [ ] `pnpm verify` passes (typecheck, lint, tests)
- [ ] `npx expo-doctor` reports no issues
- [ ] Bump `expo.version` for each release (build numbers are managed by EAS)

## Manual QA (real devices, release build)

Run on at least one small screen (iPhone SE / 5" Android) and one large (Pro Max class).

- [ ] Menu → Start begins a game; the first piece appears in the visible field
- [ ] Dragging left/right moves one column per cell of travel and stops at walls
- [ ] Tapping the right half rotates clockwise, the left half counter-clockwise, including
      next to walls and the floor (wall kicks)
- [ ] Dragging down slowly soft-drops row by row and adds points
- [ ] Flicking down hard-drops once; a slow drag down never hard-drops
- [ ] Swiping up (at any speed) holds, once per piece; the hold slot is dimmed until the next lock
- [ ] A sideways drag never soft-drops; a tap never moves the piece
- [ ] Gestures still register near the screen edges and on the side panels
- [ ] Every mode starts from Play; Sprint/Dig end as Cleared with a time, Ultra/Daily as Time
- [ ] Zone charges, starts at half, freezes gravity, banks lines and bursts
- [ ] Daily: first run counts, replays are marked Practice; streak grows on consecutive days
- [ ] Records, Awards and Share (image in the share sheet) work after a game
- [ ] Each of the eight themes applies everywhere (menu, game, overlays, settings) and is kept
      after relaunch
- [ ] With Reduce Motion on, the scan bar and title glitch stop
- [ ] Ghost piece shows and hides with the setting
- [ ] Line clears flash, collapse and score correctly; Tetris call-out shows
- [ ] Level rises every 10 lines and the game speeds up
- [ ] Pause → Resume / Restart / Settings / Main Menu all work; Settings returns to the
      paused game
- [ ] Backgrounding the app pauses the game
- [ ] Android back button pauses the game and leaves sub-screens
- [ ] Game over shows score, lines, level, best; new-high-score badge on a record
- [ ] Kill and relaunch: high score and settings are kept
- [ ] Reset high score asks for confirmation and clears it
- [ ] Sound respects the setting and the iOS silent switch; haptics respect the setting
- [ ] Play for 10+ minutes with no crash, stutter or input lag
- [ ] No layout clipping in any screen; notch and home indicator areas are clear

## Build and submit (EAS)

The project is `@cuongphan2/neon-blocks` on EAS. Apple access uses the team's App Store Connect
API key (`credentials/asc-api-key.p8` + `.env.eas`, both gitignored, same key as AERA), so no
Apple ID password or SMS code is needed. Every eas command goes through `tools/eas.sh`, which
loads `.env.eas` first.

```bash
pnpm build:ios        # cloud build, production profile, build number auto-incremented by EAS
pnpm submit:ios       # uploads the latest build to App Store Connect → TestFlight
pnpm release:ios      # verify + build + submit
```

The App Store Connect app is "Neon Blocks: Cyber Stack" (`ascAppId` 6818053046). `eas submit`
does not read `.env.eas`: it only uses an API key named in `eas.json`
(`ascApiKeyPath` / `ascApiKeyId` / `ascApiKeyIssuerId`). Without those it falls back to an Apple
ID sign-in with SMS 2FA. The key id and issuer id there are identifiers, not secrets; the `.p8`
stays gitignored. `pnpm asc:app-id` looks the app id up from the bundle id.

The marketing version comes from `expo.version` in `app.json`; bump it by hand per release.

## Store listing

- [ ] Privacy policy URL: host `PRIVACY.md` (for example on GitHub Pages)
- [ ] App Store privacy "nutrition label": **Data Not Collected**
- [ ] Google Play Data safety: no data collected or shared; no ads
- [ ] Age rating questionnaire: no violence, no user content, no gambling → 4+ / Everyone
- [ ] Screenshots: 6.9" and 6.5" iPhone; Android phone. Portrait only
- [ ] Category: Games → Puzzle
- [ ] Export compliance: `usesNonExemptEncryption` is already false in `app.json`

## Already configured in app.json

- Portrait only, dark UI, `#080A12` splash background
- iOS privacy manifest declaring no tracking and no collected data
- Microphone permission disabled (expo-audio), and on Android `RECORD_AUDIO`,
  `MODIFY_AUDIO_SETTINGS` and media foreground-service permissions blocked
- Background audio disabled; no internet access is used at runtime
