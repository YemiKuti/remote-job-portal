
export const checkNetworkStatus = (): boolean => {
  return navigator.onLine;
};

export const waitForNetwork = (timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }

    const handleOnline = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      resolve(true);
    };

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', handleOnline);
      resolve(false);
    }, timeout);

    window.addEventListener('online', handleOnline);
  });
};

export const isSupabaseReachable = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://mmbrvcndxhipaoxysvwr.supabase.co/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYnJ2Y25keGhpcGFveHlzdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzE2NDcsImV4cCI6MjA2MTg0NzY0N30.VWBmdbI7lMzHaaXl6ASJnc2116YnHm0WLHE0bkfW870'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
};
