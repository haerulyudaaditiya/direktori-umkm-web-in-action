import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Clock, Sparkles, Tag, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';

const ServiceSection = ({ layanan = [], umkm }) => {
  const { state, dispatch } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [imageErrors, setImageErrors] = useState({});

  const safeLayanan = Array.isArray(layanan) ? layanan : [];

  const categories = [
    'semua',
    ...new Set(
      safeLayanan.map((item) => {
        const rawCat = item.kategori_produk || item.kategori || 'Jasa';
        const catStr = String(rawCat);
        return catStr.charAt(0).toUpperCase() + catStr.slice(1).toLowerCase();
      })
    ),
  ];

  const filteredItems =
    selectedCategory === 'semua'
      ? safeLayanan
      : safeLayanan.filter((item) => {
          const rawCat = item.kategori_produk || item.kategori || 'Jasa';
          return (
            String(rawCat).toLowerCase() === selectedCategory.toLowerCase()
          );
        });

  // --- CART OPERATIONS ---
  const getQuantity = (itemId) => {
    const itemInCart = state.cart.find((item) => item.id === itemId);
    return itemInCart ? itemInCart.quantity : 0;
  };

  const updateCart = (item, action) => {
    dispatch({
      type: action === 'increment' ? 'ADD_TO_CART' : 'REMOVE_FROM_CART',
      payload:
        action === 'increment'
          ? {
              id: item.id,
              name: item.nama,
              price: Number(item.harga),
              image: item.gambar,
              umkm: umkm?.nama || 'UMKM',
              umkm_id: umkm?.id,
              type: 'service', // Penanda tipe item
            }
          : item.id,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide sticky top-[64px] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category.toLowerCase())}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all text-sm flex-shrink-0 ${
              selectedCategory.toLowerCase() === category.toLowerCase()
                ? 'bg-green-600 text-white shadow-md scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const quantity = getQuantity(item.id);
            const isValidUrl =
              item.gambar &&
              typeof item.gambar === 'string' &&
              item.gambar.trim().length > 0;
            const showPlaceholder = !isValidUrl || imageErrors[item.id];

            return (
              <motion.div
                layout
                key={item.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-green-100 dark:border-green-800 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {showPlaceholder ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50 dark:from-green-900/20 dark:to-cyan-900/20 text-green-600/50 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles className="w-12 h-12" />
                    </div>
                  ) : (
                    <img
                      src={item.gambar}
                      alt={item.nama}
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [item.id]: true }))
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}

                  {item.waktu_masak && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1 z-10">
                      <Clock className="w-3 h-3" /> {item.waktu_masak} jam
                    </div>
                  )}

                  {/* Quantity Badge */}
                  {quantity > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10"
                    >
                      {quantity}x
                    </motion.div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <h3
                      className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-green-600 transition-colors"
                      title={item.nama}
                    >
                      {item.nama}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {item.kategori_produk || item.kategori || 'Layanan'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                    {item.deskripsi || 'Layanan profesional terpercaya.'}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col">
                      <span className="block text-lg font-bold text-green-600 dark:text-green-400">
                        Rp {Number(item.harga).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-gray-400 -mt-1">
                        / {item.satuan || 'pcs'}
                      </span>
                    </div>

                    {/* BUTTONS (Add/Remove) - Konsisten */}
                    {quantity > 0 ? (
                      <div className="flex items-center bg-green-50 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-700 p-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateCart(item, 'decrement')}
                          className="h-8 w-8 rounded-full text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800/50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-sm w-8 text-center text-green-700 dark:text-green-300">
                          {quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateCart(item, 'increment')}
                          className="h-8 w-8 rounded-full text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800/50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => updateCart(item, 'increment')}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-9 shadow-sm hover:shadow-md active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Booking
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Wrench className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada layanan di kategori ini.
          </p>
        </motion.div>
      )}
    </>
  );
};

export default ServiceSection;
