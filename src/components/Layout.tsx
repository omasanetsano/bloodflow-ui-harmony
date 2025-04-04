
import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 dark:from-background dark:to-black/20">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="min-h-screen p-6 lg:p-8 pt-24 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
