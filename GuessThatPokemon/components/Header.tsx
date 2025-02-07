import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS, FONTS, SPACING } from '@/constants/Theme';

interface HeaderProps {
  username: string | null;
}

export default function Header({ username }: HeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['username', 'userId']);
      router.replace('/SignIn');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSignIn = () => {
    router.replace('/SignIn');
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.dark.background }]}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.titlePart, { color: COLORS.pokemon.blue }]}>
            Guess
          </Text>
          <Text style={[styles.titlePart, { color: COLORS.pokemon.yellow }]}>
            {' That '}
          </Text>
          <Text style={[styles.titlePart, { color: COLORS.pokemon.red }]}>
            Pokémon
          </Text>
        </View>
        {username ? (
          <View style={styles.userSection}>
            <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
              Welcome, {username}!
            </Text>
            <TouchableOpacity 
              onPress={handleLogout} 
              style={[styles.button, styles.logoutButton]}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authButtonContainer}>
            <TouchableOpacity 
              onPress={handleSignIn} 
              style={[styles.button, styles.signInButton]}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.lg + SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  titlePart: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  welcomeText: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
  },
  authButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  button: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#8B0000',
  },
  logoutButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
}); 