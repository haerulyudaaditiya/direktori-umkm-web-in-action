// src/pages/OrderConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ minutes: 25, seconds: 0 });
  const [isReady, setIsReady] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Simulasi data order dari Checkout
  useEffect(() => {
    const mockOrder = {
      id: orderId,
      customer: {
        name: 'John Doe',
        phone: '081234567890',
        address: 'Jl. Contoh No. 123, Karawang',
        notes: 'Tambah sambal dan tidak pakai micin',
      },
      items: [
        {
          id: 1,
          name: 'Nasi Goreng Spesial',
          price: 25000,
          quantity: 2,
          umkm: 'Warung Makan Sederhana',
        },
        {
          id: 2,
          name: 'Es Teh Manis',
          price: 5000,
          quantity: 2,
          umkm: 'Warung Makan Sederhana',
        },
      ],
      deliveryOption: 'pickup',
      total: 60000,
      status: 'ordered',
      estimatedReady: new Date(Date.now() + 25 * 60000), // 25 menit dari sekarang
      createdAt: new Date(),
    };

    setOrder(mockOrder);
  }, [orderId]);

  // Real-time countdown timer
  useEffect(() => {
    if (!order) return;

    const timer = setInterval(() => {
      const now = new Date();
      const difference = order.estimatedReady - now;

      if (difference <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        setIsReady(true);
        setShowConfetti(true);
        clearInterval(timer);

        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ minutes, seconds });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [order]);

  const handleShare = async () => {
    const shareText = `Saya baru saja memesan dari UMKM Karawang! 🍽️\nPesanan: #${
      order.id
    }\nTotal: Rp ${order.total.toLocaleString()}\nEstimasi siap: ${
      timeLeft.minutes
    } menit`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pesanan #${orderId} - UMKM Karawang`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        console.log('Sharing cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      // Show toast notification (bisa ditambah nanti)
      alert('Detail pesanan disalin ke clipboard! 📋');
    }
  };

  // Confetti component sederhana
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-green-500 to-amber-500 rounded-full"
          initial={{
            y: -100,
            x: Math.random() * window.innerWidth,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            y: window.innerHeight + 100,
            x: Math.random() * window.innerWidth - 100,
            scale: [0, 1, 0.5],
            rotate: 360,
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
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Memuat Pesanan...
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Sedang menyiapkan konfirmasi pesanan Anda
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      <div className="container mx-auto max-w-2xl px-4">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              {isReady ? (
                <Sparkles className="h-10 w-10 text-amber-500" />
              ) : (
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              )}
            </motion.div>

            {isReady && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Badge className="bg-amber-500 text-white border-0 animate-pulse">
                  Siap!
                </Badge>
              </motion.div>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-2"
          >
            {isReady ? 'Pesanan Siap! 🎉' : 'Pesanan Berhasil!'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-300"
          >
            {isReady
              ? 'Pesanan Anda sudah siap untuk diambil'
              : 'Pesanan Anda sedang diproses oleh UMKM'}
          </motion.p>

          <Badge className="mt-3 bg-green-500 text-white border-0 font-mono">
            #{order.id}
          </Badge>
        </motion.div>

        <div className="space-y-6">
          {/* Order Timeline dengan Countdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  {isReady ? 'Pesanan Siap' : 'Estimasi Siap'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <motion.div
                    key={timeLeft.minutes}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-amber-600 mb-2 font-mono"
                  >
                    {isReady ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🎉 READY!
                      </motion.div>
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
                      ? 'Silakan ambil pesanan Anda di lokasi UMKM'
                      : `Pesanan diperkirakan siap dalam ${timeLeft.minutes} menit ${timeLeft.seconds} detik`}
                  </p>
                </div>

                {/* Progress Steps dengan Animasi */}
                <div className="flex justify-between items-center mt-6 relative">
                  <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -z-10">
                    <motion.div
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{
                        width: isReady
                          ? '100%'
                          : timeLeft.minutes <= 10
                          ? '66%'
                          : '33%',
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {['Diproses', 'Disiapkan', 'Siap'].map((step, index) => {
                    const isActive = isReady
                      ? true
                      : index === 0
                      ? true
                      : index === 1 && timeLeft.minutes <= 10;

                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center relative z-10"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.2 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isActive
                              ? 'bg-green-500 border-green-500 text-white shadow-lg'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </motion.div>
                        <span
                          className={`text-sm mt-2 font-medium ${
                            isActive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Detail Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
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
                      <div className="text-green-600 dark:text-green-400 font-semibold">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="border-t border-gray-200 dark:border-gray-700 pt-4"
                >
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-green-600 dark:text-green-400">
                      Rp {order.total.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Info{' '}
                  {order.deliveryOption === 'delivery'
                    ? 'Pengiriman'
                    : 'Pengambilan'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {order.customer.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {order.customer.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {order.deliveryOption === 'delivery'
                        ? 'Diantar ke:'
                        : 'Ambil di:'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {order.deliveryOption === 'delivery'
                        ? order.customer.address
                        : 'Lokasi UMKM (tertera di Google Maps)'}
                    </div>
                  </div>
                </div>

                {order.customer.notes && (
                  <div className="flex items-start gap-3">
                    <Utensils className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Catatan Khusus:
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {order.customer.notes}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Button
              asChild
              className="bg-green-500 hover:bg-green-600 h-12 font-semibold transition-all duration-200"
            >
              <Link
                to={`/order-tracking/${order.id}`}
                className="flex items-center gap-2 justify-center"
              >
                <Clock className="w-4 h-4" />
                Lacak Pesanan
              </Link>
            </Button>

            <Button
            onClick={handleShare}
            variant="outline"
            className="
                border-green-300 text-green-700 
                hover:bg-green-50 hover:text-green-800 
                dark:border-green-700 dark:text-green-300 
                dark:hover:bg-green-900/50 dark:hover:text-green-200
                h-12 font-semibold transition-all duration-200
                flex items-center gap-2
            "
            >
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
            asChild 
            variant="outline"
            className="
                w-full h-12 transition-all duration-200
                border-green-300 text-green-700 
                hover:bg-green-50 hover:text-green-800 
                dark:border-green-700 dark:text-green-300 
                dark:hover:bg-green-900/50 dark:hover:text-green-200
            "
            >
              <Link to="/" className="flex items-center gap-2 justify-center">
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
