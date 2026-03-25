import { useEffect, useState } from 'react';
import { TheoryPage } from './TheoryPage';
import { MobileTheoryAttendance } from './mobile/MobileTheoryAttendance';

export function ResponsiveTheoryPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileTheoryAttendance /> : <TheoryPage />;
}
