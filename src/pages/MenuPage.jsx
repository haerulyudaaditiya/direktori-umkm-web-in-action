import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Store } from 'lucide-react';
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

          const formattedData = {
            ...umkmData,
            layanan: products.filter((p) =>
              checkCategoryMatch(p.kategori_produk, SERVICE_KEYWORDS)
            ),
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
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-8 w-3/4 sm:w-1/2 rounded-lg" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-10 rounded-md" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-9 w-24 rounded-full flex-shrink-0"
              />
            ))}
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-green-100 dark:border-green-800 shadow-sm h-full flex flex-col"
              >
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-5 w-10 rounded-md" />
                  </div>
                  <div className="space-y-2 flex-1 mb-4">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-auto border-t border-gray-100 dark:border-gray-700">
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-24 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              UMKM Tidak Ditemukan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Maaf, kami tidak menemukan menu untuk UMKM ini.
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/direktori">Kembali ke Direktori</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const umkmType = getUMKMType(umkm.kategori);
  const hasFood = umkm.menu && umkm.menu.length > 0;
  const hasService = umkm.layanan && umkm.layanan.length > 0;
  const hasRetail = umkm.produk && umkm.produk.length > 0;
  const hasAnyProducts = hasFood || hasService || hasRetail;

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

        {!hasAnyProducts ? (
          <Card className="text-center p-12 glass-card border border-green-200 dark:border-green-800">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Belum Ada Menu/Produk
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              UMKM ini belum menambahkan menu atau produk.
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to={`/umkm/${slug}`}>Kembali ke Profil UMKM</Link>
            </Button>
          </Card>
        ) : (
          <>
            {showFoodSection && (
              <FoodSection
                menu={hasFood ? umkm.menu : umkm.products}
                umkm={umkm}
              />
            )}

            {(umkmType === 'service' || hasService) && hasService && (
              <ServiceSection layanan={umkm.layanan} umkm={umkm} />
            )}

            {(umkmType === 'retail' || hasRetail) && hasRetail && (
              <RetailSection produk={umkm.produk} umkm={umkm} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
