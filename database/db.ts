import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('pokemon.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create favorites table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY,
          pokemon_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          image_url TEXT NOT NULL,
          types TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => {
          // Create logs table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS logs (
              id INTEGER PRIMARY KEY,
              event_type TEXT NOT NULL,
              endpoint TEXT,
              request_data TEXT,
              response_data TEXT,
              status_code INTEGER,
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );`,
            [],
            () => {
              console.log('Database and logs table initialized successfully');
              resolve(true);
            },
            (_, error) => {
              console.error('Error creating logs table:', error);
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          console.error('Error initializing database:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Add logging functions
export const logAPICall = (
  endpoint: string,
  requestData: any,
  responseData: any,
  statusCode: number
) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO logs (event_type, endpoint, request_data, response_data, status_code) VALUES (?, ?, ?, ?, ?)',
        [
          'API_CALL',
          endpoint,
          JSON.stringify(requestData),
          JSON.stringify(responseData),
          statusCode
        ],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          console.error('Error logging API call:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getLogs = (limit: number = 100) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?',
        [limit],
        (_, { rows: { _array } }) => {
          resolve(_array.map(log => ({
            ...log,
            request_data: JSON.parse(log.request_data),
            response_data: JSON.parse(log.response_data)
          })));
        },
        (_, error) => {
          console.error('Error getting logs:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const clearLogs = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM logs',
        [],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          console.error('Error clearing logs:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addToFavorites = (pokemon: { id: number; name: string; image: string; types: string[] }) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO favorites (pokemon_id, name, image_url, types) VALUES (?, ?, ?, ?)',
        [pokemon.id, pokemon.name, pokemon.image, JSON.stringify(pokemon.types)],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const removeFromFavorites = (pokemonId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM favorites WHERE pokemon_id = ?',
        [pokemonId],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getFavorites = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM favorites ORDER BY created_at DESC',
        [],
        (_, { rows: { _array } }) => {
          resolve(_array.map(item => ({
            ...item,
            types: JSON.parse(item.types)
          })));
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const isFavorite = (pokemonId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM favorites WHERE pokemon_id = ?',
        [pokemonId],
        (_, { rows: { _array } }) => {
          resolve(_array.length > 0);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Add game event logging
export const logGameEvent = (
  eventType: 'FETCH_START' | 'FETCH_SUCCESS' | 'FETCH_COMPLETE' | 'CORRECT_ANSWER' | 'FAVORITE_ADDED',
  data: any
) => {
  let logMessage = '';
  
  switch (eventType) {
    case 'FETCH_START':
      logMessage = `🔄 Starting new data fetch`;
      console.log(logMessage);
      break;
    case 'FETCH_SUCCESS':
      logMessage = `✅ Fetched Pokemon: ${data.name}`;
      console.log(logMessage);
      break;
    case 'FETCH_COMPLETE':
      logMessage = `✨ Finished fetching all Pokemon`;
      console.log(logMessage);
      break;
    case 'CORRECT_ANSWER':
      logMessage = `🎯 Correct Answer: ${data.name.toUpperCase()}`;
      console.log(logMessage);
      break;
    case 'FAVORITE_ADDED':
      logMessage = `✅ Added to favorites: ${data.name}`;
      console.log(logMessage);
      break;
  }

  // Also store in SQLite
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO logs (event_type, request_data, response_data, status_code) VALUES (?, ?, ?, ?)',
        [
          eventType,
          JSON.stringify(data),
          logMessage,
          200
        ],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          console.error('Error logging game event:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const logPokemonFetch = (pokemonId: number) => {
  const logMessage = `📱 Fetching Pokemon #${pokemonId}`;
  console.log(logMessage);
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO logs (event_type, request_data, response_data, status_code) VALUES (?, ?, ?, ?)',
        [
          'POKEMON_FETCH',
          JSON.stringify({ pokemonId }),
          logMessage,
          200
        ],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          console.error('Error logging Pokemon fetch:', error);
          reject(error);
          return false;
        }
      );
    });
  });
}; 