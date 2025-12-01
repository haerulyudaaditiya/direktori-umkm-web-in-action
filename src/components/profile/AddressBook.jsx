import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Building,
  Loader2,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';

const AddressBook = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    label: 'Rumah',
    recipient_name: '',
    phone: '',
    full_address: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch {
      setError('Gagal memuat alamat');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAddresses();
  }, [userId, fetchAddresses]);

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'recipient_name':
        if (!value.trim()) {
          return 'Nama penerima wajib diisi';
        } else if (value.trim().length < 2) {
          return 'Nama minimal 2 karakter';
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
          return 'Nama hanya boleh mengandung huruf, spasi, dan tanda baca';
        }
        return '';

      case 'phone':
        if (!value.trim()) {
          return 'Nomor WhatsApp wajib diisi';
        } else {
          const cleanPhone = value.replace(/\D/g, '');
          if (cleanPhone.length < 10) {
            return 'Nomor minimal 10 digit';
          } else if (cleanPhone.length > 15) {
            return 'Nomor maksimal 15 digit';
          } else if (!/^[0-9+-\s()]+$/.test(value)) {
            return 'Format nomor tidak valid';
          }
        }
        return '';

      case 'full_address':
        if (!value.trim()) {
          return 'Alamat lengkap wajib diisi';
        } else if (value.trim().length < 10) {
          return 'Alamat terlalu pendek, minimal 10 karakter';
        } else if (value.trim().length > 200) {
          return 'Alamat terlalu panjang, maksimal 200 karakter';
        }
        return '';

      case 'label':
        if (!value.trim()) {
          return 'Label alamat wajib diisi';
        }
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    return newErrors;
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'phone') {
      const formattedValue = value.replace(/[^\d+-\s()]/g, '');
      setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    }

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  // Save New Address
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    const allTouched = {
      label: true,
      recipient_name: true,
      phone: true,
      full_address: true,
    };
    setTouched(allTouched);

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setSaveLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('addresses').insert([
        {
          user_id: userId,
          ...formData,
          is_default: addresses.length === 0,
        },
      ]);

      if (error) throw error;

      setSuccess('Alamat berhasil disimpan!');
      await fetchAddresses();
      setIsAdding(false);
      setFormData({
        label: 'Rumah',
        recipient_name: '',
        phone: '',
        full_address: '',
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      setError(error.message || 'Terjadi kesalahan saat menyimpan alamat');
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete Address
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;

      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      setSuccess('Alamat berhasil dihapus!');
      setDeleteConfirm(null);
    } catch {
      setError('Gagal menghapus alamat');
      setDeleteConfirm(null);
    }
  };

  // Helper Icon
  const getIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('kantor')) return <Briefcase className="w-4 h-4" />;
    if (l.includes('kos')) return <Building className="w-4 h-4" />;
    return <Home className="w-4 h-4" />;
  };

  const isFormValid = () => {
    return Object.keys(validateForm()).length === 0;
  };

  const DeleteModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
  };

  return (
    <div className="space-y-6">
      {/* Error & Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-300 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Buku Alamat
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola alamat pengiriman Anda
            </p>
          </div>
        </div>

        {!isAdding && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Alamat
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Address Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Tambah Alamat Baru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Label Alamat */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Label Alamat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="label"
                        placeholder="Rumah / Kantor / Kos"
                        className={`h-11 transition-all duration-200 ${
                          errors.label
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : formData.label && !errors.label
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                        }`}
                        value={formData.label}
                        onChange={(e) =>
                          handleFieldChange('label', e.target.value)
                        }
                        onBlur={() => handleFieldBlur('label')}
                      />
                      {formData.label && !errors.label && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                      {errors.label && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                    {errors.label && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.label}
                      </motion.p>
                    )}
                  </div>

                  {/* Nama Penerima */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nama Penerima <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="recipient_name"
                        placeholder="Nama lengkap penerima"
                        className={`pl-10 h-11 transition-all duration-200 ${
                          errors.recipient_name
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : formData.recipient_name && !errors.recipient_name
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                        }`}
                        value={formData.recipient_name}
                        onChange={(e) =>
                          handleFieldChange('recipient_name', e.target.value)
                        }
                        onBlur={() => handleFieldBlur('recipient_name')}
                      />
                      {formData.recipient_name && !errors.recipient_name && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                      {errors.recipient_name && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                    {errors.recipient_name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.recipient_name}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="081234567890"
                      className={`pl-10 h-11 transition-all duration-200 ${
                        errors.phone
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : formData.phone && !errors.phone
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                      }`}
                      value={formData.phone}
                      onChange={(e) =>
                        handleFieldChange('phone', e.target.value)
                      }
                      onBlur={() => handleFieldBlur('phone')}
                    />
                    {formData.phone && !errors.phone && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    )}
                    {errors.phone && (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Alamat Lengkap */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      id="full_address"
                      placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kode pos..."
                      className={`min-h-[100px] resize-y transition-all duration-200 ${
                        errors.full_address
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : formData.full_address && !errors.full_address
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : 'border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                      }`}
                      value={formData.full_address}
                      onChange={(e) =>
                        handleFieldChange('full_address', e.target.value)
                      }
                      onBlur={() => handleFieldBlur('full_address')}
                    />
                    {formData.full_address && !errors.full_address && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                    )}
                    {errors.full_address && (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                    )}
                  </div>
                  {errors.full_address && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.full_address}
                    </motion.p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setErrors({});
                      setTouched({});
                    }}
                    className="border-green-200 text-stone-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 transition-colors"
                  >
                    Batal
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSave}
                    disabled={saveLoading || !isFormValid()}
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Alamat'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600 mb-2" />
            <p className="text-sm text-gray-500">Memuat alamat...</p>
          </div>
        ) : addresses.length === 0 ? (
          <Card className="glass-card border border-dashed border-green-200 dark:border-green-800 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
              Belum ada alamat
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-md mx-auto">
              Tambah alamat untuk memudahkan pengiriman pesanan
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Alamat Pertama
            </Button>
          </Card>
        ) : (
          addresses.map((addr, index) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 mt-1">
                        {getIcon(addr.label)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {addr.label}
                          </span>
                          {addr.is_default && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs">
                              Default
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <User className="w-4 h-4" />
                            <span>{addr.recipient_name}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Phone className="w-4 h-4" />
                            <span>{addr.phone}</span>
                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {addr.full_address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteConfirm(addr)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

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
                    Hapus Alamat?
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Anda akan menghapus alamat:
                </p>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {deleteConfirm.label} - {deleteConfirm.recipient_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {deleteConfirm.full_address}
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

export default AddressBook;
