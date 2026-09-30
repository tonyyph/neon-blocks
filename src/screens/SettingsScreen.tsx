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
import { useSettingsStore } from '../store/settingsStore';
import { useStatsStore } from '../store/statsStore';
import { withAlpha } from '../theme/colorUtils';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';

type ToggleKey = 'soundEnabled' | 'hapticsEnabled' | 'ghostEnabled';

const TOGGLES: { key: ToggleKey; label: string; hint: string }[] = [
  { key: 'soundEnabled', label: 'Sound effects', hint: 'Follows the device silent switch' },
  { key: 'hapticsEnabled', label: 'Haptics', hint: 'Light vibration on moves and clears' },
  { key: 'ghostEnabled', label: 'Ghost piece', hint: 'Show where the piece will land' },
];

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
  const { colors } = theme;
  const settings = useSettingsStore((store) => store.settings);
  const update = useSettingsStore((store) => store.update);
  const resetStats = useStatsStore((store) => store.resetStats);

  const confirmReset = () =>
    Alert.alert('Reset high score?', 'Your high score and best stats will be erased.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetStats();
          haptics.success();
        },
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title="Settings" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Theme: ${theme.name}. Change theme`}
          onPress={onOpenThemes}
          pressedScale={0.97}
        >
          <Group>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text variant="body">Theme</Text>
                <Text variant="caption" color={colors.primary}>
                  {theme.name}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textDim} />
            </View>
          </Group>
        </PressableScale>

        <Group>
          {TOGGLES.map(({ key, label, hint }, index) => (
            <View
              key={key}
              style={[styles.row, index > 0 && { ...styles.divider, borderTopColor: colors.line }]}
            >
              <View style={styles.rowText}>
                <Text variant="body">{label}</Text>
                <Text variant="caption" color={colors.textDim}>
                  {hint}
                </Text>
              </View>
              <Switch
                accessibilityLabel={label}
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
              <Text variant="body">Controls</Text>
              <Text variant="caption" color={colors.textDim}>
                Touch gestures. See How to play.
              </Text>
            </View>
          </View>
        </Group>

        <Button
          label="Reset high score"
          icon="delete-outline"
          variant="danger"
          onPress={confirmReset}
        />

        <View style={styles.footer}>
          <Text variant="caption" color={colors.textFaint}>
            {`Neon Blocks ${Constants.expoConfig?.version ?? ''}`}
          </Text>
          <Text variant="caption" color={colors.textFaint} style={styles.center}>
            Plays fully offline. No account, no ads, no tracking. Nothing leaves your device.
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
  rowText: { flex: 1, gap: 2 },
  footer: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  center: { textAlign: 'center' },
});
