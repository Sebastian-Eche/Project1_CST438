import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '@/constants/Theme';

export default function TabLayout() {
  const bottomPadding = Platform.OS === 'ios' ? 35 : 15;
  const tabBarHeight = Platform.OS === 'ios' ? 85 : 65;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          position: 'absolute',
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          ...SHADOWS.small,
        },
        tabBarActiveTintColor: '#333333',
        tabBarInactiveTintColor: '#999999',
        tabBarItemStyle: {
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontWeight: FONTS.weight.medium,
          fontSize: FONTS.size.xs,
          paddingBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Guess That Pokémon',
          tabBarLabel: 'Game',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'My Favorites',
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
