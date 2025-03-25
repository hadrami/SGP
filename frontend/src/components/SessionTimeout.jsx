// src/components/SessionTimeout.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

const SessionTimeout = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (!token) return;
    
    let timeoutId;
    let lastActivity = Date.now();
    
    // Function to handle user activity
    const resetTimer = () => {
      lastActivity = Date.now();
    };
    
    // Function to check for inactivity
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        console.log('Session timeout: User inactive for', SESSION_TIMEOUT / 60000, 'minutes');
        dispatch(logout());
      }
    };
    
    // Setup activity listeners
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('touchmove', resetTimer);
    window.addEventListener('scroll', resetTimer);
    
    // Start the inactivity check interval
    const intervalId = setInterval(checkInactivity, 60000); // Check every minute
    
    // Setup logout on window close/refresh
    const handleBeforeUnload = () => {
      // This doesn't actually work for logging out on tab close due to browser restrictions,
      // but we'll keep it here in case we want to add a warning message
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // Clean up
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('touchmove', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [token, dispatch]);
  
  return null; // This component doesn't render anything
};

export default SessionTimeout;