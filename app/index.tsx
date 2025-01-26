import { useEffect } from 'react';
import { router } from 'expo-router';
import { storage } from './lib/storage';

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await storage.getCurrentUser();
      if (currentUser) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  return null;
}
