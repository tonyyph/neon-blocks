import Constants from 'expo-constants';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import {
  LanguagePicker,
  SettingToggles,
  SettingsGroup,
  settingsStyles,
} from '../components/Settings/SettingsControls';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { PressableScale } from '../components/ui/PressableScale';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Text } from '../components/ui/Text';
import { haptics } from '../hooks/useHaptics';
import { useT } from '../i18n';
import { useStatsStore } from '../store/statsStore';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';

interface Props {
  onBack: () => void;
  onOpenThemes: () => void;
}

export const SettingsScreen = ({ onBack, onOpenThemes }: Props) => {
  const theme = useTheme();
  const t = useT();
  const { colors } = theme;
  const themeName = t.themes.names[theme.id];
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
        <SettingsGroup>
          <View style={styles.languageRow}>
            <Text variant="body">{t.settings.language}</Text>
            <LanguagePicker />
          </View>
        </SettingsGroup>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t.settings.themeA11y(themeName)}
          onPress={onOpenThemes}
          pressedScale={0.97}
        >
          <SettingsGroup>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text variant="body">{t.settings.theme}</Text>
                <Text variant="caption" color={colors.primary}>
                  {themeName}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textDim} />
            </View>
          </SettingsGroup>
        </PressableScale>

        <SettingToggles />

        <SettingsGroup>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">{t.settings.controls}</Text>
              <Text variant="caption" color={colors.textDim}>
                {t.settings.controlsHint}
              </Text>
            </View>
          </View>
        </SettingsGroup>

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
  ...settingsStyles,
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  languageRow: { paddingVertical: spacing.md, gap: spacing.sm },
  footer: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  center: { textAlign: 'center' },
});
