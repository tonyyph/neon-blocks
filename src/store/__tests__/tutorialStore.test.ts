import { useTutorialStore } from '../tutorialStore';

describe('tutorial store', () => {
  beforeEach(() => useTutorialStore.getState().open(false));

  it('opens on the welcome card, mandatory on first install, optional on replay', () => {
    useTutorialStore.getState().goTo('step', 4);
    useTutorialStore.getState().open(true);
    expect(useTutorialStore.getState()).toMatchObject({
      phase: 'intro',
      index: 0,
      mandatory: true,
    });
    useTutorialStore.getState().open(false);
    expect(useTutorialStore.getState().mandatory).toBe(false);
  });

  it('keeps its place across screen changes until reopened', () => {
    useTutorialStore.getState().goTo('step', 3);
    useTutorialStore.getState().goTo('success');
    expect(useTutorialStore.getState()).toMatchObject({ phase: 'success', index: 3 });
  });
});
