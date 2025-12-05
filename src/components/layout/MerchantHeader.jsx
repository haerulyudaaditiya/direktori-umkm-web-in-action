// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Store,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  ChefHat,
  Bell,
  ShoppingBag,
  MapPin,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle2,
  Wheat,
  User,
  TrendingUp,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
// eslint-disable-next-line no-unused-vars
import { useAuth } from '@/contexts/AuthContext';
// eslint-disable-next-line no-unused-vars
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';

const MerchantHeader = React.memo(
  ({ myShop, user, loading, onToggleStore }) => {
    const getInitials = (name) => {
      if (!name) return 'M';
      return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    };

    // Tampilkan skeleton jika loading
    if (loading || !myShop) {
      return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-green-200 dark:border-green-800 shadow-lg">
          <div className="container mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-green-200 dark:border-green-800 shadow-lg"
      >
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <Wheat className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-bold text-gray-900 dark:text-white hidden sm:inline">
                  {myShop.nama}
                </span>
                <span className="font-bold text-gray-900 dark:text-white sm:hidden text-sm">
                  {myShop.nama.length > 12
                    ? `${myShop.nama.substring(0, 10)}...`
                    : myShop.nama}
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="pl-2 pr-3 rounded-full h-10 gap-2 border border-transparent hover:bg-green-100/50 dark:hover:bg-green-900/50"
                  >
                    <Avatar className="h-8 w-8 border-2 border-green-200 dark:border-green-800">
                      <AvatarFallback className="bg-green-600 text-white font-bold text-xs">
                        {getInitials(user?.user_metadata?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">
                        {user?.user_metadata?.full_name || 'Merchant'}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Toko: {myShop.status_buka ? 'BUKA' : 'TUTUP'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-semibold">
                      {user?.user_metadata?.full_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      {myShop.nama}
                    </span>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Lihat Toko */}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      to={`/umkm/${myShop.slug}`}
                      target="_blank"
                      className="flex items-center w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Lihat Toko</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Status Toko dengan Switch */}
                  <DropdownMenuItem className="cursor-pointer">
                    <div
                      className="flex items-center justify-between w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onToggleStore) onToggleStore();
                      }}
                    >
                      <div className="flex items-center">
                        <Store className="mr-2 h-4 w-4" />
                        <span>Status Toko</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            myShop.status_buka
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-red-500 hover:bg-red-600'
                          }
                        >
                          {myShop.status_buka ? 'BUKA' : 'TUTUP'}
                        </Badge>
                        <Switch
                          checked={myShop.status_buka}
                          onCheckedChange={onToggleStore}
                          className="data-[state=checked]:bg-green-600 scale-75"
                        />
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Menu Management */}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      to="/merchant/products"
                      className="flex items-center w-full"
                    >
                      <ChefHat className="mr-2 h-4 w-4" />
                      <span>Kelola Menu</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profil</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={() => {
                      // Implement logout logic here
                      console.log('Logout merchant');
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

export default MerchantHeader;
