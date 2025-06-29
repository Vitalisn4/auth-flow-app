export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const AUTH_CONFIG = {
  SESSION_DURATION: 10 * 60 * 1000, // 10 minutes in milliseconds
  WARNING_TIME: 1 * 60 * 1000, // 1 minute warning
  REFRESH_THRESHOLD: 2 * 60 * 1000, // Refresh when 2 minutes left
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  REMEMBER_ME_KEY: 'remember_me',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const THEME_CONFIG = {
  STORAGE_KEY: 'theme_preference',
  DEFAULT_THEME: 'light',
} as const;