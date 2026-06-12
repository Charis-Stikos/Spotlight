// Τοπική αποθήκευση προτιμήσεων (JSON/string) πάνω από το expo-secure-store
import * as SecureStore from 'expo-secure-store';

// Όλα τα κλειδιά αποθήκευσης σε ένα σημείο
export const STORAGE_KEYS = {
  favorites: 'spotlight.favorites',
  recentlyViewed: 'spotlight.recent',
  recentSearches: 'spotlight.recentSearches',
  themeMode: 'spotlight.themeMode',
};

export async function loadJSON(key, fallback) {
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  SecureStore.setItemAsync(key, JSON.stringify(value)).catch(() => {});
}

export async function loadString(key) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export function saveString(key, value) {
  SecureStore.setItemAsync(key, value).catch(() => {});
}

export function remove(key) {
  SecureStore.deleteItemAsync(key).catch(() => {});
}
