
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';
import { Hospital } from '@/utils/auth';

interface LayoutProps {
  children: ReactNode;
  hospital: Hospital | null;
}

export default function Layout({ children, hospital }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 dark:from-background dark:to-black/20 transition-colors duration-500">
      <Sidebar hospital={hospital} />
      <div className="lg:pl-64">
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-20 backdrop-blur-md bg-background/80 border-b border-border flex items-center px-6 transition-all animate-fade-in">
          <div className="w-full flex justify-between items-center">
            <div className="lg:hidden">
              <Logo size="sm" appNameOnly={true} />
              {hospital && (
                <span className="ml-2 font-medium text-sm text-muted-foreground">
                  {hospital.name}
                </span>
              )}
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="min-h-screen p-6 lg:p-8 pt-24 lg:pt-24 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
