import axios from 'axios';

export interface LoginsPerDay {
  date: string;
  logins: number;
}

export const analyticsService = {
  async getLoginsPerDay(): Promise<LoginsPerDay[]> {
    const response = await axios.get('/api/analytics/logins-per-day');
    return response.data;
  },
}; 