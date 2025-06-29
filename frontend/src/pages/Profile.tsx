import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Camera,
  Save,
  Trash2,
  Key,
  Bell,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { validation } from '../utils/validation';
import { formatters } from '../utils/formatters';
import { userService } from '../services/userService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

interface ProfileFormData {
  [key: string]: unknown;
  name: string;
  email: string;
}

interface PasswordFormData {
  [key: string]: unknown;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof ProfileFormData, string>> = {};
      
      const nameError = validation.required(values.name, 'Name');
      if (nameError) errors.name = nameError;
      
      const emailError = validation.email(values.email);
      if (emailError) errors.email = emailError;
      
      return errors;
    },
    onSubmit: async (values) => {
      try {
        const updatedProfile = await userService.updateProfile({
          name: values.name,
          email: values.email,
        });
        updateUser(updatedProfile);
        toast.success('Profile updated successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update profile');
      }
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof PasswordFormData, string>> = {};
      
      const currentPasswordError = validation.required(values.currentPassword, 'Current password');
      if (currentPasswordError) errors.currentPassword = currentPasswordError;
      
      const newPasswordError = validation.password(values.newPassword);
      if (newPasswordError) errors.newPassword = newPasswordError;
      
      const confirmPasswordError = validation.confirmPassword(values.newPassword, values.confirmPassword);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
      
      return errors;
    },
    onSubmit: async (values) => {
      try {
        await userService.changePassword({
          current_password: values.currentPassword,
          new_password: values.newPassword,
          confirm_password: values.confirmPassword,
        });
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        passwordForm.resetForm();
      } catch (error: any) {
        toast.error(error.message || 'Failed to change password');
      }
    },
  });

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      toast.success('Account deleted successfully');
      await logout();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const avatarUrl = await userService.uploadAvatar(file);
      updateUser({ ...user, avatar_url: avatarUrl });
      toast.success('Avatar uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card variant="elevated">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {user?.name || user?.email?.split('@')[0] || 'Unknown'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user?.email}
                </p>

                {/* User Info */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3 text-sm">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Role:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user?.created_at ? formatters.date(user.created_at) : 'Unknown'}
                    </span>
                  </div>
                  {user?.last_login && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Last login:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatters.timeAgo(user.last_login)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="space-y-6">
              {/* Basic Information */}
              <Card variant="elevated">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Basic Information
                </h2>
                <form onSubmit={profileForm.handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={profileForm.values.name}
                    onChange={(e) => profileForm.handleChange('name', e.target.value)}
                    onBlur={() => profileForm.handleBlur('name')}
                    error={profileForm.touched.name ? profileForm.errors.name : undefined}
                    leftIcon={<User className="w-5 h-5" />}
                    placeholder="Enter your full name"
                    fullWidth
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={profileForm.values.email}
                    onChange={(e) => profileForm.handleChange('email', e.target.value)}
                    onBlur={() => profileForm.handleBlur('email')}
                    error={profileForm.touched.email ? profileForm.errors.email : undefined}
                    leftIcon={<Mail className="w-5 h-5" />}
                    placeholder="Enter your email"
                    fullWidth
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={profileForm.isSubmitting}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Security Settings */}
              <Card variant="elevated">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Password
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Email Notifications
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive security alerts and updates
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card variant="elevated" className="border-red-200 dark:border-red-800">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-6">
                  Danger Zone
                </h2>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Delete Account
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.values.currentPassword}
            onChange={(e) => passwordForm.handleChange('currentPassword', e.target.value)}
            onBlur={() => passwordForm.handleBlur('currentPassword')}
            error={passwordForm.touched.currentPassword ? passwordForm.errors.currentPassword : undefined}
            placeholder="Enter current password"
            fullWidth
          />

          <Input
            label="New Password"
            type="password"
            value={passwordForm.values.newPassword}
            onChange={(e) => passwordForm.handleChange('newPassword', e.target.value)}
            onBlur={() => passwordForm.handleBlur('newPassword')}
            error={passwordForm.touched.newPassword ? passwordForm.errors.newPassword : undefined}
            placeholder="Enter new password"
            fullWidth
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.values.confirmPassword}
            onChange={(e) => passwordForm.handleChange('confirmPassword', e.target.value)}
            onBlur={() => passwordForm.handleBlur('confirmPassword')}
            error={passwordForm.touched.confirmPassword ? passwordForm.errors.confirmPassword : undefined}
            placeholder="Confirm new password"
            fullWidth
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={passwordForm.isSubmitting}
              fullWidth
            >
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Are you absolutely sure?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This action cannot be undone. This will permanently delete your account 
            and remove all associated data from our servers.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              fullWidth
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;