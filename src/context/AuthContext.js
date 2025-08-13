// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { loadSession, saveSession, clearSession } from '../utils/sessionPersistence';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken]           = useState(null);
  const [isGuest, setIsGuest]               = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rfidTags, setRfidTags]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [session, setSession]               = useState(null);
  const [currentUser, setCurrentUser]       = useState(null);

  // 1) Al arrancar, restaurar sesión
  useEffect(() => {
    (async () => {
      const saved = await loadSession();
      if (saved) {
        setSession(saved);
        setIsAuthenticated(true);   // <— marcamos autenticado
      }
      setLoading(false);
    })();
  }, []);

  // 2) Login
  const login = async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    const resp = await api.post(
      '/auth/login',
      form.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const token = resp.data.access_token;
    setUserToken(token);
    setIsGuest(false);
    setIsAuthenticated(true);     // <— aquí también
    await AsyncStorage.setItem('userToken', token);

    const me = await api.get('/auth/me');
    setCurrentUser(me.data);
  };

  // 3) Register
  const register = async (email, password, name) => {
    const resp = await api.post('/auth/register', { email, password, name });
    const token = resp.data.access_token;
    setUserToken(token);
    setIsGuest(false);
    setIsAuthenticated(true);     // <— y aquí
    await AsyncStorage.setItem('userToken', token);

    const me = await api.get('/auth/me');
    setCurrentUser(me.data);
  };

  // 4) Invitado
  const guest = async () => {
    setUserToken(null);
    setIsGuest(true);
    setIsAuthenticated(true);     // <— marcamos autenticado en modo guest
    await AsyncStorage.removeItem('userToken');
  };

  // 5) Iniciar sesión de carga
  const startSession = async (sessionData) => {
    setSession(sessionData);
    setIsAuthenticated(true);     // <— por si viene directo del flow
    await saveSession(sessionData);
  };

  // 6) Detener sesión de carga
  const stopSession = async () => {
    setSession(null);
    setIsAuthenticated(false);    // <— volvemos a “no autenticado”
    await clearSession();
  };

  // 7) Logout completo
  const logout = async () => {
    setUserToken(null);
    setIsGuest(false);
    setIsAuthenticated(false);
    setSession(null);
    setCurrentUser(null);
    setRfidTags([]);
    await AsyncStorage.multiRemove(['userToken', 'activeSession']);
  };

  return (
    <AuthContext.Provider value={{
      userToken,
      isGuest,
      isAuthenticated,
      currentUser,
      rfidTags,
      loading,
      session,
      register,
      login,
      guest,
      logout,
      startSession,
      stopSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
