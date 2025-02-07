import { Text, Image, StyleSheet, Platform, View, Button } from 'react-native';
import { useState, useEffect } from "react"
import { Audio } from 'expo-av'
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase, updatePlayerStats, getPlayerStats } from '../../database/db';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  cries?: {
    latest: string;
  };
}

export default function HomeScreen() {
  const [pokemons, setPokemonArray] = useState<Pokemon[]>([]);
  const [streak, setStreak] = useState(0);
  const [topStreak, setTopStreak] = useState(0);
  const [pokemonToGuess, setPokemonToGuess] = useState<Pokemon | undefined>();

  // Initialize database
  useEffect(() => {
    const setup = async () => {
      try {
        const dbInitialized = await initDatabase();
        console.log('Database initialization result:', dbInitialized);
        
        if (dbInitialized) {
          const stats = await getPlayerStats();
          console.log('Initial stats:', stats);
          setStreak(stats.currentStreak || 0);
          setTopStreak(stats.topStreak || 0);
        } else {
          setStreak(0);
          setTopStreak(0);
        }
        
        await dataFetch();
      } catch (error) {
        console.error('Setup error:', error);
        setStreak(0);
        setTopStreak(0);
        await dataFetch();
      }
    };
    setup();
  }, []);

  const dataFetch = async () => {
    console.log("🔄 Starting new data fetch");
    const newPokemonArray: Pokemon[] = [];
    for(var i = 0; i < 4; i++){
      var randomPokedexNum = Math.floor(Math.random() * 1025) + 1;
      console.log(`📱 Fetching Pokemon #${randomPokedexNum}`);
      var url = `https://pokeapi.co/api/v2/pokemon/${randomPokedexNum}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(`✅ Fetched Pokemon: ${data.name}`);
      newPokemonArray.push(data);
    }
    setPokemonArray(newPokemonArray);
    console.log("✨ Finished fetching all Pokemon");
  }

  const getPokemonToGuess = () => {
    if (pokemons.length >= 4) {
      const pickRandomPokemon = Math.floor(Math.random() * pokemons.length);
      const newPokemonToGuess = pokemons[pickRandomPokemon];
      setPokemonToGuess(newPokemonToGuess);
      console.log("🎯 Correct Answer:", newPokemonToGuess?.name.toUpperCase());
    }
  }

  useEffect(() => {
    if (pokemons.length >= 4) {
      getPokemonToGuess();
    }
  }, [pokemons]);

  const placePokemonToGuessImage = (isCryActive: boolean) => {
    if(!isCryActive && pokemonToGuess){
      return (
        <View style={styles.pokemonInfoContainer}>
          <Image style={styles.pokemonImage} source={{ uri: pokemonToGuess.sprites.front_default }}/>
        </View>
      );
    }
    return null;
  }

  const placePokemonPokedexEntry = () => {
    if(pokemonToGuess != undefined){
      return <Text style={{ fontSize: 25, color: "#ffffff"}}> Pokedex Number: {pokemonToGuess.id} </Text>
    }
  }

  const correctPokemon = async (pokemonGuessed: Pokemon) => {
    if (!pokemonToGuess) return;

    const isCorrect = pokemonToGuess.name.toLowerCase() === pokemonGuessed.name.toLowerCase();
    console.log(`Player guessed: ${pokemonGuessed.name} (${isCorrect ? 'Correct' : 'Wrong'})`);

    try {
      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        console.log('✅ Correct! Updating streak to:', newStreak);
        
        const stats = await updatePlayerStats(newStreak);
        setTopStreak(stats.topStreak);
      } else {
        const currentStats = await getPlayerStats();
        console.log('❌ Wrong! The correct answer was:', pokemonToGuess.name);
        
        setStreak(0);
        const stats = await updatePlayerStats(0);
        setTopStreak(Math.max(currentStats.topStreak, stats.topStreak));
      }

      await dataFetch();
    } catch (error) {
      console.error('Error in game logic:', error);
      if (isCorrect) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
      await dataFetch();
    }
  };

  const placeButtons = () => {
    var randomNum = Math.floor(Math.random() * 10);
    if(pokemons.length >= 4){
      if(streak >= 5 && randomNum >= 4 && randomNum <= 6){
          return (
            <View style={styles.gameContainer}>
              {placePokemonToGuessImage(true)}
              <Button title='PLAY POKEMON CRY' onPress={() => playSound(pokemonToGuess?.cries?.latest)}/>
              <View style={styles.buttonContainer}>
                <Button title={pokemons[0].name} onPress={() => correctPokemon(pokemons[0])}/>
                <Button title={pokemons[1].name} onPress={() => correctPokemon(pokemons[1])}/>
                <Button title={pokemons[2].name} onPress={() => correctPokemon(pokemons[2])}/>
                <Button title={pokemons[3].name} onPress={() => correctPokemon(pokemons[3])}/>
              </View>
            </View>
          );
      }else if(streak >= 10 && randomNum > 7){
        return (
          <View style={styles.gameContainer}>
            {placePokemonPokedexEntry()}
            <View style={styles.buttonContainer}>
              <Button title={pokemons[0].name} onPress={() => correctPokemon(pokemons[0])}/>
              <Button title={pokemons[1].name} onPress={() => correctPokemon(pokemons[1])}/>
              <Button title={pokemons[2].name} onPress={() => correctPokemon(pokemons[2])}/>
              <Button title={pokemons[3].name} onPress={() => correctPokemon(pokemons[3])}/>
            </View>
          </View>
        );
      }else{
        return (
          <View style={styles.gameContainer}>
            {placePokemonToGuessImage(false)}
            <View style={styles.buttonContainer}>
              <Button title={pokemons[0].name} onPress={() => correctPokemon(pokemons[0])}/>
              <Button title={pokemons[1].name} onPress={() => correctPokemon(pokemons[1])}/>
              <Button title={pokemons[2].name} onPress={() => correctPokemon(pokemons[2])}/>
              <Button title={pokemons[3].name} onPress={() => correctPokemon(pokemons[3])}/>
            </View>
          </View>
        );
      }
    }
  }

  const playSound = async (pokemonURL: string | undefined) => {
    if (pokemonURL) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: pokemonURL },
        { shouldPlay: true }
      )
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Current Streak: {streak || 0}</Text>
        <Text style={styles.statsText}>Top Streak: {topStreak || 0}</Text>
      </View>
      
      {pokemons.length >= 4 && placeButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
  },
  statsText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  gameContainer: {
    alignItems: 'center',
    gap: 15,
  },
  pokemonInfoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  pokemonImage: {
    height: 150,
    width: 150,
    marginBottom: 5,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  }
});
