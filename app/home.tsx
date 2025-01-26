import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import GameScreen from './components/GameScreen';
import { router } from 'expo-router';
import { storage } from './lib/storage';

export default function Home() {
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await storage.getCurrentUser();
      if (!currentUser) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  return <GameScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 