import { Stack } from 'expo-router';
import { COLORS } from '@/constants/Theme';

export default function PokemonLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.light.background,
        },
        // Hide the tab bar
        tabBarStyle: {
          display: 'none',
        },
      }}
    />
  );
} 