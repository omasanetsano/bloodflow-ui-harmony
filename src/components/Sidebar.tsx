
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DropletIcon, 
  UsersIcon, 
  ClipboardListIcon, 
  ArchiveIcon,
  HomeIcon, 
  Settings2Icon,
  MenuIcon,
  XIcon,
  LogOutIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { APP_NAME } from '@/lib/constants';
import { logout } from '@/utils/auth';
import { toast } from 'sonner';

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: <HomeIcon className="w-5 h-5" /> },
  { name: 'Donors', path: '/donors', icon: <UsersIcon className="w-5 h-5" /> },
  { name: 'Blood Collection', path: '/collection', icon: <DropletIcon className="w-5 h-5" /> },
  { name: 'Blood Requests', path: '/requests', icon: <ClipboardListIcon className="w-5 h-5" /> },
  { name: 'Inventory', path: '/inventory', icon: <ArchiveIcon className="w-5 h-5" /> },
  { name: 'Settings', path: '/settings', icon: <Settings2Icon className="w-5 h-5" /> },
];

export default function Sidebar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-30 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          aria-label="Toggle menu"
          className="bg-background"
        >
          {isMobileNavOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col h-screen w-64 bg-card border-r border-border fixed inset-y-0 left-0 z-20">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <span className="font-bold text-xl text-foreground">{APP_NAME}</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-bloodRed-50 text-bloodRed-600 dark:bg-bloodRed-900/20 dark:text-bloodRed-400"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className={cn(
                "mr-3",
                location.pathname === item.path ? "text-bloodRed-500 dark:text-bloodRed-400" : "text-muted-foreground"
              )}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full w-8 h-8 bg-muted flex items-center justify-center text-muted-foreground">
                A
              </div>
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@bloodbank.org</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 justify-center mt-1"
            >
              <LogOutIcon className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden transition-opacity",
        isMobileNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 left-0 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <Logo size="md" />
              <span className="font-bold text-xl text-foreground">{APP_NAME}</span>
            </div>
          </div>
          
          <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-bloodRed-50 text-bloodRed-600 dark:bg-bloodRed-900/20 dark:text-bloodRed-400"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <span className={cn(
                  "mr-3",
                  location.pathname === item.path ? "text-bloodRed-500 dark:text-bloodRed-400" : "text-muted-foreground"
                )}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="p-4 border-t border-border">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full w-8 h-8 bg-muted flex items-center justify-center text-muted-foreground">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@bloodbank.org</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 justify-center mt-1"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
