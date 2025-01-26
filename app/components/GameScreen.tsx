import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { storage } from '../lib/storage';

interface Player {
  name: string;
  image: string;
  team: string;
}

export default function GameScreen() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState<string>('');

  // This is a placeholder. You'll need to implement the actual API call
  const fetchPlayerData = async () => {
    try {
      // Replace this with your actual API call
      // For now, using placeholder data
      const player = {
        name: "Lionel Messi",
        image: "https://placeholder-image-url.jpg",
        team: "Inter Miami"
      };
      
      // Generate random choices including the correct answer
      const playerChoices = [
        player.name,
        "Cristiano Ronaldo",
        "Neymar Jr",
        "Kylian Mbappé"
      ].sort(() => Math.random() - 0.5);

      setCurrentPlayer(player);
      setChoices(playerChoices);
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await storage.getCurrentUser();
      if (currentUser) {
        setUsername(currentUser.username);
        setScore(currentUser.score);
      }
    };
    loadUser();
    fetchPlayerData();
  }, []);

  const updateScore = async (newScore: number) => {
    try {
      const currentUser = await storage.getCurrentUser();
      if (currentUser) {
        currentUser.score = newScore;
        await storage.saveUser(currentUser);
        await storage.setCurrentUser(currentUser);
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleGuess = async (playerName: string) => {
    if (currentPlayer && playerName === currentPlayer.name) {
      const newScore = score + 1;
      setScore(newScore);
      await updateScore(newScore);
      fetchPlayerData();
    } else {
      alert('Wrong guess! Try again!');
    }
  };

  const handleSignOut = async () => {
    try {
      await storage.setCurrentUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!currentPlayer) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome, {username}!</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentPlayer.image }}
          style={styles.playerImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.questionText}>Who is this player?</Text>
      
      <View style={styles.choicesContainer}>
        {choices.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={styles.choiceButton}
            onPress={() => handleGuess(choice)}
          >
            <Text style={styles.choiceText}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  choicesContainer: {
    width: '100%',
  },
  choiceButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  choiceText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  signOutText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 