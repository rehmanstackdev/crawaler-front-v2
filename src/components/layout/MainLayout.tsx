import { ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  showSearch?: boolean;
}

export function MainLayout({ children, showSearch = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={showSearch} />
      <main>{children}</main>
    </div>
  );
}
