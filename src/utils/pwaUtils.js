// PWA Utility Functions
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                showUpdateNotification();
              }
            });
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export const showUpdateNotification = () => {
  if (window.confirm('New version available! Click OK to update.')) {
    window.location.reload();
  }
};

export const isPWAInstalled = () => {
  // Check if running as PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check for iOS
  if (window.navigator.standalone === true) {
    return true;
  }
  
  return false;
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export const canInstallPWA = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/Sai-removebg-preview.png',
      badge: '/Sai-removebg-preview.png',
      ...options
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  }
};

export const addToHomeScreen = () => {
  // This function can be called to trigger the install prompt
  // The actual implementation is handled by the PWAInstallPrompt component
  console.log('Add to home screen requested');
};

export const getPWAStatus = () => {
  return {
    isInstalled: isPWAInstalled(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    canInstall: canInstallPWA(),
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushSupport: 'PushManager' in window,
    hasNotificationSupport: 'Notification' in window
  };
};
