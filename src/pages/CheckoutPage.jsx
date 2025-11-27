import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Home,
  Utensils,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOrder } from '@/contexts/OrderContext';
// Import Supabase Client (Profesional)
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const CheckoutPage = () => {
  const { state, dispatch } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.user_metadata) {
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata.full_name || '',
        phone: user.user_metadata.phone || '',
        // Alamat nanti bisa diambil dari tabel 'profiles' jika sudah ada
      }));
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('pickup');

  const totalPrice = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = deliveryOption === 'delivery' ? 5000 : 0;
  const finalTotal = totalPrice + deliveryFee;

  // Validasi profesional
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Nama lengkap wajib diisi';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Nama minimal 2 karakter';
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
          newErrors.name =
            'Nama hanya boleh mengandung huruf, spasi, dan tanda baca';
        } else {
          delete newErrors.name;
        }
        break;

      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Nomor WhatsApp wajib diisi';
        } else {
          const cleanPhone = value.replace(/\D/g, '');
          if (cleanPhone.length < 10) {
            newErrors.phone = 'Nomor minimal 10 digit';
          } else if (cleanPhone.length > 15) {
            newErrors.phone = 'Nomor maksimal 15 digit';
          } else if (!/^[0-9+-\s()]+$/.test(value)) {
            newErrors.phone = 'Format nomor tidak valid';
          } else {
            delete newErrors.phone;
          }
        }
        break;

      case 'address':
        if (deliveryOption === 'delivery') {
          if (!value.trim()) {
            newErrors.address = 'Alamat pengiriman wajib diisi';
          } else if (value.trim().length < 10) {
            newErrors.address = 'Alamat terlalu pendek, minimal 10 karakter';
          } else if (value.trim().length > 200) {
            newErrors.address = 'Alamat terlalu panjang, maksimal 200 karakter';
          } else {
            delete newErrors.address;
          }
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

  const validateForm = () => {
    return {
      ...validateField('name', formData.name),
      ...validateField('phone', formData.phone),
      ...validateField('address', formData.address),
    };
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation untuk field yang sudah di-touch
    if (touched[field]) {
      setErrors(() => validateField(field, value));
    }
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(() => validateField(field, formData[field]));
  };

  // --- LOGIC BARU: CONNECT TO SUPABASE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark semua field as touched
    const allTouched = {
      name: true,
      phone: true,
      address: deliveryOption === 'delivery',
      notes: true,
    };
    setTouched(allTouched);

    // Validasi final
    const newErrors = validateForm();
    setErrors(newErrors);

    // Jika ada error, stop submission
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Generate Order Number Unik
      const timestamp = Date.now().toString().slice(-6);
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 5)
        .toUpperCase();
      const orderNumber = `ORD-${timestamp}-${randomStr}`;

      // 2. INSERT ke Tabel 'orders' Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_address:
              deliveryOption === 'delivery' ? formData.address : null,
            customer_notes: formData.notes,
            total_amount: finalTotal,
            delivery_fee: deliveryFee,
            delivery_method: deliveryOption,
            payment_status: 'pending',
            order_status: 'new',
            estimated_ready_time: new Date(
              Date.now() + 25 * 60000
            ).toISOString(),
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. INSERT ke Tabel 'order_items' Supabase
      const orderItems = state.cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.id, // UUID Produk
        product_name: item.name, // Backup nama produk
        price_at_purchase: item.price,
        quantity: item.quantity,
        // umkm_id: item.umkm_id // Opsional jika kolom ini ada di tabel order_items
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. SUKSES: Update Context & Pindah Halaman
      // Kita kirim object order lengkap agar PaymentPage tidak perlu fetch ulang
      const fullOrder = {
        ...orderData,
        items: state.cart,
        customer: formData,
      };

      dispatch({ type: 'START_ORDER', payload: fullOrder });
      dispatch({ type: 'CLEAR_CART' });

      navigate('/payment', {
        state: {
          orderData: fullOrder, // Mengirim data order yang sudah tersimpan di DB
        },
      });
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const requiredFields = ['name', 'phone'];
    if (deliveryOption === 'delivery') requiredFields.push('address');

    return (
      requiredFields.every((field) => formData[field]?.trim()) &&
      Object.keys(validateForm()).length === 0
    );
  };

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Utensils className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Keranjang Kosong
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Silakan tambahkan item ke keranjang terlebih dahulu.
              </p>
              <Button asChild className="bg-green-500 hover:bg-green-600">
                <Link to="/direktori">Jelajahi UMKM</Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto max-w-4xl px-4">
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
            className="
                border-green-300 text-green-700 
                hover:bg-green-50 hover:text-green-800 
                dark:border-green-700 dark:text-green-300 
                dark:hover:bg-green-900/50 dark:hover:text-green-200
                transition-colors duration-200
            "
          >
            <Link to="/direktori">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              Checkout Pesanan
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Lengkapi data diri untuk menyelesaikan pesanan
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Data Diri Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Data Diri
                    <span className="text-red-500">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nama Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleFieldChange('name', e.target.value)
                        }
                        onBlur={() => handleFieldBlur('name')}
                        placeholder="Masukkan nama lengkap"
                        className={`pr-10 transition-all duration-200 ${
                          errors.name
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : formData.name && !errors.name
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : 'focus-visible:ring-green-500'
                        }`}
                      />
                      {formData.name && !errors.name && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                      {errors.name && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          // Auto-format: hanya allow angka dan simbol telepon
                          const value = e.target.value.replace(
                            /[^\d+-\s()]/g,
                            ''
                          );
                          handleFieldChange('phone', value);
                        }}
                        onBlur={() => handleFieldBlur('phone')}
                        placeholder="Contoh: 081234567890 atau +6281234567890"
                        className={`pr-10 transition-all duration-200 ${
                          errors.phone
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : formData.phone && !errors.phone
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : 'focus-visible:ring-green-500'
                        }`}
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Pengiriman Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Pickup Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setDeliveryOption('pickup')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        deliveryOption === 'pickup'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <Home className="w-5 h-5 mb-2" />
                      <div className="font-semibold">Ambil Sendiri</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Gratis
                      </div>
                    </motion.button>

                    {/* Delivery Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setDeliveryOption('delivery')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        deliveryOption === 'delivery'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <Clock className="w-5 h-5 mb-2" />
                      <div className="font-semibold">Antar</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Rp 5.000
                      </div>
                    </motion.button>
                  </div>

                  {/* Address Field (hanya untuk delivery) */}
                  {deliveryOption === 'delivery' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alamat Lengkap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            handleFieldChange('address', e.target.value)
                          }
                          onBlur={() => handleFieldBlur('address')}
                          placeholder="Masukkan alamat lengkap pengiriman termasuk patokan"
                          className={`min-h-[100px] resize-y pr-10 transition-all duration-200 ${
                            errors.address
                              ? 'border-red-500 focus-visible:ring-red-500'
                              : formData.address && !errors.address
                              ? 'border-green-500 focus-visible:ring-green-500'
                              : 'focus-visible:ring-green-500'
                          }`}
                        />
                        {formData.address && !errors.address && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                        )}
                        {errors.address && (
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                        )}
                      </div>
                      {errors.address && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-red-500 text-sm mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.address}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Catatan Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glas-scard border border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Catatan Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder="Contoh: Jangan pakai micin, pedas level 3, tanpa acar, dll."
                    className="focus-visible:ring-green-500 min-h-[100px] resize-y"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Opsional - untuk permintaan khusus pada pesanan
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Card className="glass-card border border-green-200 dark:border-green-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Ringkasan Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {state.cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.quantity}x {item.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.umkm}
                        </div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      Rp {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {deliveryOption === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Ongkos Kirim
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Rp 5.000
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-green-600 dark:text-green-400">
                      Rp {finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed h-12 text-lg font-bold mt-4 transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Memproses...
                      </>
                    ) : (
                      'Konfirmasi Pesanan'
                    )}
                  </Button>
                </motion.div>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang
                  berlaku
                </p>

                {/* Validation Summary */}
                {Object.keys(errors).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3"
                  >
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Harap perbaiki {Object.keys(errors).length} kesalahan
                      sebelum melanjutkan
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
