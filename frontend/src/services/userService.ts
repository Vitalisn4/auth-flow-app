import { User, UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../types/auth';
import { apiService } from './api';

class UserService {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>('/users/profile');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch profile');
    }
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>('/users/profile', profileData);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to update profile');
    }
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    try {
      await apiService.put('/users/password', passwordData);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to change password');
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await apiService.delete('/users/account');
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to delete account');
    }
  }

  async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiService.post<{ avatar_url: string }>('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data.avatar_url;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to upload avatar');
    }
  }
}

export const userService = new UserService(); 