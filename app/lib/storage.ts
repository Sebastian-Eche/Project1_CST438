import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  username: string;  // Changed from email
  password: string;  // In a real app, never store plain text passwords
  score: number;
}

// ... rest of the existing storage.ts code ... 

// Add this to your storage utility
const StorageKeys = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  API_CACHE: 'apiCache',
};

export const storage = {
  // ... existing methods ...

  // Add this new method to view all stored data
  async viewAllData(): Promise<{users: any, currentUser: any, apiCache: any}> {
    try {
      const users = await AsyncStorage.getItem(StorageKeys.USERS);
      const currentUser = await AsyncStorage.getItem(StorageKeys.CURRENT_USER);
      const apiCache = await AsyncStorage.getItem(StorageKeys.API_CACHE);

      return {
        users: users ? JSON.parse(users) : {},
        currentUser: currentUser ? JSON.parse(currentUser) : null,
        apiCache: apiCache ? JSON.parse(apiCache) : {},
      };
    } catch (error) {
      console.error('Error viewing storage data:', error);
      return {
        users: {},
        currentUser: null,
        apiCache: {},
      };
    }
  },

  async getUsers(): Promise<Record<string, User>> {
    try {
      const users = await AsyncStorage.getItem(StorageKeys.USERS);
      return users ? JSON.parse(users) : {};
    } catch (error) {
      console.error('Error getting users:', error);
      return {};
    }
  },

  async saveUser(user: User): Promise<void> {
    try {
      const users = await this.getUsers();
      users[user.username] = user;  // Changed from email to username
      await AsyncStorage.setItem(StorageKeys.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await AsyncStorage.getItem(StorageKeys.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageKeys.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
      throw error;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
}; 