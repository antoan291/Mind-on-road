import type { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
