import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Header from '@/components/Header';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const getUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      setUsername(storedUsername);
    };
    getUsername();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Header username={username} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Game',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gamecontroller.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
