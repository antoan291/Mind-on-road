import { useAuthSession } from '../services/authSession';
import { DashboardPage } from './DashboardPage';
import { PortalDashboardPage } from './PortalDashboardPage';

export function DashboardResponsivePage() {
  const { session } = useAuthSession();

  if (
    session?.user.roleKeys.includes('student') ||
    session?.user.roleKeys.includes('parent')
  ) {
    return <PortalDashboardPage />;
  }

  return <DashboardPage />;
}
