// src/components/umkm/FoodSection.jsx
import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Plus, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';

const FoodSection = ({ menu, umkm }) => {
  const { dispatch } = useOrder();
  const [quantities, setQuantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('semua');

  const categories = ['semua', ...new Set(menu.map((item) => item.kategori))];
  const filteredItems =
    selectedCategory === 'semua'
      ? menu
      : menu.filter((item) => item.kategori === selectedCategory);

  const addToCart = (menuItem) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: menuItem.id,
        name: menuItem.nama,
        price: menuItem.harga,
        image: menuItem.gambar,
        umkm: umkm.nama,
        umkmSlug: umkm.slug,
      },
    });

    setQuantities((prev) => ({
      ...prev,
      [menuItem.id]: (prev[menuItem.id] || 0) + 1,
    }));

    setTimeout(() => {
      setQuantities((prev) => ({ ...prev, [menuItem.id]: 0 }));
    }, 1000);
  };

  return (
    <>
      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all text-sm flex-shrink-0 ${
              selectedCategory === category
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4"
      >
        {filteredItems.map((menuItem, index) => (
          <motion.div
            key={menuItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-green-200 dark:border-green-700"
          >
            <div className="flex flex-col sm:flex-row">
              <img
                src={menuItem.gambar}
                alt={menuItem.nama}
                className="w-full h-40 sm:w-32 sm:h-32 object-cover"
              />

              <div className="flex-1 p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                      {menuItem.nama}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                      {menuItem.deskripsi}
                    </p>
                  </div>
                  <div className="text-left sm:text-right sm:ml-4">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      Rp {menuItem.harga.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{menuItem.waktuMasak} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{menuItem.rating}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {quantities[menuItem.id] > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                      >
                        +{quantities[menuItem.id]}
                      </motion.span>
                    )}
                    <Button
                      onClick={() => addToCart(menuItem)}
                      className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-9 text-sm"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export default FoodSection;
