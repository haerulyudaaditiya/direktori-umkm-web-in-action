import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';

function extractMapSrc(iframeString) {
  if (!iframeString) return null;
  const match = iframeString.match(/src="([^"]+)"/);
  return match ? match[1] : null;
}

function DetailPage() {
  const { slug } = useParams();
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState(null);

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((item) => item.slug === slug);
        setUmkm(found);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data:', err);
        setIsLoading(false);
      });
  }, [slug]);

  // Effect untuk sinkronisasi carousel dengan thumbnail
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

  // Effect untuk mengubah carousel ketika thumbnail diklik
  useEffect(() => {
    if (!carouselApi) return;

    if (activeImageIndex !== carouselApi.selectedScrollSnap()) {
      carouselApi.scrollTo(activeImageIndex);
    }
  }, [activeImageIndex, carouselApi]);

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
          <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Wheat className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
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
        </div>
      </div>
    );
  }

  const mapSrcLink = extractMapSrc(umkm.lokasi_map);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
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

          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm border border-green-200 dark:border-green-800">
            <Wheat className="h-3 w-3" />
            <span>UMKM Karawang</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-10">
          <Carousel
            className="w-full rounded-2xl overflow-hidden shadow-2xl border border-green-200 dark:border-green-800"
            setApi={setCarouselApi}
          >
            <CarouselContent>
              {umkm.foto.map((foto, i) => (
                <CarouselItem key={i}>
                  <div className="w-full h-80 md:h-[480px] relative">
                    <img
                      src={foto}
                      alt={`${umkm.nama} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <Badge className="absolute top-4 left-4 bg-green-500 text-white border-0 shadow-lg text-sm font-semibold">
                        {umkm.kategori}
                      </Badge>
                    )}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{umkm.rating}</span>
                      <span className="text-green-300">•</span>
                      <span>{umkm.rentang_harga}</span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-white/90 hover:bg-white border-green-200 text-green-700" />
            <CarouselNext className="right-4 bg-white/90 hover:bg-white border-green-200 text-green-700" />
          </Carousel>

          {/* Thumbnail Navigation */}
          {umkm.foto.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto py-2">
              {umkm.foto.map((foto, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === i
                      ? 'border-green-500 shadow-lg scale-105'
                      : 'border-green-200 dark:border-green-800 hover:border-green-400'
                  }`}
                >
                  <img
                    src={foto}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Info Card */}
        <Card className="mb-8 glass-card border border-green-200 dark:border-green-800 shadow-lg">
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
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-green-500 text-white border-0 text-sm font-semibold">
                {umkm.kategori}
              </Badge>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200"
              >
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-bold">{umkm.rating}</span>
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {umkm.rentang_harga}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {umkm.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Story Section */}
          <Card className="lg:col-span-2 glass-card border border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-amber-500 rounded-full"></div>
                Cerita & Keunikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {umkm.cerita}
              </p>
            </CardContent>
          </Card>

          {/* Info & Location Sidebar */}
          <div className="space-y-6">
            {/* Operating Hours */}
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Jam Operasional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {umkm.jam_buka}
                </p>
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
                >
                  <a
                    href={mapSrcLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Buka di Google Maps
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                {/* Tombol Lihat Menu untuk UMKM yang punya menu */}
                {umkm.menu && (
                  <Button
                    asChild
                    className="w-full bg-amber-500 hover:bg-amber-600 h-12"
                  >
                    <Link
                      to={`/menu/${umkm.slug}`}
                      className="flex items-center gap-2"
                    >
                      <Utensils className="h-4 w-4" />
                      Lihat Menu & Pesan
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300 h-12"
                >
                  <Phone className="h-4 w-4" />
                  Hubungi UMKM
                </Button>
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-48 rounded-lg overflow-hidden border border-green-200 dark:border-green-800">
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: umkm.lokasi_map }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-600 to-amber-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Temukan Lebih Banyak UMKM Karawang
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Jelajahi berbagai usaha lokal lainnya yang siap melayani Anda
              dengan produk dan jasa terbaik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-white text-green-600 hover:bg-green-50 font-semibold"
              >
                <Link to="/direktori">Jelajahi Semua UMKM</Link>
              </Button>
              <Button
                variant="outline"
                className="
                  border-white 
                  bg-transparent text-green-100 
                  hover:bg-white hover:text-green-600 
                  dark:border-white dark:bg-transparent dark:text-white 
                  dark:hover:bg-white dark:hover:text-green-600
                "
              >
                Bagikan UMKM Ini
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
