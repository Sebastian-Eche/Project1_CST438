import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase } from '../database/db';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS, customDarkTheme, customLightTheme } from '@/constants/Theme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;

  return (
    <ThemeProvider value={theme}>
      <SQLiteProvider databaseName="pokemon.db" onInit={initDatabase}>
        <View style={{ flex: 1, backgroundColor: COLORS.dark.background }}>
          <StatusBar style="light" />
          <Stack screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: COLORS.dark.background,
            },
          }} />
        </View>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
