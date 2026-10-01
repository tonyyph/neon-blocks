import { useCallback, useEffect, useRef, useState } from 'react';
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
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';
import { EMPTY_PROGRESS, type StepProgress, TUTORIAL_STEPS, applyEvent } from '../tutorial/steps';
import { TetrisScreen } from './TetrisScreen';

/** How long "Nice!" stays up before the next step's board loads. */
const SUCCESS_PAUSE_MS = 1100;

type Phase = 'intro' | 'step' | 'success' | 'done';
export type TutorialExit = 'marathon' | 'modes' | 'menu';

interface Props {
  onExit: (to: TutorialExit) => void;
  onOpenSettings: () => void;
}

/**
 * Step-by-step tutorial on a real board. Each step loads a prepared position, watches the game's
 * events, and moves on once the player has actually done the move it teaches. Gravity is off.
 */
export const TutorialScreen = ({ onExit, onOpenSettings }: Props) => {
  const { colors } = useTheme();
  const t = useT();
  const update = useSettingsStore((store) => store.update);
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const progress = useRef<StepProgress>(EMPTY_PROGRESS);
  const step = TUTORIAL_STEPS[index];

  // Start from a clean slate, whatever game was left behind (paused, finished…).
  useEffect(() => {
    dispatchGame({ type: 'quit' });
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
    setIndex(0);
    setPhase('step');
  };

  /** Leaving, finishing or skipping all count as having seen the tutorial. */
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
        setPhase('success');
      }
    });
  }, [phase, index, step, loadStep]);

  // After the "Nice!" beat, load the next step or finish.
  useEffect(() => {
    if (phase !== 'success') return undefined;
    const timer = setTimeout(() => {
      if (index + 1 < TUTORIAL_STEPS.length) {
        loadStep(index + 1);
        setIndex(index + 1);
        setPhase('step');
      } else {
        setPhase('done');
      }
    }, SUCCESS_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [phase, index, loadStep]);

  const [title, body] = t.tutorial.steps[step.id];

  return (
    <View style={styles.root}>
      <TetrisScreen
        onOpenSettings={onOpenSettings}
        onExitToMenu={() => exit('menu')}
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
              onSkip={() => exit('menu')}
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
          <Button label={t.tutorial.skip} onPress={() => exit('menu')} />
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
