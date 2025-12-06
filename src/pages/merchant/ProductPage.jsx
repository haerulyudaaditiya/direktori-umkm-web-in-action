import React, { useEffect, useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader2,
  PackageOpen,
  CheckCircle2,
  XCircle,
  ChefHat,
  Filter,
  DollarSign,
  Package,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import MerchantHeader from '@/components/layout/MerchantHeader';

const ProductPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  const initialForm = {
    nama: '',
    harga: '',
    kategori_produk: 'makanan',
    deskripsi: '',
    gambar: '',
    stok: 100,
    is_available: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // 1. Fetch Data
  useEffect(() => {
    const initData = async () => {
      if (!user) return;
      try {
        // Get Shop first
        const { data: shopData } = await supabase
          .from('umkms')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (shopData) {
          setShop(shopData);
          // Get Products
          const { data: prods } = await supabase
            .from('products')
            .select('*')
            .eq('umkm_id', shopData.id)
            .order('created_at', { ascending: false });
          setProducts(prods || []);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [user]);

  // Filtered products
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      searchTerm === '' ||
      product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.deskripsi &&
        product.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    if (filterStatus === 'available')
      return product.is_available && matchesSearch;
    if (filterStatus === 'unavailable')
      return !product.is_available && matchesSearch;

    return matchesSearch;
  });

  // Stats
  const stats = {
    total: products.length,
    available: products.filter((p) => p.is_available).length,
    totalValue: products.reduce((sum, p) => sum + p.harga, 0),
  };

  // 2. Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File terlalu besar (Max 2MB)');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${shop.id}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, gambar: data.publicUrl }));
      setPreviewImage(data.publicUrl);
    } catch (error) {
      alert('Gagal upload gambar: ' + error.message);
    }
  };

  // 3. Save Logic (Create/Update)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        umkm_id: shop.id,
        harga: parseInt(formData.harga),
        stok: parseInt(formData.stok),
      };

      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...payload } : p
          )
        );
      } else {
        // Insert
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;

        setProducts((prev) => [data, ...prev]);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan produk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Gagal menghapus');
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingProduct(null);
    setPreviewImage(null);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nama: product.nama,
      harga: product.harga,
      kategori_produk: product.kategori_produk || 'makanan',
      deskripsi: product.deskripsi || '',
      gambar: product.gambar,
      stok: product.stok,
      is_available: product.is_available,
    });
    setPreviewImage(product.gambar);
    setIsDialogOpen(true);
  };

  const toggleAvailability = async (product) => {
    try {
      const newStatus = !product.is_available;
      const { error } = await supabase
        .from('products')
        .update({ is_available: newStatus })
        .eq('id', product.id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_available: newStatus } : p
        )
      );
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Gagal mengubah status');
    }
  };

  if (loading && !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <Skeleton className="h-10 w-48 mb-8 rounded-lg" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Toko Tidak Ditemukan
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Anda belum memiliki toko UMKM. Daftarkan toko Anda terlebih
              dahulu!
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href="/merchant-registration">Daftarkan Toko Sekarang</a>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* Merchant Header */}
      <MerchantHeader
        myShop={shop}
        user={user}
        loading={loading}
        onToggleStore={() => {}} // Tidak digunakan di halaman ini
      />

      <div className={loading ? 'pt-0' : 'pt-16'}>
        <div className="container mx-auto max-w-6xl px-4">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Menu
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Menu Tersedia
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.available}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Nilai
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      Rp {stats.totalValue.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Header & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-green-600" />
                      Daftar Menu
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Kelola semua produk dan layanan di toko Anda
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari menu..."
                        className="pl-9 h-10 w-full sm:w-48 border-green-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filter */}
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="h-10 w-full sm:w-40 border-green-200">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Menu</SelectItem>
                        <SelectItem value="available">Tersedia</SelectItem>
                        <SelectItem value="unavailable">
                          Tidak Tersedia
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Add Button */}
                    <Dialog
                      open={isDialogOpen}
                      onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white h-10">
                          <Plus className="w-4 h-4 mr-2" /> Tambah Menu
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingProduct ? 'Edit Menu' : 'Tambah Menu Baru'}
                          </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSave} className="space-y-4 py-4">
                          {/* Image Upload */}
                          <div className="flex justify-center">
                            <div
                              onClick={() => fileInputRef.current.click()}
                              className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors overflow-hidden relative"
                            >
                              {previewImage ? (
                                <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <>
                                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Klik untuk upload foto
                                  </span>
                                </>
                              )}
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Nama Menu <span className="text-red-500">*</span>
                            </label>
                            <Input
                              required
                              value={formData.nama}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  nama: e.target.value,
                                })
                              }
                              placeholder="Contoh: Soto Mie Spesial"
                              className="border-green-200 dark:border-green-800"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Harga (Rp){' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <Input
                                required
                                type="number"
                                value={formData.harga}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    harga: e.target.value,
                                  })
                                }
                                placeholder="15000"
                                className="border-green-200 dark:border-green-800"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kategori
                              </label>
                              <Select
                                value={formData.kategori_produk}
                                onValueChange={(val) =>
                                  setFormData({
                                    ...formData,
                                    kategori_produk: val,
                                  })
                                }
                              >
                                <SelectTrigger className="border-green-200 dark:border-green-800">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="makanan">
                                    Makanan
                                  </SelectItem>
                                  <SelectItem value="minuman">
                                    Minuman
                                  </SelectItem>
                                  <SelectItem value="jasa">
                                    Jasa/Layanan
                                  </SelectItem>
                                  <SelectItem value="retail">
                                    Retail/Barang
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Deskripsi
                            </label>
                            <Textarea
                              value={formData.deskripsi}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  deskripsi: e.target.value,
                                })
                              }
                              placeholder="Jelaskan detail menu..."
                              className="border-green-200 dark:border-green-800 min-h-[100px]"
                            />
                          </div>

                          <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status Tersedia
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.is_available
                                  ? 'Menu akan ditampilkan'
                                  : 'Menu akan disembunyikan'}
                              </p>
                            </div>
                            <Switch
                              checked={formData.is_available}
                              onCheckedChange={(val) =>
                                setFormData({ ...formData, is_available: val })
                              }
                              className="data-[state=checked]:bg-green-600"
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 h-11"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Menyimpan...
                              </>
                            ) : editingProduct ? (
                              'Update Menu'
                            ) : (
                              'Simpan Menu'
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {filteredProducts.length === 0 ? (
              <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <PackageOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {searchTerm ? 'Menu tidak ditemukan' : 'Belum ada menu'}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? 'Coba gunakan kata kunci lain atau hapus filter'
                    : 'Tambahkan menu pertama Anda untuk mulai berjualan'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Menu Pertama
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            product.gambar ||
                            'https://placehold.co/400x300?text=No+Image'
                          }
                          alt={product.nama}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            !product.is_available && 'grayscale'
                          }`}
                        />
                        {!product.is_available && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">
                              <XCircle className="w-3 h-3 mr-1" /> Tidak
                              Tersedia
                            </Badge>
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0">
                          {product.kategori_produk}
                        </Badge>
                        <div className="absolute top-3 right-3">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                            onClick={() => toggleAvailability(product)}
                            title={
                              product.is_available
                                ? 'Sembunyikan menu'
                                : 'Tampilkan menu'
                            }
                          >
                            {product.is_available ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-5 flex flex-col flex-1">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                              {product.nama}
                            </h3>
                            <p className="text-green-600 dark:text-green-400 font-bold whitespace-nowrap ml-2">
                              Rp {product.harga.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                            {product.deskripsi || 'Tidak ada deskripsi'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                product.is_available ? 'default' : 'secondary'
                              }
                              className={
                                product.is_available
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                              }
                            >
                              {product.is_available
                                ? 'Tersedia'
                                : 'Tidak Tersedia'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Stok: {product.stok}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50"
                              onClick={() => openEdit(product)}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-700 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
