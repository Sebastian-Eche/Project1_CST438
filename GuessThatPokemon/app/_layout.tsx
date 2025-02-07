import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Platform, View, Text, Button } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase } from '../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { HapticTab } from '../components/HapticTab';
import SignUpScreen from '../components/SignUpScreen';
import SignInScreen from '../components/SignInScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('Stored Username:', storedUsername);
        console.log('Stored UserId:', storedUserId);
        
        if (!storedUsername || !storedUserId) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const database = await initDatabase();
        if (!database) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const user = await database.getFirstAsync<{ username: string }>(
          'SELECT username FROM users WHERE id = ?',
          [parseInt(storedUserId)]
        );

        if (user) {
          setIsAuthenticated(true);
          setUsername(storedUsername);
          setUserId(parseInt(storedUserId));
        } else {
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('userId');
          setIsAuthenticated(false);
          setUsername('');
          setUserId(null);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setIsAuthenticated(false);
        setUsername('');
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="pokemon.db" onInit={initDatabase}>
        <Stack>
          {isAuthenticated ? (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="SignIn" options={{ headerShown: false }} />
              <Stack.Screen name="SignUp" options={{ headerShown: false }} />
            </>
          )}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
