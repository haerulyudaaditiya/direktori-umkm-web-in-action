// src/pages/OrderConfirmation.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Share2,
  Home,
  Utensils,
  User,
  Sparkles,
  Truck,
  MessageCircle,
  Shield,
  CreditCard,
  Receipt,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrder } from '@/contexts/OrderContext';
import { supabase } from '@/lib/supabaseClient'; // IMPORT SUPABASE

const OrderConfirmation = () => {
  const { orderId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const location = useLocation();
  const { state: orderState } = useOrder();

  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ minutes: 25, seconds: 0 });
  const [isReady, setIsReady] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [imageErrors, setImageErrors] = useState({});

  const generateOrderNumber = (id) => {
    return `ORD-${id?.slice(0, 8).toUpperCase() || '000000'}`;
  };

  // --- LOGIC BARU: REALTIME FETCHING ---
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // 1. Cek apakah data sudah ada di location state (biar cepat)
        if (
          location.state?.orderData &&
          location.state.orderData.id === orderId
        ) {
          // Merge dengan items dari state jika ada
          const initialData = location.state.orderData;
          if (!initialData.items && orderState.cart.length > 0) {
            initialData.items = orderState.cart;
          }
          setOrder(initialData);
        } else {
          // 2. Jika tidak ada/refresh, Fetch dari Supabase (Join items)
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();

          if (error) throw error;

          // Map order_items agar struktur sama dengan cart (untuk display)
          if (data) {
            const mappedItems = data.order_items.map((item) => ({
              id: item.product_id,
              name: item.product_name,
              price: item.price_at_purchase,
              quantity: item.quantity,
              // Image dan UMKM name mungkin null kalau join-nya belum dalam (kita handle di UI)
              umkm: 'UMKM',
            }));
            setOrder({
              ...data,
              items: mappedItems,
              customer: {
                name: data.customer_name,
                phone: data.customer_phone,
                address: data.customer_address,
                notes: data.customer_notes,
              },
            });
          }
        }
      } catch (err) {
        console.error('Gagal memuat pesanan:', err);
        // Jangan redirect dulu, biarkan loading state atau error message
      }
    };

    fetchOrder();

    // --- REALTIME SUBSCRIPTION ---
    // Dengarkan perubahan pada baris order ini
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order Updated:', payload.new);
          // Update local state dengan data baru
          setOrder((prev) => ({ ...prev, ...payload.new }));

          // Cek status selesai
          if (
            payload.new.order_status === 'ready' ||
            payload.new.order_status === 'completed'
          ) {
            setIsReady(true);
            setShowConfetti(true);
            setCurrentStep(3);
            setProgress(100);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId, location.state, orderState.cart]);

  // --- LOGIC PROGRESS BAR & TIMER ---
  // Tetap jalan sebagai estimasi, tapi bisa di-override oleh Realtime status
  useEffect(() => {
    if (!order) return;

    // Jika status dari DB sudah 'ready', langsung set selesai
    if (order.order_status === 'ready' || order.order_status === 'completed') {
      setIsReady(true);
      setCurrentStep(3);
      setProgress(100);
      setTimeLeft({ minutes: 0, seconds: 0 });
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      // Gunakan estimated_ready_time dari DB jika ada, kalau tidak pakai +25 menit manual
      const estimatedTime = order.estimated_ready_time
        ? new Date(order.estimated_ready_time)
        : new Date(new Date(order.created_at).getTime() + 25 * 60000);

      const difference = estimatedTime - now;
      const totalTime = 25 * 60000; // Asumsi durasi standar 25 menit
      const elapsed = totalTime - difference;

      // Update progress (max 95% sampai benar-benar 'ready' dari DB)
      const newProgress = Math.min((elapsed / totalTime) * 100, 95);

      if (!isReady) {
        setProgress(newProgress);
        // Map progress to steps
        if (newProgress < 33) setCurrentStep(0); // Diproses
        else if (newProgress < 66) setCurrentStep(1); // Disiapkan
        else setCurrentStep(2); // Siap Diambil (Hampir)
      }

      if (difference <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        // Kita tidak set IsReady=true di sini, tunggu konfirmasi DB Realtime
        clearInterval(timer);
      } else {
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order, isReady]);

  const steps = [
    {
      name: 'Diproses',
      description: 'Pesanan diterima UMKM',
      time: '2-5 menit',
      icon: Receipt,
    },
    {
      name: 'Disiapkan',
      description: 'Bahan sedang dimasak',
      time: '10-15 menit',
      icon: Utensils,
    },
    {
      name: 'Siap Diambil',
      description: 'Pesanan sudah siap',
      time: '0-2 menit',
      icon: CheckCircle,
    },
    {
      name: 'Selesai',
      description: 'Pesanan telah selesai',
      time: '',
      icon: Sparkles,
    },
  ];

  const handleShare = useCallback(async () => {
    if (!order) return;

    const orderNumber = order.order_number || generateOrderNumber(order.id);
    const shareText = `Saya baru saja memesan dari UMKM Karawang! 🍽️\n
📦 Pesanan: #${orderNumber}
💰 Total: Rp ${Number(order.total_amount || order.total).toLocaleString()}
📍 Status: ${isReady ? 'Siap Diambil' : 'Sedang Disiapkan'}

Dukung UMKM lokal dengan #KarawangMart!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pesanan #${orderNumber} - KarawangMart`,
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText);
          alert('Detail pesanan disalin ke clipboard! 📋');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Detail pesanan disalin ke clipboard! 📋');
    }
  }, [order, isReady]);

  const handleContactUMKM = useCallback(() => {
    if (!order) return;

    const orderNumber = order.order_number || generateOrderNumber(order.id);
    const phoneNumber = '6281234567890'; // Nanti bisa ambil dari relation umkm

    const message = `Halo, saya ingin bertanya tentang pesanan #${orderNumber} atas nama ${
      order.customer_name || order.customer?.name
    }`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  }, [order]);

  // Confetti component (Sama Persis)
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
          }}
          initial={{
            y: -100,
            x: Math.random() * window.innerWidth,
            scale: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 100,
            x: Math.random() * window.innerWidth - 100,
            scale: [0, 1, 0.5],
            rotate: 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <Clock className="h-10 w-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <CardTitle className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Memuat Pesanan...
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Sedang sinkronisasi data pesanan Anda...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const orderNumber = order.order_number || generateOrderNumber(order.id);
  // Map DB fields to UI if needed
  const displayTotal = order.total_amount || order.total;
  const displayAddress = order.customer_address || order.customer?.address;
  const displayPhone = order.customer_phone || order.customer?.phone;
  const displayName = order.customer_name || order.customer?.name;
  const displayNotes = order.customer_notes || order.customer?.notes;
  const displayMethod = order.delivery_method || order.deliveryOption;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      <div className="container mx-auto max-w-4xl px-4">
        {/* Header Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            asChild
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300"
          >
            <Link to="/direktori" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Direktori
            </Link>
          </Button>

          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm border border-green-200 dark:border-green-800">
            <Receipt className="h-3 w-3" />
            <span>Konfirmasi Pesanan</span>
          </div>
        </motion.div>

        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
            >
              {isReady ? (
                <Sparkles className="h-10 w-10 text-white" />
              ) : (
                <CheckCircle className="h-10 w-10 text-white" />
              )}
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              {isReady ? 'Pesanan Siap!' : 'Pesanan Diterima!'}
            </span>
            <span className="text-amber-600">{isReady && ' 🎉'}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 dark:text-gray-300 mb-6"
          >
            {isReady
              ? 'Pesanan Anda sudah siap untuk diambil'
              : 'Pesanan Anda sedang diproses oleh UMKM'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 font-mono text-sm px-3 py-1">
              #{orderNumber}
            </Badge>
            <Badge
              variant="outline"
              className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-300"
            >
              <CreditCard className="w-3 h-3 mr-1" />
              {order.paymentMethod || order.payment_method || 'QRIS'} •{' '}
              {(order.paymentStatus || order.payment_status) === 'paid'
                ? 'LUNAS'
                : 'MENUNGGU'}
            </Badge>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border border-green-200 dark:border-green-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Status Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Countdown Timer */}
                  <div className="text-center py-4 bg-gradient-to-r from-green-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-green-100 dark:border-green-800">
                    <motion.div
                      key={timeLeft.minutes}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2 font-mono"
                    >
                      {isReady ? (
                        <span className="text-green-600 dark:text-green-400">
                          READY!
                        </span>
                      ) : (
                        `${timeLeft.minutes
                          .toString()
                          .padStart(2, '0')}:${timeLeft.seconds
                          .toString()
                          .padStart(2, '0')}`
                      )}
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isReady
                        ? 'Pesanan siap diambil'
                        : `Estimasi siap: ${timeLeft.minutes} menit ${timeLeft.seconds} detik`}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Timeline Steps */}
                  <div className="space-y-3">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = index < currentStep;
                      const isCurrent = index === currentStep;

                      return (
                        <motion.div
                          key={step.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isCurrent
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : isCompleted
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isCurrent
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            }`}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-medium ${
                                  isCurrent || isCompleted
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {step.name}
                              </span>
                              {step.time && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {step.time}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {step.description}
                            </p>
                          </div>
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Detail Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {item.quantity}x {item.name}
                              </h4>
                              <p className="text-green-600 dark:text-green-400 text-sm">
                                {item.umkm || 'Menu'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600 dark:text-green-400">
                                Rp{' '}
                                {(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Subtotal</span>
                      <span>
                        Rp{' '}
                        {Number(
                          displayTotal -
                            (order.delivery_fee || order.deliveryFee || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    {(order.delivery_fee || order.deliveryFee) > 0 && (
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Biaya Kirim</span>
                        <span>
                          Rp{' '}
                          {Number(
                            order.delivery_fee || order.deliveryFee
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                      <span className="text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        Rp {Number(displayTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border border-green-200 dark:border-green-800 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Info Pelanggan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-2 rounded-lg">
                    <User className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {displayName || 'Pelanggan'}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 text-sm">
                        {displayPhone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2 rounded-lg">
                    {displayMethod === 'delivery' ? (
                      <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    ) : (
                      <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {displayMethod === 'delivery'
                          ? 'Diantar ke:'
                          : 'Ambil di:'}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 text-sm">
                        {displayMethod === 'delivery'
                          ? displayAddress
                          : 'Lokasi UMKM'}
                      </div>
                    </div>
                  </div>

                  {displayNotes && (
                    <div className="flex items-start gap-3 p-2 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          Catatan:
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 text-sm">
                          {displayNotes}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Akses Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleContactUMKM}
                    className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-11 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Hubungi UMKM
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-200 h-11"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Bagikan Pesanan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Support Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Butuh Bantuan?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>Tim support kami siap membantu 24/7.</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg">
                      <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>+62 812-3456-7890</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>WhatsApp Support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-green-600 to-amber-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Terima Kasih Telah Mendukung UMKM Karawang!
            </h3>
            <p className="text-green-100 mb-6">
              Setiap pesanan Anda membantu perekonomian lokal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-white text-green-600 hover:bg-green-50 font-semibold"
              >
                <Link to="/direktori">Pesan Lagi</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white hover:text-green-600"
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Beranda
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
