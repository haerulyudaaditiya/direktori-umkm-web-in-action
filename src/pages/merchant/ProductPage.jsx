import React, { useEffect, useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft
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
  DialogDescription,
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
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

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
  const [formTouched, setFormTouched] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Alert State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Alert Modal Portal
  const AlertModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
  };

  const DeleteModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
  };

  // Fungsi helper untuk menampilkan modal alert
  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

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
        const { data: shopData, error: shopError } = await supabase
          .from('umkms')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (shopError) throw shopError;

        if (shopData) {
          setShop(shopData);
          // Get Products
          const { data: prods, error: prodsError } = await supabase
            .from('products')
            .select('*')
            .eq('umkm_id', shopData.id)
            .order('created_at', { ascending: false });

          if (prodsError) throw prodsError;
          setProducts(prods || []);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        showAlert('Gagal memuat data produk');
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
    totalValue: products.reduce((sum, p) => sum + Number(p.harga || 0), 0),
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'nama':
        if (!value.trim()) return 'Nama menu wajib diisi';
        if (value.trim().length < 3) return 'Nama minimal 3 karakter';
        return '';

      case 'harga':
        if (!value.trim()) return 'Harga wajib diisi';
        if (isNaN(value) || Number(value) <= 0) return 'Harga tidak valid';
        if (Number(value) > 10000000) return 'Harga terlalu besar';
        return '';

      case 'deskripsi':
        if (value.length > 500) return 'Deskripsi maksimal 500 karakter';
        return '';

      case 'stok':
        if (isNaN(value) || Number(value) < 0) return 'Stok tidak valid';
        if (Number(value) > 10000) return 'Stok terlalu besar';
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    return errors;
  };

  const isFieldValid = (fieldName) => {
    return (
      formTouched[fieldName] &&
      !formErrors[fieldName] &&
      formData[fieldName] &&
      formData[fieldName].toString().trim() !== ''
    );
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error untuk field ini
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Jika field sudah di-touch, validasi
    if (formTouched[field]) {
      const error = validateField(field, value);
      if (error) {
        setFormErrors((prev) => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleFieldBlur = (field) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // 2. Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
       setIsDialogOpen(false);
       setTimeout(() => {
         showAlert('File terlalu besar! Maksimal 2MB.');
       }, 100);
       return;
    }

    if (!file.type.startsWith('image/')) {
      showAlert('File harus berupa gambar.');
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
      console.error('Upload error:', error);
      showAlert('Gagal upload gambar. Pastikan koneksi lancar.');
    }
  };

  // 3. Save Logic (Create/Update)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Set semua field sebagai touched untuk validasi
    const allTouched = {
      nama: true,
      harga: true,
      kategori_produk: true,
      deskripsi: true,
      stok: true,
    };
    setFormTouched(allTouched);

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0];
      setTimeout(() => {
        document.getElementById(firstError)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
      setIsSaving(false);
      return;
    }

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

        showAlert('Menu berhasil diperbarui!', 'success');
      } else {
        // Insert
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;

        setProducts((prev) => [data, ...prev]);
        showAlert('Menu berhasil ditambahkan!', 'success');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      showAlert('Gagal menyimpan menu. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== id));
      showAlert('Menu berhasil dihapus!', 'success');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      showAlert('Gagal menghapus menu. Silakan coba lagi.');
      setDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingProduct(null);
    setPreviewImage(null);
    setFormTouched({});
    setFormErrors({});
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
    setFormTouched({});
    setFormErrors({});
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

      showAlert(
        `Menu ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}!`,
        'success'
      );
    } catch (error) {
      console.error('Error updating availability:', error);
      showAlert('Gagal mengubah status menu.');
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
              <Link to="/merchant/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kelola Menu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Tambah, edit, atau hapus menu toko Anda
              </p>
            </div>
          </motion.div>
          
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
                        className="pl-9 h-10 w-full sm:w-48 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filter */}
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="h-10 w-full sm:w-40 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
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
                      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border border-green-200 dark:border-green-800">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                            {editingProduct ? 'Edit Menu' : 'Tambah Menu Baru'}
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            {editingProduct
                              ? 'Edit menu toko Anda'
                              : 'Tambahkan menu baru ke toko Anda'}
                          </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSave} className="space-y-4 py-4">
                          {/* Image Upload */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Foto Menu
                            </label>
                            <div
                              onClick={() => fileInputRef.current.click()}
                              className="w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition-all duration-200"
                              style={{
                                borderColor: formErrors.gambar
                                  ? '#ef4444'
                                  : previewImage && !formErrors.gambar
                                  ? '#10b981'
                                  : '#e5e7eb',
                                backgroundColor: previewImage
                                  ? 'transparent'
                                  : '#f9fafb',
                              }}
                            >
                              {previewImage ? (
                                <>
                                  <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                                      Ganti Foto
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Klik untuk upload foto
                                  </span>
                                  <span className="text-xs text-gray-400 mt-1">
                                    Max 2MB
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
                            {formErrors.gambar && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.gambar}
                              </p>
                            )}
                          </div>

                          {/* Nama Menu */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Nama Menu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Input
                                id="nama"
                                required
                                value={formData.nama}
                                onChange={(e) =>
                                  handleFieldChange('nama', e.target.value)
                                }
                                onBlur={() => handleFieldBlur('nama')}
                                placeholder="Contoh: Soto Mie Spesial"
                                className={`h-11 transition-all duration-200 ${
                                  formErrors.nama
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : isFieldValid('nama')
                                    ? 'border-green-500 focus-visible:ring-green-500'
                                    : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                                }`}
                              />
                              {isFieldValid('nama') && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                              )}
                              {formErrors.nama && (
                                <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                              )}
                            </div>
                            {formErrors.nama && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.nama}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Harga */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Harga (Rp){' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <Input
                                  id="harga"
                                  required
                                  type="number"
                                  value={formData.harga}
                                  onChange={(e) =>
                                    handleFieldChange('harga', e.target.value)
                                  }
                                  onBlur={() => handleFieldBlur('harga')}
                                  placeholder="15000"
                                  className={`h-11 transition-all duration-200 ${
                                    formErrors.harga
                                      ? 'border-red-500 focus-visible:ring-red-500'
                                      : isFieldValid('harga')
                                      ? 'border-green-500 focus-visible:ring-green-500'
                                      : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                                  }`}
                                />
                                {isFieldValid('harga') && (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                                )}
                                {formErrors.harga && (
                                  <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                                )}
                              </div>
                              {formErrors.harga && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {formErrors.harga}
                                </p>
                              )}
                            </div>

                            {/* Kategori */}
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
                                <SelectTrigger className="h-11 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
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

                          {/* Deskripsi */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Deskripsi
                            </label>
                            <div className="relative">
                              <Textarea
                                id="deskripsi"
                                value={formData.deskripsi}
                                onChange={(e) =>
                                  handleFieldChange('deskripsi', e.target.value)
                                }
                                onBlur={() => handleFieldBlur('deskripsi')}
                                placeholder="Jelaskan detail menu..."
                                className={`min-h-[100px] resize-y transition-all duration-200 ${
                                  formErrors.deskripsi
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : isFieldValid('deskripsi')
                                    ? 'border-green-500 focus-visible:ring-green-500'
                                    : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                                }`}
                              />
                              {isFieldValid('deskripsi') && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                              )}
                              {formErrors.deskripsi && (
                                <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                              )}
                            </div>
                            {formErrors.deskripsi && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.deskripsi}
                              </p>
                            )}
                          </div>

                          {/* Stok */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Stok
                            </label>
                            <div className="relative">
                              <Input
                                id="stok"
                                type="number"
                                value={formData.stok}
                                onChange={(e) =>
                                  handleFieldChange('stok', e.target.value)
                                }
                                onBlur={() => handleFieldBlur('stok')}
                                placeholder="100"
                                className={`h-11 transition-all duration-200 ${
                                  formErrors.stok
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : isFieldValid('stok')
                                    ? 'border-green-500 focus-visible:ring-green-500'
                                    : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                                }`}
                              />
                              {isFieldValid('stok') && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                              )}
                              {formErrors.stok && (
                                <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                              )}
                            </div>
                            {formErrors.stok && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.stok}
                              </p>
                            )}
                          </div>

                          {/* Status Tersedia */}
                          <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
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
                            className="w-full bg-green-600 hover:bg-green-700 h-11 text-white font-semibold"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Menyimpan...
                              </>
                            ) : editingProduct ? (
                              'Perbarui Menu'
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
                    <Card className="glass-card border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        {product.gambar ? (
                          <img
                            src={product.gambar}
                            alt={product.nama}
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              !product.is_available && 'grayscale'
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400">
                              Tidak ada foto
                            </span>
                          </div>
                        )}
                        {!product.is_available && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">
                              <XCircle className="w-3 h-3 mr-1" /> Tidak
                              Tersedia
                            </Badge>
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0 shadow-md">
                          {product.kategori_produk}
                        </Badge>
                        <div className="absolute top-3 right-3">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border border-green-200 dark:border-green-800"
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
                              Rp{' '}
                              {Number(product.harga || 0).toLocaleString(
                                'id-ID'
                              )}
                            </p>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 min-h-[40px]">
                            {product.deskripsi || 'Tidak ada deskripsi'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                product.is_available ? 'default' : 'secondary'
                              }
                              className={`
                                transition-colors duration-200 cursor-default
                                ${
                                  product.is_available
                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/50'
                                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              {product.is_available
                                ? 'Tersedia'
                                : 'Tidak Tersedia'}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Stok: {product.stok}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-200 transition-colors"
                              onClick={() => openEdit(product)}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50 dark:hover:text-red-200 transition-colors"
                              onClick={() => setDeleteConfirm(product)}
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

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <AlertModalPortal>
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
                  <div
                    className={`p-2 rounded-full ${
                      alertType === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}
                  >
                    {alertType === 'error' ? (
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {alertType === 'error' ? 'Terjadi Kesalahan' : 'Sukses!'}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {alertMessage}
                </p>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowAlertModal(false)}
                    className={`${
                      alertType === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    Tutup
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </AlertModalPortal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteModalPortal>
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
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Hapus Menu?
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Anda akan menghapus menu:
                </p>
                <p className="font-medium text-gray-900 dark:text-white mb-1 text-lg">
                  {deleteConfirm.nama}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Menu ini akan dihapus permanen dari toko Anda.
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
                    onClick={() => handleDelete(deleteConfirm.id)}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all"
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
  );
};

export default ProductPage;
