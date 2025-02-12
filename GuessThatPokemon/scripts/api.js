import {Text, View} from 'react-native'
import {useState, useEffect} from "react"

export const dataFetch = async () => {
    var pokemonArray = [];
    for(var i = 0; i < 4; i++){
      var randomPokedexNum = Math.floor(Math.random() * 1025) + 1;
      var url = `https://pokeapi.co/api/v2/pokemon/${randomPokedexNum}`;
      const response = await fetch(url);
      const data = await response.json();
      pokemonArray.push(data);
    }
    console.log(data.length)
    return pokemonArray
}