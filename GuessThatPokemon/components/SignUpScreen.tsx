import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signUpUser } from '../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    if (!username || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    const result = await signUpUser(username, password);
    if (result.success && result.userId) {
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('userId', result.userId.toString());
      router.replace('/(tabs)');
    } else {
      setMessage('Username already exists or sign-up failed.');
    }
  };

  const goToSignIn = () => {
    router.replace('/SignIn');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
      <Button title="Sign Up" onPress={handleSignUp} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TouchableOpacity onPress={goToSignIn} style={styles.linkContainer}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
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

export default SignUpScreen; 