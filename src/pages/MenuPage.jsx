// src/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOrder } from '@/contexts/OrderContext';
import { Skeleton } from '@/components/ui/skeleton';

const MenuPage = () => {
  const { slug } = useParams();
  const { dispatch } = useOrder();
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((item) => item.slug === slug);
        setUmkm(found);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data:', err);
        setIsLoading(false);
      });
  }, [slug]);

  const addToCart = (menuItem) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: menuItem.id,
        name: menuItem.nama,
        price: menuItem.harga,
        image: menuItem.gambar,
        umkm: umkm.nama,
      },
    });

    // Animasi feedback
    setQuantities((prev) => ({
      ...prev,
      [menuItem.id]: (prev[menuItem.id] || 0) + 1,
    }));

    setTimeout(() => {
      setQuantities((prev) => ({ ...prev, [menuItem.id]: 0 }));
    }, 1000);
  };

  // Skeleton yang lebih detail untuk MenuPage:
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8">
        <div className="container mx-auto max-w-4xl px-3 sm:px-4">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-36 sm:w-48" />
            </div>
          </div>

          {/* Category Filter Skeleton */}
          <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 sm:h-10 w-16 sm:w-20 rounded-full"
              />
            ))}
          </div>

          {/* Menu Items Skeleton */}
          <div className="grid gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex gap-3 sm:gap-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4"
              >
                <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg sm:rounded-xl" />
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <Skeleton className="h-5 sm:h-6 w-3/4" />
                  <Skeleton className="h-3 sm:h-4 w-full" />
                  <Skeleton className="h-3 sm:h-4 w-2/3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    <Skeleton className="h-8 sm:h-10 w-20 sm:w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!umkm || !umkm.menu) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="text-center p-6 sm:p-8 glass-card border border-green-200 dark:border-green-800 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Menu Tidak Tersedia
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
            UMKM ini belum memiliki menu online.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/direktori">Kembali ke Direktori</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const categories = [
    'semua',
    ...new Set(umkm.menu.map((item) => item.kategori)),
  ];

  const filteredItems =
    selectedCategory === 'semua'
      ? umkm.menu
      : umkm.menu.filter((item) => item.kategori === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8">
      <div className="container mx-auto max-w-4xl px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="
                h-8 w-8 sm:h-10 sm:w-10
                border-green-300 text-green-700 
                hover:bg-green-50 hover:text-green-800 
                dark:border-green-700 dark:text-green-300 
                dark:hover:bg-green-900/50 dark:hover:text-green-200
                transition-colors duration-200
            "
          >
            <Link to="/direktori">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
              {umkm.nama}
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                <span>{umkm.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>15-25 min</span>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
                {umkm.rentang_harga}
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all text-xs sm:text-sm flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid gap-4 sm:gap-6">
          {filteredItems.map((menuItem) => (
            <motion.div
              key={menuItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-green-200 dark:border-green-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src={menuItem.gambar}
                  alt={menuItem.nama}
                  className="w-full h-40 sm:w-32 sm:h-32 object-cover"
                />

                <div className="flex-1 p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                        {menuItem.nama}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 line-clamp-2">
                        {menuItem.deskripsi}
                      </p>
                    </div>
                    <div className="text-left sm:text-right sm:ml-4">
                      <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                        Rp {menuItem.harga.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{menuItem.waktuMasak} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 sm:mt-0">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      <span>{menuItem.rating}</span>
                    </div>

                    <motion.div className="flex items-center gap-2">
                      {quantities[menuItem.id] > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                        >
                          +{quantities[menuItem.id]}
                        </motion.span>
                      )}
                      <Button
                        onClick={() => addToCart(menuItem)}
                        className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-8 sm:h-9 text-xs"
                        size="sm"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Tambah
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Tidak ada menu dalam kategori ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
