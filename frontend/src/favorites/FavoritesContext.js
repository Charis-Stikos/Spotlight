import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

// Αγαπημένες παραστάσεις (ids) αποθηκευμένες τοπικά στη συσκευή
const KEY = 'spotlight.favorites';
const FavoritesContext = createContext(null);
export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEY);
        if (raw) setIds(new Set(JSON.parse(raw)));
      } catch { /* αγνόησε σφάλματα */ }
    })();
  }, []);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      SecureStore.setItemAsync(KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const value = {
    ids,
    isFavorite: (id) => ids.has(id),
    toggle,
    count: ids.size,
  };
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
