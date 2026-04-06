import { useIsMobile } from '../components/ui/use-mobile';
import { SchedulePage } from './SchedulePage';
import { MobileSchedulePage } from './mobile/MobileSchedulePage';

export function ResponsiveSchedulePage() {
  const isMobile = useIsMobile(1024);

  return isMobile ? <MobileSchedulePage /> : <SchedulePage />;
}
