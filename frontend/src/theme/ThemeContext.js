import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { STORAGE_KEYS, loadString, saveString } from '../storage/local';
import { palettes, shadows } from './theme';

// Θέμα εφαρμογής: System (ακολουθεί τη συσκευή) / Light / Dark, με αποθήκευση της επιλογής
const MODES = ['system', 'light', 'dark'];
const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState('system');

  useEffect(() => {
    loadString(STORAGE_KEYS.themeMode).then((v) => { if (MODES.includes(v)) setModeState(v); });
  }, []);

  const setMode = useCallback((m) => {
    setModeState(m);
    saveString(STORAGE_KEYS.themeMode, m);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');

  const value = useMemo(() => ({
    mode,
    setMode,
    isDark,
    colors: isDark ? palettes.dark : palettes.light,
    shadow: isDark ? shadows.dark : shadows.light,
  }), [mode, setMode, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Factory για themed StyleSheets: const useStyles = makeStyles((colors, shadow) => ({...}))
// Ξαναϋπολογίζεται όταν αλλάζει το θέμα — ή το ίδιο το fn (ώστε το Fast Refresh να πιάνει αλλαγές στα styles).
export function makeStyles(fn) {
  return function useStyles() {
    const { colors, shadow } = useTheme();
    return useMemo(() => StyleSheet.create(fn(colors, shadow)), [colors, shadow, fn]);
  };
}
