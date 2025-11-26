import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Minus,
  Tag,
  Store,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
// eslint-disable-next-line no-unused-vars
import { cn } from '@/lib/utils';

const RetailSection = ({ produk = [], umkm }) => {
  const { state, dispatch } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [imageErrors, setImageErrors] = useState({});

  // --- LOGIC DATA AMAN ---
  const safeProduk = Array.isArray(produk) ? produk : [];

  // Generate Kategori
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

  // Filter Item
  const filteredItems =
    selectedCategory === 'semua'
      ? safeProduk
      : safeProduk.filter((item) => {
          const rawCat = item.kategori_produk || item.kategori || 'Umum';
          return (
            String(rawCat).toLowerCase() === selectedCategory.toLowerCase()
          );
        });

  // --- CART OPERATIONS (Sama Persis dengan FoodSection) ---
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
              type: 'retail', // Penanda tipe item (opsional, berguna untuk analytics)
            }
          : item.id,
    });
  };

  return (
    <>
      {/* TABS (Sticky & Consistent) */}
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

      {/* GRID */}
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
                {/* IMAGE SECTION */}
                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {showPlaceholder ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-900/20 dark:to-amber-900/20 text-green-600/50 group-hover:scale-110 transition-transform duration-500">
                      <ShoppingBag className="w-12 h-12" />
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

                  {/* Badge Stok (Retail Specific) */}
                  {item.stok && item.stok < 10 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                      Sisa {item.stok}
                    </div>
                  )}

                  {/* Quantity Badge */}
                  {quantity > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10"
                    >
                      +{quantity}
                    </motion.div>
                  )}
                </div>

                {/* CONTENT SECTION */}
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
                        {item.kategori_produk || item.kategori || 'Umum'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                    {item.deskripsi || 'Produk berkualitas siap dipesan.'}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="block text-lg font-bold text-green-600 dark:text-green-400">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </span>

                    {/* BUTTONS (Add/Remove) - Konsisten dengan Food */}
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
                        <Plus className="w-4 h-4 mr-1.5" /> Beli
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-green-200 dark:border-green-800"
        >
          <Store className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada produk di kategori ini.
          </p>
        </motion.div>
      )}
    </>
  );
};

export default RetailSection;
