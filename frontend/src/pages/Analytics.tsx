import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';

interface LoginsPerDay {
  date: string;
  logins: number;
}

const Analytics: React.FC = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<LoginsPerDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restrict access to admins only
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/api/analytics/logins-per-day', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(res.data.data))
      .catch(err => {
        if (err.response && err.response.status === 403) {
          setError('You are not authorized to view this page.');
        } else {
          setError('Failed to load analytics data.');
        }
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="elevated" className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Visualize your authentication data and trends. Here is a sample of logins over the past week.
          </p>
          <div className="h-80 flex items-center justify-center bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-800/30 dark:to-secondary-800/30 rounded-xl">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <span className="text-lg text-red-400">{error}</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="logins" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;