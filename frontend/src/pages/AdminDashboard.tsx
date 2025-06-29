import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Trash2, User, Activity, BarChart3 } from 'lucide-react';
import axios from 'axios';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
  last_login?: string;
}

interface AdminActivity {
  id: string;
  action: string;
  user_email: string;
  timestamp: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Protect route: only admin can access
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch users
  useEffect(() => {
    setLoadingUsers(true);
    axios.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data.data))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, [token]);

  // Fetch activities
  useEffect(() => {
    setLoadingActivities(true);
    axios.get('/api/admin/dashboard/activity', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setActivities(res.data.data))
      .catch(() => setActivities([]))
      .finally(() => setLoadingActivities(false));
  }, [token]);

  // Delete user
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    await axios.delete(`/api/users/account`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { id }
    });
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management */}
          <Card variant="elevated" className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
            </div>
            {loadingUsers ? (
              <div>Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left">Email</th>
                      <th className="px-2 py-1 text-left">Role</th>
                      <th className="px-2 py-1 text-left">Created</th>
                      <th className="px-2 py-1 text-left">Last Login</th>
                      <th className="px-2 py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-2 py-1">{u.email}</td>
                        <td className="px-2 py-1 capitalize">{u.role}</td>
                        <td className="px-2 py-1">{new Date(u.created_at).toLocaleString()}</td>
                        <td className="px-2 py-1">{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                        <td className="px-2 py-1">
                          {u.role !== 'admin' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id)}
                              leftIcon={<Trash2 className="w-4 h-4" />}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Activity Logs */}
          <Card variant="elevated">
            <div className="flex items-center mb-4">
              <Activity className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Logs</h2>
            </div>
            {loadingActivities ? (
              <div>Loading activities...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activities.map(a => (
                  <div key={a.id} className="p-2 rounded bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                    <div className="font-medium text-gray-900 dark:text-white">{a.action}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{a.user_email}</div>
                    <div className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        {/* Link to Analytics */}
        <div className="mt-8">
          <a href="/analytics" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded shadow hover:scale-105 transition">
            <BarChart3 className="w-5 h-5 mr-2" />
            View Analytics
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;