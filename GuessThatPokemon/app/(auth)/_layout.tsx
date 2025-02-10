import { Stack } from 'expo-router';
import { COLORS } from '@/constants/Theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.dark.background,
        },
        animation: 'fade',
      }}
    />
  );
} 