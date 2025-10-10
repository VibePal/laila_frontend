import { useEffect } from 'react';
import { updateActivity } from '@/lib/dataService';

export const useActivityTracker = () => {
  useEffect(() => {
    // List of events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Function to handle activity
    const handleActivity = () => {
      updateActivity();
    };

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function to remove event listeners
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);
};
