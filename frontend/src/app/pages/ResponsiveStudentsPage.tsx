import { useIsMobile } from '../components/ui/use-mobile';
import { StudentsPage } from './StudentsPage';
import { MobileStudentsPage } from './mobile/MobileStudentsPage';

export function ResponsiveStudentsPage() {
  const isMobile = useIsMobile(1024);

  return isMobile ? <MobileStudentsPage /> : <StudentsPage />;
}
