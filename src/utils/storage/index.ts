/*
import {MMKV} from 'react-native-mmkv';
import {name} from '../../../app.json';

const storage = new MMKV({
  id: `${name}-storage`,
  encryptionKey: 'encryption-key',
});


type Keys = 'token' | 'refresh-token'; // add more key

const Storage = {
  setItem: (key: Keys, value: string): Promise<void> => {
    return new Promise(resolve => {
      storage.set(key, value);
      resolve();
    });
  },

  getItem: (key: Keys): Promise<string | null> => {
    return new Promise(resolve => {
      const value = storage.getString(key);
      resolve(value || null);
    });
  },

  getNumber: (key: Keys): Promise<number | null> => {
    return new Promise(resolve => {
      const value = storage.getNumber(key);
      resolve(value || null);
    });
  },

  getBoolean: (key: Keys): Promise<boolean | null> => {
    return new Promise(resolve => {
      const value = storage.getBoolean(key);
      resolve(value || null);
    });
  },

  containsKey: (key: Keys): Promise<boolean | null> => {
    return new Promise(resolve => {
      const value = storage.contains(key);
      resolve(value || null);
    });
  },

  removeItem: (key: Keys): Promise<void> => {
    return new Promise(resolve => {
      storage.delete(key);
      resolve();
    });
  },

  clearAll: (): Promise<void> => {
    return new Promise(resolve => {
      storage.clearAll();
      resolve();
    });
  },
};

export default Storage;
*/

import AsyncStorage from '@react-native-async-storage/async-storage';

type Keys = 'token' | 'refresh-token'|'isInstalled'; // Add more keys as needed

const Storage = {
  setItem: async (key: Keys, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item in AsyncStorage: ${error}`);
    }
  },

  getItem: async (key: Keys): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`Error getting item from AsyncStorage: ${error}`);
      return null;
    }
  },

  getNumber: async (key: Keys): Promise<number | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? parseFloat(value) : null;
    } catch (error) {
      console.error(`Error getting number from AsyncStorage: ${error}`);
      return null;
    }
  },

  getBoolean: async (key: Keys): Promise<boolean | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? value === 'true' : null;
    } catch (error) {
      console.error(`Error getting boolean from AsyncStorage: ${error}`);
      return null;
    }
  },

  containsKey: async (key: Keys): Promise<boolean> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.includes(key);
    } catch (error) {
      console.error(`Error checking key in AsyncStorage: ${error}`);
      return false;
    }
  },

  removeItem: async (key: Keys): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from AsyncStorage: ${error}`);
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error(`Error clearing AsyncStorage: ${error}`);
    }
  },
};

export default Storage;
