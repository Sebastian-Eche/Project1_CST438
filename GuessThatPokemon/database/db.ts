import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseAsync('pokemon.db');

export interface PlayerStats {
  currentStreak: number;
  topStreak: number;
}

export interface FavoritePokemon {
  id: number;
  name: string;
  spriteUrl: string;
}

export const initDatabase = async () => {
  try {
    const database = await db;
    
    // Drop and recreate tables to ensure correct structure
    await database.execAsync(`
      DROP TABLE IF EXISTS player_stats;
      DROP TABLE IF EXISTS favorite_pokemon;
      
      CREATE TABLE player_stats (
        id INTEGER PRIMARY KEY,
        current_streak INTEGER NOT NULL DEFAULT 0,
        top_streak INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE favorite_pokemon (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        sprite_url TEXT NOT NULL
      );

      INSERT INTO player_stats (id, current_streak, top_streak) VALUES (1, 0, 0);
    `);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export const updatePlayerStats = async (currentStreak: number): Promise<PlayerStats> => {
  try {
    const database = await db;
    
    // Ensure currentStreak is a valid number
    currentStreak = Math.max(0, parseInt(currentStreak.toString()) || 0);
    
    // Get current stats including top streak
    const currentStats = await database.getFirstAsync<PlayerStats>(
      'SELECT current_streak, top_streak FROM player_stats WHERE id = 1'
    );
    
    if (!currentStats) {
      // If no stats exist, create initial record
      await database.execAsync(`
        INSERT INTO player_stats (id, current_streak, top_streak) 
        VALUES (1, ${currentStreak}, ${currentStreak})
      `);
      return { currentStreak, topStreak: currentStreak };
    }

    // Ensure we have valid numbers
    const existingTopStreak = Math.max(0, parseInt(currentStats.top_streak?.toString()) || 0);
    const newTopStreak = Math.max(existingTopStreak, currentStreak);

    // Update current streak and preserve top streak
    await database.execAsync(`
      UPDATE player_stats 
      SET current_streak = ${currentStreak}, 
          top_streak = ${newTopStreak}
      WHERE id = 1
    `);

    return { 
      currentStreak, 
      topStreak: newTopStreak 
    };
  } catch (error) {
    console.error('Error updating player stats:', error);
    return { currentStreak: 0, topStreak: Math.max(0, currentStreak) };
  }
};

export const getPlayerStats = async (): Promise<PlayerStats> => {
  try {
    const database = await db;
    const stats = await database.getFirstAsync<PlayerStats>(
      'SELECT current_streak, top_streak FROM player_stats WHERE id = 1'
    );
    
    if (!stats) {
      return { currentStreak: 0, topStreak: 0 };
    }

    // Ensure we return valid numbers
    return {
      currentStreak: Math.max(0, parseInt(stats.current_streak?.toString()) || 0),
      topStreak: Math.max(0, parseInt(stats.top_streak?.toString()) || 0)
    };
  } catch (error) {
    console.error('Error getting player stats:', error);
    return { currentStreak: 0, topStreak: 0 };
  }
};

export const addFavoritePokemon = async (pokemon: FavoritePokemon) => {
  try {
    const database = await db;
    await database.execAsync(`
      INSERT OR REPLACE INTO favorite_pokemon (id, name, sprite_url) 
      VALUES (${pokemon.id}, '${pokemon.name}', '${pokemon.spriteUrl}')
    `);
    return true;
  } catch (error) {
    console.error('Error adding favorite pokemon:', error);
    return false;
  }
};

export const removeFavoritePokemon = async (pokemonId: number) => {
  try {
    const database = await db;
    await database.execAsync(`
      DELETE FROM favorite_pokemon 
      WHERE id = ${pokemonId}
    `);
    return true;
  } catch (error) {
    console.error('Error removing favorite pokemon:', error);
    return false;
  }
};

export const getFavoritePokemon = async (): Promise<FavoritePokemon[]> => {
  try {
    const database = await db;
    const favorites = await database.getAllAsync<FavoritePokemon>(
      'SELECT id, name, sprite_url as spriteUrl FROM favorite_pokemon'
    );
    return favorites || [];
  } catch (error) {
    console.error('Error getting favorite pokemon:', error);
    return [];
  }
}; 