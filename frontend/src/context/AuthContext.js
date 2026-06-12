import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as authApi from '../api/auth';
import * as store from '../storage/secureStore';
import { configureApiAuth } from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);

  // Τα tokens ζουν σε refs ώστε οι interceptors να διαβάζουν πάντα την τελευταία τιμή χωρίς re-render
  const accessToken = useRef(null);
  const refreshToken = useRef(null);

  const applyTokens = useCallback(async ({ accessToken: at, refreshToken: rt }) => {
    accessToken.current = at;
    refreshToken.current = rt;
    await store.saveTokens({ accessToken: at, refreshToken: rt });
  }, []);

  const clearSession = useCallback(async () => {
    accessToken.current = null;
    refreshToken.current = null;
    setUser(null);
    await store.clearTokens();
  }, []);

  // Σύνδεση του API client μία φορά
  useEffect(() => {
    configureApiAuth({
      getAccessToken: () => accessToken.current,
      refreshTokens: async () => {
        if (!refreshToken.current) throw new Error('No refresh token');
        const data = await authApi.refresh(refreshToken.current);
        await applyTokens(data);
        return data.accessToken;
      },
      onAuthLost: () => { clearSession(); },
    });
  }, [applyTokens, clearSession]);

  // Επαναφορά αποθηκευμένης συνεδρίας κατά την εκκίνηση
  useEffect(() => {
    (async () => {
      try {
        const at = await store.getStoredAccessToken();
        const rt = await store.getStoredRefreshToken();
        if (at && rt) {
          accessToken.current = at;
          refreshToken.current = rt;
          const { user: restored } = await authApi.me();
          setUser(restored);
        }
      } catch {
        await store.clearTokens();
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    await applyTokens(data);
    setUser(data.user);
  }, [applyTokens]);

  const signUp = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    await applyTokens(data);
    setUser(data.user);
  }, [applyTokens]);

  const signOut = useCallback(async () => {
    const rt = refreshToken.current;
    await clearSession();
    if (rt) { try { await authApi.logout(rt); } catch { /* αγνόησε σφάλματα */ } }
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, restoring, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
