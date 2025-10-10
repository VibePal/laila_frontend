import { useEffect } from 'react';
import { checkAuthStatus, startTokenRefreshTimer, updateActivity } from '@/lib/dataService';

const AuthInitializer = () => {
  useEffect(() => {
    // Check if user is already authenticated when app starts
    const isAuthenticated = checkAuthStatus();
    
    if (isAuthenticated) {
      console.log('🔄 User already authenticated, starting token refresh timer...');
      startTokenRefreshTimer();
      updateActivity();
    }
  }, []);

  return null; // This component doesn't render anything
};

export default AuthInitializer;
