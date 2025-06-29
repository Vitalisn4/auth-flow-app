import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';
import { storage } from '../utils/storage';
import { AUTH_CONFIG } from '../constants/config';
import { apiService } from './api';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      const authResponse = response.data.data;
      
      // Store authentication data
      storage.set(AUTH_CONFIG.TOKEN_KEY, authResponse.token);
      storage.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, authResponse.refreshToken);
      storage.set(AUTH_CONFIG.USER_KEY, authResponse.user);
      
      return authResponse;
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      const authResponse = response.data.data;
      
      // Store authentication data
      storage.set(AUTH_CONFIG.TOKEN_KEY, authResponse.token);
      storage.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, authResponse.refreshToken);
      storage.set(AUTH_CONFIG.USER_KEY, authResponse.user);
      
      return authResponse;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed. Please check your information.');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.warn('Logout API call failed, but clearing local data:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
      const authResponse = response.data.data;
      
      // Update stored tokens
      storage.set(AUTH_CONFIG.TOKEN_KEY, authResponse.token);
      storage.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, authResponse.refreshToken);
      storage.set(AUTH_CONFIG.USER_KEY, authResponse.user);
      
      return authResponse;
    } catch (error) {
      this.clearAuthData();
      throw new Error('Invalid refresh token');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>('/auth/me');
      const user = response.data.data;
      
      // Update stored user data
      storage.set(AUTH_CONFIG.USER_KEY, user);
      
      return user;
    } catch (error) {
      this.clearAuthData();
      throw new Error('No authenticated user found');
    }
  }

  private clearAuthData(): void {
    storage.remove(AUTH_CONFIG.TOKEN_KEY);
    storage.remove(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    storage.remove(AUTH_CONFIG.USER_KEY);
  }

  isAuthenticated(): boolean {
    const token = storage.get<string>(AUTH_CONFIG.TOKEN_KEY);
    const user = storage.get<User>(AUTH_CONFIG.USER_KEY);
    return !!(token && user);
  }

  getStoredUser(): User | null {
    return storage.get<User>(AUTH_CONFIG.USER_KEY);
  }

  getStoredToken(): string | null {
    return storage.get<string>(AUTH_CONFIG.TOKEN_KEY);
  }

  getStoredRefreshToken(): string | null {
    return storage.get<string>(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }
}

export const authService = new AuthService();