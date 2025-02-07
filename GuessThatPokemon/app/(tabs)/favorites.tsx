import { useState, useEffect } from 'react';
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
} from 'react-native';
import { getFavoritePokemon, addFavoritePokemon, removeFavoritePokemon } from '../../database/db';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

interface FavoritePokemon {
  id: number;
  name: string;
  spriteUrl: string;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Load userId and favorites when component mounts
  useEffect(() => {
    const initialize = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
        loadFavorites(parseInt(storedUserId));
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
      const data = await response.json();
      const filteredPokemon = data.results
        .filter((pokemon: { name: string }) => 
          pokemon.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10);

      const detailedResults = await Promise.all(
        filteredPokemon.map(async (pokemon: { url: string }) => {
          const detailResponse = await fetch(pokemon.url);
          return detailResponse.json();
        })
      );

      setSearchResults(detailedResults);
    } catch (error) {
      console.error('Error searching Pokemon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (pokemon: Pokemon) => {
    if (!userId) {
      console.log('Cannot add favorite: No user ID found');
      return;
    }

    try {
      const newFavorite = {
        id: pokemon.id,
        name: pokemon.name,
        spriteUrl: pokemon.sprites.front_default
      };
      
      const success = await addFavoritePokemon(userId, newFavorite);
      if (success) {
        setFavorites(prev => [...prev, newFavorite]);
        console.log('✅ Added to favorites:', pokemon.name);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (pokemonId: number) => {
    if (!userId) {
      console.log('Cannot remove favorite: No user ID found');
      return;
    }

    try {
      const success = await removeFavoritePokemon(userId, pokemonId);
      if (success) {
        setFavorites(prev => prev.filter(fav => fav.id !== pokemonId));
        console.log('❌ Removed from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoritePokemon }) => (
    <View style={styles.favoriteItem}>
      <Image source={{ uri: item.spriteUrl }} style={styles.pokemonImage} />
      <Text style={styles.pokemonName}>{item.name}</Text>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFromFavorites(item.id)}
      >
        <Text style={styles.removeButtonText}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: Pokemon }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => {
        addToFavorites(item);
        setIsModalVisible(false);
        setSearchQuery('');
        setSearchResults([]);
      }}
    >
      <Image source={{ uri: item.sprites.front_default }} style={styles.searchResultImage} />
      <Text style={styles.searchResultText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Favorite Pokémon</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.favoritesList}
      />

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
                placeholderTextColor="#666"
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={item => item.id.toString()}
                style={styles.searchResults}
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
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  favoritesList: {
    paddingBottom: 20,
  },
  favoriteItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  pokemonImage: {
    width: 100,
    height: 100,
  },
  pokemonName: {
    color: '#ffffff',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
  },
  removeButtonText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 10,
    color: '#ffffff',
    marginRight: 10,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchResults: {
    maxHeight: '80%',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2a2a2a',
    marginBottom: 5,
    borderRadius: 10,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  searchResultText: {
    color: '#ffffff',
    textTransform: 'capitalize',
  },
});
