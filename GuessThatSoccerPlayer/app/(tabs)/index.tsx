import { Text, Image, StyleSheet, Platform, View, FlatList} from 'react-native';
import {useState, useEffect} from "react"

// import APIFetch from api;

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// var url = 'https://api-football-v1.p.rapidapi.com/';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '0a7f187b59mshdb359109eaf38fbp19a603jsn02683a0c4a47',
		'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
	}
};



var pokemonArray = [];
var pokemonArrayImage = [] 

export default function HomeScreen() {
  const [pokemon, setPokemonArray] = useState([]);
  const dataFetch = async () => {
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




  

  // useEffect(() => {
  //   dataFetch()
  // }, []);

  // console.log()
  console.log(pokemonArray)
  console.log(pokemonArray[1])
  

  return (
    <View>
      {pokemonArray.map((pokemon, index) => (
        <View> 
          <Text style={{ fontSize: 25, color: "#ffffff"}}>
            {pokemon.name}
          </Text>
          <Image style={{height: 100, width: 100}}source = {{ uri: pokemon.sprites.front_default }}/>
        </View>
      ))}
    </View>

    // <ParallaxScrollView
    //   headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    //   headerImage={
    //     <Image
    //       source={require('@/assets/images/partial-react-logo.png')}
    //       style={styles.reactLogo}
    //     />
    //   }>
    //   <ThemedView style={styles.titleContainer}>
    //     <ThemedText type="title">Welcome!</ThemedText>
    //     <HelloWave />
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 1: Try it</ThemedText>
    //     <ThemedText>
    //       Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
    //       Press{' '}
    //       <ThemedText type="defaultSemiBold">
    //         {Platform.select({
    //           ios: 'cmd + d',
    //           android: 'cmd + m',
    //           web: 'F12'
    //         })}
    //       </ThemedText>{' '}
    //       to open developer tools.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 2: Explore</ThemedText>
    //     <ThemedText>
    //       Tap the Explore tab to learn more about what's included in this starter app.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
    //     <ThemedText>
    //       When you're ready, run{' '}
    //       <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
    //       <ThemedText type="defaultSemiBold">app-example</ThemedText>.
    //     </ThemedText>
    //   </ThemedView>
    // </ParallaxScrollView>
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
