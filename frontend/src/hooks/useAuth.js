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
      // Clear user state on any auth failure (including expired tokens)
      // The route guard in App.jsx will handle redirecting to /login
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

  const loginWithGoogle = useCallback(async (idToken) => {
    const response = await api.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    setUser(response.user || { authenticated: true });
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Continue with local logout even if backend request fails
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
    }
  }, []);

  return { user, loading, checkAuth, login, register, loginWithGoogle, logout };
}
