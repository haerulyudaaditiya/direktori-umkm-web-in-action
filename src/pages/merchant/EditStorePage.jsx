import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  MapPin,
  Phone,
  Save,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  Clock,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import MerchantHeader from '@/components/layout/MerchantHeader';
import ReactDOM from 'react-dom';

const EditStorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [shop, setShop] = useState(null);

  // Alert State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');

  // Image State
  const [imageErrors, setImageErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const AlertModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
  };

  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    kategori: '',
    kontak: '',
    alamat: '',
    cerita: '',
    jam_buka: '08:00 - 21:00',
    rentang_harga: '$',
    foto: [],
  });

  const [formTouched, setFormTouched] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // 1. Fetch Data Toko Saat Ini
  useEffect(() => {
    const fetchShop = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('umkms')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setShopId(data.id);
          setShop(data);
          setFormData({
            nama: data.nama || '',
            slug: data.slug || '',
            kategori: data.kategori || '',
            kontak: data.kontak || '',
            alamat: data.alamat || '',
            cerita: data.cerita || '',
            jam_buka: data.jam_buka || '08:00 - 21:00',
            rentang_harga: data.rentang_harga || '$',
            foto: Array.isArray(data.foto) ? data.foto : [],
          });
        }
      } catch (err) {
        console.error('Error fetching shop:', err);
        showAlert('Gagal memuat data toko');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [user]);

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'nama':
        if (!value.trim()) return 'Nama usaha wajib diisi';
        if (value.trim().length < 3) return 'Nama minimal 3 karakter';
        return '';

      case 'kategori':
        if (!value) return 'Kategori usaha wajib dipilih';
        return '';

      case 'kontak': {
        if (!value.trim()) return 'Nomor WhatsApp wajib diisi';
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) return 'Nomor minimal 10 digit';
        if (cleanPhone.length > 15) return 'Nomor maksimal 15 digit';
        return '';
      }

      case 'alamat':
        if (!value.trim()) return 'Alamat wajib diisi';
        if (value.trim().length < 10) return 'Alamat terlalu pendek';
        return '';

      case 'jam_buka':
        if (!value.trim()) return 'Jam operasional wajib diisi';
        return '';

      case 'cerita':
        if (value.length > 1000) return 'Cerita maksimal 1000 karakter';
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((field) => {
      if (field === 'foto') return; // Skip foto validation
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

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

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

  // 2. Handle Multiple Image Upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const oversizedFiles = files.filter((file) => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showAlert('Beberapa file terlalu besar! Maksimal 2MB per file.');
      return;
    }

    try {
      setUploadingImage(true);
      const uploadedUrls = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${shopId}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('umkm-covers')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('umkm-covers')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Add new images to existing array
      setFormData((prev) => ({
        ...prev,
        foto: [...prev.foto, ...uploadedUrls],
      }));

      showAlert(`${uploadedUrls.length} gambar berhasil diupload!`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showAlert('Gagal upload gambar. Pastikan koneksi lancar.');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      foto: prev.foto.filter((_, i) => i !== index),
    }));
  };

  // 3. Handle Save Text Data
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Set semua field sebagai touched untuk validasi
    const allTouched = {
      nama: true,
      kategori: true,
      kontak: true,
      alamat: true,
      jam_buka: true,
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
      setSaving(false);
      return;
    }

    try {
      const payload = {
        nama: formData.nama,
        kategori: formData.kategori,
        kontak: formData.kontak,
        alamat: formData.alamat,
        cerita: formData.cerita,
        jam_buka: formData.jam_buka,
        rentang_harga: formData.rentang_harga,
        foto: formData.foto,
      };

      const { error } = await supabase
        .from('umkms')
        .update(payload)
        .eq('id', shopId);

      if (error) throw error;

      showAlert('Perubahan toko berhasil disimpan!', 'success');

      // Tidak navigate otomatis, biar user bisa lanjut edit
      // Refresh shop data untuk sync
      const { data: updatedShop } = await supabase
        .from('umkms')
        .select('*')
        .eq('id', shopId)
        .single();

      if (updatedShop) setShop(updatedShop);
    } catch (error) {
      console.error('Save error:', error);
      showAlert('Gagal menyimpan perubahan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
              <Store className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Toko Tidak Ditemukan
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Anda belum memiliki toko UMKM.
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/merchant-registration">Daftarkan Toko</Link>
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
        onToggleStore={() => {}}
      />

      <div className="container mx-auto max-w-6xl px-4 pt-16">
        {/* Header */}
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
              Pengaturan Toko
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Perbarui informasi bisnis Anda
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Galeri Foto (Multiple Images) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                  Galeri Foto Toko
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Unggah foto-foto toko Anda (maksimal 10 foto, 2MB per foto)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full h-48 border-2 border-dashed border-green-200 dark:border-green-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors mb-6 relative"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Mengupload...
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-10 h-10 text-green-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tambah Foto Toko
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Klik atau drag & drop untuk upload
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                  />
                </div>

                {/* Image Grid Preview */}
                {formData.foto.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.foto.map((foto, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden border border-green-200 dark:border-green-800">
                          {imageErrors[index] ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                              <Eye className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                            </div>
                          ) : (
                            <img
                              src={foto}
                              alt={`Foto toko ${index + 1}`}
                              onError={() =>
                                setImageErrors((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }))
                              }
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Badge className="absolute top-2 left-2 bg-black/70 text-white text-xs">
                          {index + 1}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Informasi Dasar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  Informasi Dasar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nama Usaha */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nama Usaha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="nama"
                      value={formData.nama}
                      onChange={(e) =>
                        handleFieldChange('nama', e.target.value)
                      }
                      onBlur={() => handleFieldBlur('nama')}
                      className={`pl-10 h-11 transition-all ${
                        formErrors.nama
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : isFieldValid('nama')
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                          : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                      }`}
                      required
                    />
                    {isFieldValid('nama') && (
                      <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3.5" />
                    )}
                    {formErrors.nama && (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3.5" />
                    )}
                  </div>
                  {formErrors.nama && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.nama}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kategori */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        value={formData.kategori}
                        onValueChange={(val) => {
                          handleFieldChange('kategori', val);
                          setFormTouched((prev) => ({
                            ...prev,
                            kategori: true,
                          }));
                        }}
                        required
                      >
                        <SelectTrigger
                          id="kategori"
                          className={`h-11 transition-all ${
                            formErrors.kategori
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : isFieldValid('kategori')
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                              : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                          }`}
                        >
                          <SelectValue placeholder="Pilih kategori..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kuliner">Kuliner</SelectItem>
                          <SelectItem value="Minuman">Minuman</SelectItem>
                          <SelectItem value="Retail">Retail/Sembako</SelectItem>
                          <SelectItem value="Jasa">Jasa/Layanan</SelectItem>
                          <SelectItem value="Pertanian">Pertanian</SelectItem>
                          <SelectItem value="Fashion">Fashion</SelectItem>
                          <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                        </SelectContent>
                      </Select>
                      {isFieldValid('kategori') && (
                        <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3.5" />
                      )}
                      {formErrors.kategori && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3.5" />
                      )}
                    </div>
                    {formErrors.kategori && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.kategori}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      WhatsApp Admin <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="kontak"
                        value={formData.kontak}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleFieldChange('kontak', value);
                        }}
                        onBlur={() => handleFieldBlur('kontak')}
                        className={`pl-10 h-11 transition-all ${
                          formErrors.kontak
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : isFieldValid('kontak')
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                            : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                        }`}
                        required
                      />
                      {isFieldValid('kontak') && (
                        <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3.5" />
                      )}
                      {formErrors.kontak && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3.5" />
                      )}
                    </div>
                    {formErrors.kontak && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.kontak}
                      </p>
                    )}
                  </div>
                </div>

                {/* Alamat */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Textarea
                      id="alamat"
                      value={formData.alamat}
                      onChange={(e) =>
                        handleFieldChange('alamat', e.target.value)
                      }
                      onBlur={() => handleFieldBlur('alamat')}
                      className={`pl-10 min-h-[100px] transition-all ${
                        formErrors.alamat
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : isFieldValid('alamat')
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                          : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                      }`}
                      required
                    />
                    {isFieldValid('alamat') && (
                      <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                    )}
                    {formErrors.alamat && (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                    )}
                  </div>
                  {formErrors.alamat && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.alamat}
                    </p>
                  )}
                </div>

                {/* Cerita */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cerita / Deskripsi Toko
                  </label>
                  <Textarea
                    value={formData.cerita}
                    onChange={(e) =>
                      handleFieldChange('cerita', e.target.value)
                    }
                    placeholder="Ceritakan keunikan, sejarah, atau nilai jual toko Anda..."
                    className="min-h-[120px] border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Maksimal 1000 karakter
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 3: Operasional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Operasional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Jam Operasional */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Jam Operasional <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="jam_buka"
                        value={formData.jam_buka}
                        onChange={(e) =>
                          handleFieldChange('jam_buka', e.target.value)
                        }
                        onBlur={() => handleFieldBlur('jam_buka')}
                        placeholder="Contoh: 08:00 - 22:00"
                        className={`pl-10 h-11 transition-all ${
                          formErrors.jam_buka
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : isFieldValid('jam_buka')
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                            : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                        }`}
                        required
                      />
                      {isFieldValid('jam_buka') && (
                        <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3.5" />
                      )}
                      {formErrors.jam_buka && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3.5" />
                      )}
                    </div>
                    {formErrors.jam_buka && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.jam_buka}
                      </p>
                    )}
                  </div>

                  {/* Rentang Harga */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rentang Harga
                    </label>
                    <Select
                      value={formData.rentang_harga}
                      onValueChange={(val) =>
                        setFormData({ ...formData, rentang_harga: val })
                      }
                    >
                      <SelectTrigger className="h-11 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Pilih..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">Murah ($)</SelectItem>
                        <SelectItem value="$$">Menengah ($$)</SelectItem>
                        <SelectItem value="$$$">Mahal ($$$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4 pt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/merchant/dashboard')}
              className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white min-w-[150px] h-11"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <AlertModalPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-green-200 dark:border-green-800 shadow-xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
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
    </div>
  );
};

export default EditStorePage;
