import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { haptics } from '../../hooks/useHaptics';
import { LANGUAGES, LANGUAGE_NAMES, useT } from '../../i18n';
import { useSettingsStore } from '../../store/settingsStore';
import { withAlpha } from '../../theme/colorUtils';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/useTheme';
import { Chamfer } from '../ui/Chamfer';
import { PressableScale } from '../ui/PressableScale';
import { Text } from '../ui/Text';
import { Toggle } from '../ui/Toggle';

/** A themed panel grouping related settings rows. */
export const SettingsGroup = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme();
  return (
    <Chamfer
      cut={12}
      fill={withAlpha(colors.surface, 0.92)}
      stroke={colors.line}
      style={styles.group}
    >
      {children}
    </Chamfer>
  );
};

/** Two-way choice of language, each option written in its own language. */
export const LanguagePicker = () => {
  const { colors } = useTheme();
  const language = useSettingsStore((store) => store.settings.language);
  const update = useSettingsStore((store) => store.update);
  return (
    <View style={styles.segments} accessibilityRole="radiogroup">
      {LANGUAGES.map((option) => {
        const selected = option === language;
        return (
          <View key={option} style={styles.segment}>
            <PressableScale
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => {
                if (selected) return;
                haptics.tap();
                update({ language: option });
              }}
              pressedScale={0.96}
            >
              <Chamfer
                cut={8}
                fill={selected ? colors.primary : colors.surfaceRaised}
                stroke={selected ? colors.primary : colors.line}
                style={styles.segmentInner}
              >
                <Text variant="body" color={selected ? colors.onPrimary : colors.text}>
                  {LANGUAGE_NAMES[option]}
                </Text>
              </Chamfer>
            </PressableScale>
          </View>
        );
      })}
    </View>
  );
};

type ToggleKey = 'soundEnabled' | 'hapticsEnabled' | 'ghostEnabled';

/** Each toggle's label and hint come from the dictionary under these keys. */
const TOGGLES: { key: ToggleKey; label: 'sound' | 'haptics' | 'ghost' }[] = [
  { key: 'soundEnabled', label: 'sound' },
  { key: 'hapticsEnabled', label: 'haptics' },
  { key: 'ghostEnabled', label: 'ghost' },
];

/** Sound, haptics and ghost piece switches, saved the moment they change. */
export const SettingToggles = () => {
  const { colors } = useTheme();
  const t = useT();
  const settings = useSettingsStore((store) => store.settings);
  const update = useSettingsStore((store) => store.update);
  return (
    <SettingsGroup>
      {TOGGLES.map(({ key, label }, index) => (
        <View
          key={key}
          style={[styles.row, index > 0 && { ...styles.divider, borderTopColor: colors.line }]}
        >
          <View style={styles.rowText}>
            <Text variant="body">{t.settings[label]}</Text>
            <Text variant="caption" color={colors.textDim}>
              {t.settings[`${label}Hint`]}
            </Text>
          </View>
          <Toggle
            accessibilityLabel={t.settings[label]}
            value={settings[key]}
            onValueChange={(value) => {
              update({ [key]: value });
              if (key === 'hapticsEnabled' && value) haptics.tap();
            }}
          />
        </View>
      ))}
    </SettingsGroup>
  );
};

export const settingsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
});

const styles = StyleSheet.create({
  ...settingsStyles,
  group: { paddingHorizontal: spacing.lg },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
  segments: { flexDirection: 'row', gap: spacing.sm },
  segment: { flex: 1 },
  segmentInner: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
