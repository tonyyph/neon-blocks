import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { OverlayCard } from '../components/Overlay/OverlayCard';
import { CoachCard } from '../components/Tutorial/CoachCard';
import { Button } from '../components/ui/Button';
import { GlitchText } from '../components/ui/GlitchText';
import { Text } from '../components/ui/Text';
import { haptics } from '../hooks/useHaptics';
import { useT } from '../i18n';
import { dispatchGame, useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTutorialStore } from '../store/tutorialStore';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';
import { EMPTY_PROGRESS, type StepProgress, TUTORIAL_STEPS, applyEvent } from '../tutorial/steps';
import { TetrisScreen } from './TetrisScreen';

/** How long "Nice!" stays up before the next step's board loads. */
const SUCCESS_PAUSE_MS = 1100;

export type TutorialExit = 'marathon' | 'modes' | 'menu';

interface Props {
  onExit: (to: TutorialExit) => void;
  onOpenSettings: () => void;
}

/**
 * Step-by-step tutorial on a real board. Each step loads a prepared position, watches the game's
 * events, and moves on once the player has actually done the move it teaches. Gravity is off.
 *
 * On first install it is mandatory: no Skip, and no way to the main menu until it is finished.
 * Quitting the app midway brings it back on the next launch.
 */
export const TutorialScreen = ({ onExit, onOpenSettings }: Props) => {
  const { colors } = useTheme();
  const t = useT();
  const update = useSettingsStore((store) => store.update);
  const phase = useTutorialStore((store) => store.phase);
  const index = useTutorialStore((store) => store.index);
  const mandatory = useTutorialStore((store) => store.mandatory);
  const goTo = useTutorialStore((store) => store.goTo);
  const progress = useRef<StepProgress>(EMPTY_PROGRESS);
  const step = TUTORIAL_STEPS[index];

  // On a fresh start, clear whatever game was left behind (paused, finished…). Coming back from
  // Settings mid-step keeps the paused tutorial board as it was.
  useEffect(() => {
    if (useTutorialStore.getState().phase === 'intro') dispatchGame({ type: 'quit' });
  }, []);

  const loadStep = useCallback((stepIndex: number) => {
    progress.current = EMPTY_PROGRESS;
    dispatchGame({
      type: 'start',
      seed: Date.now(),
      mode: 'tutorial',
      scenario: TUTORIAL_STEPS[stepIndex].scenario,
    });
  }, []);

  const begin = () => {
    loadStep(0);
    goTo('step', 0);
  };

  /** Finishing (or, on an optional replay, skipping) marks the tutorial as seen. */
  const exit = useCallback(
    (to: TutorialExit) => {
      update({ tutorialDone: true });
      dispatchGame({ type: 'quit' });
      onExit(to);
    },
    [onExit, update],
  );

  // Watch the game for the move this step teaches. A top-out just restarts the step.
  useEffect(() => {
    if (phase !== 'step') return undefined;
    return useGameStore.subscribe(({ game }, previous) => {
      if (game.status === 'gameOver' && previous.game.status !== 'gameOver') {
        loadStep(index);
        return;
      }
      if (game.events === previous.game.events || !game.events.length) return;
      progress.current = game.events.reduce(applyEvent, progress.current);
      if (step.done(progress.current)) {
        haptics.success();
        goTo('success');
      }
    });
  }, [phase, index, step, loadStep, goTo]);

  // After the "Nice!" beat, load the next step or finish.
  useEffect(() => {
    if (phase !== 'success') return undefined;
    const timer = setTimeout(() => {
      if (index + 1 < TUTORIAL_STEPS.length) {
        loadStep(index + 1);
        goTo('step', index + 1);
      } else {
        goTo('done');
      }
    }, SUCCESS_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [phase, index, loadStep, goTo]);

  const [title, body] = t.tutorial.steps[step.id];

  return (
    <View style={styles.root}>
      <TetrisScreen
        onOpenSettings={onOpenSettings}
        onExitToMenu={mandatory ? undefined : () => exit('menu')}
        onRestart={() => loadStep(index)}
        hideGameOver
        footer={
          phase === 'step' || phase === 'success' ? (
            <CoachCard
              step={index + 1}
              total={TUTORIAL_STEPS.length}
              title={title}
              body={body}
              demo={step.demo}
              succeeded={phase === 'success'}
              onSkip={mandatory ? undefined : () => exit('menu')}
            />
          ) : null
        }
      />

      {phase === 'intro' ? (
        <OverlayCard accent={colors.primary}>
          <View style={styles.center}>
            <GlitchText variant="title" color={colors.primary}>
              {t.tutorial.introTitle}
            </GlitchText>
          </View>
          <Text variant="body" color={colors.textDim} style={styles.centerText}>
            {t.tutorial.introBody}
          </Text>
          <Button
            label={t.tutorial.start}
            icon="school-outline"
            variant="primary"
            onPress={begin}
          />
          {mandatory ? null : <Button label={t.tutorial.skip} onPress={() => exit('menu')} />}
        </OverlayCard>
      ) : null}

      {phase === 'done' ? (
        <OverlayCard accent={colors.success}>
          <View style={styles.center}>
            <GlitchText variant="title" color={colors.success}>
              {t.tutorial.finishTitle}
            </GlitchText>
          </View>
          <Text variant="body" color={colors.textDim} style={styles.centerText}>
            {t.tutorial.finishBody}
          </Text>
          <Button
            label={t.tutorial.playMarathon}
            icon="play"
            variant="primary"
            onPress={() => exit('marathon')}
          />
          <Button
            label={t.tutorial.chooseMode}
            icon="view-grid-outline"
            onPress={() => exit('modes')}
          />
          <Button label={t.tutorial.menu} icon="home-outline" onPress={() => exit('menu')} />
        </OverlayCard>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', marginBottom: spacing.xs },
  centerText: { textAlign: 'center' },
});
