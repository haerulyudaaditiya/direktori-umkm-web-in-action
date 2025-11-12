// src/components/umkm/ServiceSection.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Clock, DollarSign, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServiceSection = ({ layanan, umkm }) => {
  const handleWhatsAppOrder = (service) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Layanan {umkm.kategori}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Pilih layanan yang Anda butuhkan dan hubungi langsung via WhatsApp
        </p>
      </div>

      <div className="grid gap-4">
        {layanan.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {service.nama}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {service.deskripsi}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      Rp {service.harga.toLocaleString()}/{service.satuan}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleWhatsAppOrder(service)}
                className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 whitespace-nowrap"
              >
                <Phone className="w-4 h-4 mr-2" />
                Pesan via WhatsApp
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ServiceSection;
