import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Store, Menu, Wheat } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Direktori', path: '/direktori' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-100 dark:border-green-800 bg-gradient-to-r from-green-50/90 via-amber-50/90 to-green-100/90 dark:from-green-950/90 dark:via-amber-900/80 dark:to-green-950/90 backdrop-blur-md shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        {/* Logo + Brand dengan tema Karawang */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Wheat className="h-6 w-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
            <Store className="h-3 w-3 text-amber-600 dark:text-amber-400 absolute -bottom-1 -right-1" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
            KantongAman
          </span>
          <span className="text-xs text-green-500 font-medium bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
            Karawang
          </span>
        </Link>

        {/* Navigasi Utama (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className={`text-sm font-medium rounded-lg px-3 py-2 transition-all ${
                location.pathname === item.path
                  ? 'text-green-700 bg-green-100 border border-green-300 dark:bg-green-900 dark:border-green-600 dark:text-green-400'
                  : 'text-muted-foreground hover:text-green-700 hover:bg-green-100/50 dark:hover:bg-green-900/50 dark:hover:text-green-400'
              }`}
            >
              <Link to={item.path}>{item.name}</Link>
            </Button>
          ))}
        </nav>

        {/* Aksi kanan */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Menu Hamburger Mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                {/* Logo di dalam Menu Mobile */}
                <Link to="/" className="flex items-center space-x-2 mb-6">
                  <div className="relative">
                    <Wheat className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <Store className="h-3 w-3 text-amber-600 dark:text-amber-400 absolute -bottom-1 -right-1" />
                  </div>
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
                    KantongAman
                  </span>
                </Link>

                {/* Navigasi di dalam Menu Mobile */}
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        to={item.path}
                        className={`text-lg font-medium rounded-lg px-3 py-3 transition-all ${
                          location.pathname === item.path
                            ? 'text-green-700 bg-green-100 border border-green-300 dark:bg-green-900 dark:border-green-600 dark:text-green-400'
                            : 'text-muted-foreground hover:text-green-700 hover:bg-green-100/50 dark:hover:bg-green-900/50 dark:hover:text-green-400'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* Badge Karawang di mobile */}
                <div className="mt-6 p-3 bg-gradient-to-r from-green-500/10 to-amber-500/10 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300 text-center">
                    Platform UMKM Lumbung Padi Karawang
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
