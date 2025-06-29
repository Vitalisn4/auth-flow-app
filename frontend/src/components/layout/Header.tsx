import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Clock,
  Shield
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSessionTimer } from '../../hooks/useSessionTimer';
import { formatters } from '../../utils/formatters';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout, sessionExpiry } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const { timeLeft, isWarning, extendSession } = useSessionTimer(
    sessionExpiry,
    () => setShowSessionModal(true),
    () => logout()
  );

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const handleExtendSession = () => {
    extendSession();
    setShowSessionModal(false);
  };

  const isLandingPage = location.pathname === '/';

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isLandingPage 
            ? 'bg-transparent backdrop-blur-sm' 
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-5 h-5 text-white" />
              </motion.div>
              <span className={`text-xl font-bold ${
                isLandingPage ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                AuthFlow
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={isLandingPage ? 'text-white hover:bg-white/10' : ''}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/dashboard' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Dashboard</Link>
                  <Link to="/profile" className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/profile' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Profile</Link>
                  <Link to="/settings" className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/settings' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Settings</Link>
                </>
              )}

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center space-x-2 ${
                    isLandingPage ? 'text-white hover:bg-white/10' : ''
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name || user?.email}</span>
                </Button>

                {isMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={isLandingPage ? 'text-white hover:bg-white/10' : ''}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-200/20 dark:border-gray-700/20 py-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className={`justify-start ${isLandingPage ? 'text-white hover:bg-white/10' : ''}`}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark mode
                    </>
                  )}
                </Button>

                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className={`w-full justify-start ${location.pathname === '/dashboard' ? 'bg-primary-600 text-white' : ''}`}>Dashboard</Button>
                    </Link>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className={`w-full justify-start ${location.pathname === '/profile' ? 'bg-primary-600 text-white' : ''}`}>Profile</Button>
                    </Link>
                    <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className={`w-full justify-start ${location.pathname === '/settings' ? 'bg-primary-600 text-white' : ''}`}>Settings</Button>
                    </Link>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={`justify-start text-red-600 dark:text-red-400 ${isLandingPage ? 'hover:bg-white/10' : ''}`}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Session Warning Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Session Expiring Soon"
        size="sm"
        closeOnOverlayClick={false}
      >
        <div className="text-center">
          <div className="mb-4">
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Your session will expire in{' '}
              <span className="font-semibold text-yellow-600">
                {formatters.duration(timeLeft)}
              </span>
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowSessionModal(false)}
              fullWidth
            >
              Continue
            </Button>
            <Button
              variant="primary"
              onClick={handleExtendSession}
              fullWidth
            >
              Extend Session
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;