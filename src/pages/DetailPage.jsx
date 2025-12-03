import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Utensils,
  MapPin,
  Clock,
  Star,
  ArrowLeft,
  ExternalLink,
  Phone,
  Wheat,
  Sparkles,
  Heart,
} from 'lucide-react';
import { getCategoryFallback } from '@/utils/categoryFallback';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';

function DetailPage() {
  const { user } = useAuth(); // Ambil user
  const [isFavorited, setIsFavorited] = useState(false); // State love
  const { slug } = useParams();
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const location = useLocation(); 
  const [showLoginModal, setShowLoginModal] = useState(false);

  const LoginModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
  };

  useEffect(() => {
    const fetchUMKMDetail = async () => {
      setIsLoading(true);
      try {
        // Fetch UMKM data by slug
        const { data, error } = await supabase
          .from('umkms')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        if (data) {
          setUmkm(data);
        }
      } catch (error) {
        console.error('Error fetching UMKM detail:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUMKMDetail();
  }, [slug]);

  // Effect for carousel sync
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setActiveImageIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Effect to control carousel from thumbnails
  useEffect(() => {
    if (!carouselApi) return;

    if (activeImageIndex !== carouselApi.selectedScrollSnap()) {
      carouselApi.scrollTo(activeImageIndex);
    }
  }, [activeImageIndex, carouselApi]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !umkm) return;
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('umkm_id', umkm.id)
        .single();

      setIsFavorited(!!data);
    };
    checkFavorite();
  }, [user, umkm]);

  const handleToggleFavorite = async () => {
    if (!user) {
      setShowLoginModal(true); 
      return;
    }

    if (isFavorited) {
      // Unlike
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('umkm_id', umkm.id);
      if (!error) setIsFavorited(false);
    } else {
      // Like
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, umkm_id: umkm.id }]);
      if (!error) setIsFavorited(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <Skeleton className="h-10 w-40 mb-6 rounded-lg" />
          <Skeleton className="w-full h-80 md:h-96 rounded-2xl mb-8" />

          <Card className="mb-8 glass-card border border-green-200 dark:border-green-800">
            <CardHeader className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <Wheat className="h-10 w-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <CardTitle className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                UMKM Tidak Ditemukan 😢
              </CardTitle>
              <CardDescription className="text-lg mb-8 text-gray-600 dark:text-gray-300">
                Maaf, kami tidak menemukan data untuk "
                <span className="font-semibold">{slug}</span>".
              </CardDescription>
              <Button
                asChild
                variant="outline"
                className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300"
              >
                <Link to="/direktori" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Direktori
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Ensure arrays exist
  const fotoList = Array.isArray(umkm.foto) ? umkm.foto : [];
  const tagsList = Array.isArray(umkm.tags) ? umkm.tags : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        {/* Header Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            asChild
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300"
          >
            <Link to="/direktori" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Direktori
            </Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm border border-green-200 dark:border-green-800"
          >
            <Wheat className="h-3 w-3" />
            <span>UMKM Karawang</span>
          </motion.div>
        </motion.div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <Carousel
            className="w-full rounded-2xl overflow-hidden border border-green-200 dark:border-green-800"
            setApi={setCarouselApi}
          >
            <CarouselContent>
              {fotoList.length > 0 ? (
                fotoList.map((foto, i) => (
                  <CarouselItem key={i}>
                    <motion.div
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-80 md:h-[480px] relative"
                    >
                      {imageErrors[i] ? (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                          {(() => {
                            const fallbackConfig = getCategoryFallback(
                              umkm.kategori
                            );
                            const IconComponent = fallbackConfig.icon;
                            return (
                              <IconComponent className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                            );
                          })()}
                        </div>
                      ) : (
                        <img
                          src={foto}
                          alt={`${umkm.nama} ${i + 1}`}
                          onError={() =>
                            setImageErrors((prev) => ({ ...prev, [i]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      )}
                      {i === 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Badge className="absolute top-4 left-4 bg-green-500 text-white border-0 text-sm font-semibold">
                            {umkm.kategori}
                          </Badge>
                        </motion.div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm"
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{umkm.rating}</span>
                        <span className="text-green-300">•</span>
                        <span>{umkm.rentang_harga}</span>
                      </motion.div>
                    </motion.div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="w-full h-80 md:h-[480px] bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Tidak ada foto</span>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-white/90 hover:bg-white border-green-200 text-green-700 hover:text-green-700 dark:bg-gray-900/80 dark:hover:bg-gray-800 dark:border-green-700 dark:text-green-300 dark:hover:text-green-300" />
            <CarouselNext className="right-4 bg-white/90 hover:bg-white border-green-200 text-green-700 hover:text-green-700 dark:bg-gray-900/80 dark:hover:bg-gray-800 dark:border-green-700 dark:text-green-300 dark:hover:text-green-300" />
          </Carousel>

          {/* Thumbnail Navigation */}
          {fotoList.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-3 mt-4 overflow-x-auto py-2"
            >
              {fotoList.map((foto, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === i
                      ? 'border-green-500 scale-105'
                      : 'border-green-200 dark:border-green-800 hover:border-green-400'
                  }`}
                >
                  {imageErrors[`thumb_${i}`] ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                      {(() => {
                        const fallbackConfig = getCategoryFallback(
                          umkm.kategori
                        );
                        const IconComponent = fallbackConfig.icon;
                        return (
                          <IconComponent className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                        );
                      })()}
                    </div>
                  ) : (
                    <img
                      src={foto}
                      alt={`Thumbnail ${i + 1}`}
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [`thumb_${i}`]: true,
                        }))
                      }
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Main Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-8 glass-card border border-green-200 dark:border-green-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-3">
                {umkm.nama}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300">
                <MapPin className="h-5 w-5 text-green-600" />
                {umkm.alamat}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge className="bg-green-500 text-white border-0 text-sm font-semibold">
                  {umkm.kategori}
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                >
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold">{umkm.rating}</span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                >
                  {umkm.rentang_harga}
                </Badge>
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {tagsList.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-green-200 dark:border-green-700"
                  >
                    #{tag}
                  </Badge>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
            layout
          >
            <Card className="glass-card border border-green-200 dark:border-green-800 h-full min-h-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-6 bg-gradient-to-b from-green-500 to-amber-500 rounded-full"
                  />
                  Cerita & Keunikan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <motion.p
                  className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {umkm.cerita}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info & Location Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Operating Hours */}
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Jam Operasional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.p
                  className="text-gray-700 dark:text-gray-300 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {umkm.jam_buka}
                </motion.p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Akses Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                  disabled={!umkm.lat || !umkm.lng}
                >
                  <a
                    href={
                      umkm.lat && umkm.lng
                        ? `https://www.google.com/maps/search/?api=1&query=${umkm.lat},${umkm.lng}`
                        : '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${
                      !umkm.lat || !umkm.lng
                        ? 'cursor-not-allowed opacity-60'
                        : ''
                    }`}
                    onClick={(e) => {
                      if (!umkm.lat || !umkm.lng) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4" />
                    {umkm.lat && umkm.lng
                      ? 'Buka di Google Maps'
                      : 'Lokasi Tidak Tersedia'}
                    {umkm.lat && umkm.lng && (
                      <ExternalLink className="h-4 w-4" />
                    )}
                  </a>
                </Button>

                <Button
                  asChild
                  className="w-full bg-amber-500 hover:bg-amber-600 h-12"
                >
                  <Link
                    to={`/menu/${umkm.slug}`}
                    className="flex items-center gap-2"
                  >
                    <Utensils className="h-4 w-4" />
                    {umkm.kategori === 'Jasa'
                      ? 'Pesan Layanan'
                      : umkm.kategori === 'Retail'
                      ? 'Lihat Katalog'
                      : 'Lihat Menu & Pesan'}
                  </Link>
                </Button>

                <Button
                  onClick={() => {
                    const message = `Halo KarawangMart, saya tertarik dengan ${umkm.nama}. Bisa info lebih lanjut?`;
                    const phoneNumber = umkm.kontak;
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                      message
                    )}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300 h-12"
                >
                  <Phone className="h-4 w-4" />
                  Hubungi Mitra
                </Button>
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {umkm.lokasi_map ? (
                  <motion.div
                    className="w-full h-48 rounded-lg overflow-hidden border border-green-200 dark:border-green-800"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: umkm.lokasi_map }}
                    />
                  </motion.div>
                ) : umkm.lat && umkm.lng ? (
                  <motion.div
                    className="w-full h-48 rounded-lg overflow-hidden border border-green-200 dark:border-green-800 flex items-center justify-center bg-green-50 dark:bg-gray-800/50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="text-center p-4">
                      <MapPin className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Peta tidak tersedia, tapi Anda bisa buka di Google Maps
                      </p>
                      <Button
                        asChild
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${umkm.lat},${umkm.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Buka di Maps
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-full h-48 rounded-lg overflow-hidden border border-green-200 dark:border-green-800 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="text-center p-4">
                      <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Lokasi peta tidak tersedia
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 max-w-xs">
                        {umkm.alamat}
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-green-600 to-amber-500 rounded-2xl p-8 text-white">
            <motion.h3
              className="text-2xl font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Temukan Lebih Banyak UMKM Karawang
            </motion.h3>
            <motion.p
              className="text-green-100 mb-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              Jelajahi berbagai usaha lokal lainnya yang siap melayani Anda
              dengan produk dan jasa terbaik.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-white text-green-600 hover:bg-green-50 font-semibold"
              >
                <Link to="/direktori">Jelajahi Semua UMKM</Link>
              </Button>
              <Button
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white hover:text-green-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Bagikan UMKM Ini
              </Button>
              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                className={`border-white bg-transparent text-white hover:bg-white hover:text-green-600 ${
                  isFavorited
                    ? 'bg-white text-red-500 hover:bg-white/90 hover:text-red-600'
                    : ''
                }`}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isFavorited ? 'fill-red-500' : ''
                  }`}
                />
                {isFavorited ? 'Tersimpan' : 'Favorit'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModalPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-green-200 dark:border-green-800 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Login Diperlukan
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Untuk menyimpan ke favorit, Anda perlu login terlebih dahulu.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Nikmati fitur lengkap KarawangMart dengan akun Anda.
                </p>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowLoginModal(false)}
                    className="border-green-200 text-stone-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 transition-colors"
                  >
                    Nanti Saja
                  </Button>
                  <Button
                    asChild
                    className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20 transition-all"
                    onClick={() => setShowLoginModal(false)}
                  >
                    <Link to="/auth" state={{ from: location }}>
                      Login Sekarang
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </LoginModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DetailPage;
