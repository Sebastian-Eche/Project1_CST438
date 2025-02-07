import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface HeaderProps {
  username: string | null;
}

export default function Header({ username }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear all user data from AsyncStorage
      await AsyncStorage.multiRemove(['username', 'userId']);
      // Force reload the app to clear all states
      router.replace('/SignIn');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSignIn = () => {
    router.replace('/SignIn');
  };

  return (
    <View style={styles.container}>
      {username ? (
        <>
          <Text style={styles.welcomeText}>Welcome, {username}!</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.welcomeText}>Sign in to save your progress!</Text>
          <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 