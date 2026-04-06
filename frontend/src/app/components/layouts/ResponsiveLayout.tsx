import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { ForcePasswordChangeScreen } from '../ForcePasswordChangeScreen';
import { AppLayout } from './AppLayout';
import { MobileLayout } from './MobileLayout';
import { useAuthSession } from '../../services/authSession';
import { StudentPortalProfilePage } from '../../pages/StudentPortalProfilePage';

export function ResponsiveLayout() {
  const { authState, session } = useAuthSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (authState === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg-page)', color: 'var(--text-secondary)' }}
      >
        Зареждане на сесията...
      </div>
    );
  }

  if (authState === 'anonymous') {
    return <Navigate to="/login" replace />;
  }

  if (session?.mustChangePassword) {
    return <ForcePasswordChangeScreen />;
  }

  if (session?.user.roleKeys.includes('student')) {
    return <StudentPortalProfilePage />;
  }

  return isMobile ? <MobileLayout /> : <AppLayout />;
}
