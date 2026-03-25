import { useEffect, useState } from 'react';
import { SchedulePage } from './SchedulePage';
import { MobileSchedulePage } from './mobile/MobileSchedulePage';

export function ResponsiveSchedulePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <MobileSchedulePage /> : <SchedulePage />;
}