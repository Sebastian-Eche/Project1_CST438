import * as SQLite from 'expo-sqlite';

// Open database with proper typing
const db: SQLite.SQLiteDatabase = SQLite.openDatabaseSync('pokemon.db');

export interface PlayerStats {
  currentStreak: number;
  topStreak: number;
}

export interface FavoritePokemon {
  id: number;
  name: string;
  spriteUrl: string;
  types?: string[];
}

export const initDatabase = async () => {
  try {
    // Drop existing tables to ensure clean state
    await db.execAsync(`
      DROP TABLE IF EXISTS favorite_pokemon;
      DROP TABLE IF EXISTS player_stats;
      DROP TABLE IF EXISTS users;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS player_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        current_streak INTEGER NOT NULL DEFAULT 0,
        top_streak INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS favorite_pokemon (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        pokemon_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sprite_url TEXT NOT NULL,
        types TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const updatePlayerStats = async (userId: number, currentStreak: number): Promise<PlayerStats> => {
  try {
    // Ensure currentStreak is a valid number
    currentStreak = Math.max(0, parseInt(currentStreak.toString()) || 0);
    
    // Get current stats including top streak
    const currentStats = await db.getFirstAsync<PlayerStats>(
      'SELECT current_streak as currentStreak, top_streak as topStreak FROM player_stats WHERE user_id = ?',
      [userId]
    );
    
    if (!currentStats) {
      // If no stats exist, create initial record
      await db.runAsync(
        'INSERT INTO player_stats (user_id, current_streak, top_streak) VALUES (?, ?, ?)',
        [userId, currentStreak, currentStreak]
      );
      return { currentStreak, topStreak: currentStreak };
    }

    const newTopStreak = Math.max(currentStats.topStreak, currentStreak);

    // Update current streak and preserve top streak
    await db.runAsync(
      'UPDATE player_stats SET current_streak = ?, top_streak = ? WHERE user_id = ?',
      [currentStreak, newTopStreak, userId]
    );

    return { 
      currentStreak, 
      topStreak: newTopStreak 
    };
  } catch (error) {
    console.error('Error updating player stats:', error);
    return { currentStreak: 0, topStreak: Math.max(0, currentStreak) };
  }
};

export const getPlayerStats = async (userId: number): Promise<PlayerStats> => {
  try {
    const stats = await db.getFirstAsync<PlayerStats>(
      'SELECT current_streak as currentStreak, top_streak as topStreak FROM player_stats WHERE user_id = ?',
      [userId]
    );
    
    if (!stats) {
      // Initialize stats for new user
      await db.runAsync(
        'INSERT INTO player_stats (user_id, current_streak, top_streak) VALUES (?, 0, 0)',
        [userId]
      );
      return { currentStreak: 0, topStreak: 0 };
    }

    return stats;
  } catch (error) {
    console.error('Error getting player stats:', error);
    return { currentStreak: 0, topStreak: 0 };
  }
};

export const addFavoritePokemon = async (userId: number, pokemon: FavoritePokemon) => {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO favorite_pokemon (user_id, pokemon_id, name, sprite_url, types) VALUES (?, ?, ?, ?, ?)',
      [userId, pokemon.id, pokemon.name, pokemon.spriteUrl, pokemon.types ? JSON.stringify(pokemon.types) : null]
    );
    return true;
  } catch (error) {
    console.error('Error adding favorite pokemon:', error);
    return false;
  }
};

export const removeFavoritePokemon = async (userId: number, pokemonId: number) => {
  try {
    await db.runAsync(
      'DELETE FROM favorite_pokemon WHERE user_id = ? AND pokemon_id = ?',
      [userId, pokemonId]
    );
    return true;
  } catch (error) {
    console.error('Error removing favorite pokemon:', error);
    return false;
  }
};

export const getFavoritePokemon = async (userId: number): Promise<FavoritePokemon[]> => {
  try {
    const favorites = await db.getAllAsync<any>(
      'SELECT pokemon_id as id, name, sprite_url as spriteUrl, types FROM favorite_pokemon WHERE user_id = ?',
      [userId]
    );
    return favorites.map(fav => ({
      ...fav,
      types: fav.types ? JSON.parse(fav.types) : undefined
    })) || [];
  } catch (error) {
    console.error('Error getting favorite pokemon:', error);
    return [];
  }
};

// Simple password hashing
function hashPassword(password: string): string {
  const salt = 'GuessT#@tP0k3m0n';
  const combined = password + salt;
  return btoa(combined);
}

function verifyPassword(password: string, hash: string): boolean {
  const hashedInput = hashPassword(password);
  return hashedInput === hash;
}

// Function to sign up a new user
export const signUpUser = async (username: string, password: string): Promise<{ success: boolean; userId?: number }> => {
  try {
    const passwordHash = hashPassword(password);

    // Check if username exists
    const existingUser = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser) {
      console.log('Username already exists');
      return { success: false };
    }

    // Create new user
    const result = await db.runAsync(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    if (result.changes > 0) {
      console.log('User signed up successfully');
      return { success: true, userId: result.lastInsertRowId };
    }

    return { success: false };
  } catch (error) {
    console.error('Error in sign up:', error);
    return { success: false };
  }
};

// Function to sign in a user
export const signInUser = async (username: string, password: string): Promise<{ success: boolean; userId?: number }> => {
  try {
    const user = await db.getFirstAsync<{ id: number; password_hash: string }>(
      'SELECT id, password_hash FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      console.log('User not found');
      return { success: false };
    }

    if (verifyPassword(password, user.password_hash)) {
      console.log('User signed in successfully');
      return { success: true, userId: user.id };
    }

    console.log('Invalid password');
    return { success: false };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false };
  }
}; 