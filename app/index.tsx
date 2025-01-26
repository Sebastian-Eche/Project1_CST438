import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { storage } from './lib/storage';
import LoadingScreen from './components/LoadingScreen';

export default function Index() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await storage.getCurrentUser();
      if (currentUser) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    };

    if (isLoaded) {
      checkAuth();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return <LoadingScreen onLoaded={() => setIsLoaded(true)} />;
  }

  return null;
}
