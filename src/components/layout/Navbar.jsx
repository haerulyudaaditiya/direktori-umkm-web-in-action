import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

function Navbar() {
  return (
    // Header 'sticky' profesional dengan efek 'blur'
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo/Judul Aplikasi */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-lg font-serif">Kantong Aman</span>
        </Link>

        {/* Navigasi Utama */}
        <nav className="flex flex-1 items-center space-x-1">
          <Button variant="ghost" asChild>
            <Link
              to="/direktori"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Direktori
            </Link>
          </Button>
          {/* Link navigasi lain bisa ditambahkan di sini */}
        </nav>

        {/* Aksi Sisi Kanan (Saklar Tema) */}
        <div className="flex items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
