import { useIsMobile } from '../components/ui/use-mobile';
import { useAuthSession } from '../services/authSession';
import { StudentDetailPage } from './StudentDetailPage';
import { StudentPortalProfilePage } from './StudentPortalProfilePage';
import { MobileStudentProfile } from './mobile/MobileStudentProfile';

export function ResponsiveStudentDetailPage() {
  const { session } = useAuthSession();
  const isStudentPortal = Boolean(session?.user.roleKeys.includes('student'));
  const isMobile = useIsMobile();

  if (isStudentPortal) {
    return <StudentPortalProfilePage />;
  }

  return isMobile ? <MobileStudentProfile /> : <StudentDetailPage />;
}
