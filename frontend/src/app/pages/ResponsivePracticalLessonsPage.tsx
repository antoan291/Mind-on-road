import { useIsMobile } from '../components/ui/use-mobile';
import { PracticalLessonsPage } from './PracticalLessonsPage';
import { MobilePracticalLessons } from './mobile/MobilePracticalLessons';

export function ResponsivePracticalLessonsPage() {
  const isMobile = useIsMobile();

  return isMobile ? <MobilePracticalLessons /> : <PracticalLessonsPage />;
}
