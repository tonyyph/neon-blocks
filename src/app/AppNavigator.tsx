import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import { HowToPlayScreen } from '../screens/HowToPlayScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TetrisScreen } from '../screens/TetrisScreen';
import { ThemesScreen } from '../screens/ThemesScreen';
import { dispatchGame, startNewGame, useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useStatsStore } from '../store/statsStore';
import { FONT_ASSETS } from '../theme/fonts';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type Route = 'menu' | 'game' | 'settings' | 'themes' | 'howToPlay';

/**
 * Five screens and no deep links, so a tiny state machine replaces a navigation library. The game
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
    ]).finally(() => setStorageReady(true));
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
          setRoute('menu');
          return true;
        case 'game':
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
      return <HowToPlayScreen onBack={() => setRoute('menu')} />;
    default:
      return (
        <MainMenuScreen
          onStart={() => {
            startNewGame();
            setRoute('game');
          }}
          onThemes={() => openThemes('menu')}
          onSettings={() => openSettings('menu')}
          onHowToPlay={() => setRoute('howToPlay')}
        />
      );
  }
};
