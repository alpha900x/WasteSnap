import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTheme } from './ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Camera, 
  Map, 
  List, 
  BarChart3, 
  Menu, 
  Moon, 
  Sun, 
  Plus,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Map', href: '/', icon: Map },
    { name: 'Report', href: '/report', icon: Camera },
    { name: 'My Reports', href: '/my-reports', icon: List },
    (user?.role === "admin"
    ? [{ name: 'Admin Dashboard', href: '/admin', icon: BarChart3 }]
    : []),
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Camera className="text-white w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">WasteSnap</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Civic Reporting Platform</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Camera className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">WasteSnap</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Civic Reporting Platform</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                <NavItems />

              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex h-screen lg:h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white dark:bg-slate-800 shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Camera className="text-white w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">WasteSnap</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Civic Reporting Platform</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
            <nav className="p-4 space-y-2 flex-1">
              <NavItems />

            </nav>
           <div className="p-4 text-[11px] text-slate-400 text-center border-t border-slate-200 dark:border-slate-700">
              © {new Date().getFullYear()} WasteSnap  
              <br />
              <span className="opacity-70">Developed by Atharva Solkar</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <Link href="/report">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg lg:hidden z-30"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
