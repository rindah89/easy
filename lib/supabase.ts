import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '../database.types';

// Constants for chunked storage
const CHUNK_SIZE = 1800; // Slightly less than 2048 to be safe
const CHUNK_PREFIX = 'CHUNK_';

// Enhanced SecureStore adapter for Supabase that handles large values
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      // First, try to get the value directly (for backward compatibility)
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) return value;
      
      // Check if this is a chunked value
      const chunkCountKey = `${key}_chunks`;
      const chunkCountStr = await SecureStore.getItemAsync(chunkCountKey);
      
      if (!chunkCountStr) return null;
      
      // Reassemble chunks
      const chunkCount = parseInt(chunkCountStr, 10);
      let result = '';
      
      for (let i = 0; i < chunkCount; i++) {
        const chunkKey = `${CHUNK_PREFIX}${key}_${i}`;
        const chunk = await SecureStore.getItemAsync(chunkKey);
        if (chunk === null) {
          console.warn(`Missing chunk ${i} for key ${key}`);
          return null;
        }
        result += chunk;
      }
      
      return result;
    } catch (error) {
      console.error('Error in SecureStore getItem:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string) => {
    try {
      // If value is small enough, store directly
      if (value.length < CHUNK_SIZE) {
        return SecureStore.setItemAsync(key, value);
      }
      
      // Otherwise, split into chunks
      const chunks = [];
      let position = 0;
      
      while (position < value.length) {
        chunks.push(value.substring(position, position + CHUNK_SIZE));
        position += CHUNK_SIZE;
      }
      
      // Store chunk count
      await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());
      
      // Store each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkKey = `${CHUNK_PREFIX}${key}_${i}`;
        await SecureStore.setItemAsync(chunkKey, chunks[i]);
      }
      
      // Delete the original key to avoid confusion
      await SecureStore.deleteItemAsync(key);
      
      return;
    } catch (error) {
      console.error('Error in SecureStore setItem:', error);
      throw error;
    }
  },
  
  removeItem: async (key: string) => {
    try {
      // Try to remove the direct key (for backward compatibility)
      await SecureStore.deleteItemAsync(key);
      
      // Check if this is a chunked value
      const chunkCountKey = `${key}_chunks`;
      const chunkCountStr = await SecureStore.getItemAsync(chunkCountKey);
      
      if (!chunkCountStr) return;
      
      // Remove all chunks
      const chunkCount = parseInt(chunkCountStr, 10);
      for (let i = 0; i < chunkCount; i++) {
        const chunkKey = `${CHUNK_PREFIX}${key}_${i}`;
        await SecureStore.deleteItemAsync(chunkKey);
      }
      
      // Remove the chunk count key
      await SecureStore.deleteItemAsync(chunkCountKey);
    } catch (error) {
      console.error('Error in SecureStore removeItem:', error);
    }
  },
};

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 