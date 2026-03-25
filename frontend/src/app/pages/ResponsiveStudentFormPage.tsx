import { useEffect, useState } from 'react';
import { StudentFormPage } from './StudentFormPage';
import { MobileStudentFormPage } from './mobile/MobileStudentFormPage';

export function ResponsiveStudentFormPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <MobileStudentFormPage /> : <StudentFormPage />;
}
