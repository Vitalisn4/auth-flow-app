import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { validation } from '../utils/validation';
import { RegisterRequest } from '../types/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PasswordStrength from '../components/ui/PasswordStrength';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<RegisterRequest>({
    initialValues: {
      email: '',
      password: '',
      confirm_password: '',
      agree_to_terms: false,
    },
    validate: (values) => {
      const errors: Partial<Record<keyof RegisterRequest, string>> = {};
      
      const emailError = validation.email(values.email);
      if (emailError) errors.email = emailError;
      
      const passwordError = validation.password(values.password);
      if (passwordError) errors.password = passwordError;
      
      const confirmPasswordError = validation.confirmPassword(values.password, values.confirm_password);
      if (confirmPasswordError) errors.confirm_password = confirmPasswordError;
      
      if (!values.agree_to_terms) {
        errors.agree_to_terms = 'You must agree to the terms and conditions';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      try {
        await register({
          email: values.email,
          password: values.password,
          confirm_password: values.confirm_password,
          agree_to_terms: values.agree_to_terms,
        });
        navigate('/dashboard');
      } catch {
        // Error is handled by the auth context
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Gradient */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-600 via-primary-600 to-accent-600">
          {/* Animated Background Elements */}
          <motion.div
            className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-56 h-56 bg-white/5 rounded-full blur-2xl"
            animate={{
              x: [0, -60, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center p-12">
            <div className="text-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <CheckCircle className="w-24 h-24 mx-auto mb-8 opacity-80" />
                <h3 className="text-3xl font-bold mb-4">
                  Join Our Community
                </h3>
                <p className="text-xl text-white/80 max-w-md">
                  Create your account and start building amazing applications 
                  with our secure authentication platform.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                AuthFlow
              </span>
            </Link>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create your account
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Get started with your free account today
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email address"
                type="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : undefined}
                leftIcon={<Mail className="w-5 h-5" />}
                placeholder="Enter your email"
                fullWidth
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  error={touched.password ? errors.password : undefined}
                  leftIcon={<Lock className="w-5 h-5" />}
                  placeholder="Create a strong password"
                  fullWidth
                  required
                />
                <PasswordStrength password={values.password} />
              </div>

              <Input
                label="Confirm password"
                type="password"
                value={values.confirm_password}
                onChange={(e) => handleChange('confirm_password', e.target.value)}
                onBlur={() => handleBlur('confirm_password')}
                error={touched.confirm_password ? errors.confirm_password : undefined}
                leftIcon={<Lock className="w-5 h-5" />}
                placeholder="Confirm your password"
                fullWidth
                required
              />

              <div>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={values.agree_to_terms}
                    onChange={(e) => handleChange('agree_to_terms', e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {touched.agree_to_terms && errors.agree_to_terms && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.agree_to_terms}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Create account
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;