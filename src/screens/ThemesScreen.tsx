import { LinearGradient } from 'expo-linear-gradient';
import { Text as RNText, ScrollView, StyleSheet, View } from 'react-native';

import { Block } from '../components/Board/Cell';
import { Chamfer } from '../components/ui/Chamfer';
import { PressableScale } from '../components/ui/PressableScale';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import type { PieceType } from '../game/types';
import { haptics } from '../hooks/useHaptics';
import { useT } from '../i18n';
import { useSettingsStore } from '../store/settingsStore';
import { spacing } from '../theme/spacing';
import { THEMES, THEME_ORDER, type Theme } from '../theme/themes';
import { getTextStyle } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

/** A little stack of pieces, so each card shows the theme's blocks in use, not just swatches. */
const SAMPLE: { type: PieceType; x: number; y: number }[] = [
  { type: 'T', x: 2, y: 0 },
  { type: 'T', x: 1, y: 1 },
  { type: 'T', x: 2, y: 1 },
  { type: 'T', x: 3, y: 1 },
  { type: 'I', x: 5, y: 0 },
  { type: 'I', x: 5, y: 1 },
  { type: 'I', x: 5, y: 2 },
  { type: 'I', x: 5, y: 3 },
  { type: 'J', x: 0, y: 2 },
  { type: 'J', x: 0, y: 3 },
  { type: 'J', x: 1, y: 3 },
  { type: 'O', x: 2, y: 2 },
  { type: 'O', x: 3, y: 2 },
  { type: 'O', x: 2, y: 3 },
  { type: 'O', x: 3, y: 3 },
  { type: 'S', x: 4, y: 3 },
  { type: 'Z', x: 1, y: 2 },
  { type: 'L', x: 4, y: 2 },
];
const SAMPLE_CELL = 16;

const Sample = ({ theme }: { theme: Theme }) => (
  <View style={{ width: SAMPLE_CELL * 6, height: SAMPLE_CELL * 4 }}>
    {SAMPLE.map(({ type, x, y }) => (
      <View
        key={`${x}-${y}`}
        style={[styles.sampleCell, { left: x * SAMPLE_CELL, top: y * SAMPLE_CELL }]}
      >
        <Block type={type} size={SAMPLE_CELL} theme={theme} />
      </View>
    ))}
  </View>
);

/** Drawn entirely in its own theme, so the card is a true preview of that look. */
const ThemeCard = ({
  theme,
  active,
  onSelect,
}: {
  theme: Theme;
  active: boolean;
  onSelect: () => void;
}) => {
  const { colors } = theme;
  const t = useT();
  const name = t.themes.names[theme.id];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={t.themes.cardA11y(name, active)}
      onPress={onSelect}
      pressedScale={0.97}
    >
      <Chamfer
        cut={18}
        shape={theme.shape}
        fill={colors.background}
        stroke={active ? colors.primary : colors.line}
        strokeWidth={active ? 2.5 : 1}
        style={styles.card}
      >
        <LinearGradient
          colors={['transparent', colors.backgroundAlt]}
          style={[StyleSheet.absoluteFill, styles.cardGlow]}
          pointerEvents="none"
        />
        <View style={styles.cardText}>
          <RNText
            allowFontScaling={false}
            style={[getTextStyle('heading', theme, name), { color: colors.primary }]}
          >
            {name}
          </RNText>
          <RNText
            allowFontScaling={false}
            style={[
              getTextStyle('caption', theme, t.themes.taglines[theme.id]),
              { color: colors.textDim },
            ]}
          >
            {t.themes.taglines[theme.id]}
          </RNText>
          {active ? (
            <Chamfer cut={5} shape={theme.shape} fill={colors.primary} style={styles.badge}>
              <RNText
                allowFontScaling={false}
                style={[getTextStyle('label', theme, t.themes.inUse), { color: colors.onPrimary }]}
              >
                {t.themes.inUse}
              </RNText>
            </Chamfer>
          ) : null}
        </View>
        <Sample theme={theme} />
      </Chamfer>
    </PressableScale>
  );
};

interface Props {
  onBack: () => void;
}

const COLLECTIONS = ['Cyberpunk', 'Crafted'] as const;

export const ThemesScreen = ({ onBack }: Props) => {
  const { colors } = useTheme();
  const t = useT();
  const themeId = useSettingsStore((store) => store.settings.themeId);
  const update = useSettingsStore((store) => store.update);

  return (
    <Screen>
      <ScreenHeader title={t.themes.title} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.list}>
        {COLLECTIONS.map((collection) => (
          <View key={collection} style={styles.section}>
            <Text variant="label" color={colors.textDim}>
              {t.themes.collections[collection]}
            </Text>
            {THEME_ORDER.filter((id) => THEMES[id].collection === collection).map((id) => (
              <ThemeCard
                key={id}
                theme={THEMES[id]}
                active={id === themeId}
                onSelect={() => {
                  if (id === themeId) return;
                  haptics.tap();
                  update({ themeId: id });
                }}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    minHeight: 112,
    overflow: 'hidden',
  },
  cardGlow: { opacity: 0.9 },
  cardText: { flex: 1, gap: spacing.xs },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  sampleCell: { position: 'absolute' },
});
