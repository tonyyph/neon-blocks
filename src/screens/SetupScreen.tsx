import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  LanguagePicker,
  SettingToggles,
  SettingsGroup,
} from '../components/Settings/SettingsControls';
import { ThemeList } from '../components/Themes/ThemeList';
import { Button } from '../components/ui/Button';
import { GlitchText } from '../components/ui/GlitchText';
import { Logo } from '../components/ui/Logo';
import { Screen } from '../components/ui/Screen';
import { Text } from '../components/ui/Text';
import { useT } from '../i18n';
import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/useTheme';

const PAGES = ['language', 'theme', 'feel'] as const;
type Page = (typeof PAGES)[number];

interface Props {
  /** Called after the last page; the tutorial comes next. */
  onDone: () => void;
}

/**
 * First-run setup, before the tutorial: language, then theme, then sound and haptics. Every
 * choice applies the moment it is made, so the player sees the game change as they pick.
 */
export const SetupScreen = ({ onDone }: Props) => {
  const theme = useTheme();
  const { colors } = theme;
  const t = useT();
  const [index, setIndex] = useState(0);
  const page: Page = PAGES[index];
  const last = index === PAGES.length - 1;

  // Android back steps through the pages; on the first page it leaves the app as usual.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index === 0) return false;
      setIndex(index - 1);
      return true;
    });
    return () => subscription.remove();
  }, [index]);

  const copy = t.setup[page];

  return (
    <Screen>
      <View style={styles.top}>
        <Text variant="label" color={colors.textDim}>
          {t.setup.progress(index + 1, PAGES.length)}
        </Text>
        <View style={styles.dots}>
          {PAGES.map((name, i) => (
            <View
              key={name}
              style={[
                styles.dot,
                { backgroundColor: i <= index ? colors.primary : colors.surfaceRaised },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Animated.View key={page} entering={FadeIn.duration(220)} style={styles.page}>
          {page === 'language' ? (
            <View style={styles.logo}>
              <Logo cellSize={22} theme={theme} />
            </View>
          ) : null}
          <GlitchText variant="title" color={colors.primary} jitter={false}>
            {copy.title}
          </GlitchText>
          <Text variant="body" color={colors.textDim}>
            {copy.body}
          </Text>

          <View style={styles.body}>
            {page === 'language' ? (
              <SettingsGroup>
                <View style={styles.picker}>
                  <LanguagePicker />
                </View>
              </SettingsGroup>
            ) : null}
            {page === 'theme' ? <ThemeList /> : null}
            {page === 'feel' ? <SettingToggles /> : null}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Text variant="caption" color={colors.textFaint} style={styles.note}>
          {t.setup.later}
        </Text>
        <View style={styles.buttons}>
          {index > 0 ? (
            <View style={styles.back}>
              <Button label={t.setup.back} onPress={() => setIndex(index - 1)} />
            </View>
          ) : null}
          <View style={styles.next}>
            <Button
              label={last ? t.setup.finish : t.setup.next}
              icon={last ? 'school-outline' : 'arrow-right'}
              variant="primary"
              onPress={() => (last ? onDone() : setIndex(index + 1))}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 28, height: 4, borderRadius: 2 },
  scroll: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.lg },
  page: { gap: spacing.sm },
  logo: { alignItems: 'center', marginVertical: spacing.xl },
  body: { marginTop: spacing.lg },
  picker: { paddingVertical: spacing.lg },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  note: { textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: spacing.md },
  back: { flex: 1 },
  next: { flex: 2 },
});
