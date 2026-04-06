import { useIsMobile } from '../components/ui/use-mobile';
import { TheoryPage } from './TheoryPage';
import { MobileTheoryAttendance } from './mobile/MobileTheoryAttendance';

export function ResponsiveTheoryPage() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileTheoryAttendance /> : <TheoryPage />;
}
