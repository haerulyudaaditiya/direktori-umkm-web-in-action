import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Star,
  X,
  Wheat,
  Store,
} from 'lucide-react';

function DirectoryPage() {
  const [searchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';
  const initialCategory = searchParams.get('kategori') || 'Semua';

  const [umkmList, setUmkmList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => {
        setUmkmList(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data:', err);
        setIsLoading(false);
      });
  }, []);

  const { allCategories, allTags } = useMemo(() => {
    const categories = new Set(['Semua']);
    const tags = new Set();
    umkmList.forEach((item) => {
      categories.add(item.kategori);
      item.tags.forEach((tag) => tags.add(tag));
    });
    return {
      allCategories: Array.from(categories),
      allTags: Array.from(tags),
    };
  }, [umkmList]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Semua');
    setSelectedTags([]);
    setSortBy('rating');
  };

  const filteredUMKM = useMemo(() => {
    let filtered = umkmList.filter((umkm) => {
      const matchCategory =
        selectedCategory === 'Semua' || umkm.kategori === selectedCategory;
      const matchSearch = umkm.nama
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => umkm.tags.includes(tag));
      return matchCategory && matchSearch && matchTags;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.nama.localeCompare(b.nama);
        default:
          return 0;
      }
    });

    return filtered;
  }, [umkmList, searchTerm, selectedCategory, selectedTags, sortBy]);

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (selectedCategory !== 'Semua' ? 1 : 0) +
    selectedTags.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4 rounded-xl" />
            <Skeleton className="h-6 w-96 mx-auto rounded" />
          </div>

          {/* Filter Section Skeleton */}
          <Card className="p-6 mb-10 glass-card">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-32 mb-3 rounded" />
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </Card>

          {/* UMKM Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <Skeleton className="h-48 w-full" />
                <CardHeader className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 md:px-8">
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-green-200 dark:border-green-800">
            <Wheat className="h-4 w-4" />
            <span>Direktori UMKM Karawang</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Jelajahi UMKM Lokal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Temukan keanekaragaman usaha mikro, kecil, dan menengah di jantung
            lumbung padi Indonesia
          </p>
        </div>

        {/* FILTER SECTION - Diperbaiki untuk dark mode */}
        <Card className="p-6 mb-10 glass-card border border-green-200 dark:border-green-800 sticky top-20 z-40">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Cari warung makan, kedai kopi, laundry, atau jasa..."
                  className="pl-10 focus-visible:ring-green-500 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 w-32">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating Tertinggi</SelectItem>
                  <SelectItem value="name">Nama A-Z</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="h-12 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hapus Filter
                </Button>
              )}
            </div>
          </div>

          <div className="border-t border-green-200 dark:border-green-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Tag:
              </h3>
              {selectedTags.length > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {selectedTags.length} tag aktif
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    variant={active ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      active
                        ? 'bg-green-500 text-white hover:bg-green-600 border-green-500 dark:bg-green-600 dark:hover:bg-green-700'
                        : 'border-green-200 text-gray-600 hover:border-green-400 hover:text-green-600 dark:border-green-700 dark:text-gray-300 dark:hover:border-green-500 dark:hover:text-green-400'
                    }`}
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Menampilkan{' '}
            <span className="font-semibold text-green-600">
              {filteredUMKM.length}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-green-600">
              {umkmList.length}
            </span>{' '}
            UMKM
          </p>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Filter className="h-4 w-4" />
              <span>{activeFiltersCount} filter aktif</span>
            </div>
          )}
        </div>

        {/* HASIL UMKM */}
        {filteredUMKM.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUMKM.map((umkm) => (
              <Link to={`/umkm/${umkm.slug}`} key={umkm.id} className="group">
                <Card className="glass-card overflow-hidden rounded-2xl border border-green-200 dark:border-green-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  {/* Gambar UMKM */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={umkm.foto[0]}
                      alt={umkm.nama}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge className="absolute top-3 right-3 bg-green-500 text-white shadow-lg border-0">
                      {umkm.kategori}
                    </Badge>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{umkm.rating}</span>
                    </div>
                  </div>

                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-green-600 transition-colors">
                      {umkm.nama}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm pt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {umkm.rentang_harga}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Buka
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {umkm.alamat}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {umkm.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {umkm.tags.length > 3 && (
                        <Badge variant="outline" className="text-gray-500">
                          +{umkm.tags.length - 3} lainnya
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 glass-card border border-green-200 dark:border-green-800">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              UMKM Tidak Ditemukan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Coba ubah kata kunci pencarian atau filter untuk menemukan UMKM
              yang Anda cari.
            </p>
            <Button
              onClick={clearAllFilters}
              className="bg-green-600 hover:bg-green-700"
            >
              <X className="h-4 w-4 mr-2" />
              Hapus Semua Filter
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

export default DirectoryPage;
