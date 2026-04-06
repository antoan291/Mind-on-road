import { useIsMobile } from '../components/ui/use-mobile';
import { DocumentsPage } from './DocumentsPage';
import { MobileDocuments } from './mobile/MobileDocuments';

export function ResponsiveDocumentsPage() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileDocuments /> : <DocumentsPage />;
}
