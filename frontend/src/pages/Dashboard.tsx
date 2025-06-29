import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Shield, 
  Activity,
  TrendingUp,
  Globe,
  Zap,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatters } from '../utils/formatters';
import { adminService } from '../services/adminService';
import { DashboardStats, ActivityItem } from '../types/auth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useActivity } from '../contexts/ActivityContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activity, logActivity, deleteActivity, clearActivity } = useActivity();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user?.role === 'admin') {
        try {
          const [statsData, activityData] = await Promise.all([
            adminService.getDashboardStats(),
            adminService.getRecentActivity(),
          ]);
          setStats(statsData);
          setRecentActivity(activityData);
        } catch (error: any) {
          toast.error(error.message || 'Failed to fetch dashboard data');
        } finally {
          setLoading(false);
        }
      } else {
        // For regular users, use mock data
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  // Use real data for admin, mock data for regular users
  const displayStats = user?.role === 'admin' && stats ? [
    {
      title: 'Total Users',
      value: stats.total_users.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Active Sessions',
      value: stats.active_sessions.toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'New Registrations',
      value: stats.new_registrations_today.toString(),
      change: '+2%',
      changeType: 'positive' as const,
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Login Attempts',
      value: stats.login_attempts_today.toString(),
      change: '-8%',
      changeType: 'positive' as const,
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600',
    },
  ] : [];

  const displayActivity = user?.role === 'admin' ? recentActivity : [];

  const quickActions = [
    {
      title: 'View Analytics',
      description: 'Detailed insights and reports',
      icon: BarChart3,
      action: () => { logActivity('Viewed Analytics'); navigate('/analytics'); },
    },
    {
      title: 'Manage Users',
      description: 'User management and permissions',
      icon: Users,
      action: () => { logActivity('Managed Users'); navigate('/users'); },
    },
    {
      title: 'Security Settings',
      description: 'Configure security policies',
      icon: Shield,
      action: () => { logActivity('Viewed Security Settings'); navigate('/security-settings'); },
    },
    {
      title: 'Global Settings',
      description: 'Application configuration',
      icon: Globe,
      action: () => { logActivity('Viewed Global Settings'); navigate('/settings'); },
    },
  ];

  // Log navigation to dashboard
  useEffect(() => { logActivity('Visited Dashboard'); }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your authentication system today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card variant="elevated" hover className="relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className={`w-4 h-4 mr-1 ${
                        stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card variant="elevated" className="bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 mb-4">
            <div className="flex items-center space-x-6">
              <BarChart3 className="w-8 h-8 text-primary-600" />
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">Statistics</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Total Actions: {activity.length}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Last Action: {activity[0]?.action || 'None'}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card variant="elevated">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={clearActivity} title="Clear All Activity">
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Clear All</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {activity.length === 0 ? (
                  <div className="text-gray-400 text-center">No recent activity yet.</div>
                ) : (
                  activity.slice(0, 10).map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg shadow"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.action}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.timestamp).toLocaleString()}</div>
                        {item.details && <div className="text-xs text-gray-400">{item.details}</div>}
                      </div>
                      <button onClick={() => deleteActivity(item.id)} title="Delete Activity" className="ml-4 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card variant="elevated">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.title}
                    onClick={action.action}
                    className="w-full p-4 text-left bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl shadow-md hover:scale-[1.03] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all duration-200 border border-transparent hover:border-primary-400 dark:hover:border-primary-600"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow">
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Welcome Message for New Users */}
        {user?.createdAt && new Date(user.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card variant="glass" className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Welcome to AuthFlow!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You've successfully created your account. Explore the dashboard to get started with managing your authentication system.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;