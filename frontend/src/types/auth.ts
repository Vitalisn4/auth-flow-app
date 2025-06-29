export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: string;
  email_verified: boolean;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  last_login?: string;
}

export interface LoginRequest {
  [key: string]: unknown;
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  agree_to_terms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiry: number | null;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface DashboardStats {
  total_users: number;
  active_sessions: number;
  new_registrations_today: number;
  login_attempts_today: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  user_email: string;
  timestamp: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
  details?: any;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}