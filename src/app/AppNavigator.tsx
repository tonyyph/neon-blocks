import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import { AchievementsScreen } from '../screens/AchievementsScreen';
import { HowToPlayScreen } from '../screens/HowToPlayScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { ModeSelectScreen } from '../screens/ModeSelectScreen';
import { RecordsScreen } from '../screens/RecordsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { TetrisScreen } from '../screens/TetrisScreen';
import { ThemesScreen } from '../screens/ThemesScreen';
import { TutorialScreen } from '../screens/TutorialScreen';
import { dispatchGame, startNewGame, useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useStatsStore } from '../store/statsStore';
import { useTutorialStore } from '../store/tutorialStore';
import { FONT_ASSETS } from '../theme/fonts';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type Route =
  | 'menu'
  | 'modes'
  | 'game'
  | 'records'
  | 'awards'
  | 'settings'
  | 'themes'
  | 'howToPlay'
  | 'tutorial'
  | 'setup';

/**
 * A handful of screens and no deep links, so a tiny state machine replaces a navigation library. The game
 * store outlives screen changes, which is what lets Settings open from the pause menu and return
 * to the same paused game. Settings and Themes remember where they were opened from.
 */
export const AppNavigator = () => {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const [storageReady, setStorageReady] = useState(false);
  const [route, setRoute] = useState<Route>('menu');
  const [settingsReturn, setSettingsReturn] = useState<Route>('menu');
  const [themesReturn, setThemesReturn] = useState<Route>('menu');

  // Bundled fonts load from disk; if one ever fails the app still boots on system fonts.
  const ready = storageReady && (fontsLoaded || fontError !== null);

  useEffect(() => {
    Promise.all([
      useSettingsStore.getState().hydrate(),
      useStatsStore.getState().hydrate(),
    ]).finally(() => {
      // A fresh install goes through setup (language, theme, sound) and then the mandatory
      // tutorial before anything else. Each comes back on every launch until it is finished.
      const { setupDone, tutorialDone } = useSettingsStore.getState().settings;
      if (!setupDone) {
        setRoute('setup');
      } else if (!tutorialDone) {
        useTutorialStore.getState().open(true);
        setRoute('tutorial');
      }
      setStorageReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  const openSettings = useCallback((from: Route) => {
    setSettingsReturn(from);
    setRoute('settings');
  }, []);

  const openThemes = useCallback((from: Route) => {
    setThemesReturn(from);
    setRoute('themes');
  }, []);

  // Android back: leave sub-screens, pause a running game, otherwise let the OS exit.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      switch (route) {
        case 'settings':
          setRoute(settingsReturn);
          return true;
        case 'themes':
          setRoute(themesReturn);
          return true;
        case 'howToPlay':
        case 'modes':
        case 'records':
        case 'awards':
          setRoute('menu');
          return true;
        case 'game':
        case 'tutorial':
          if (useGameStore.getState().game.status === 'playing') dispatchGame({ type: 'pause' });
          return true;
        default:
          return false;
      }
    });
    return () => subscription.remove();
  }, [route, settingsReturn, themesReturn]);

  if (!ready) return null;

  switch (route) {
    case 'game':
      return (
        <TetrisScreen
          onOpenSettings={() => openSettings('game')}
          onExitToMenu={() => setRoute('menu')}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          onBack={() => setRoute(settingsReturn)}
          onOpenThemes={() => openThemes('settings')}
        />
      );
    case 'themes':
      return <ThemesScreen onBack={() => setRoute(themesReturn)} />;
    case 'howToPlay':
      return (
        <HowToPlayScreen
          onBack={() => setRoute('menu')}
          onTutorial={() => {
            useTutorialStore.getState().open(false);
            setRoute('tutorial');
          }}
        />
      );
    case 'setup':
      return (
        <SetupScreen
          onDone={() => {
            useSettingsStore.getState().update({ setupDone: true });
            if (useSettingsStore.getState().settings.tutorialDone) {
              setRoute('menu');
            } else {
              useTutorialStore.getState().open(true, 'step');
              setRoute('tutorial');
            }
          }}
        />
      );
    case 'tutorial':
      return (
        <TutorialScreen
          onOpenSettings={() => openSettings('tutorial')}
          onExit={(to) => {
            if (to === 'marathon') {
              startNewGame('marathon');
              setRoute('game');
            } else {
              setRoute(to);
            }
          }}
        />
      );
    case 'modes':
      return (
        <ModeSelectScreen
          onBack={() => setRoute('menu')}
          onPlay={(mode) => {
            startNewGame(mode);
            setRoute('game');
          }}
        />
      );
    case 'records':
      return <RecordsScreen onBack={() => setRoute('menu')} />;
    case 'awards':
      return <AchievementsScreen onBack={() => setRoute('menu')} />;
    default:
      return (
        <MainMenuScreen
          onPlay={() => setRoute('modes')}
          onRecords={() => setRoute('records')}
          onAwards={() => setRoute('awards')}
          onThemes={() => openThemes('menu')}
          onSettings={() => openSettings('menu')}
          onHowToPlay={() => setRoute('howToPlay')}
        />
      );
  }
};
