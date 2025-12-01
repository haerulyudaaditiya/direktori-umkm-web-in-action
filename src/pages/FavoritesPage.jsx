import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Star,
  Store,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { getCategoryFallback } from '@/utils/categoryFallback';
import ReactDOM from 'react-dom';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Clear messages after timeout
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch Favorites dengan error handling lebih baik
  useEffect(() => {
    let mounted = true;

    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('favorites')
          .select('*, umkms(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (mounted) {
          setFavorites(data || []);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        if (mounted) {
          setMessage({ type: 'error', text: 'Gagal memuat daftar favorit' });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFavorites();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Handle Unlike
  const handleRemove = async (favId, umkmName) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favId);

      if (error) throw error;

      setFavorites((prev) => prev.filter((item) => item.id !== favId));
      setMessage({
        type: 'success',
        text: `"${umkmName}" dihapus dari favorit`,
      });
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error removing favorite:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus dari favorit' });
      setDeleteConfirm(null);
    }
  };

  // Reset image errors ketika data berubah
  useEffect(() => {
    setImageErrors({});
  }, [favorites]);

  const DeleteModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header Skeleton - Konsisten dengan halaman lain */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          {/* Cards Skeleton - Konsisten dengan DirectoryPage */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="glass-card border border-green-200 dark:border-green-800 overflow-hidden"
              >
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <Skeleton className="h-4 w-full rounded" />
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
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header - Konsisten dengan halaman lain */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            asChild
            variant="outline"
            size="icon"
            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-200 transition-colors"
          >
            <Link to="/direktori">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Toko Favorit Saya
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Kelola toko langganan favorit Anda
            </p>
          </div>
        </motion.div>

        {/* Message Alert */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg border mb-6 flex items-center gap-3 ${
                message.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-300'
              }`}
            >
              {message.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favorites Grid - Konsisten dengan DirectoryPage */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center p-12 glass-card border border-green-200 dark:border-green-800">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Belum Ada Favorit
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Simpan toko langganan favoritmu untuk memudahkan akses di
                kemudian hari.
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/direktori">
                  <Store className="h-4 w-4 mr-2" />
                  Jelajahi Toko
                </Link>
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {favorites.map((fav, index) => {
              const umkm = fav.umkms;
              const fallbackConfig = getCategoryFallback(umkm.kategori);
              const IconComponent = fallbackConfig.icon;
              const displayImage = umkm.foto?.[0];

              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/umkm/${umkm.slug}`} className="group">
                    <Card className="glass-card overflow-hidden rounded-2xl border border-green-200 dark:border-green-800 transition-all relative h-full flex flex-col">
                      {/* TOMBOL DELETE - Tetap ada di favorites */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteConfirm({ id: fav.id, name: umkm.nama });
                        }}
                        className="absolute top-3 right-3 z-20 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors shadow-lg border border-red-200 dark:border-red-700"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                      {/* IMAGE SECTION - Sama persis dengan DirectoryPage */}
                      <div className="relative h-48 w-full overflow-hidden">
                        {!displayImage || imageErrors[umkm.id] ? (
                          <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <IconComponent className="w-10 h-10 text-white" />
                          </div>
                        ) : (
                          <img
                            src={displayImage}
                            alt={umkm.nama}
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...prev,
                                [umkm.id]: true,
                              }))
                            }
                            className="w-full h-full object-cover"
                          />
                        )}
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white shadow-lg border-0">
                          {umkm.kategori}
                        </Badge>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{umkm.rating}</span>
                        </div>
                      </div>

                      {/* CARD CONTENT - Sama persis dengan DirectoryPage */}
                      <div className="flex flex-col flex-1 p-5">
                        <CardHeader className="p-0 pb-3">
                          <CardTitle className="text-xl font-bold line-clamp-1 text-gray-900 dark:text-white">
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

                        <div className="flex-1 min-h-[60px] mb-3">
                          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 h-full">
                            {umkm.alamat}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(umkm.tags) &&
                            umkm.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                          {Array.isArray(umkm.tags) && umkm.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-transparent dark:hover:bg-transparent"
                            >
                              +{umkm.tags.length - 3} lainnya
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <DeleteModalPortal>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-green-200 dark:border-green-800 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Hapus dari Favorit?
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Anda akan menghapus toko:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white mb-4 text-lg">
                    {deleteConfirm.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Toko ini akan dihapus dari daftar favorit Anda
                  </p>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirm(null)}
                      className="border-green-200 text-stone-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 transition-colors"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={() =>
                        handleRemove(deleteConfirm.id, deleteConfirm.name)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Ya, Hapus
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </DeleteModalPortal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FavoritesPage;
