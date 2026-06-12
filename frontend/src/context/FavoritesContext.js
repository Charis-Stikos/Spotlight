import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../storage/local';

// Αγαπημένες παραστάσεις (ids) αποθηκευμένες τοπικά στη συσκευή
const FavoritesContext = createContext(null);
export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    loadJSON(STORAGE_KEYS.favorites, []).then((stored) => setIds(new Set(stored)));
  }, []);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveJSON(STORAGE_KEYS.favorites, [...next]);
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
