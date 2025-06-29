import React from 'react';
import Card from '../components/ui/Card';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="elevated">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage your account preferences and application settings here. More options coming soon!
          </p>
          {/* Add more settings sections here as needed */}
        </Card>
      </div>
    </div>
  );
};

export default Settings; 