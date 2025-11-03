// src/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Plus, Minus } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Category Filter Skeleton */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-full" />
            ))}
          </div>

          {/* Menu Items Skeleton */}
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 bg-white rounded-2xl p-4">
                <Skeleton className="w-32 h-32 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Menu Tidak Tersedia</h2>
          <p className="text-gray-600 mb-6">
            UMKM ini belum memiliki menu online.
          </p>
          <Button asChild>
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="icon">
            <Link to="/direktori">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{umkm.nama}</h1>
            <div className="flex items-center gap-4 text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{umkm.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>15-25 min</span>
              </div>
              <span className="text-green-600 font-semibold">
                {umkm.rentang_harga}
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid gap-6">
          {filteredItems.map((menuItem) => (
            <motion.div
              key={menuItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-xl transition-all"
            >
              <div className="flex">
                <img
                  src={menuItem.gambar}
                  alt={menuItem.nama}
                  className="w-32 h-32 object-cover"
                />

                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {menuItem.nama}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {menuItem.deskripsi}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-green-600">
                        Rp {menuItem.harga.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{menuItem.waktuMasak} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{menuItem.rating}</span>
                    </div>

                    <motion.div className="flex items-center gap-2">
                      {quantities[menuItem.id] > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold"
                        >
                          +{quantities[menuItem.id]}
                        </motion.span>
                      )}
                      <Button
                        onClick={() => addToCart(menuItem)}
                        className="bg-green-500 hover:bg-green-600"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
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
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada menu dalam kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
