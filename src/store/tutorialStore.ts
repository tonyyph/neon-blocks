import { create } from 'zustand';

export type TutorialPhase = 'intro' | 'step' | 'success' | 'done';

interface TutorialStore {
  phase: TutorialPhase;
  index: number;
  /**
   * First run after install: the player has to finish the tutorial. There is no Skip, and the
   * pause menu has no way back to the main menu. Replays from How to play are optional.
   */
  mandatory: boolean;
  /** Opens the tutorial from its welcome card. */
  open: (mandatory: boolean) => void;
  goTo: (phase: TutorialPhase, index?: number) => void;
}

/**
 * Tutorial progress lives here rather than in the screen, so a trip to Settings from the pause
 * menu (which unmounts the screen) comes back to the same step instead of the welcome card.
 */
export const useTutorialStore = create<TutorialStore>((set) => ({
  phase: 'intro',
  index: 0,
  mandatory: false,
  open: (mandatory) => set({ phase: 'intro', index: 0, mandatory }),
  goTo: (phase, index) => set((state) => ({ phase, index: index ?? state.index })),
}));
