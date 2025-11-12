import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getUMKMType, hasMenu, hasLayanan, hasProduk } from '@/utils/umkmTypes';
import FoodSection from '@/components/umkm/FoodSection';
import ServiceSection from '@/components/umkm/ServiceSection';
import RetailSection from '@/components/umkm/RetailSection';

const MenuPage = () => {
  const { slug } = useParams();
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8">
        <div className="container mx-auto max-w-4xl px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-36 sm:w-48" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2"
          >
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 sm:h-10 w-16 sm:w-20 rounded-full"
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 sm:gap-6"
          >
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
          </motion.div>
        </div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="text-center p-6 sm:p-8 glass-card border border-green-200 dark:border-green-800 w-full max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              UMKM Tidak Ditemukan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              UMKM yang Anda cari tidak ditemukan.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/direktori">Kembali ke Direktori</Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const umkmType = getUMKMType(umkm.kategori);
  const hasData = hasMenu(umkm) || hasLayanan(umkm) || hasProduk(umkm);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8">
      <div className="container mx-auto max-w-4xl px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <Button
            asChild
            variant="outline"
            size="icon"
            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300"
          >
            <Link to={`/umkm/${slug}`}>
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate"
            >
              {umkm.nama}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 flex-wrap"
            >
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                <span>{umkm.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{umkm.jam_buka.split(': ')[1]}</span>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
                {umkm.rentang_harga}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {umkmType === 'food' && hasMenu(umkm) && (
          <FoodSection menu={umkm.menu} umkm={umkm} />
        )}

        {umkmType === 'service' && hasLayanan(umkm) && (
          <ServiceSection layanan={umkm.layanan} umkm={umkm} />
        )}

        {umkmType === 'retail' && hasProduk(umkm) && (
          <RetailSection produk={umkm.produk} umkm={umkm} />
        )}

        {!hasData && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Informasi pemesanan belum tersedia untuk {umkm.nama}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
