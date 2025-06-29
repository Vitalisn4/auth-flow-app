import React from 'react';
import Card from '../components/ui/Card';
import { Users } from 'lucide-react';

const UsersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="elevated" className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Users className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage users, roles, and permissions. User management features are coming soon!
          </p>
          <div className="h-64 flex items-center justify-center bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-800/30 dark:to-secondary-800/30 rounded-xl">
            <span className="text-lg text-gray-400">[User list and management tools will appear here]</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage; 