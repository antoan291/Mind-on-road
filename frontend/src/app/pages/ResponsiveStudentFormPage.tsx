import { useIsMobile } from '../components/ui/use-mobile';
import { StudentFormPage } from './StudentFormPage';
import { MobileStudentFormPage } from './mobile/MobileStudentFormPage';

export function ResponsiveStudentFormPage() {
  const isMobile = useIsMobile(1024);

  return isMobile ? <MobileStudentFormPage /> : <StudentFormPage />;
}
