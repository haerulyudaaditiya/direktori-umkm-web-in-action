import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Plus, Clock, Star, Utensils, Coffee, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';

const FoodSection = ({ menu = [], umkm }) => {
  const { dispatch } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [quantities, setQuantities] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // --- LOGIC DATA AMAN ---
  const safeMenu = Array.isArray(menu) ? menu : [];

  const categories = [
    'semua',
    ...new Set(
      safeMenu.map((item) => {
        const rawCat = item.kategori_produk || item.kategori || 'Lainnya';
        const catStr = String(rawCat);
        return catStr.charAt(0).toUpperCase() + catStr.slice(1).toLowerCase();
      })
    ),
  ];

  const filteredItems =
    selectedCategory === 'semua'
      ? safeMenu
      : safeMenu.filter((item) => {
          const rawCat = item.kategori_produk || item.kategori || 'Lainnya';
          return (
            String(rawCat).toLowerCase() === selectedCategory.toLowerCase()
          );
        });

  const addToCart = (menuItem) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: menuItem.id,
        name: menuItem.nama,
        price: Number(menuItem.harga),
        image: menuItem.gambar,
        umkm: umkm?.nama || 'UMKM',
        umkm_id: umkm?.id,
      },
    });

    setQuantities((prev) => ({
      ...prev,
      [menuItem.id]: (prev[menuItem.id] || 0) + 1,
    }));
    setTimeout(
      () => setQuantities((prev) => ({ ...prev, [menuItem.id]: 0 })),
      1000
    );
  };

  return (
    <>
      {/* TABS - Animasi Sesuai Acuan */}
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

      {/* GRID - Animasi Sesuai Acuan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredItems.map((menuItem, index) => {
          const isValidUrl =
            menuItem.gambar &&
            typeof menuItem.gambar === 'string' &&
            menuItem.gambar.trim().length > 0;
          const showPlaceholder = !isValidUrl || imageErrors[menuItem.id];
          const isDrink = String(menuItem.kategori_produk || '')
            .toLowerCase()
            .match(/minum|teh|kopi|es|jus/);

          return (
            <motion.div
              key={menuItem.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }} // DELAY CONSISTENT
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-green-200 dark:border-green-700 flex flex-col h-full"
            >
              {/* IMAGE TOP */}
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
                {showPlaceholder ? (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    {isDrink ? (
                      <Coffee className="w-8 h-8 text-white" />
                    ) : (
                      <Utensils className="w-8 h-8 text-white" />
                    )}
                  </div>
                ) : (
                  <img
                    src={menuItem.gambar}
                    alt={menuItem.nama}
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        [menuItem.id]: true,
                      }))
                    }
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}

                {quantities[menuItem.id] > 0 && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    +{quantities[menuItem.id]}
                  </div>
                )}
              </div>

              {/* CONTENT BOTTOM */}
              <div className="flex-1 p-3 sm:p-4 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2">
                    {menuItem.nama}
                  </h3>
                  <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap ml-2">
                    Rp {Number(menuItem.harga).toLocaleString('id-ID')}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2 flex-1">
                  {menuItem.deskripsi || 'Menu favorit.'}
                </p>

                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {menuItem.waktu_masak && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {menuItem.waktu_masak} mnt
                      </span>
                    )}
                    {menuItem.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{' '}
                        {menuItem.rating}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => addToCart(menuItem)}
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-8 sm:h-9 text-xs"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Tambah
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
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada menu di kategori ini.
          </p>
        </motion.div>
      )}
    </>
  );
};

export default FoodSection;
