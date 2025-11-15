import React from 'react';
import { Link } from 'react-router-dom';
import { Wheat, Heart, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="p-2 bg-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Wheat className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">KarawangMart</div>
                <div className="text-green-400 text-sm">
                  Platform UMKM Terpercaya
                </div>
              </div>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md leading-relaxed">
              Membangun ekonomi lokal Karawang melalui teknologi. Menghubungkan
              masyarakat dengan UMKM terbaik di jantung lumbung padi Indonesia.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Dibangun dengan cinta untuk Karawang</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Menu Cepat</h3>
            <div className="space-y-2">
              <Link
                to="/direktori"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Jelajahi UMKM
              </Link>
              <Link
                to="/kategori"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Kategori
              </Link>
              <Link
                to="/tentang"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Tentang Kami
              </Link>
              <Link
                to="/bantuan"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Bantuan
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-4 w-4 text-green-500" />
                <span>Karawang, Jawa Barat</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-green-500" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-green-500" />
                <span>info@karawangmart.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} KarawangMart. All rights
              reserved.
            </div>
            <div className="text-gray-400 text-sm">
              <span className="text-green-400 font-semibold">
                Web in Action 2025
              </span>{' '}
              oleh{' '}
              <span className="text-amber-400 font-semibold">
                TandemNgoding
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
