import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Phone,
  Star,
  Clock,
  WashingMachine,
  Printer,
  BookOpen,
  Wrench,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryFallback } from '@/utils/categoryFallback';

const ServiceSection = ({ layanan, umkm }) => {
  const [selectedCategory, setSelectedCategory] = useState('semua');

  const categories = [
    'semua',
    ...new Set(layanan.map((item) => item.nama.split(' ')[0])),
  ];
  const filteredItems =
    selectedCategory === 'semua'
      ? layanan
      : layanan.filter((item) => item.nama.startsWith(selectedCategory));

  const handleOrder = (service) => {
    const message = `Halo ${umkm.nama}, saya ingin memesan layanan:\n\n*${
      service.nama
    }*\nHarga: Rp ${service.harga.toLocaleString()}/${
      service.satuan
    }\nDeskripsi: ${service.deskripsi}\n\nBisa info lebih lanjut?`;
    const whatsappUrl = `https://wa.me/${umkm.kontak}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* CATEGORY FILTER - SAMA PERSIS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 sm:px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all text-xs sm:text-sm flex-shrink-0 ${
              selectedCategory === category
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* SERVICE ITEMS - SEMUA HIJAU */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 sm:gap-6"
      >
        {filteredItems.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-green-200 dark:border-green-700"
          >
            <div className="flex flex-col sm:flex-row">
              <div className="w-full h-40 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                {(() => {
                  const fallbackConfig = getCategoryFallback('jasa');
                  const IconComponent = fallbackConfig.icon;
                  return <IconComponent className="w-10 h-10 text-white" />;
                })()}
              </div>

              <div className="flex-1 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                      {service.nama}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1 line-clamp-2">
                      {service.deskripsi}
                    </p>
                  </div>
                  <div className="text-left sm:text-right sm:ml-4">
                    <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                      Rp {service.harga.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Cepat</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 sm:mt-0">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>

                  {/* TOMBOL WARNA HIJAU */}
                  <Button
                    onClick={() => handleOrder(service)}
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-8 sm:h-9 text-xs"
                    size="sm"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Pesan
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 sm:py-12"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Tidak ada layanan dalam kategori ini.
          </p>
        </motion.div>
      )}
    </>
  );
};

export default ServiceSection;
