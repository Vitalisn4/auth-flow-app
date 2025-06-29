import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';
import { AUTH_CONFIG } from '../constants/config';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string; expiresIn: number } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_SESSION_EXPIRY'; payload: number };

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  sessionExpiry: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        sessionExpiry: Date.now() + action.payload.expiresIn,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    
    case 'SET_SESSION_EXPIRY':
      return {
        ...state,
        sessionExpiry: action.payload,
      };
    
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getStoredToken();
        const refreshToken = authService.getStoredRefreshToken();
        const user = authService.getStoredUser();

        if (token && refreshToken && user) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user,
              token,
              refreshToken,
              expiresIn: AUTH_CONFIG.SESSION_DURATION,
            },
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authService.login(credentials);
      
      // Store auth data
      storage.set(AUTH_CONFIG.TOKEN_KEY, response.token);
      storage.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.refreshToken);
      storage.set(AUTH_CONFIG.USER_KEY, response.user);
      
      if (credentials.rememberMe) {
        storage.set(AUTH_CONFIG.REMEMBER_ME_KEY, true);
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });

      toast.success(`Welcome back, ${response.user.name || response.user.email}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authService.register(userData);
      
      // Store auth data
      storage.set(AUTH_CONFIG.TOKEN_KEY, response.token);
      storage.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.refreshToken);
      storage.set(AUTH_CONFIG.USER_KEY, response.user);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });

      toast.success('Account created successfully! Welcome aboard!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if server request fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshAuthToken = async () => {
    try {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(state.refreshToken);
      
      // Update stored auth data
      storage.set(AUTH_CONFIG.TOKEN_KEY, response.token);
      storage.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.refreshToken);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      storage.set(AUTH_CONFIG.USER_KEY, updatedUser);
      dispatch({ type: 'UPDATE_USER', payload: userData });
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuthToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}