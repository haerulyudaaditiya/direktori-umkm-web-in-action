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
  Tag, 
  Navigation, 
  Map,
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
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

  const [showMapModal, setShowMapModal] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  // Predefined tags
  const PREDEFINED_TAGS = [
    'Halal',
    'Vegetarian',
    'Ramah Anak',
    'Parkir Luas',
    'Delivery',
    'Takeaway',
    'Wifi Gratis',
    'AC',
    'Tempat Duduk',
    'Pembayaran Digital',
    'Kartu Kredit/Debit',
    'Buka 24 Jam',
    'Tersedia Kursi Roda',
    'Hewan Peliharaan Diizinkan',
  ];

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
    lokasi_map: '', 
    lat: null, 
    lng: null, 
    tags: [],
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
            lat: data.lat || null,
            lng: data.lng || null,
            tags: data.tags || [],
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

  const handleToggleTag = (tag) => {
    setFormData((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];

      if (newTags.length > 10) {
        showAlert('Maksimal 10 tags', 'error');
        return prev;
      }

      return { ...prev, tags: newTags };
    });
  };

  const handleAddCustomTag = () => {
    const tag = customTagInput.trim();

    if (!tag) {
      showAlert('Tag tidak boleh kosong', 'error');
      return;
    }

    if (formData.tags.includes(tag)) {
      showAlert('Tag sudah ada', 'error');
      return;
    }

    if (formData.tags.length >= 10) {
      showAlert('Maksimal 10 tags', 'error');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));

    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // GPS Handlers
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert('Browser tidak mendukung geolocation', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
        }));
        showAlert('Lokasi berhasil diperoleh', 'success');
      },
      (error) => {
        showAlert('Gagal mendapatkan lokasi: ' + error.message, 'error');
      }
    );
  };

  const handleMapPositionChange = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      lat: lat,
      lng: lng,
    }));
  };

  // Map Picker Modal Component
  const MapPickerModal = ({ isOpen, onClose, position, onPositionChange }) => {
    const [tempPosition, setTempPosition] = useState(
      position || [-6.2088, 106.8456]
    );

    function LocationMarker() {
      useMapEvents({
        click(e) {
          setTempPosition([e.latlng.lat, e.latlng.lng]);
        },
      });

      return tempPosition === null ? null : (
        <Marker
          position={tempPosition}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              setTempPosition([position.lat, position.lng]);
            },
          }}
        />
      );
    }

    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Pilih Lokasi di Peta
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 min-h-[400px] rounded-lg overflow-hidden border border-green-200 dark:border-green-800">
            <MapContainer
              center={tempPosition}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Latitude: {tempPosition[0]?.toFixed(6)} | Longitude:{' '}
              {tempPosition[1]?.toFixed(6)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50"
              >
                Batal
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  onPositionChange(tempPosition[0], tempPosition[1]);
                  onClose();
                }}
              >
                Konfirmasi Lokasi
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
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
        lat: formData.lat,
        lng: formData.lng,
        tags: formData.tags,
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

          {/* Section 4: Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-600" />
                  Tags / Kategori Tambahan
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Pilih atau tambah tags yang menggambarkan usaha Anda (maksimal
                  10)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Predefined Tags Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PREDEFINED_TAGS.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={
                        formData.tags.includes(tag) ? 'default' : 'outline'
                      }
                      className={`h-9 text-sm transition-all duration-200 ${
                        formData.tags.includes(tag)
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 border-transparent'
                          : 'border-green-200 text-stone-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 dark:hover:text-green-400'
                      }`}
                      onClick={() => handleToggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>

                {/* Custom Tags Input */}
                {/* Custom Tags Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tambah tag custom:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      placeholder="Contoh: 'Ramen', 'Kekinian', 'Coffee Shop'"
                      className="flex-1 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      maxLength={20}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={!customTagInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Selected Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tags terpilih ({formData.tags.length}/10):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="
                            bg-green-100 text-green-800 border border-green-200
                            dark:bg-green-900/30 dark:text-green-300 dark:border-green-700
                            hover:bg-green-200 dark:hover:bg-green-900/50
                            px-3 py-1 rounded-full flex items-center gap-1 transition-colors duration-200 cursor-default
                          "
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-green-600 hover:text-red-600 dark:text-green-400 dark:hover:text-red-400 transition-colors"
                            title="Hapus tag"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 5: Lokasi GPS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Lokasi GPS (Opsional)
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Tambahkan koordinat untuk menampilkan peta di halaman toko
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Action Buttons (Updated: Gaya 'Tinted' & 'Ghost' agar lebih Premium) */}
                <div className="flex flex-wrap gap-3">
                  {/* Tombol Hijau (Lokasi Saat Ini) */}
                  <Button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50 shadow-sm transition-all border"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Gunakan Lokasi Saat Ini
                  </Button>

                  {/* Tombol Biru (Pilih Peta) */}
                  <Button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50 shadow-sm transition-all border"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Pilih Lewat Peta
                  </Button>

                  {/* Tombol Merah (Hapus) - DIPERBAIKI: Pakai Background Merah Muda agar sejajar */}
                  <Button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        lat: null,
                        lng: null,
                      }));
                    }}
                    // UPDATE: Style disamakan (bg-red-100, border-red-200)
                    className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/50 shadow-sm transition-all border"
                    disabled={formData.lat === null && formData.lng === null}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                </div>

                {/* Koordinat Display */}
                {formData.lat !== null && formData.lng !== null ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Input Latitude (Updated: Tambah Ikon MapPin di dalam) */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Latitude
                        </label>
                        <div className="relative group">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                          <Input
                            value={formData.lat}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  lat: value,
                                }));
                              }
                            }}
                            type="number"
                            step="0.000001"
                            className="pl-10 h-11 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                            placeholder="-6.208763"
                          />
                        </div>
                      </div>

                      {/* Input Longitude (Updated: Tambah Ikon Map di dalam) */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Longitude
                        </label>
                        <div className="relative group">
                          <Map className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                          <Input
                            value={formData.lng}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  lng: value,
                                }));
                              }
                            }}
                            type="number"
                            step="0.000001"
                            className="pl-10 h-11 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                            placeholder="106.845599"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview Map (Updated: Tambah Shadow & Ring) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preview Lokasi
                      </label>
                      <div className="h-48 rounded-xl overflow-hidden border border-green-200 dark:border-green-800 shadow-inner ring-4 ring-green-50 dark:ring-green-900/10">
                        <MapContainer
                          center={[formData.lat, formData.lng]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                          dragging={false}
                          touchZoom={false}
                          scrollWheelZoom={false}
                          doubleClickZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[formData.lat, formData.lng]} />
                        </MapContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Empty State (Updated: Sedikit lebih rapi)
                  <div className="text-center py-10 border-2 border-dashed border-green-200 dark:border-green-800 rounded-xl bg-green-50/30 dark:bg-green-900/10">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Belum ada koordinat yang ditambahkan
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Klik tombol di atas untuk menambahkan lokasi
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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

      <MapPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        position={formData.lat !== null ? [formData.lat, formData.lng] : null}
        onPositionChange={handleMapPositionChange}
      />
    </div>
  );
};

export default EditStorePage;
