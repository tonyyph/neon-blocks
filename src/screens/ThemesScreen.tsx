import { ScrollView, StyleSheet } from 'react-native';

import { ThemeList } from '../components/Themes/ThemeList';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useT } from '../i18n';
import { spacing } from '../theme/spacing';

interface Props {
  onBack: () => void;
}

export const ThemesScreen = ({ onBack }: Props) => {
  const t = useT();
  return (
    <Screen>
      <ScreenHeader title={t.themes.title} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.list}>
        <ThemeList />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
});
