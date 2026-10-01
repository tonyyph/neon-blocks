import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Button } from '../components/ui/Button';
import { Chamfer } from '../components/ui/Chamfer';
import { Icon } from '../components/ui/Icon';
import { PressableScale } from '../components/ui/PressableScale';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { haptics } from '../hooks/useHaptics';
import { LANGUAGES, LANGUAGE_NAMES, useT } from '../i18n';
import { useSettingsStore } from '../store/settingsStore';
import { useStatsStore } from '../store/statsStore';
import { withAlpha } from '../theme/colorUtils';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';

type ToggleKey = 'soundEnabled' | 'hapticsEnabled' | 'ghostEnabled';

/** Each toggle's label and hint come from the dictionary under these keys. */
const TOGGLES: { key: ToggleKey; label: 'sound' | 'haptics' | 'ghost' }[] = [
  { key: 'soundEnabled', label: 'sound' },
  { key: 'hapticsEnabled', label: 'haptics' },
  { key: 'ghostEnabled', label: 'ghost' },
];

/** Two-way choice of language, each option written in its own language. */
const LanguagePicker = () => {
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

const Group = ({ children }: { children: ReactNode }) => {
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

interface Props {
  onBack: () => void;
  onOpenThemes: () => void;
}

export const SettingsScreen = ({ onBack, onOpenThemes }: Props) => {
  const theme = useTheme();
  const t = useT();
  const { colors } = theme;
  const themeName = t.themes.names[theme.id];
  const settings = useSettingsStore((store) => store.settings);
  const update = useSettingsStore((store) => store.update);
  const resetProgress = useStatsStore((store) => store.resetProgress);

  const confirmReset = () =>
    Alert.alert(t.settings.resetTitle, t.settings.resetBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.settings.resetConfirm,
        style: 'destructive',
        onPress: () => {
          resetProgress();
          haptics.success();
        },
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title={t.settings.title} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Group>
          <View style={styles.languageRow}>
            <Text variant="body">{t.settings.language}</Text>
            <LanguagePicker />
          </View>
        </Group>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t.settings.themeA11y(themeName)}
          onPress={onOpenThemes}
          pressedScale={0.97}
        >
          <Group>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text variant="body">{t.settings.theme}</Text>
                <Text variant="caption" color={colors.primary}>
                  {themeName}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textDim} />
            </View>
          </Group>
        </PressableScale>

        <Group>
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
              <Switch
                accessibilityLabel={t.settings[label]}
                value={settings[key]}
                onValueChange={(value) => {
                  update({ [key]: value });
                  if (key === 'hapticsEnabled' && value) haptics.tap();
                }}
                trackColor={{ false: colors.surfaceRaised, true: colors.primary }}
                thumbColor={colors.text}
                ios_backgroundColor={colors.surfaceRaised}
              />
            </View>
          ))}
        </Group>

        <Group>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">{t.settings.controls}</Text>
              <Text variant="caption" color={colors.textDim}>
                {t.settings.controlsHint}
              </Text>
            </View>
          </View>
        </Group>

        <Button
          label={t.settings.reset}
          icon="delete-outline"
          variant="danger"
          onPress={confirmReset}
        />

        <View style={styles.footer}>
          <Text variant="caption" color={colors.textFaint}>
            {t.settings.version(Constants.expoConfig?.version ?? '')}
          </Text>
          <Text variant="caption" color={colors.textFaint} style={styles.center}>
            {t.settings.privacy}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  group: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    gap: spacing.md,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
  languageRow: { paddingVertical: spacing.md, gap: spacing.sm },
  segments: { flexDirection: 'row', gap: spacing.sm },
  segment: { flex: 1 },
  segmentInner: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  footer: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  center: { textAlign: 'center' },
});
