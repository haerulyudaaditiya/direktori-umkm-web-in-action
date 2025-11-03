// src/pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrder } from '@/contexts/OrderContext';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: orderState } = useOrder();

  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes in seconds
  const [showQR, setShowQR] = useState(false);

  // Get order data from location state or context
  const order = location.state?.order || orderState.currentOrder;

  useEffect(() => {
    if (!order) {
      navigate('/checkout');
      return;
    }
  }, [order, navigate]);

  // Countdown timer for payment
  useEffect(() => {
    if (!selectedMethod || isProcessing || isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handlePaymentTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedMethod, isProcessing, isSuccess]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handlePaymentTimeout = () => {
    // Reset payment process
    setSelectedMethod('');
    setCountdown(180);
    setShowQR(false);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsSuccess(true);

    // Auto navigate after success
    setTimeout(() => {
      navigate(`/order-confirmation/${order.id}`, {
        state: { order, paymentMethod: selectedMethod },
      });
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'qris',
      name: 'QRIS',
      description: 'Scan QR code dengan aplikasi e-wallet atau mobile banking',
      icon: QrCode,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      features: ['Semua e-wallet', 'Mobile banking', 'Instant payment'],
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      description: 'LinkAja, GoPay, OVO, Dana, dan lainnya',
      icon: Smartphone,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      features: ['Instant', 'Cashback available', 'Easy refund'],
    },
    {
      id: 'transfer',
      name: 'Transfer Bank',
      description: 'Transfer manual ke rekening UMKM',
      icon: Building2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      features: ['BCA, BNI, Mandiri', 'Manual transfer', 'Konfirmasi manual'],
    },
    {
      id: 'cod',
      name: 'Bayar di Tempat',
      description: 'Bayar ketika pesanan diterima (Cash/QRIS)',
      icon: CreditCard,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      features: ['Cash atau QRIS', 'Bayar saat terima', 'No upfront payment'],
    },
  ];

  const selectedMethodData = paymentMethods.find(
    (method) => method.id === selectedMethod
  );

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="glass-card border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300 text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Session Expired
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Silakan kembali ke checkout untuk melanjutkan pembayaran.
            </p>
            <Button
              asChild
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Link to="/checkout">Kembali ke Checkout</Link>
            </Button>
          </Card>
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
            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300"
          >
            <Link to="/checkout">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              Pembayaran
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Pilih metode pembayaran untuk menyelesaikan pesanan
            </p>
            <Badge className="mt-2 bg-green-500 hover:bg-green-600 text-white border-0 font-mono">
              #{order.id}
            </Badge>
          </div>

          {/* Timer */}
          {selectedMethod && !isSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">
                {formatTime(countdown)}
              </span>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4 hover:shadow-md transition-all duration-300"
            >
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Pembayaran 100% Aman & Terenkripsi
              </span>
            </motion.div>

            {/* Payment Methods Grid */}
            <Card className="glass-card border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Pilih Metode Pembayaran
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Pilih cara pembayaran yang paling nyaman untuk Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method, index) => (
                    <motion.button
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        if (method.id === 'qris') setShowQR(true);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                        selectedMethod === method.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                          : `border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 
                             hover:border-green-300 dark:hover:border-green-500
                             hover:bg-green-50 dark:hover:bg-green-900/20
                             hover:shadow-md`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${method.bgColor}`}>
                          <method.icon className={`w-6 h-6 ${method.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {method.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {method.description}
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {method.features.map((feature, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedMethod === method.id
                              ? 'border-green-500 bg-green-500 dark:bg-green-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {selectedMethod === method.id && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            <AnimatePresence>
              {selectedMethod && selectedMethodData && !isSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass-card border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <selectedMethodData.icon
                          className={`w-5 h-5 ${selectedMethodData.color}`}
                        />
                        Instruksi {selectedMethodData.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* QR Code for QRIS */}
                      {selectedMethod === 'qris' && showQR && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex justify-center w-full" // Tambah w-full
                        >
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-dashed border-green-300 dark:border-green-600 hover:shadow-md transition-all duration-300 mx-auto">
                            {' '}
                            <div className="w-48 h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                              {' '}
                              <QrCode className="w-32 h-32 text-white" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                              Scan QR code dengan aplikasi e-wallet atau mobile
                              banking
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Manual Transfer Instructions */}
                      {selectedMethod === 'transfer' && (
                        <div className="space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                            <div className="font-mono text-center space-y-2">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Bank BCA
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                123 456 7890
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                a.n. UMKM KARAWANG
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Transfer tepat sebesar{' '}
                            <span className="font-bold text-green-600 dark:text-green-400">
                              Rp {order.total.toLocaleString()}
                            </span>{' '}
                            dan konfirmasi manual ke UMKM
                          </p>
                        </div>
                      )}

                      {/* E-Wallet Instructions */}
                      {selectedMethod === 'ewallet' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Anda akan diarahkan ke aplikasi e-wallet untuk
                            menyelesaikan pembayaran.
                          </p>
                          <div className="flex gap-2">
                            {['GoPay', 'OVO', 'Dana', 'LinkAja'].map(
                              (ewallet) => (
                                <Badge
                                  key={ewallet}
                                  variant="outline"
                                  className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                                >
                                  {ewallet}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* COD Instructions */}
                      {selectedMethod === 'cod' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Bayar ketika pesanan sudah diterima. Siapkan uang
                            tunai atau gunakan QRIS di tempat.
                          </p>
                          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                            <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
                              Total yang harus dibayar:{' '}
                              <span className="font-bold">
                                Rp {order.total.toLocaleString()}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handlePaymentSubmit}
                          disabled={isProcessing}
                          className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-12 text-lg font-bold text-white mt-4 transition-all duration-300"
                        >
                          {isProcessing ? (
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
                              Memproses Pembayaran...
                            </>
                          ) : (
                            `Bayar Rp ${order.total.toLocaleString()}`
                          )}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success State */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 1 }}
                    className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300"
                  >
                    <Sparkles className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Pembayaran Berhasil! 🎉
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Mengarahkan ke konfirmasi pesanan...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="glass-card border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300 sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Ringkasan Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -mx-2 transition-all duration-300"
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
                    </motion.div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -mx-2 transition-all duration-300">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      Rp{' '}
                      {order.items
                        .reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>

                  {order.deliveryOption === 'delivery' && (
                    <div className="flex justify-between text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -mx-2 transition-all duration-300">
                      <span className="text-gray-600 dark:text-gray-400">
                        Ongkos Kirim
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Rp 5.000
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -mx-2 transition-all duration-300">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-green-600 dark:text-green-400">
                      Rp {order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Shield className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span>Pembayaran terenkripsi</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span>Garansi uang kembali</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Clock className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span>Konfirmasi instan</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;