import { useEffect, useState } from 'react';
import { useAuthSession } from '../services/authSession';
import { DashboardPage } from './DashboardPage';
import { PortalDashboardPage } from './PortalDashboardPage';
import { MobileDashboard } from './mobile/MobileDashboard';

export function DashboardResponsivePage() {
  const { session } = useAuthSession();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (
    session?.user.roleKeys.includes('student') ||
    session?.user.roleKeys.includes('parent')
  ) {
    return <PortalDashboardPage />;
  }

  return isMobile ? <MobileDashboard /> : <DashboardPage />;
}
