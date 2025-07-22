import { useState, useEffect } from 'react';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

/**
 * Custom hook to monitor network connectivity status
 * Simplified implementation - assumes online by default
 * In production, this would use @react-native-community/netinfo
 * @returns Network status information
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  });

  useEffect(() => {
    // Simplified network detection using fetch to a reliable endpoint
    const checkNetworkStatus = async () => {
      try {
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
        });
        
        setNetworkStatus({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        });
      } catch (error) {
        setNetworkStatus({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
        });
      }
    };

    // Check immediately
    checkNetworkStatus();

    // Check periodically
    const interval = setInterval(checkNetworkStatus, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return networkStatus;
};

export default useNetworkStatus;
