/**
 * Favorites Screen
 * 
 * Displays a grid of user's favorite Pokémon with features:
 * - View favorite Pokémon in a card layout
 * - Add new Pokémon to favorites via search
 * - Remove Pokémon from favorites
 * - Navigate to detailed Pokémon information
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  Animated,
  ImageBackground,
} from 'react-native';
import { getFavoritePokemon, addFavoritePokemon, removeFavoritePokemon } from '../../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '@/constants/Theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

// Types
interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
}

interface FavoritePokemon {
  id: number;
  name: string;
  spriteUrl: string;
  types?: string[];
}

// Default favorites for non-logged in users
const DEFAULT_FAVORITES: FavoritePokemon[] = [
  { id: 1, name: 'bulbasaur', spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', types: ['grass', 'poison'] },
  { id: 4, name: 'charmander', spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', types: ['fire'] },
  { id: 7, name: 'squirtle', spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', types: ['water'] },
  { id: 25, name: 'pikachu', spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', types: ['electric'] },
];

const CustomButton = ({ title, onPress, style = {} }: { title: string; onPress: () => void; style?: any }) => (
  <TouchableOpacity style={[styles.customButton, style]} onPress={onPress}>
    <Text style={styles.customButtonText}>{title}</Text>
  </TouchableOpacity>
);

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Animated Pokémon card component
 */
const FavoriteItem = ({ item, onRemove, index, onPress, userId }: { 
  item: FavoritePokemon; 
  onRemove: () => void; 
  index: number;
  onPress: () => void;
  userId: number | null;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
        delay: index * 100,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
        delay: index * 100,
      }),
    ]).start();
  }, []);

  const backgroundColor = item.types && item.types[0] ? COLORS.types[item.types[0] as keyof typeof COLORS.types] : COLORS.types.normal;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardWrapper}>
      <Animated.View
        style={[
          styles.favoriteItem,
          {
            transform: [{ scale: scaleAnim }, { translateY }],
          },
        ]}
      >
        <View style={[styles.cardBackground, { backgroundColor }]}>
          <Image 
            source={require('../../assets/images/pokemon_backdrop-removebg-preview.png')} 
            style={styles.backdropImage}
            resizeMode="contain"
          />
          <View style={styles.cardContent}>
            <View style={styles.pokemonInfo}>
              <Text style={styles.pokemonNumber}>#{item.id.toString().padStart(3, '0')}</Text>
              <Text style={styles.pokemonName}>{item.name}</Text>
            </View>
            {userId && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onRemove();
                }}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Image 
          source={{ uri: item.spriteUrl }} 
          style={styles.pokemonImage}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Search result item component with animation
 */
const SearchResultItem = ({ item, onPress, index }: { item: Pokemon; onPress: () => void; index: number }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
      delay: index * 50,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.searchResultItem,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity 
        style={styles.searchResultContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.sprites.front_default }} style={styles.searchResultImage} />
        <Text style={styles.searchResultText}>{item.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
        loadFavorites(parseInt(storedUserId));
      } else {
        setFavorites(DEFAULT_FAVORITES);
      }
    };
    initialize();
  }, []);

  const loadFavorites = async (currentUserId: number) => {
    try {
      const favs = await getFavoritePokemon(currentUserId);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const searchPokemon = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
      if (!response.ok) throw new Error('Failed to fetch Pokemon list');
      
      const data = await response.json();
      const filteredPokemon = data.results
        .filter((pokemon: { name: string }) => 
          pokemon.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10);

      if (filteredPokemon.length === 0) {
        setSearchResults([]);
        return;
      }

      const detailedResults = await Promise.all(
        filteredPokemon.map(async (pokemon: { url: string }) => {
          const detailResponse = await fetch(pokemon.url);
          if (!detailResponse.ok) return null;
          return detailResponse.json();
        })
      );

      setSearchResults(detailedResults.filter(Boolean));
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (pokemon: Pokemon) => {
    if (!userId) return;

    try {
      const newFavorite = {
        id: pokemon.id,
        name: pokemon.name,
        spriteUrl: pokemon.sprites.front_default,
        types: pokemon.types.map(t => t.type.name)
      };
      
      const success = await addFavoritePokemon(userId, newFavorite);
      if (success) {
        setFavorites(prev => [...prev, newFavorite]);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (pokemonId: number) => {
    if (!userId) return;

    try {
      const success = await removeFavoritePokemon(userId, pokemonId);
      if (success) {
        setFavorites(prev => prev.filter(fav => fav.id !== pokemonId));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={({ item, index }) => (
          <FavoriteItem
            item={item}
            onRemove={() => removeFromFavorites(item.id)}
            onPress={() => router.push(`/pokemon/${item.id}`)}
            index={index}
            userId={userId}
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.favoritesList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={styles.floatingAddButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.searchHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Pokémon..."
                value={searchQuery}
                onChangeText={searchPokemon}
                placeholderTextColor={COLORS.dark.textSecondary}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsModalVisible(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.pokemon.yellow} />
                <Text style={styles.loadingText}>Searching Pokémon...</Text>
              </View>
            ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No Pokémon found</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={({ item, index }) => (
                  <SearchResultItem
                    item={item}
                    index={index}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      addToFavorites(item);
                      setIsModalVisible(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  />
                )}
                keyExtractor={item => item.id.toString()}
                style={styles.searchResults}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#FFFFFF',
  },
  favoritesList: {
    paddingHorizontal: 5,
  },
  cardWrapper: {
    flex: 1,
    padding: 8,
    minWidth: '50%',
  },
  favoriteItem: {
    aspectRatio: 1.6,
    position: 'relative',
    borderRadius: 16,
    overflow: 'visible',
  },
  cardBackground: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  backdropImage: {
    position: 'absolute',
    right: -40,
    top: 30,
    width: '80%',
    height: '80%',
    opacity: 0.2,
    transform: [{ scale: 3.2 }],
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.size.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  pokemonName: {
    color: '#FFFFFF',
    fontSize: FONTS.size.lg,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  pokemonImage: {
    width: '65%',
    height: '65%',
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
  removeButton: {
    opacity: 0.8,
    padding: 4,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.size.sm,
    fontWeight: '600',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    backgroundColor: COLORS.pokemon.blue,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
    zIndex: 1000,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    color: '#333333',
    marginRight: 10,
    fontSize: FONTS.size.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#333333',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
  },
  searchResults: {
    maxHeight: '80%',
  },
  searchResultItem: {
    marginBottom: 8,
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  searchResultText: {
    color: '#333333',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#333333',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    marginTop: 12,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#333333',
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
  },
});
