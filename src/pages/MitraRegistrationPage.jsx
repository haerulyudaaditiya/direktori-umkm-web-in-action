import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  MapPin,
  Phone,
  Loader2,
  CheckCircle2,
  LayoutDashboard,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Shield,
  Users,
  Zap,
  AlertCircle,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import ReactDOM from 'react-dom';

const MitraRegistrationPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Alert Modal Portal
  const AlertModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
  };

  // Fungsi helper untuk menampilkan modal alert
  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    kategori: '',
    kontak: '',
    alamat: '',
    cerita: '',
  });

  // Redirect jika user sudah jadi merchant
  useEffect(() => {
    if (profile?.role === 'merchant') {
      navigate('/merchant/dashboard');
    }
  }, [profile, navigate]);

  // Auto-generate slug yang rapi
  const handleNameChange = (e) => {
    const name = e.target.value;

    // Generate slug yang lebih bersih
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter spesial kecuali spasi dan dash
      .trim()
      .replace(/\s+/g, '-') // Ganti spasi dengan dash
      .replace(/-+/g, '-'); // Hapus multiple dash berturut-turut

    setFormData((prev) => ({ ...prev, nama: name, slug: name ? slug : '' }));

    // Clear validation error untuk field ini
    if (validationErrors.nama) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.nama;
        return newErrors;
      });
    }
  };

  // Validasi field
  const validateField = (name, value) => {
    switch (name) {
      case 'nama':
        if (!value.trim()) return 'Nama usaha wajib diisi';
        if (value.trim().length < 3) return 'Nama usaha minimal 3 karakter';
        return '';

      case 'kategori':
        if (!value) return 'Kategori usaha wajib dipilih';
        return '';

      case 'kontak': {
        if (!value.trim()) {
          return 'Nomor WhatsApp wajib diisi';
        }

        const cleanPhone = value.replace(/\D/g, '');

        if (cleanPhone.length < 10) {
          return 'Nomor minimal 10 digit';
        } else if (cleanPhone.length > 15) {
          return 'Nomor maksimal 15 digit';
        } else if (!/^[0-9]+$/.test(cleanPhone)) {
          return 'Format nomor tidak valid';
        }
        return '';
      }

      case 'alamat':
        if (!value.trim()) {
          return 'Alamat usaha wajib diisi';
        } else if (value.trim().length < 10) {
          return 'Alamat terlalu pendek, minimal 10 karakter';
        } else if (value.trim().length > 200) {
          return 'Alamat terlalu panjang, maksimal 200 karakter';
        }
        return '';

      default:
        return '';
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error untuk field ini
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const isFieldValid = (fieldName) => {
    return (
      touched[fieldName] && !validationErrors[fieldName] && formData[fieldName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        showAlert('Anda harus login terlebih dahulu');
        setLoading(false);
        return;
      }

      // Validasi semua field
      const allTouched = {
        nama: true,
        kategori: true,
        kontak: true,
        alamat: true,
      };
      setTouched(allTouched);

      const errors = {};
      Object.keys(allTouched).forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) errors[field] = error;
      });

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setLoading(false);

        // Scroll ke field pertama yang error
        const firstError = Object.keys(errors)[0];
        setTimeout(() => {
          document.getElementById(firstError)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);

        return;
      }

      // 1. Insert Data UMKM Baru ke Database
      const { error: umkmError } = await supabase.from('umkms').insert([
        {
          owner_id: user.id,
          nama: formData.nama,
          slug: formData.slug,
          kategori: formData.kategori,
          kontak: formData.kontak,
          alamat: formData.alamat,
          cerita: formData.cerita,
          rating: 0.0,
          jam_buka: '08:00 - 17:00',
          rentang_harga: '$',
          status_buka: true,
        },
      ]);

      if (umkmError) throw umkmError;

      // 2. Upgrade Role User jadi 'merchant'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'merchant' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. Sukses
      showAlert(
        'Selamat! Toko Anda berhasil dibuat. Anda akan diarahkan ke beranda.',
        'success'
      );

      // Navigasi setelah delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Registrasi Mitra Error:', error);
      showAlert(`Gagal mendaftar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <LayoutDashboard className="w-5 h-5 text-green-600" />,
      title: 'Dashboard Penjual Lengkap',
      description: 'Pantau pesanan, pendapatan, dan analitik real-time',
    },
    {
      icon: <Zap className="w-5 h-5 text-green-600" />,
      title: 'Notifikasi Realtime',
      description: 'Dapatkan notifikasi langsung saat ada pesanan baru',
    },
    {
      icon: <Shield className="w-5 h-5 text-green-600" />,
      title: 'Transaksi Aman',
      description: 'Semua transaksi dilindungi dan terverifikasi',
    },
    {
      icon: <Users className="w-5 h-5 text-green-600" />,
      title: 'Komunitas UMKM',
      description: 'Bergabung dengan 500+ UMKM Karawang lainnya',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header Navigation */}
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
              Daftar Jadi Mitra
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Buka toko online Anda di KarawangMart
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Marketing Pitch */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium border border-green-200 dark:border-green-800"
            >
              <Store className="w-4 h-4" />
              <span>Mitra KarawangMart</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent"
            >
              Buka Toko Online Anda,
              <br />
              <span className="text-2xl md:text-3xl">
                Gratis & Tanpa Biaya Awal!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              Jangkau ribuan pelanggan potensial di Karawang. Kelola pesanan,
              atur menu, dan pantau omzet langsung dari smartphone Anda.
            </motion.p>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass-card p-4 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-green-600 to-amber-500 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-green-100">UMKM Mitra</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">10.000+</div>
                  <div className="text-sm text-green-100">Transaksi/Bulan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-green-100">Kepuasan</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Formulir Pendaftaran Mitra
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Lengkapi data usaha Anda untuk mulai berjualan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nama Usaha */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nama Usaha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="nama"
                        placeholder="Contoh: Warung Makan Padang Sederhana"
                        className={`pl-9 h-11 transition-all ${
                          validationErrors.nama
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : isFieldValid('nama')
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                            : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                        }`}
                        value={formData.nama}
                        onChange={handleNameChange}
                        onBlur={() => handleFieldBlur('nama')}
                        required
                      />
                      {isFieldValid('nama') && (
                        <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3.5" />
                      )}
                      {validationErrors.nama && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3.5" />
                      )}
                    </div>
                    {validationErrors.nama && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.nama}
                      </motion.p>
                    )}
                    {formData.slug && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                        >
                          Preview
                        </Badge>
                        <span>
                          karawangmart.id/umkm/
                          <span className="font-mono">{formData.slug}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Kategori & WhatsApp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kategori */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kategori Usaha <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          onValueChange={(val) => {
                            handleFieldChange('kategori', val);
                            setTouched((prev) => ({ ...prev, kategori: true }));
                          }}
                          required
                        >
                          <SelectTrigger
                            id="kategori"
                            className={`h-11 transition-all ${
                              validationErrors.kategori
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
                            <SelectItem value="Retail">
                              Retail/Sembako
                            </SelectItem>
                            <SelectItem value="Jasa">Jasa/Layanan</SelectItem>
                            <SelectItem value="Pertanian">Pertanian</SelectItem>
                            <SelectItem value="Fashion">Fashion</SelectItem>
                            <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                          </SelectContent>
                        </Select>
                        {isFieldValid('kategori') && (
                          <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3.5" />
                        )}
                        {validationErrors.kategori && (
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3.5" />
                        )}
                      </div>
                      {validationErrors.kategori && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.kategori}
                        </motion.p>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        WhatsApp Admin <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="kontak"
                          placeholder="0812..."
                          className={`pl-9 h-11 transition-all ${
                            validationErrors.kontak
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : isFieldValid('kontak')
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                              : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                          }`}
                          value={formData.kontak}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleFieldChange('kontak', value);
                          }}
                          onBlur={() => handleFieldBlur('kontak')}
                          required
                        />
                        {isFieldValid('kontak') && (
                          <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3.5" />
                        )}
                        {validationErrors.kontak && (
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3.5" />
                        )}
                      </div>
                      {validationErrors.kontak && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.kontak}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="alamat"
                        placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan..."
                        className={`pl-9 min-h-[100px] transition-all ${
                          validationErrors.alamat
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : isFieldValid('alamat')
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                            : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                        }`}
                        value={formData.alamat}
                        onChange={(e) =>
                          handleFieldChange('alamat', e.target.value)
                        }
                        onBlur={() => handleFieldBlur('alamat')}
                        required
                      />
                      {isFieldValid('alamat') && (
                        <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                      )}
                      {validationErrors.alamat && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                      )}
                    </div>
                    {validationErrors.alamat && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.alamat}
                      </motion.p>
                    )}
                  </div>

                  {/* Cerita */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cerita Singkat Usaha (Opsional)
                    </label>
                    <Textarea
                      placeholder="Ceritakan keunikan, sejarah, atau nilai jual usaha Anda..."
                      className="min-h-[100px] border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      value={formData.cerita}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cerita: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 mt-4 transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mendaftarkan Toko...
                        </>
                      ) : (
                        <>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Buka Toko Sekarang
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    Dengan mendaftar, Anda menyetujui{' '}
                    <Link
                      to="/terms"
                      className="text-green-600 hover:underline"
                    >
                      Syarat & Ketentuan
                    </Link>{' '}
                    kami
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Alert Modal (hanya untuk error server) */}
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

                <div className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">
                  {alertMessage}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setShowAlertModal(false);
                      if (alertType === 'success') {
                        window.location.href = '/';
                      }
                    }}
                    className={`${
                      alertType === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {alertType === 'error' ? 'Tutup' : 'Oke, Lanjutkan'}
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

export default MitraRegistrationPage;
