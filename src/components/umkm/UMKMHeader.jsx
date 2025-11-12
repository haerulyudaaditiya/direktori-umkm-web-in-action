// src/components/umkm/UMKMHeader.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const UMKMHeader = ({ umkm, type }) => {
  // eslint-disable-next-line no-unused-vars
  const getActionText = () => {
    switch (type) {
      case 'food':
        return 'Lihat Menu & Pesan';
      case 'service':
        return 'Pesan Layanan';
      case 'retail':
        return 'Lihat Katalog';
      default:
        return 'Pesan Sekarang';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 mb-8"
    >
      <Button
        asChild
        variant="outline"
        size="icon"
        className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50"
      >
        <Link to="/direktori">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </Button>

      <div className="flex-1 min-w-0">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate"
        >
          {umkm.nama}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mt-2 flex-wrap"
        >
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{umkm.rating}</span>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4" />
            <span>{umkm.jam_buka.split(': ')[1]}</span>
          </div>

          <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
            {umkm.rentang_harga}
          </span>

          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs">
            {umkm.kategori}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UMKMHeader;
