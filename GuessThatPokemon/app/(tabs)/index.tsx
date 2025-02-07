/**
 * Game Screen Component
 * Main screen for the Pokémon guessing game.
 */

import { Text, Image, StyleSheet, Platform, View, TouchableOpacity, Animated, ViewStyle, TextStyle, ImageStyle, StyleProp } from 'react-native';
import { useState, useEffect, useRef } from "react"
import { Audio } from 'expo-av'
import { updatePlayerStats, getPlayerStats } from '../../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Types
interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  cries?: {
    latest: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
}

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  animationDelay?: number;
  backgroundColor?: string;
}

/**
 * Animated button component with spring animation on mount and press animation
 */
const CustomButton = ({ title, onPress, style = {}, animationDelay = 0, backgroundColor }: CustomButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
      delay: animationDelay,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 0,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const buttonScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  const shadowTranslate = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  const animatedStyle: StyleProp<ViewStyle> = {
    transform: [{ scale: scaleAnim }]
  };

  const buttonWrapperStyle: StyleProp<ViewStyle> = [
    styles.buttonWrapper,
    { transform: [{ scale: buttonScale }] }
  ];

  const shadowStyle: StyleProp<ViewStyle> = [
    styles.buttonShadow,
    {
      backgroundColor: darkenColor(backgroundColor || '#8B0000', 20),
      transform: [{ translateY: shadowTranslate }]
    }
  ];

  const buttonStyle: StyleProp<ViewStyle> = [
    styles.customButton,
    { backgroundColor: backgroundColor || '#8B0000' },
    style
  ];

  return (
    <Animated.View style={animatedStyle}>
      <Animated.View style={buttonWrapperStyle}>
        <Animated.View style={shadowStyle} />
        <TouchableOpacity 
          style={buttonStyle}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <Text style={styles.customButtonText}>{title}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// Add darkenColor function
const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
};

const HomeScreen = () => {
  // State management
  const [pokemons, setPokemonArray] = useState<Pokemon[]>([]);
  const [streak, setStreak] = useState(0);
  const [topStreak, setTopStreak] = useState(0);
  const [pokemonToGuess, setPokemonToGuess] = useState<Pokemon | undefined>();
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState<'correct' | 'incorrect' | null>(null);

  // Animation values
  const statsFadeAnim = useRef(new Animated.Value(1)).current;
  const statsColorAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const router = useRouter();

  // Initialize user data and game state
  useEffect(() => {
    const setup = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUserId) {
          setUserId(parseInt(storedUserId));
          setUsername(storedUsername);
          const stats = await getPlayerStats(parseInt(storedUserId));
          setStreak(stats.currentStreak || 0);
          setTopStreak(stats.topStreak || 0);
        }
        await fetchRandomPokemon();
      } catch (error) {
        console.error('Setup error:', error);
        setStreak(0);
        setTopStreak(0);
        await fetchRandomPokemon();
      }
    };
    setup();
  }, []);

  /**
   * Fetches 4 random Pokémon from the API
   */
  const fetchRandomPokemon = async () => {
    try {
      console.log('🔄 Starting new data fetch');
      const newPokemonArray: Pokemon[] = [];
      
      // Fetch 4 random Pokemon
      for(let i = 0; i < 4; i++) {
        const randomId = Math.floor(Math.random() * 1025) + 1;
        console.log(`📱 Fetching Pokemon #${randomId}`);
        
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await response.json();
        
        console.log(`✅ Fetched Pokemon: ${data.name}`);
        newPokemonArray.push(data);
      }
      
      setPokemonArray(newPokemonArray);
      console.log('✨ Finished fetching all Pokemon');
      
      // Randomly select one of the four Pokemon as the answer
      const randomIndex = Math.floor(Math.random() * 4);
      const selectedPokemon = newPokemonArray[randomIndex];
      setPokemonToGuess(selectedPokemon);
      console.log(`🎯 Selected Pokemon: ${selectedPokemon.name.toUpperCase()}`);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
    }
  };

  /**
   * Handles animations when a new Pokémon is selected
   */
  const animateNewPokemon = () => {
    fadeAnim.setValue(1);
    slideAnim.setValue(50);
    statsFadeAnim.setValue(0);
    
    Animated.parallel([
      Animated.timing(statsFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (pokemonToGuess) {
      animateNewPokemon();
    }
  }, [pokemonToGuess]);

  /**
   * Renders the Pokémon image with animation
   */
  const renderPokemonImage = (isCryActive: boolean) => {
    if(!isCryActive && pokemonToGuess){
      return (
        <Animated.View 
          style={[
            styles.pokemonImageContainer,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Image 
            style={styles.pokemonImage} 
            source={{ uri: pokemonToGuess.sprites.front_default }}
            resizeMode="contain"
          />
        </Animated.View>
      );
    }
    return null;
  }

  /**
   * Handles game over state
   */
  const handleGameOver = async () => {
    const newTopStreak = Math.max(topStreak, streak);
    if (userId) {
      await updatePlayerStats(userId, 0);
    }
    setTopStreak(newTopStreak);
    setStreak(0);
    await fetchRandomPokemon();
  };

  /**
   * Handles Pokémon selection
   */
  const handlePokemonSelect = async (selectedPokemon: Pokemon) => {
    if (selectedPokemon.name === pokemonToGuess?.name) {
      showAnswerIndicator(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (userId) {
        await updatePlayerStats(userId, newStreak);
      }
      setTimeout(() => {
        fetchRandomPokemon();
      }, 1200);
    } else {
      showAnswerIndicator(false);
      setTimeout(() => {
        handleGameOver();
      }, 1200);
    }
  };

  /**
   * Renders the game interface
   */
  const renderGameInterface = () => {
    if(pokemons.length >= 4){
      const mainType = pokemonToGuess?.types?.[0]?.type?.name || 'normal';
      const backgroundColor = COLORS.types[mainType as keyof typeof COLORS.types];
      const randomNum = Math.floor(Math.random() * 10);
      const isSoundGuess = streak >= 5 && randomNum >= 4 && randomNum <= 6;

      return (
        <View style={styles.gameContainer}>
          <View style={[styles.pokemonCard, { backgroundColor }]}>
            <Image 
              source={require('../../assets/images/pokemon_backdrop-removebg-preview.png')} 
              style={styles.backdropImage}
              resizeMode="contain"
            />
            <View style={styles.pokemonInfo}>
              <Text style={styles.pokemonNumber}>
                #{pokemonToGuess?.id.toString().padStart(3, '0')}
              </Text>
              <View style={styles.typeContainer}>
                {pokemonToGuess?.types?.map((type) => (
                  <View
                    key={type.type.name}
                    style={[styles.typeTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  >
                    <Text style={styles.typeText}>{type.type.name}</Text>
                  </View>
                ))}
              </View>
              {isSoundGuess && (
                <View style={styles.soundButtonContainer}>
                  <TouchableOpacity 
                    style={styles.soundButton}
                    onPress={() => playPokemonCry(pokemonToGuess?.cries?.latest)}
                  >
                    <Ionicons name="volume-high" size={40} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          {!isSoundGuess && renderPokemonImage(false)}
          <View style={styles.buttonContainer}>
            {pokemons.map((pokemon, index) => (
              <CustomButton
                key={pokemon.id}
                title={pokemon.name}
                onPress={() => handlePokemonSelect(pokemon)}
                animationDelay={200 + (index * 100)}
                backgroundColor={backgroundColor}
              />
            ))}
          </View>
        </View>
      );
    }
    return null;
  }

  /**
   * Plays the Pokémon cry sound
   */
  const playPokemonCry = async (pokemonURL: string | undefined) => {
    if (pokemonURL) {
      await Audio.Sound.createAsync(
        { uri: pokemonURL },
        { shouldPlay: true }
      );
    }
  }

  /**
   * Handles authentication actions
   */
  const handleAuthAction = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (userId) {
      await AsyncStorage.multiRemove(['username', 'userId']);
      setUserId(null);
      setUsername(null);
      setStreak(0);
      setTopStreak(0);
    } else {
      router.push('/(auth)/sign-in');
    }
  };

  /**
   * Handles answer animation
   */
  const showAnswerIndicator = (isCorrect: boolean) => {
    setShowAnswer(isCorrect ? 'correct' : 'incorrect');
    statsColorAnim.setValue(0);
    
    Animated.sequence([
      Animated.spring(statsColorAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
      Animated.delay(1000),
      Animated.spring(statsColorAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowAnswer(null);
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.statsContainer, 
          { 
            backgroundColor: statsColorAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['#F5F5F5', showAnswer === 'correct' ? '#4CAF50' : '#F44336']
            }),
            transform: [
              { scale: statsColorAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.05, 1]
              }) }
            ]
          }
        ]}
      >
        <Animated.Text 
          style={[
            styles.statsText,
            {
              color: statsColorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#333333', '#FFFFFF']
              })
            }
          ]}
        >
          Current Streak: {streak || 0}
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.statsText,
            {
              color: statsColorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#333333', '#FFFFFF']
              })
            }
          ]}
        >
          Top Streak: {topStreak || 0}
        </Animated.Text>
      </Animated.View>
      
      {renderGameInterface()}

      <View style={styles.authButtonContainer}>
        {userId && username && (
          <Text style={styles.usernameText}>Welcome, {username}!</Text>
        )}
        <TouchableOpacity
          style={[
            styles.authButton,
            { backgroundColor: pokemonToGuess?.types?.[0]?.type?.name 
              ? COLORS.types[pokemonToGuess.types[0].type.name as keyof typeof COLORS.types]
              : COLORS.pokemon.blue }
          ]}
          onPress={handleAuthAction}
        >
          <Text style={styles.authButtonText}>
            {userId ? 'Sign Out' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#FFFFFF',
  } as ViewStyle,
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  } as ViewStyle,
  statsText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 10,
    position: 'relative',
  } as ViewStyle,
  buttonContainer: {
    width: '100%',
    gap: 10,
  } as ViewStyle,
  buttonWrapper: {
    position: 'relative',
    marginVertical: SPACING.sm,
    transform: [{ perspective: 1000 }],
  } as ViewStyle,
  buttonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    zIndex: 1,
  } as ViewStyle,
  customButton: {
    padding: SPACING.md,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  } as ViewStyle,
  customButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.md,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto'
    }),
  } as TextStyle,
  pokemonCard: {
    width: '100%',
    padding: 20,
    borderRadius: 30,
    marginBottom: 20,
    position: 'relative',
    minHeight: 200,
    overflow: 'hidden',
  } as ViewStyle,
  pokemonInfo: {
    flex: 1,
    paddingRight: '45%',
    position: 'relative',
    zIndex: 1,
  } as ViewStyle,
  pokemonNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto'
    }),
  } as TextStyle,
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  } as ViewStyle,
  typeTag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  } as ViewStyle,
  typeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto'
    }),
  } as TextStyle,
  pokemonImageContainer: {
    position: 'absolute',
    right: -30,
    top: 20,
    width: '65%',
    aspectRatio: 1,
    zIndex: 999,
  } as ViewStyle,
  pokemonImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.2 }],
  } as ImageStyle,
  soundButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  soundButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 35,
    padding: 15,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  authButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,
  usernameText: {
    fontSize: FONTS.size.md,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  authButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.md,
    fontWeight: '700',
  } as TextStyle,
  backdropImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1,
    transform: [{ scale: 2.2 }],
    zIndex: 0,
  } as ImageStyle,
});
