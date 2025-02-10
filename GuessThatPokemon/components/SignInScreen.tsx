import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { signInUser } from '../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/constants/Theme';

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
      router.replace('/(tabs)');
    } else {
      setMessage('Invalid username or password');
    }
  };

  const goToSignUp = () => {
    router.replace('/(auth)/sign-up');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/pokemon_backdrop-removebg-preview.png')} 
          style={styles.backdropImage}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={[styles.titlePart, { color: '#000000' }]}>
            Guess
          </Text>
          <Text style={[styles.titlePart, { color: '#000000' }]}>
            {' That '}
          </Text>
          <Text style={[styles.titlePart, { color: '#000000' }]}>
            Pokémon
          </Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputShadow} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={COLORS.dark.textSecondary}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputShadow} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.dark.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonWrapper}>
          <View style={[styles.buttonShadow, { backgroundColor: COLORS.pokemon.darkBlue }]} />
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.buttonText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.buttonWrapper}>
          <View style={[styles.buttonShadow, { backgroundColor: '#666666' }]} />
          <TouchableOpacity style={styles.linkButton} onPress={goToSignUp}>
            <Text style={styles.linkText}>New to the game? Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  header: {
    height: 200,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  backdropImage: {
    position: 'absolute',
    width: '140%',
    height: '140%',
    opacity: 0.1,
    transform: [{ scale: 2.2 }],
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  titlePart: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    letterSpacing: 1,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 4, height: 4 },
        textShadowRadius: 0,
      },
      android: {
        elevation: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 4, height: 4 },
        textShadowRadius: 0,
      },
    }),
  },
  formContainer: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  inputShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: '#CCCCCC',
    borderRadius: 12,
    zIndex: 1,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.dark.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    color: COLORS.dark.text,
    fontSize: FONTS.size.md,
    position: 'relative',
    zIndex: 2,
  },
  buttonWrapper: {
    position: 'relative',
    marginVertical: SPACING.sm,
  },
  buttonShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 12,
    zIndex: 1,
  },
  signInButton: {
    backgroundColor: '#8B0000',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  linkButton: {
    backgroundColor: '#888888',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
  },
  message: {
    marginTop: SPACING.md,
    textAlign: 'center',
    color: COLORS.error,
    fontSize: FONTS.size.md,
  }
});

export default SignInScreen; 