import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { signInUser } from '../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/constants/Theme';
import { BlurView } from 'expo-blur';

const SignInScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    if (!username || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    const result = await signInUser(username, password);
    if (result.success && result.userId) {
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('userId', result.userId.toString());
      router.push('/(tabs)');
    } else {
      setMessage('Invalid username or password');
    }
  };

  const goToSignUp = () => {
    router.push('/(auth)/sign-up');
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="light" style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Hello!</Text>
            <Text style={styles.subtitle}>We are really happy to see you again!</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            <TouchableOpacity onPress={goToSignUp}>
              <Text style={styles.linkText}>Don't have an account? Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardContent: {
    padding: SPACING.xl,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  formContainer: {
    gap: SPACING.md,
  },
  input: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    color: '#000000',
    fontSize: FONTS.size.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signInButton: {
    backgroundColor: '#8B0000',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
  },
  linkText: {
    color: '#666666',
    fontSize: FONTS.size.md,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 16,
  },
  message: {
    textAlign: 'center',
    color: COLORS.error,
    fontSize: FONTS.size.md,
    marginTop: 8,
  }
});

export default SignInScreen; 