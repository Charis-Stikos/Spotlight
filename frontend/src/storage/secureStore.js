// Αποθήκευση tokens στο keychain/keystore της συσκευής (expo-secure-store)
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'spotlight.accessToken';
const REFRESH_KEY = 'spotlight.refreshToken';

export async function saveTokens({ accessToken, refreshToken }) {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export const getStoredAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const getStoredRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}
