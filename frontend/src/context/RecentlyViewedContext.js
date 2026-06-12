import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../storage/local';

// Πρόσφατα ανοιγμένες παραστάσεις (ids, πιο πρόσφατη πρώτη)
const MAX = 12;
const Ctx = createContext(null);
export const useRecentlyViewed = () => useContext(Ctx);

export function RecentlyViewedProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    loadJSON(STORAGE_KEYS.recentlyViewed, []).then(setIds);
  }, []);

  const add = useCallback((id) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX);
      saveJSON(STORAGE_KEYS.recentlyViewed, next);
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ ids, add }}>{children}</Ctx.Provider>;
}
