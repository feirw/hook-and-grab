import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [authModal, setAuthModal] = useState(null);

  const persistUser = useCallback((nextUser) => {
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('user');
    }
    setUser(nextUser);
  }, []);

  const login = useCallback((nextUser) => {
    persistUser(nextUser);
    setAuthModal(null);
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Local logout should still succeed if the session is already gone.
    }
    persistUser(null);
  }, [persistUser]);

  const openLogin = useCallback(() => setAuthModal('login'), []);
  const openSignup = useCallback(() => setAuthModal('signup'), []);
  const closeAuthModal = useCallback(() => setAuthModal(null), []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      login,
      logout,
      persistUser,
      authModal,
      openLogin,
      openSignup,
      closeAuthModal,
    }),
    [user, login, logout, persistUser, authModal, openLogin, openSignup, closeAuthModal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
