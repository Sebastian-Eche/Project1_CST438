import {Text, View} from 'react-native'
import {useState, useEffect} from "react"

var url = 'https://api-football-v1.p.rapidapi.com/v2/odds/league/865927/bookmaker/5?page=2';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '0a7f187b59mshdb359109eaf38fbp19a603jsn02683a0c4a47',
		'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
	}
};

export default function APIFetch() {
    const dataFetch = async () => {
        const response = await fetch(url, options);
        const data = await response.json();
    }
};

useEffect(() => {
    APIFetch();
}, []);

console.log(data)