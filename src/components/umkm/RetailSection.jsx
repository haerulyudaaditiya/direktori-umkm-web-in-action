import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ShoppingBag, MessageCircle, Store, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RetailSection = ({ produk = [], umkm }) => {
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [imageErrors, setImageErrors] = useState({});

  const safeProduk = Array.isArray(produk) ? produk : [];

  const categories = [
    'semua',
    ...new Set(
      safeProduk.map((item) => {
        const rawCat = item.kategori_produk || item.kategori || 'Umum';
        const catStr = String(rawCat);
        return catStr.charAt(0).toUpperCase() + catStr.slice(1).toLowerCase();
      })
    ),
  ];

  const filteredItems =
    selectedCategory === 'semua'
      ? safeProduk
      : safeProduk.filter((item) => {
          const rawCat = item.kategori_produk || item.kategori || 'Umum';
          return (
            String(rawCat).toLowerCase() === selectedCategory.toLowerCase()
          );
        });

  const handleOrder = (product) => {
    const phoneNumber = umkm?.kontak || '6281234567890';
    const message = `Halo ${umkm?.nama}, saya tertarik dengan produk: ${product.nama}. Apakah stok tersedia?`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <>
      {/* TABS - SAMA PERSIS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category.toLowerCase())}
            className={`px-3 sm:px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all text-xs sm:text-sm flex-shrink-0 ${
              selectedCategory.toLowerCase() === category.toLowerCase()
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* GRID - SAMA PERSIS (VERTICAL) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredItems.map((item, index) => {
          const isValidUrl =
            item.gambar &&
            typeof item.gambar === 'string' &&
            item.gambar.trim().length > 0;
          const showPlaceholder = !isValidUrl || imageErrors[item.id];

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }} // DELAY SAMA
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-green-200 dark:border-green-700 flex flex-col h-full"
            >
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
                {showPlaceholder ? (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                ) : (
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    onError={() =>
                      setImageErrors((prev) => ({ ...prev, [item.id]: true }))
                    }
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                {item.stok && item.stok < 10 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    Sisa {item.stok}
                  </div>
                )}
              </div>

              <div className="flex-1 p-3 sm:p-4 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2">
                    {item.nama}
                  </h3>
                  <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap ml-2">
                    Rp {Number(item.harga).toLocaleString('id-ID')}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2 flex-1">
                  {item.deskripsi || 'Produk berkualitas.'}
                </p>

                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Tag className="w-3 h-3" />{' '}
                    <span>{item.kategori_produk || 'Umum'}</span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOrder(item)}
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-8 sm:h-9 text-xs"
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{' '}
                    Tanya Stok
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Store className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">Tidak ada produk.</p>
        </motion.div>
      )}
    </>
  );
};

export default RetailSection;
