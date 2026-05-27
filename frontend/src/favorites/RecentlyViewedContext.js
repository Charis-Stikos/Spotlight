import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

// Πρόσφατα ανοιγμένες παραστάσεις (ids, πιο πρόσφατη πρώτη)
const KEY = 'spotlight.recent';
const MAX = 12;
const Ctx = createContext(null);
export const useRecentlyViewed = () => useContext(Ctx);

export function RecentlyViewedProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEY);
        if (raw) setIds(JSON.parse(raw));
      } catch { /* αγνόησε σφάλματα */ }
    })();
  }, []);

  const add = useCallback((id) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX);
      SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ ids, add }}>{children}</Ctx.Provider>;
}
