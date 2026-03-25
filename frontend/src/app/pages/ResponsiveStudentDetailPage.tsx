import { useEffect, useState } from 'react';
import { StudentDetailPage } from './StudentDetailPage';
import { MobileStudentProfile } from './mobile/MobileStudentProfile';

export function ResponsiveStudentDetailPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileStudentProfile /> : <StudentDetailPage />;
}