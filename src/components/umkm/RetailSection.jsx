// src/components/umkm/RetailSection.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RetailSection = ({ produk, umkm }) => {
  const handleWhatsAppInquiry = (product) => {
    const message = `Halo ${umkm.nama}, saya tertarik dengan produk:\n\n*${
      product.nama
    }*\nHarga: Rp ${product.harga.toLocaleString()}\nDeskripsi: ${
      product.deskripsi
    }\n\nBisa info stock dan cara pemesanan?`;
    const whatsappUrl = `https://wa.me/${umkm.kontak}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Katalog Produk
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Temukan produk terbaik dari {umkm.nama}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {produk.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-green-200 dark:border-green-700 hover:shadow-lg transition-all"
          >
            <img
              src={product.gambar}
              alt={product.nama}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {product.nama}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                {product.deskripsi}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  Rp {product.harga.toLocaleString()}
                </div>

                <Button
                  onClick={() => handleWhatsAppInquiry(product)}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Tanya Stock
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RetailSection;
