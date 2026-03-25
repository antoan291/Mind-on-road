import { useEffect, useState } from 'react';
import { StudentsPage } from './StudentsPage';
import { MobileStudentsPage } from './mobile/MobileStudentsPage';

export function ResponsiveStudentsPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <MobileStudentsPage /> : <StudentsPage />;
}
