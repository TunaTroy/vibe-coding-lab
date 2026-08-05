import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      await api.request('/todos');
      setUser({ authenticated: true });
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
        return;
      }

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (payload) => {
    const response = await api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setUser(response.user || { authenticated: true });
    return response;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setUser(response.user || { authenticated: true });
    return response;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return { user, loading, checkAuth, login, register, logout };
}
