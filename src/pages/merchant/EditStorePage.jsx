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
import { useMap } from 'react-leaflet';

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
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showAlert('Browser Anda tidak mendukung Geolocation', 'error');
      return;
    }

    showAlert('Sedang mencari titik lokasi Anda...', 'info');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        console.log('Akurasi GPS:', accuracy, 'meter');

        if (accuracy > 5000) {
          showAlert(
            `Akurasi GPS rendah (±${Math.round(
              accuracy
            )}m). Mencoba lokasi via alamat...`,
            'warning'
          );

          try {
            const location = await getApproximateLocation();
            if (location) {
              setFormData((prev) => ({
                ...prev,
                lat: location.lat,
                lng: location.lng,
              }));
              showAlert(
                `Lokasi ditetapkan di ${location.city}. Silakan sesuaikan di peta.`,
                'success'
              );
              return;
            }
          } catch (error) {
            console.log('Reverse geocode failed:', error);
          }
        }

        setFormData((prev) => ({
          ...prev,
          lat: parseFloat(latitude.toFixed(6)),
          lng: parseFloat(longitude.toFixed(6)),
        }));

        if (accuracy > 500) {
          showAlert(
            `Lokasi ditemukan (Akurasi: ±${Math.round(
              accuracy
            )}m). Silakan koreksi manual jika perlu.`,
            'warning'
          );
        } else {
          showAlert('Lokasi berhasil ditemukan!', 'success');
        }
      },
      async (error) => {
        console.error('GPS Error:', error);

        try {
          showAlert(
            'GPS tidak tersedia, mencoba lokasi via jaringan...',
            'info'
          );
          const location = await getApproximateLocation();
          if (location) {
            setFormData((prev) => ({
              ...prev,
              lat: location.lat,
              lng: location.lng,
            }));
            showAlert(
              `Lokasi ditetapkan di ${location.city}. Silakan sesuaikan di peta.`,
              'success'
            );
          } else {
            throw new Error('Gagal mendapatkan lokasi');
          }
        } catch {
          let msg = 'Gagal mendapatkan lokasi.';
          if (error.code === 1) {
            msg =
              'Izin lokasi ditolak. Mohon izinkan browser mengakses lokasi, atau gunakan "Pilih Lewat Peta".';
          } else if (error.code === 2) {
            msg =
              'Sinyal GPS tidak tersedia. Silakan gunakan fitur "Pilih Lewat Peta".';
          } else if (error.code === 3) {
            msg = 'Waktu permintaan lokasi habis.';
          }
          showAlert(msg, 'error');
        }
      },
      options
    );
  };

  const getApproximateLocation = async () => {
    try {
      // Coba dapatkan lokasi dari IP-based service
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP location failed');

      const data = await response.json();
      const city = data.city || 'Karawang';
      const region = data.region || 'Jawa Barat';

      // Gunakan OpenStreetMap Nominatim untuk geocode kota ke koordinat
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          city + ', ' + region + ', Indonesia'
        )}&limit=1`
      );

      const geocodeData = await geocodeResponse.json();

      if (geocodeData && geocodeData[0]) {
        const { lat, lon } = geocodeData[0];
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          city: city,
          region: region,
        };
      }

      // Fallback ke koordinat Karawang
      return {
        lat: -6.3016,
        lng: 107.3019,
        city: 'Karawang',
        region: 'Jawa Barat',
      };
    } catch (error) {
      console.error('Approximate location error:', error);
      // Ultimate fallback ke Karawang
      return {
        lat: -6.3016,
        lng: 107.3019,
        city: 'Karawang',
        region: 'Jawa Barat',
      };
    }
  };

  const handleMapPositionChange = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      lat: lat,
      lng: lng,
    }));
  };

  const MapFixer = ({ isOpen }) => {
    const map = useMap();

    useEffect(() => {
      if (isOpen && map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      }
    }, [isOpen, map]);

    return null;
  };

  // Map Picker Modal Component
  const MapPickerModal = ({ isOpen, onClose, position, onPositionChange }) => {
    // Default ke Karawang jika position null
    const defaultCenter = [-6.3016, 107.3019];
    const [tempPosition, setTempPosition] = useState(position || defaultCenter);

    // Update tempPosition jika prop position berubah
    useEffect(() => {
      if (position) {
        setTempPosition(position);
      }
    }, [position]);

    const LocationMarker = () => {
      const map = useMapEvents({
        click(e) {
          setTempPosition([e.latlng.lat, e.latlng.lng]);
          map.flyTo(e.latlng, map.getZoom()); // Efek animasi geser
        },
      });

      return tempPosition ? <Marker position={tempPosition} /> : null;
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl flex flex-col h-[80vh] border border-green-200 dark:border-green-800">
          {/* Header Modal */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Pilih Lokasi Toko
              </h3>
              <p className="text-sm text-gray-500">
                Klik pada peta untuk menandai lokasi
              </p>
            </div>
            {/* UPDATE: Tombol X lebih rapi */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative bg-gray-100 w-full">
            <MapContainer
              center={tempPosition}
              zoom={13}
              style={{ height: '100%', width: '100%', position: 'absolute' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
              <MapFixer isOpen={isOpen} />
            </MapContainer>
          </div>

          {/* Footer Info & Actions */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg w-full md:w-auto border border-green-100 dark:border-green-800">
                <span className="font-semibold">Koordinat Dipilih:</span>{' '}
                {tempPosition[0].toFixed(6)}, {tempPosition[1].toFixed(6)}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-green-300 text-stone-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 transition-colors flex-1 md:flex-none"
                >
                  Batal
                </Button>

                <Button
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none shadow-md shadow-green-600/20"
                  onClick={() => {
                    onPositionChange(tempPosition[0], tempPosition[1]);
                    onClose();
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Simpan Lokasi
                </Button>
              </div>
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
      let lokasi_map_value = formData.lokasi_map; 
      if (formData.lat && formData.lng) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (apiKey) {
          lokasi_map_value = `<iframe src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${formData.lat},${formData.lng}&zoom=16" width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        } else {
          lokasi_map_value = `<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${formData.lng}!3d${formData.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid!4v1760000000000!5m2!1sid!2sid" width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        }
      }
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
        lokasi_map: lokasi_map_value,
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

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <p className="flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Tips:</strong> Jika lokasi tidak akurat (misal:
                      masih di Jakarta), gunakan "Pilih Lewat Peta" untuk
                      pinpoint manual di Karawang.
                    </span>
                  </p>
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

                    {/* Preview Map*/}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Preview Lokasi
                        </label>
                        <Badge variant="outline" className="text-xs">
                          Interaktif
                        </Badge>
                      </div>

                      <div className="h-72 md:h-96 rounded-xl overflow-hidden border-2 border-green-200 dark:border-green-800 shadow-lg">
                        <MapContainer
                          center={[formData.lat, formData.lng]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                          dragging={true}
                          touchZoom={true}
                          scrollWheelZoom={true}
                          doubleClickZoom={true}
                          zoomControl={true}
                          whenCreated={(map) => {
                            setTimeout(() => map.invalidateSize(), 0);
                          }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker
                            position={[formData.lat, formData.lng]}
                            draggable={true}
                            eventHandlers={{
                              dragend: (e) => {
                                const marker = e.target;
                                const position = marker.getLatLng();
                                setFormData((prev) => ({
                                  ...prev,
                                  lat: position.lat,
                                  lng: position.lng,
                                }));
                              },
                            }}
                          />
                        </MapContainer>
                      </div>

                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Drag untuk geser</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Scroll untuk zoom</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span>Double click zoom in</span>
                        </div>
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

          {/* Action Buttons - FIXED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end gap-4 pt-4"
          >
            {/* Tombol Batal - TAMBAHKAN h-11 */}
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/merchant/dashboard')}
              className="h-11 px-6 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300 transition-colors"
            >
              Batal
            </Button>

            {/* Tombol Simpan - BUANG min-w, TAMBAH px-6 */}
            <Button
              type="submit"
              className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20 transition-all active:scale-[0.98]"
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
