import type { GameMode, GameOutcome, Mutator } from '../game/types';
import type { ZoneTier } from '../game/zone';
import type { AchievementId } from '../progress/types';
import type { ThemeId } from '../theme/themes';
import type { TutorialStepId } from '../tutorial/steps';

type Pair = readonly [string, string];

/**
 * English strings, and the shape every other language must match. Strings that depend on a value
 * are functions, so each language can order words and pluralise in its own way.
 */
export const en = {
  locale: 'en-US',

  common: {
    back: 'Back',
    cancel: 'Cancel',
    score: 'Score',
    time: 'Time',
    lines: 'Lines',
    level: 'Level',
    best: 'Best',
    hold: 'Hold',
    next: 'Next',
    levelShort: 'Lv',
    linesShort: 'Ln',
  },

  menu: {
    marathonBest: 'Marathon best',
    gamesPlayed: (n: number) => `${n} ${n === 1 ? 'game' : 'games'} played`,
    play: 'Play',
    records: 'Records',
    awards: 'Awards',
    themes: 'Themes',
    settings: 'Settings',
    howToPlay: 'How to play',
    themeChip: (name: string) => `Theme: ${name}. Change theme`,
  },

  modes: {
    title: 'Play',
    notPlayed: 'Not played yet',
    notFinished: 'Not finished yet',
    best: (value: string) => `Best ${value}`,
    names: {
      marathon: 'Marathon',
      sprint: 'Sprint',
      ultra: 'Ultra',
      dig: 'Dig',
      cascade: 'Cascade',
      mutators: 'Mutators',
      daily: 'Daily',
      tutorial: 'Tutorial',
    } satisfies Record<GameMode, string>,
    summaries: {
      marathon: 'Endless. Faster every 10 lines.',
      sprint: 'Clear 40 lines as fast as you can.',
      ultra: 'Two minutes. Score as much as you can.',
      dig: 'Ten rows of garbage. Dig to the floor.',
      cascade: 'Loose blocks fall after a clear. Chain the reactions.',
      mutators: 'Every level twists a rule: fog, mirror, ghosts, turbo.',
      daily: 'Three minutes, today’s pieces and today’s twist.',
      tutorial: 'Learn the controls one step at a time.',
    } satisfies Record<GameMode, string>,
  },

  daily: {
    title: 'Daily challenge',
    subtitle: (date: string, twist: string) => `${date} · twist: ${twist}`,
    intro: (summary: string, hint: string) =>
      `${summary} ${hint} Your first run today is the one that counts.`,
    played: (score: string) => `Today's score: ${score}. Play again for practice.`,
    a11y: (date: string, twist: string) => `Daily challenge, ${date}. Twist: ${twist}.`,
  },

  mutators: {
    names: {
      fog: 'Fog',
      mirror: 'Mirror',
      invisible: 'Ghosts',
      turbo: 'Turbo',
    } satisfies Record<Mutator, string>,
    hints: {
      fog: 'The bottom of the well is hidden.',
      mirror: 'Left and right are swapped.',
      invisible: 'Locked blocks fade to outlines.',
      turbo: 'Gravity doubles.',
    } satisfies Record<Mutator, string>,
  },

  game: {
    board: 'Game board',
    pause: 'Pause',
    touchHint: 'Drag to move, tap to rotate, flick down to drop, swipe up to hold',
    linesToGo: (n: number) => `${n} ${n === 1 ? 'line' : 'lines'} to go`,
    garbageLeft: (n: number) => `${n} garbage ${n === 1 ? 'row' : 'rows'} left`,
    timeLeft: (time: string) => `${time} left`,
    gestures: { move: 'Move', rotate: 'Rotate', drop: 'Drop', hold: 'Hold' },
    zone: 'Zone',
    zoneSeconds: (n: number) => `${n}s`,
    zoneActiveA11y: (n: number) => `Zone active, ${n} seconds left`,
    zoneChargeA11y: (percent: number) => `Zone, ${percent}% charged`,
    clears: ['', 'Single', 'Double', 'Triple', 'Quad'],
    /** Names for big Zone bursts, by the number of lines banked. */
    zoneTiers: {
      8: 'Supernova',
      12: 'Hypernova',
      16: 'Singularity',
      20: 'Big Bang',
    } satisfies Record<ZoneTier, string>,
    zoneLines: (n: number) => `${n} lines`,
    backToBack: 'Back-to-back',
    combo: (n: number) => `Combo ×${n}`,
    chain: (n: number) => `Chain ×${n}`,
  },

  pause: {
    title: 'Paused',
    resume: 'Resume',
    restart: 'Restart',
    settings: 'Settings',
    menu: 'Main menu',
  },

  gameOver: {
    titles: {
      completed: 'Cleared',
      timeUp: 'Time',
      topOut: 'Game over',
    } satisfies Record<GameOutcome, string>,
    dailyLabel: (date: string) => `Daily · ${date}`,
    newRecord: 'New record',
    todaysScore: "Today's score",
    practice: 'Practice run',
    playAgain: 'Play again',
    share: 'Share',
    sharing: 'Sharing…',
    menu: 'Menu',
    shareDialog: 'Share your result',
  },

  records: {
    title: 'Records',
    byMode: 'Best by mode',
    notFinished: 'DNF',
    daily: 'Daily',
    streak: 'Current streak',
    bestStreak: 'Best streak',
    daysPlayed: 'Days played',
    allTime: 'All time',
    games: 'Games',
    lines: 'Lines',
    tetrises: 'Quads',
    pieces: 'Pieces',
    pps: 'Pieces per second',
    longestCombo: 'Longest combo',
    longestChain: 'Longest chain',
    biggestZone: 'Biggest Zone',
    zoneLines: (n: number) => `${n} ${n === 1 ? 'line' : 'lines'}`,
    timePlayed: 'Time played',
    minutes: (m: number) => `${m} min`,
    hours: (h: number, m: number) => `${h} h ${m} min`,
    recent: 'Recent games',
    recentEmpty: 'Finish a game and it shows up here.',
  },

  awards: {
    title: 'Awards',
    count: (earned: number, total: number) => `${earned} of ${total} earned`,
    items: {
      'first-game': ['Boot sequence', 'Finish your first game.'],
      'first-tetris': ['Four at once', 'Clear four lines with one piece.'],
      'tetris-25': ['Quad stacker', 'Clear four lines at once 25 times in total.'],
      'back-to-back': ['Encore', 'Clear four lines at once twice in a row.'],
      'combo-5': ['Rhythm', 'Clear lines with six pieces in a row.'],
      'lines-100': ['Century', 'Clear 100 lines in total.'],
      'lines-1000': ['Thousand rows', 'Clear 1,000 lines in total.'],
      'level-10': ['Terminal velocity', 'Reach level 10 in any mode.'],
      'marathon-50k': ['Long haul', 'Score 50,000 in Marathon.'],
      'sprint-done': ['Off the line', 'Finish a Sprint.'],
      'sprint-2min': ['Under two', 'Finish a Sprint in under 2 minutes.'],
      'ultra-20k': ['Overclocked', 'Score 20,000 in one Ultra.'],
      'dig-done': ['Bedrock', 'Dig through all the garbage.'],
      'dig-90s': ['Excavator', 'Finish Dig in under 90 seconds.'],
      'chain-3': ['Chain reaction', 'Set off a 3-link chain in Cascade.'],
      'chain-5': ['Meltdown', 'Set off a 5-link chain in Cascade.'],
      'zone-8': ['Supernova', 'Bank 8 lines in one Zone.'],
      'zone-16': ['Singularity', 'Bank 16 lines in one Zone.'],
      'mutator-5': ['Adaptive', 'Reach level 5 in Mutators.'],
      'daily-first': ['Clocked in', 'Play a Daily challenge.'],
      'daily-streak-7': ['Seven days', 'Play the Daily seven days running.'],
      'speed-2pps': ['Fast hands', 'Average 2 pieces a second over 100+ pieces.'],
    } satisfies Record<AchievementId, readonly [string, string]>,
  },

  themes: {
    title: 'Themes',
    collections: { Cyberpunk: 'Cyberpunk', Crafted: 'Crafted' },
    inUse: 'In use',
    cardA11y: (name: string, active: boolean) => `${name} theme${active ? ', active' : ''}`,
    names: {
      nightCity: 'Night City',
      neonRain: 'Neon Rain',
      outrun: 'Outrun',
      amberTerminal: 'Amber Terminal',
      blueprint: 'Blueprint',
      sugarRush: 'Sugar Rush',
      kintsugi: 'Kintsugi',
      cathedral: 'Cathedral',
    } satisfies Record<ThemeId, string>,
    taglines: {
      nightCity: 'Hazard yellow on black. Hollow neon tubes.',
      neonRain: 'Magenta signs through wet glass.',
      outrun: 'A violet dusk and a grid to the horizon.',
      amberTerminal: 'A netrunner’s phosphor screen.',
      blueprint: 'Pencil lines on drafting film. Every block a technical drawing.',
      sugarRush: 'A box of jelly sweets on a strawberry-milk table.',
      kintsugi: 'Black lacquer, mended with gold.',
      cathedral: 'Jewel-bright glass set in lead.',
    } satisfies Record<ThemeId, string>,
  },

  settings: {
    title: 'Settings',
    theme: 'Theme',
    themeA11y: (name: string) => `Theme: ${name}. Change theme`,
    language: 'Language',
    sound: 'Sound effects',
    soundHint: 'Follows the device silent switch',
    haptics: 'Haptics',
    hapticsHint: 'Light vibration on moves and clears',
    ghost: 'Ghost piece',
    ghostHint: 'Show where the piece will land',
    controls: 'Controls',
    controlsHint: 'Touch gestures. See How to play.',
    reset: 'Reset progress',
    resetTitle: 'Reset all progress?',
    resetBody: 'Records, Daily history, stats and awards will be erased. This cannot be undone.',
    resetConfirm: 'Reset',
    version: (version: string) => `Neon Blocks ${version}`,
    privacy: 'Plays fully offline. No account, no ads, no tracking. Nothing leaves your device.',
  },

  setup: {
    progress: (n: number, total: number) => `${n} of ${total}`,
    next: 'Continue',
    back: 'Back',
    finish: 'Start the tutorial',
    later: 'You can change any of this later in Settings.',
    language: {
      title: 'Welcome to Neon Blocks',
      body: 'First, pick the language you want to play in.',
    },
    theme: {
      title: 'Pick a look',
      body: 'Eight themes. Tap one and the whole game changes to show it.',
    },
    feel: {
      title: 'Sound and feel',
      body: 'Choose what you want to hear and feel while you play.',
    },
  },

  tutorial: {
    introTitle: 'Welcome to Neon Blocks',
    introBody:
      'One minute, seven moves. Try each one on the board and the next step opens by itself.',
    start: 'Start the tutorial',
    skip: 'Skip, I know how to play',
    skipShort: 'Skip',
    stepCounter: (n: number, total: number) => `Step ${n} of ${total}`,
    steps: {
      move: ['Move', 'Drag left, then right. The piece follows your finger.'],
      rotate: [
        'Rotate',
        'Tap the right side to turn clockwise, the left side to turn back. Turn it twice.',
      ],
      softDrop: ['Soft drop', 'Drag down slowly to lower the piece one row at a time.'],
      hardDrop: ['Hard drop', 'Flick down quickly. The piece drops and locks at once.'],
      hold: ['Hold', 'Swipe up to put this piece aside. You can swap it back later.'],
      clear: [
        'Clear lines',
        'Tap to stand the I upright, drag it into the gap on the right, then flick down.',
      ],
      zone: ['Zone', 'Your Zone meter is full. Tap Zone at the top right to freeze time.'],
    } satisfies Record<TutorialStepId, Pair>,
    success: 'Nice!',
    finishTitle: "You're ready",
    finishBody:
      'That is everything you need. Fill rows to clear them, and save Zone for when the stack gets tall.',
    playMarathon: 'Play Marathon',
    chooseMode: 'Choose a mode',
    menu: 'Main menu',
    replay: 'Step-by-step tutorial',
  },

  howToPlay: {
    title: 'How to play',
    items: [
      ['Move', 'Drag left or right anywhere below the score. The piece follows your finger.'],
      ['Rotate', 'Tap the right half to turn clockwise, the left half to turn the other way.'],
      ['Soft drop', 'Drag down slowly. +1 per row.'],
      ['Hard drop', 'Flick down to slam the piece and lock it. +2 per row.'],
      ['Hold', 'Swipe up to save the piece for later. Once per piece.'],
      ['Clear lines', 'Fill a row to clear it. Every 10 lines speeds up the game.'],
      [
        'Zone',
        'Clears charge the Zone meter. Tap Zone once it is half full: gravity stops, cleared lines pile up at the bottom, and when time runs out they all burst at once.',
      ],
      [
        'Modes',
        'Sprint and Dig race the clock. Ultra and Daily give you a few minutes. Cascade lets loose blocks fall into chains. Mutators bend a rule every level.',
      ],
    ] as Pair[],
    pointsTitle: 'Points × level',
    points: [
      ['Single', '100'],
      ['Double', '300'],
      ['Triple', '500'],
      ['Quad', '800'],
    ] as Pair[],
    pointsNote:
      'A Quad straight after another scores half again. Clearing on consecutive pieces builds a combo bonus.',
  },
};

export type Strings = typeof en;
