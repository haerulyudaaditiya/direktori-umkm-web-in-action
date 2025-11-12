import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Import components dan utils
import { getUMKMType, hasMenu, hasLayanan, hasProduk } from '@/utils/umkmTypes';
import UMKMHeader from '@/components/umkm/UMKMHeader';
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

  // Fallback untuk WhatsApp direct order
  const handleDirectWhatsApp = () => {
    const message = `Halo ${
      umkm.nama
    }, saya tertarik dengan ${umkm.kategori.toLowerCase()} Anda. Bisa info lebih lanjut?`;
    const whatsappUrl = `https://wa.me/${umkm.kontak}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Skeleton className="h-12 w-full mb-8 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="text-center p-8 glass-card border border-green-200 dark:border-green-800 w-full max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            UMKM Tidak Ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Maaf, UMKM yang Anda cari tidak ditemukan.
          </p>
          <Button asChild className="w-full">
            <Link to="/direktori">Kembali ke Direktori</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Tentukan jenis UMKM dan data yang tersedia
  const umkmType = getUMKMType(umkm.kategori);
  const hasData = hasMenu(umkm) || hasLayanan(umkm) || hasProduk(umkm);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <UMKMHeader umkm={umkm} type={umkmType} />

        {/* Konten Berdasarkan Jenis UMKM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {hasData ? (
            <>
              {/* UMKM dengan Menu Makanan */}
              {umkmType === 'food' && hasMenu(umkm) && (
                <FoodSection menu={umkm.menu} umkm={umkm} />
              )}

              {/* UMKM Jasa dengan Layanan */}
              {umkmType === 'service' && hasLayanan(umkm) && (
                <ServiceSection layanan={umkm.layanan} umkm={umkm} />
              )}

              {/* UMKM Retail dengan Produk */}
              {umkmType === 'retail' && hasProduk(umkm) && (
                <RetailSection produk={umkm.produk} umkm={umkm} />
              )}

              {/* Fallback untuk UMKM tanpa data spesifik */}
              {!hasMenu(umkm) && !hasLayanan(umkm) && !hasProduk(umkm) && (
                <FallbackSection umkm={umkm} type={umkmType} />
              )}
            </>
          ) : (
            /* UMKM tanpa data - Tampilkan fallback */
            <FallbackSection umkm={umkm} type={umkmType} />
          )}
        </motion.div>

        {/* Contact Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="glass-card border border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Informasi Kontak
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Telepon/WhatsApp
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {umkm.kontak}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Alamat
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {umkm.alamat}
                    </p>
                  </div>
                </div>

                {/* Direct WhatsApp Button untuk fallback */}
                {!hasData && (
                  <Button
                    onClick={handleDirectWhatsApp}
                    className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-12 text-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Hubungi via WhatsApp
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// Fallback Component untuk UMKM tanpa data spesifik
const FallbackSection = ({ umkm, type }) => {
  const getFallbackMessage = () => {
    switch (type) {
      case 'food':
        return 'Menu belum tersedia untuk UMKM ini. Silakan hubungi langsung untuk informasi menu.';
      case 'service':
        return 'Detail layanan belum tersedia. Silakan hubungi langsung untuk informasi layanan.';
      case 'retail':
        return 'Katalog produk belum tersedia. Silakan hubungi langsung untuk informasi produk.';
      default:
        return 'Informasi pemesanan belum tersedia. Silakan hubungi langsung.';
    }
  };

  return (
    <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
        <MessageCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Informasi Pemesanan
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {getFallbackMessage()}
      </p>
      <Button
        onClick={() => {
          const message = `Halo ${
            umkm.nama
          }, saya tertarik dengan ${umkm.kategori.toLowerCase()} Anda. Bisa info lebih lanjut?`;
          const whatsappUrl = `https://wa.me/${
            umkm.kontak
          }?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }}
        className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
      >
        <Phone className="w-4 h-4 mr-2" />
        Hubungi Langsung
      </Button>
    </Card>
  );
};

export default MenuPage;
