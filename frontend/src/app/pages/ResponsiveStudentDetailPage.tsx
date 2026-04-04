import { useEffect, useState } from 'react';
import { useAuthSession } from '../services/authSession';
import { StudentDetailPage } from './StudentDetailPage';
import { StudentPortalProfilePage } from './StudentPortalProfilePage';
import { MobileStudentProfile } from './mobile/MobileStudentProfile';

export function ResponsiveStudentDetailPage() {
  const { session } = useAuthSession();
  const isStudentPortal = Boolean(session?.user.roleKeys.includes('student'));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isStudentPortal) {
    return <StudentPortalProfilePage />;
  }

  return isMobile ? <MobileStudentProfile /> : <StudentDetailPage />;
}
