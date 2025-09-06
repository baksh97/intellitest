import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '../types';
import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

const authReducer = (state: AuthState & { loading: boolean }, action: AuthAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    default:
      return state;
  }
};

const initialState: AuthState & { loading: boolean } = {
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: false,
  loading: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          apiClient.setToken(token);
          const user = await apiClient.get<User>(API_ENDPOINTS.USERS_ME);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        } catch (error) {
          localStorage.removeItem('access_token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.post<{ access_token: string; token_type: string }>(
        API_ENDPOINTS.LOGIN,
        { username, password }
      );

      const token = response.access_token;
      apiClient.setToken(token);
      
      const user = await apiClient.get<User>(API_ENDPOINTS.USERS_ME);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}