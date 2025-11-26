import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getUMKMType } from '@/utils/umkmTypes';
import FoodSection from '@/components/umkm/FoodSection';
import ServiceSection from '@/components/umkm/ServiceSection';
import RetailSection from '@/components/umkm/RetailSection';
import { supabase } from '@/lib/supabaseClient';

const MenuPage = () => {
  const { slug } = useParams();
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUMKMAndMenu = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch UMKM Data + Products (Join)
        // We use the slug to find the UMKM, and load related products
        const { data: umkmData, error: umkmError } = await supabase
          .from('umkms')
          .select('*, products(*)')
          .eq('slug', slug)
          .single();

        if (umkmError) throw umkmError;

        if (umkmData) {
          // 2. Transformation Logic
          // Mapping flat product list to structure expected by UI Components
          const products = umkmData.products || [];

          const formattedData = {
            ...umkmData,
            // Food Section Logic
            menu: products.filter(
              (p) =>
                p.kategori_produk === 'makanan' ||
                p.kategori_produk === 'minuman' ||
                p.kategori_produk === 'tambahan' ||
                p.kategori_produk === 'paket'
            ),
            // Service Section Logic
            layanan: products.filter((p) => p.kategori_produk === 'jasa'),
            // Retail Section Logic
            produk: products.filter(
              (p) =>
                p.kategori_produk === 'retail' ||
                p.kategori_produk === 'umum' ||
                !p.kategori_produk // Fallback for undefined
            ),
          };

          setUmkm(formattedData);
        }
      } catch (error) {
        console.error('Error fetching menu data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUMKMAndMenu();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8">
        <div className="container mx-auto max-w-4xl px-3 sm:px-4">
          {/* Skeleton Loaders */}
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
          <motion.div className="grid gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
            <Button asChild className="w-full sm:w-auto">
              <Link to="/direktori">Kembali ke Direktori</Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const umkmType = getUMKMType(umkm.kategori);

  // Logic to determine if we have content to show
  const hasFood = umkm.menu && umkm.menu.length > 0;
  const hasService = umkm.layanan && umkm.layanan.length > 0;
  const hasRetail = umkm.produk && umkm.produk.length > 0;

  const hasData = hasFood || hasService || hasRetail;

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
                <span>
                  {umkm.jam_buka
                    ? umkm.jam_buka.split(':')[0] +
                      ':' +
                      umkm.jam_buka.split(':')[1]
                    : 'Open'}
                </span>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
                {umkm.rentang_harga}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Render sections based on data availability and category */}

        {/* Priority 1: Food Category */}
        {(umkmType === 'food' || hasFood) && hasFood && (
          <FoodSection menu={umkm.menu} umkm={umkm} />
        )}

        {/* Priority 2: Service Category */}
        {(umkmType === 'service' || hasService) && hasService && (
          <ServiceSection layanan={umkm.layanan} umkm={umkm} />
        )}

        {/* Priority 3: Retail Category */}
        {(umkmType === 'retail' || hasRetail) && hasRetail && (
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
