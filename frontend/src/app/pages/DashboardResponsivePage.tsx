import { useIsMobile } from '../components/ui/use-mobile';
import { useAuthSession } from '../services/authSession';
import { DashboardPage } from './DashboardPage';
import { PortalDashboardPage } from './PortalDashboardPage';
import { MobileDashboard } from './mobile/MobileDashboard';

export function DashboardResponsivePage() {
  const { session } = useAuthSession();
  const isMobile = useIsMobile();

  if (
    session?.user.roleKeys.includes('student') ||
    session?.user.roleKeys.includes('parent')
  ) {
    return <PortalDashboardPage />;
  }

  return isMobile ? <MobileDashboard /> : <DashboardPage />;
}
