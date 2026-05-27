import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/auth/AuthContext';
import { FavoritesProvider } from './src/favorites/FavoritesContext';
import { RecentlyViewedProvider } from './src/favorites/RecentlyViewedContext';
import { BadgeProvider } from './src/badge/BadgeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/theme';

// Θέμα πλοήγησης βασισμένο στα design tokens (ανοιχτό)
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FavoritesProvider>
          <RecentlyViewedProvider>
            <BadgeProvider>
              <NavigationContainer theme={navTheme}>
                <StatusBar style="dark" />
                <RootNavigator />
              </NavigationContainer>
            </BadgeProvider>
          </RecentlyViewedProvider>
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
