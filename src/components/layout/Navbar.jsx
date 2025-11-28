import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Store,
  Menu,
  Wheat,
  User,
  LogOut,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';
// --- INTEGRASI AUTH ---
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth(); // Mengambil data user

  const navItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Direktori', path: '/direktori' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Helper: Inisial Nama
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-100 dark:border-green-800 bg-gradient-to-r from-green-50/90 via-amber-50/90 to-green-100/90 dark:from-green-950/90 dark:via-amber-900/80 dark:to-green-950/90 backdrop-blur-md shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        {/* Logo + Brand dengan tema Karawang */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Wheat className="h-6 w-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
            KarawangMart
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

          {/* --- AREA LOGIC AUTH DESKTOP --- */}
          {user ? (
            // SUDAH LOGIN: Tampilkan Avatar & Dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="pl-2 pr-3 rounded-full h-10 gap-2 border border-transparent hover:bg-green-100/50 dark:hover:bg-green-900/50"
                >
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-green-600 text-white font-bold text-xs">
                      {getInitials(user.user_metadata?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">
                      {user.user_metadata?.full_name || 'Pengguna'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/history" className="flex items-center w-full">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Pesanan Saya</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // BELUM LOGIN: Tampilkan Tombol Masuk/Daftar
            <div className="hidden md:flex gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-stone-700 dark:text-stone-200 font-semibold hover:text-green-700 hover:bg-green-100/50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200"
              >
                <Link to="/auth">Masuk</Link>
              </Button>
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white shadow-md border border-green-500 font-medium"
              >
                <Link to="/auth" state={{ isRegister: true }}>
                  Daftar
                </Link>
              </Button>
            </div>
          )}

          {/* Menu Hamburger Mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 p-0 flex flex-col h-full"
              >
                {/* Logo di dalam Menu Mobile */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50/50 to-amber-50/50 dark:from-green-900/20 dark:to-amber-900/20">
                  <Link to="/" className="flex items-center space-x-2">
                    <Wheat className="h-6 w-6 text-green-600" />
                    <span className="font-bold text-xl">KarawangMart</span>
                  </Link>
                </div>

                {/* Navigasi di dalam Menu Mobile */}
                <nav className="flex flex-col gap-1 p-4 flex-1">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        to={item.path}
                        className={`text-lg font-medium rounded-lg px-3 py-3 transition-all flex items-center gap-3 ${
                          location.pathname === item.path
                            ? 'text-green-700 bg-green-100 border border-green-300 dark:bg-green-900 dark:border-green-600 dark:text-green-400'
                            : 'text-muted-foreground hover:text-green-700 hover:bg-green-100/50 dark:hover:bg-green-900/50 dark:hover:text-green-400'
                        }`}
                      >
                        {/* Icon Logic */}
                        {item.name === 'Beranda' ? (
                          <Wheat className="h-5 w-5" />
                        ) : (
                          <Store className="h-5 w-5" />
                        )}
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* --- AREA LOGIC AUTH MOBILE (Bottom) --- */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80">
                  {user ? (
                    // MOBILE: SUDAH LOGIN
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-10 w-10 border border-green-200">
                          <AvatarFallback className="bg-green-600 text-white font-bold">
                            {getInitials(user.user_metadata?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-sm line-clamp-1">
                            {user.user_metadata?.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate w-32">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:bg-red-50 border-red-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Keluar
                      </Button>
                    </div>
                  ) : (
                    // MOBILE: BELUM LOGIN
                    <div className="grid grid-cols-2 gap-3">
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          asChild
                          className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30"
                        >
                          <Link to="/auth">Masuk</Link>
                        </Button>
                      </SheetClose>

                      <SheetClose asChild>
                        <Button
                          asChild
                          className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        >
                          <Link to="/auth">Daftar</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>

                {/* Badge Karawang di mobile */}
                <div className="mt-2 px-4 pb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-amber-500/10 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300 text-center font-medium">
                      Platform UMKM Karawang
                    </p>
                  </div>
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
