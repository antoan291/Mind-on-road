import { useEffect, useState } from 'react';
import { PracticalLessonsPage } from './PracticalLessonsPage';
import { MobilePracticalLessons } from './mobile/MobilePracticalLessons';

export function ResponsivePracticalLessonsPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobilePracticalLessons /> : <PracticalLessonsPage />;
}