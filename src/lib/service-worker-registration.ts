// Service worker registration for offline map functionality

/**
 * Register the service worker for offline capabilities.
 * The service worker will automatically cache all US map tiles on installation.
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registration successful with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  } else {
    console.warn('Service workers are not supported in this browser');
  }
  return null;
}; 