import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface ActivityContextType {
  activity: ActivityItem[];
  logActivity: (action: string, details?: string) => void;
  deleteActivity: (id: string) => void;
  clearActivity: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const logActivity = (action: string, details?: string) => {
    setActivity((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        action,
        timestamp: new Date().toISOString(),
        details,
      },
      ...prev.slice(0, 19), // keep last 20
    ]);
  };

  const deleteActivity = (id: string) => {
    setActivity((prev) => prev.filter(item => item.id !== id));
  };

  const clearActivity = () => {
    setActivity([]);
  };

  return (
    <ActivityContext.Provider value={{ activity, logActivity, deleteActivity, clearActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}; 