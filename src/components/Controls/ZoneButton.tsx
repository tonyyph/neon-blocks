import { StyleSheet, View } from 'react-native';

import { ZONE_FULL_DURATION_MS, ZONE_MIN_METER } from '../../game/zone';
import { haptics } from '../../hooks/useHaptics';
import { useT } from '../../i18n';
import { dispatchGame, useGameStore } from '../../store/gameStore';
import { withAlpha } from '../../theme/colorUtils';
import { MIN_TOUCH } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Chamfer } from '../ui/Chamfer';
import { PressableScale } from '../ui/PressableScale';
import { Text } from '../ui/Text';

const WIDTH = 76;

/**
 * Zone meter and trigger. The fill shows the charge; it lights up once half full, and while Zone
 * runs it counts down the frozen seconds instead.
 */
export const ZoneButton = () => {
  const { colors } = useTheme();
  const t = useT();
  const meter = useGameStore((store) => store.game.zone.meter);
  const active = useGameStore((store) => store.game.zone.active);
  const seconds = useGameStore((store) => Math.ceil(store.game.zone.remainingMs / 1000));
  // While Zone runs the bar drains; rounded to whole percent so it re-renders ~100 times, not 60/s.
  const left = useGameStore(({ game: { zone } }) =>
    zone.active ? Math.round((zone.remainingMs / (zone.meter * ZONE_FULL_DURATION_MS)) * 100) : 0,
  );
  const ready = !active && meter >= ZONE_MIN_METER;

  const label = active ? t.game.zoneSeconds(seconds) : t.game.zone;
  const accent = active ? colors.secondary : ready ? colors.primary : colors.textFaint;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={
        active ? t.game.zoneActiveA11y(seconds) : t.game.zoneChargeA11y(Math.round(meter * 100))
      }
      accessibilityState={{ disabled: !ready }}
      disabled={!ready}
      hitSlop={8}
      onPress={() => {
        haptics.tap();
        dispatchGame({ type: 'activateZone' });
      }}
    >
      <Chamfer
        cut={9}
        fill={colors.surface}
        stroke={accent}
        strokeWidth={ready ? 2 : 1}
        style={styles.button}
      >
        <View
          pointerEvents="none"
          style={[
            styles.fill,
            {
              width: `${active ? left : Math.round(meter * 100)}%`,
              backgroundColor: withAlpha(accent, active ? 0.28 : 0.22),
            },
          ]}
        />
        <Text variant="label" color={accent}>
          {label}
        </Text>
      </Chamfer>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    width: WIDTH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
});
