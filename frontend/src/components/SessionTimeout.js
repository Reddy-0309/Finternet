import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

function SessionTimeout({ timeoutMinutes = 15, warningMinutes = 1 }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const activityTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const countdownInterval = useRef(null);

  const resetTimeout = () => {
    // Clear existing timeouts
    if (activityTimeout.current) clearTimeout(activityTimeout.current);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    
    // Hide warning if it's showing
    if (showWarning) {
      setShowWarning(false);
      setCountdown(60);
    }
    
    // Only set new timeouts if user is logged in
    if (user) {
      // Set timeout for warning
      const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
      warningTimeout.current = setTimeout(() => {
        setShowWarning(true);
        startCountdown();
      }, warningTime);
      
      // Set timeout for logout
      const logoutTime = timeoutMinutes * 60 * 1000;
      activityTimeout.current = setTimeout(() => {
        handleLogout(true);
      }, logoutTime);
    }
  };

  const startCountdown = () => {
    setCountdown(warningMinutes * 60);
    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogout = (isAutomatic = false) => {
    // Clear all timeouts and intervals
    if (activityTimeout.current) clearTimeout(activityTimeout.current);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    
    // Hide warning
    setShowWarning(false);
    
    // Dispatch logout action
    dispatch(logout());
    
    // Show toast notification
    if (isAutomatic) {
      toast.info('You have been logged out due to inactivity');
    }
  };

  const handleContinueSession = () => {
    resetTimeout();
  };

  // Set up event listeners for user activity
  useEffect(() => {
    if (!user) return;
    
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      resetTimeout();
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Initial timeout setup
    resetTimeout();
    
    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [user]);

  if (!showWarning || !user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Session Timeout Warning</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your session is about to expire due to inactivity. You will be automatically logged out in <span className="font-bold text-red-600 dark:text-red-400">{countdown}</span> seconds.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={handleContinueSession}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionTimeout;
