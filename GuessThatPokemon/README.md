# Guess That Pokémon!

A fun and interactive Pokémon guessing game built with React Native and Expo. Test your Pokémon knowledge by trying to identify Pokémon from their silhouettes!

## Features

- Engaging Pokémon guessing gameplay with silhouettes
- User authentication system with sign-up and sign-in functionality
- Beautiful Pokédex-style detail views for each Pokémon
- Comprehensive Pokémon information including:
  - Types and abilities
  - Base stats with visual bars
  - Evolution chains
  - Moves list
  - Habitat and physical characteristics
- Streak tracking system
- Favorites system using SQLite database
- Clean and modern UI inspired by the official Pokédex
- Sound effects and haptic feedback
- Animated components and transitions
- Error handling and loading states

## Technical Stack

### Core Technologies
- React Native with TypeScript
- Expo Framework and Router
- SQLite for data persistence
- PokeAPI integration

### Expo Libraries
- expo-sqlite: Database operations
- expo-haptics: Tactile feedback
- expo-av: Sound effects
- AsyncStorage: Session management

### UI/UX
- React Native StyleSheet
- Custom Animated API implementations
- Modern design patterns

## Database Schema

The app uses SQLite with the following tables:

```sql
-- Users table for authentication
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table for storing user's favorite Pokémon
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY,
  pokemon_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  types TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logs table for tracking game events
CREATE TABLE logs (
  id INTEGER PRIMARY KEY,
  event_type TEXT NOT NULL,
  endpoint TEXT,
  request_data TEXT,
  response_data TEXT,
  status_code INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Use the Expo Go app on your mobile device or an emulator to run the application

## How to Play

1. Create an account or sign in
2. Launch the game to see a Pokémon silhouette
3. Choose from four options to guess the Pokémon
4. Build your streak by making correct guesses
5. View detailed information about each Pokémon in the Pokédex view
6. Save your favorite Pokémon to revisit them later

## Data Source

This app uses the [PokeAPI](https://pokeapi.co/) to fetch Pokémon data, including:
- Pokémon information and stats
- Evolution chains
- Abilities and moves
- Type information

## Contributing

Feel free to contribute to this project by submitting issues or pull requests. All contributions are welcome!
