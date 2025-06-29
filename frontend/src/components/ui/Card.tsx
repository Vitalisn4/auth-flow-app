import React, { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    glass: 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-xl',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const classes = clsx(
    'rounded-xl transition-all duration-200',
    variants[variant],
    paddings[padding],
    hover && 'hover:shadow-lg hover:scale-[1.02]',
    className
  );

  const MotionComponent = hover ? motion.div : 'div';

  return (
    <MotionComponent
      className={classes}
      {...(hover && {
        whileHover: { y: -2 },
        transition: { duration: 0.2 },
      })}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export default Card;