// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  ArrowRight,
  Star,
  Users,
  MapPin,
  Clock,
  Shield,
  Heart,
  Coffee,
  Utensils,
  ShoppingBag,
  Scissors,
  Factory,
  Wheat,
  Sprout,
  CheckCircle,
  Zap,
  Store,
  Quote,
} from 'lucide-react';

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/direktori?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/direktori');
    }
  };

  // Data Kategori UMKM Karawang
  const categories = [
    {
      name: 'Kuliner',
      icon: Utensils,
      description: 'Warung makan, kafe, dan resto khas Karawang',
      count: '150+',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      query: 'Kuliner',
    },
    {
      name: 'Minuman',
      icon: Coffee,
      description: 'Kedai kopi, jus, dan minuman tradisional',
      count: '80+',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      query: 'Minuman',
    },
    {
      name: 'Pertanian',
      icon: Wheat,
      description: 'Produk hasil bumi lumbung padi Karawang',
      count: '45+',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      query: 'Pertanian',
    },
    {
      name: 'Retail',
      icon: ShoppingBag,
      description: 'Toko kelontong dan kebutuhan sehari-hari',
      count: '120+',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      query: 'Retail',
    },
    {
      name: 'Jasa',
      icon: Scissors,
      description: 'Laundry, servis, dan berbagai layanan',
      count: '65+',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      query: 'Jasa',
    },
    {
      name: 'Industri',
      icon: Factory,
      description: 'UKM dan home industry lokal',
      count: '90+',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      query: 'Industri',
    },
  ];

  // Fitur Unggulan
  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: 'Lokasi Akurat',
      description:
        'Temukan UMKM terdekat dengan pin point lokasi yang presisi di seluruh Karawang',
    },
    {
      icon: <Clock className="h-8 w-8 text-yellow-600" />,
      title: 'Update Real-time',
      description:
        'Info jam buka dan ketersediaan terupdate langsung dari pemilik UMKM',
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: 'Terpercaya',
      description:
        'Semua UMKM terverifikasi untuk keamanan dan kenyamanan bertransaksi',
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: 'Komunitas Aktif',
      description: 'Bergabung dengan komunitas pencinta UMKM Karawang',
    },
  ];

  // Statistik
  const stats = [
    {
      number: '500+',
      label: 'UMKM Terdaftar',
      icon: <Store className="h-6 w-6" />,
    },
    { number: '15+', label: 'Kecamatan', icon: <MapPin className="h-6 w-6" /> },
    {
      number: '4.8',
      label: 'Rating Pengguna',
      icon: <Star className="h-6 w-6" />,
    },
    {
      number: '98%',
      label: 'Kepuasan Pelanggan',
      icon: <Heart className="h-6 w-6" />,
    },
  ];

  // Testimoni
  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa',
      comment:
        'Sangat membantu menemukan tempat makan enak dengan harga mahasiswa di sekitar kampus!',
      rating: 5,
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Karyawan Industri',
      comment:
        'Aplikasi ini memudahkan saya berbelanja kebutuhan sehari-hari dekat kosan.',
      rating: 5,
    },
    {
      name: 'Ahmad Wijaya',
      role: 'Pemilik Warung',
      comment:
        'Omzet saya meningkat 40% sejak bergabung dengan platform ini. Terima kasih!',
      rating: 5,
    },
  ];

  // Komponen untuk menampilkan rating bintang
  const StarRating = ({ rating }) => {
    return (
      <div className="flex justify-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative section-padding bg-gradient-to-br from-green-600 via-emerald-600 to-yellow-500 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-emerald-400/30 rounded-full blur-lg animate-bounce"></div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/30"
            >
              <Sprout className="h-4 w-4" />
              <span>Platform Resmi UMKM Karawang</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6"
            >
              <span className="block leading-[1.1]">Temukan Keberagaman</span>
              <span className="block bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent leading-[1.2] pb-2">
                UMKM Karawang
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl text-green-100 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Jelajahi 500+ usaha lokal terbaik di jantung lumbung padi
              Indonesia. Dari kuliner autentik hingga jasa terpercaya, semua ada
              di genggaman Anda.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Cari warung makan, kedai kopi, laundry, atau jasa..."
                    className="h-14 text-base pl-12 pr-4 rounded-xl border-0 focus:ring-2 focus:ring-green-500 bg-white/95 backdrop-blur-sm w-full text-gray-800 placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="btn-primary h-14 px-8 rounded-xl text-base font-semibold bg-white text-green-600 hover:bg-green-50 min-w-[140px]"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Cari
                </Button>
              </div>
            </motion.form>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-green-100"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>100% UMKM Terverifikasi</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Update Real-time</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Aman & Terpercaya</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section-padding bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center group hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Jelajahi <span className="text-gradient-karawang">Kategori</span>{' '}
              UMKM
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Temukan berbagai jenis usaha mikro, kecil, dan menengah yang
              menjadi tulang punggung ekonomi Karawang
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="group text-left bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 cursor-pointer"
              >
                <div
                  className={`p-3 rounded-2xl ${category.bgColor} dark:bg-gray-700 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                  {category.description}
                </p>
                <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                  {category.count} Tempat
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button untuk redirect ke direktori */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-8 py-4 text-lg"
            >
              <Link to="/direktori" className="flex items-center gap-2">
                Jelajahi Semua Kategori
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Mengapa Pilih{' '}
              <span className="text-gradient-karawang">KarawangMart</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Platform khusus yang dirancang untuk memajukan UMKM Karawang
              dengan teknologi modern
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 group-hover:shadow-lg transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gradient-to-br from-green-50 to-amber-50 dark:from-gray-800 dark:to-gray-700">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Apa Kata <span className="text-gradient-karawang">Mereka</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Dengarkan pengalaman langsung dari pengguna dan pemilik UMKM yang
              telah merasakan manfaat KarawangMart
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex"
              >
                <Card className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
                  <CardContent className="p-0 flex flex-col flex-1">
                    {/* Quote Icon */}
                    <div className="flex justify-start mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Quote className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>

                    {/* Testimonial Text - Fixed height */}
                    <div className="flex-1 mb-4 min-h-[120px]">
                      <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed line-clamp-4">
                        "{testimonial.comment}"
                      </p>
                    </div>

                    {/* Rating Stars */}
                    <div className="mb-4">
                      <StarRating rating={testimonial.rating} />
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-400 truncate">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-4 rounded-2xl shadow-lg mx-auto w-full sm:w-auto max-w-full sm:max-w-fit">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span className="text-green-600">5,000+</span> Pengguna Aktif
                </span>
              </div>

              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Rating <span className="text-green-600">4.8/5</span>
                </span>
              </div>

              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span className="text-green-600">98%</span> Puas
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-green-600 via-emerald-600 to-yellow-500 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Siap Mendukung
              <br />
              <span className="text-amber-200">UMKM Karawang?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Bergabunglah dengan ribuan pengguna yang sudah menemukan usaha
              lokal terbaik. Dukung ekonomi daerah dan temukan keunikan
              Karawang.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                asChild
                className="btn-secondary bg-white text-green-600 hover:bg-green-50 font-bold rounded-xl px-8 py-4 text-lg shadow-2xl min-w-[200px]"
              >
                <Link to="/direktori" className="flex items-center gap-2">
                  Jelajahi Sekarang
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold rounded-xl px-8 py-4 text-lg transition-all duration-300 min-w-[200px]"
              >
                <Link to="/tentang">Pelajari Lebih Lanjut</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
