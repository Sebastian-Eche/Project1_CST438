import { Text, Image, StyleSheet, Platform, View, FlatList, Button} from 'react-native';
import {useState, useEffect} from "react"

import { Audio } from 'expo-av'


export default function HomeScreen() {
  var pokemonArray = [];
  const [pokemons, setPokemonArray] = useState([]);


  
  const dataFetch = async () => {
    setPokemonArray([]);
    for(var i = 0; i < 4; i++){
      var randomPokedexNum = Math.floor(Math.random() * 1025) + 1;
      console.log(randomPokedexNum)
      var url = `https://pokeapi.co/api/v2/pokemon/${randomPokedexNum}`;
      console.log(url);
      const response = await fetch(url);
      const data = await response.json();
      // setData(data);
      pokemonArray.push(data)
    }
    // const response = await fetch(url, options);
    setPokemonArray(pokemonArray)
  }

  useEffect(() => {
    dataFetch()
  }, []);
  
  const [pokemonToGuess, setPokemonToGuess] = useState();



  const getPokemonToGuess = () => {
    var pickRandomPokemon = Math.floor(Math.random() * pokemons.length)
    var pokemonToGuess = pokemons[pickRandomPokemon];

    setPokemonToGuess(pokemonToGuess)

  }

  useEffect(() => {
    if(pokemons.length >= 4) {
      getPokemonToGuess()
    }
  }, [pokemons])

  

  const placePokemonToGuessImage = (isCryActive) => {
    if(!isCryActive){
      if(pokemonToGuess != undefined){
        return <Image style={{height: 100, width: 100}} source = {{ uri: pokemonToGuess.sprites.front_default }}/>
      }
    }
  }

  const placePokemonPokedexEntry = () => {
    if(pokemonToGuess != undefined){
      return <Text style={{ fontSize: 25, color: "#ffffff"}}> Pokedex Number: {pokemonToGuess.id} </Text>
    }
  }

  console.log("PokemonToGuess: ", pokemonToGuess)

  const clearArray = () => {
    console.log("POKEMONS LENGTH: ", pokemons.length)
    for(var i = 0; i < pokemons.length; i++){
      pokemons.pop()
    }
  }

  const [streak, setStreak] = useState(0);

  const correctPokemon = (pokemonGuessed) => {
    if(pokemonToGuess.name == pokemonGuessed.name){
      setStreak(streak + 1);
    }else{
      setStreak(0);
    }

    dataFetch()

  }

  const placeButtons = () => {
    var randomNum = Math.floor(Math.random() * 10);
    console.log(randomNum)
    if(pokemons.length >= 4){
      if(streak >= 5 && randomNum >= 4 && randomNum <= 6){
          return <View> <br></br> {placePokemonToGuessImage(true)} <Button title='PLAY POKEMON CRY' onPress={() => playSound(pokemonToGuess.cries.latest)}/> <br></br> <Button title={pokemons[0].name} onPress={() => correctPokemon(pokemons[0])}/>
          <Button title={pokemons[1].name} onPress={() => correctPokemon(pokemons[1])}/>
          <Button title={pokemons[2].name} onPress={() => correctPokemon(pokemons[2])}/>
          <Button title={pokemons[3].name} onPress={() => correctPokemon(pokemons[3])}/></View>
      }else if(streak >= 10 && randomNum > 7){
        return <View> <br></br> {placePokemonPokedexEntry()} <br></br> <Button title={pokemons[0].name} onPress={() => correctPokemon(pokemons[0])}/>
        <Button title={pokemons[1].name} onPress={() => correctPokemon(pokemons[1])}/>
        <Button title={pokemons[2].name} onPress={() => correctPokemon(pokemons[2])}/>
        <Button title={pokemons[3].name} onPress={() => correctPokemon(pokemons[3])}/></View>

      }else{
        return <View> <br></br> {placePokemonToGuessImage(false)} <br></br> <Button title={pokemons[0].name} onPress={() => correctPokemon(pokemons[0])}/>
          <Button title={pokemons[1].name} onPress={() => correctPokemon(pokemons[1])}/>
          <Button title={pokemons[2].name} onPress={() => correctPokemon(pokemons[2])}/>
          <Button title={pokemons[3].name} onPress={() => correctPokemon(pokemons[3])}/></View>
      }
    }
  }

  useEffect(() => {
    placeButtons()
  });

  
  // useEffect(() => {
  //   placePokemonToGuessImage(false)
  // });

  


  const playSound = async (pokemonURL) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: pokemonURL },
      { shouldPlay: true }
    )
  }

  console.log(pokemons)

  // if(pokemonToGuess != undefined)

  return (
    <View>
      <Text style={{ fontSize: 25, color: "#ffffff"}}>
        Streak: {streak}
      </Text>
          {placeButtons()}
    </View>
  );
}


const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
