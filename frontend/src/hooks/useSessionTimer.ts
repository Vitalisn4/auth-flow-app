import { useState, useEffect, useCallback, useRef } from 'react';
import { AUTH_CONFIG } from '../constants/config';

interface UseSessionTimerReturn {
  timeLeft: number;
  isWarning: boolean;
  isExpired: boolean;
  resetTimer: () => void;
  extendSession: () => void;
}

export function useSessionTimer(
  sessionExpiry: number | null,
  onWarning?: () => void,
  onExpired?: () => void
): UseSessionTimerReturn {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  const warningTriggered = useRef(false);
  const expiredTriggered = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const calculateTimeLeft = useCallback(() => {
    if (!sessionExpiry) return 0;
    const now = Date.now();
    const remaining = Math.max(0, sessionExpiry - now);
    return Math.floor(remaining / 1000); // Convert to seconds
  }, [sessionExpiry]);

  const resetTimer = useCallback(() => {
    setTimeLeft(AUTH_CONFIG.SESSION_DURATION / 1000);
    setIsWarning(false);
    setIsExpired(false);
    warningTriggered.current = false;
    expiredTriggered.current = false;
  }, []);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!sessionExpiry) {
      setTimeLeft(0);
      setIsWarning(false);
      setIsExpired(false);
      return;
    }

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Check for warning state
      const warningThreshold = AUTH_CONFIG.WARNING_TIME / 1000;
      if (remaining <= warningThreshold && remaining > 0 && !warningTriggered.current) {
        setIsWarning(true);
        warningTriggered.current = true;
        onWarning?.();
      }

      // Check for expiration
      if (remaining <= 0 && !expiredTriggered.current) {
        setIsExpired(true);
        expiredTriggered.current = true;
        onExpired?.();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    // Initial update
    updateTimer();

    // Set up interval
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionExpiry, calculateTimeLeft, onWarning, onExpired]);

  return {
    timeLeft,
    isWarning,
    isExpired,
    resetTimer,
    extendSession,
  };
}