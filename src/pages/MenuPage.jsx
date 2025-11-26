import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Plus, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getUMKMType } from '@/utils/umkmTypes';
import FoodSection from '@/components/umkm/FoodSection';
import ServiceSection from '@/components/umkm/ServiceSection';
import RetailSection from '@/components/umkm/RetailSection';
import { supabase } from '@/lib/supabaseClient';
import {
  SERVICE_KEYWORDS,
  RETAIL_KEYWORDS,
  checkCategoryMatch,
} from '@/utils/categoryConstants';

const MenuPage = () => {
  const { slug } = useParams();
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUMKMAndMenu = async () => {
      setIsLoading(true);
      try {
        const { data: umkmData, error: umkmError } = await supabase
          .from('umkms')
          .select('*, products(*)')
          .eq('slug', slug)
          .single();

        if (umkmError) throw umkmError;

        if (umkmData) {
          const products = umkmData.products || [];

          // --- LOGIC DINAMIS (PROFESIONAL) ---
          // Menggunakan helper dari utils/categoryConstants.js

          const formattedData = {
            ...umkmData,

            // 1. Layanan Jasa (Smart Filter)
            layanan: products.filter((p) =>
              checkCategoryMatch(p.kategori_produk, SERVICE_KEYWORDS)
            ),

            // 2. Produk Retail (Smart Filter: Retail tapi BUKAN Jasa)
            produk: products.filter((p) => {
              const isRetail = checkCategoryMatch(
                p.kategori_produk,
                RETAIL_KEYWORDS
              );
              const isService = checkCategoryMatch(
                p.kategori_produk,
                SERVICE_KEYWORDS
              );
              return isRetail && !isService;
            }),

            // 3. Menu Makanan/Minuman (Smart Fallback)
            // Apapun yang BUKAN Jasa dan BUKAN Retail --> Masuk Makanan.
            menu: products.filter((p) => {
              const isService = checkCategoryMatch(
                p.kategori_produk,
                SERVICE_KEYWORDS
              );
              const isRetail = checkCategoryMatch(
                p.kategori_produk,
                RETAIL_KEYWORDS
              );
              return !isService && !isRetail;
            }),
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
          <motion.div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </motion.div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8 text-center max-w-md">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold">UMKM Tidak Ditemukan</h2>
          <Button asChild className="mt-4">
            <Link to="/direktori">Kembali</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const umkmType = getUMKMType(umkm.kategori);
  const hasFood = umkm.menu && umkm.menu.length > 0;
  const hasService = umkm.layanan && umkm.layanan.length > 0;
  const hasRetail = umkm.produk && umkm.produk.length > 0;

  // Fallback Logic untuk Tipe Toko
  // Jika kategori toko mengandung 'kuliner'/'makan'/'minum', anggap sebagai Food Section
  // meskipun produknya mungkin salah input kategori.
  const mainCategory = (umkm.kategori || '').toLowerCase();
  const isKulinerStore =
    mainCategory.includes('kuliner') ||
    mainCategory.includes('makan') ||
    mainCategory.includes('minum');

  const showFoodSection =
    (umkmType === 'food' || hasFood) && (hasFood || isKulinerStore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8">
      <div className="container mx-auto max-w-4xl px-3 sm:px-4">
        {/* Header Profile */}
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
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
              {umkm.nama}
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-300 mt-1 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{umkm.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Buka</span>
              </div>
              <span className="text-green-600 font-semibold">
                {umkm.rentang_harga}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        {showFoodSection && (
          // Fallback: Jika menu kosong tapi ini toko kuliner, ambil semua produk sebagai menu
          <FoodSection menu={hasFood ? umkm.menu : umkm.products} umkm={umkm} />
        )}

        {(umkmType === 'service' || hasService) && hasService && (
          <ServiceSection layanan={umkm.layanan} umkm={umkm} />
        )}

        {(umkmType === 'retail' || hasRetail) && hasRetail && (
          <RetailSection produk={umkm.produk} umkm={umkm} />
        )}

        {!hasFood && !hasService && !hasRetail && (
          <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              Belum ada daftar menu/produk untuk UMKM ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
