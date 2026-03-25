import { useEffect, useState } from 'react';
import { NotificationsPage } from './OtherPages';
import { MobileNotifications } from './mobile/MobileNotifications';

export function ResponsiveNotificationsPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileNotifications /> : <NotificationsPage />;
}