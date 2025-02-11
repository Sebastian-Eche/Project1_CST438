import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, ViewStyle, TextStyle, ImageStyle, Dimensions, Platform, StyleProp } from 'react-native';
import { useLocalSearchParams, useRouter, router } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';

interface Evolution {
  species: {
    name: string;
    url: string;
  };
  evolves_to: Evolution[];
  evolution_details: {
    min_level: number;
  }[];
}

interface PokemonDetails {
  id: number;
  name: string;
  types: {
    type: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  height: number;
  weight: number;
  abilities: {
    ability: {
      name: string;
    };
  }[];
  base_experience: number;
  moves: {
    move: {
      name: string;
    };
  }[];
}

interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  genera: {
    genus: string;
    language: {
      name: string;
    };
  }[];
  habitat: {
    name: string;
  } | null;
}

interface EvolutionChainPokemon {
  name: string;
  id: number;
  level: number;
  imageUrl: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
  <TouchableOpacity 
    style={[styles.tabButton, isActive && styles.tabButtonActive]} 
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
};

// Add type safety for Pokemon types
type PokemonType = keyof typeof COLORS.types;

export default function PokemonDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChainPokemon[]>([]);
  const [activeTab, setActiveTab] = useState('About');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPokemonDetails();
  }, [id]);

  const processEvolutionChain = (chain: Evolution): EvolutionChainPokemon[] => {
    const results: EvolutionChainPokemon[] = [];
    
    const addEvolution = (evolution: Evolution) => {
      const pokemonId = parseInt(evolution.species.url.split('/').slice(-2, -1)[0]);
      const level = evolution.evolution_details[0]?.min_level || 1;
      
      results.push({
        name: evolution.species.name,
        id: pokemonId,
        level: level,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
      });

      // Process each evolution branch
      evolution.evolves_to.forEach(evo => {
        addEvolution(evo);
      });
    };

    // Start with the base form
    addEvolution(chain);
    return results;
  };

  const fetchPokemonDetails = async () => {
    try {
      // Pokemon details
      const pokemonEndpoint = `https://pokeapi.co/api/v2/pokemon/${id}`;
      const response = await fetch(pokemonEndpoint);
      const data = await response.json();
      setPokemon(data);
      console.log('✅ Fetched Pokemon details');

      // Species details
      const speciesEndpoint = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
      const speciesResponse = await fetch(speciesEndpoint);
      const speciesData = await speciesResponse.json();
      setSpecies(speciesData);
      console.log('✅ Fetched Species details');
      
      // Evolution chain
      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionResponse.json();
      const chain = processEvolutionChain(evolutionData.chain);
      setEvolutionChain(chain);
      console.log('✅ Fetched Evolution chain');
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatColor = (value: number) => {
    if (value >= 100) return '#00C853';
    if (value >= 70) return '#64DD17';
    if (value >= 50) return '#FFD600';
    return '#FF3D00';
  };

  const getStatPercentage = (value: number) => {
    return Math.min((value / 150) * 100, 100);
  };

  const handleBack = () => {
    router.replace('/(tabs)/favorites');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.pokemon.yellow} />
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load Pokemon details</Text>
      </View>
    );
  }

  const mainType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = COLORS.types[mainType as keyof typeof COLORS.types];

  const renderAboutTab = () => {
    if (!pokemon || !species) return null;

    const description = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    )?.flavor_text.replace(/\f/g, ' ');

    return (
      <View style={styles.aboutContainer}>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Weight:</Text>
          <Text style={styles.infoValue}>{pokemon.weight / 10}kg</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Height:</Text>
          <Text style={styles.infoValue}>{pokemon.height / 10}m</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Habitat:</Text>
          <Text style={styles.infoValue}>{species.habitat?.name || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Abilities:</Text>
          <Text style={styles.infoValue}>{pokemon.abilities.map(a => a.ability.name).join(', ')}</Text>
        </View>
      </View>
    );
  };

  const renderBaseStatsTab = () => {
    if (!pokemon) return null;

    return (
      <View style={styles.statsContainer}>
        {pokemon.stats.map((stat) => (
          <View key={stat.stat.name} style={styles.statRow}>
            <Text style={styles.statLabel}>
              {stat.stat.name.replace('-', ' ')}
            </Text>
            <Text style={styles.statValue}>{stat.base_stat}</Text>
            <View style={styles.statBar}>
              <View
                style={[
                  styles.statFill,
                  {
                    width: `${getStatPercentage(stat.base_stat)}%`,
                    backgroundColor: getStatColor(stat.base_stat),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMovesTab = () => {
    if (!pokemon) return null;

    return (
      <ScrollView style={styles.movesList}>
        {pokemon.moves.map((move, index) => (
          <View key={index} style={styles.moveItem}>
            <Text style={styles.moveName}>{move.move.name.replace('-', ' ')}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderEvolutionChain = () => {
    return (
      <View style={styles.evolutionContainer}>
        {evolutionChain.map((evo, index) => (
          <View key={evo.id} style={styles.evolutionRow}>
            <View style={styles.evolutionWrapper}>
              <View style={styles.evolutionPokemon} />
              <View style={styles.evolutionPokemon}>
                <Image 
                  source={{ uri: evo.imageUrl }} 
                  style={styles.evolutionImage} 
                />
                <Text style={styles.evolutionName}>{evo.name}</Text>
              </View>
            </View>
            {index < evolutionChain.length - 1 && (
              <View style={styles.evolutionArrow}>
                <Ionicons name="arrow-forward" size={24} color="black" />
                <Text style={styles.evolutionLevel}>
                  Level {evolutionChain[index + 1].level}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor }]}>
        <Image 
          source={require('../../assets/images/pokemon_backdrop-removebg-preview.png')} 
          style={styles.backdropImage}
          resizeMode="contain"
        />
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.pokemonName}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>
          <Text style={styles.pokemonNumber}>#{String(pokemon.id).padStart(3, '0')}</Text>
          <View style={styles.typeContainer}>
            {pokemon.types.map((type) => (
              <View key={type.type.name} style={styles.typeWrapper}>
                <View style={[styles.typeTag, { backgroundColor: COLORS.types[type.type.name as PokemonType] }]}>
                  <Text style={styles.typeText}>{type.type.name}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          {['About', 'Base Stats', 'Evolution', 'Moves'].map((tab) => (
            <TabButton
              key={tab}
              title={tab}
              isActive={activeTab === tab}
              onPress={() => setActiveTab(tab)}
            />
          ))}
        </View>

        <ScrollView style={styles.tabContent}>
          {activeTab === 'About' && renderAboutTab()}
          {activeTab === 'Base Stats' && renderBaseStatsTab()}
          {activeTab === 'Evolution' && renderEvolutionChain()}
          {activeTab === 'Moves' && renderMovesTab()}
        </ScrollView>
      </View>

      <View style={styles.pokemonImageContainer}>
        <Image
          source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 80,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
    zIndex: 10,
  },
  headerContent: {
    marginTop: 40,
    paddingRight: '30%',
  },
  pokemonName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  pokemonNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.pokemon.blue,
  },
  tabButtonText: {
    color: '#666',
    fontSize: 16,
  },
  tabButtonTextActive: {
    color: COLORS.pokemon.blue,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    width: 100,
    fontSize: FONTS.size.md,
    color: '#999999',
    fontWeight: '500',
  },
  statValue: {
    width: 40,
    fontSize: FONTS.size.md,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'right',
    marginRight: 10,
  },
  statBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 2,
  },
  aboutContainer: {
    gap: 16,
  },
  description: {
    fontSize: FONTS.size.md,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    width: 100,
    fontSize: FONTS.size.md,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: FONTS.size.md,
    color: '#333',
  },
  movesList: {
    marginTop: 10,
  },
  moveItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  moveName: {
    fontSize: FONTS.size.md,
    color: '#333333',
    textTransform: 'capitalize',
  },
  evolutionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  evolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  evolutionWrapper: {
    position: 'relative',
    width: 80,
  },
  evolutionPokemon: {
    alignItems: 'center',
    width: 80,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  evolutionImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  evolutionName: {
    fontSize: FONTS.size.md,
    color: '#333333',
    textTransform: 'capitalize',
  },
  evolutionLevel: {
    fontSize: FONTS.size.sm,
    color: '#666666',
  },
  evolutionArrow: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.size.lg,
    fontWeight: '500',
  },
  pokemonImageContainer: {
    position: 'absolute',
    right: -30,
    bottom: '52%',
    width: '65%',
    aspectRatio: 1,
    zIndex: 999,
  },
  pokemonImage: {
    width: '100%',
    height: '100%',
  },
  backdropImage: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: '140%',
    height: '140%',
    opacity: 0.1,
    transform: [{ scale: 2.2 }],
    zIndex: 1,
  },
  typeWrapper: {
    position: 'relative',
  },
}); 