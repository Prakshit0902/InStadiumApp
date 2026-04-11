import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Robust token cache implementation for Clerk in Expo.
 * Uses SecureStore to persist the JWT session token safely.
 */
export const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('Clerk: Error getting token from SecureStore', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('Clerk: Error saving token to SecureStore', err);
      return;
    }
  },
};
