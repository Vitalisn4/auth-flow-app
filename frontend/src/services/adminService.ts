import { DashboardStats, ActivityItem } from '../types/auth';
import { apiService } from './api';

class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<DashboardStats>('/admin/dashboard/stats');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    try {
      const response = await apiService.get<ActivityItem[]>('/admin/dashboard/activity');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch recent activity');
    }
  }
}

export const adminService = new AdminService(); 