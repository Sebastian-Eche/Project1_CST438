import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signInUser } from '../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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
      setMessage('Invalid username or password.');
    }
  };

  const goToSignUp = () => {
    router.replace('/SignUp');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TouchableOpacity onPress={goToSignUp} style={styles.linkContainer}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    color: 'red',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default SignInScreen; 