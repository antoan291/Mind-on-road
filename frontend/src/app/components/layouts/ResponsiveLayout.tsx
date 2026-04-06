import { Navigate } from 'react-router';
import { ForcePasswordChangeScreen } from '../ForcePasswordChangeScreen';
import { AppLayout } from './AppLayout';
import { MobileLayout } from './MobileLayout';
import { useAuthSession } from '../../services/authSession';
import { StudentPortalProfilePage } from '../../pages/StudentPortalProfilePage';
import { useIsMobile } from '../ui/use-mobile';

export function ResponsiveLayout() {
  const { authState, session } = useAuthSession();
  const isMobile = useIsMobile(1024);

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
