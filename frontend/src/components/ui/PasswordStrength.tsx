import React from 'react';
import { motion } from 'framer-motion';
import { getPasswordStrength } from '../../utils/validation';

interface PasswordStrengthProps {
  password: string;
  show?: boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  show = true,
}) => {
  if (!show || !password) return null;

  const { score, label, color } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Password strength
        </span>
        <span className={`text-xs font-medium ${
          score <= 1 ? 'text-red-600' :
          score <= 2 ? 'text-yellow-600' :
          score <= 3 ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {label}
        </span>
      </div>
      
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            className={`h-1 flex-1 rounded-full ${
              index < score ? color : 'bg-gray-200 dark:bg-gray-700'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: index < score ? 1 : 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;