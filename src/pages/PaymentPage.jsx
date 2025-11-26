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
import { supabase } from '@/lib/supabaseClient';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: orderState } = useOrder();

  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [showQR, setShowQR] = useState(false);

  // Order data from location (priority) or context
  const order = location.state?.order || orderState.currentOrder;

  useEffect(() => {
    if (!order) {
      navigate('/checkout');
      return;
    }
  }, [order, navigate]);

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
    setSelectedMethod('');
    setCountdown(180);
    setShowQR(false);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);

    try {
      // 1. Update Database Payment Status
      const { error } = await supabase
        .from('orders')
        .update({
          payment_method: selectedMethod,
          payment_status: 'paid',
          order_status: 'processing', // Move from 'new' to 'processing'
        })
        .eq('id', order.id);

      if (error) throw error;

      // 2. Simulate Gateway Delay (User Experience)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsProcessing(false);
      setIsSuccess(true);

      // 3. Navigate
      setTimeout(() => {
        navigate(`/order-confirmation/${order.id}`, {
          state: {
            orderId: order.id,
            paymentMethod: selectedMethod,
          },
        });
      }, 2000);
    } catch (error) {
      console.error('Payment update failed:', error);
      alert('Gagal memproses pembayaran. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  // ... (Bagian paymentMethods array sama seperti sebelumnya)
  const paymentMethods = [
    {
      id: 'qris',
      name: 'QRIS',
      description: 'Scan QR code dengan aplikasi e-wallet atau mobile banking',
      icon: QrCode,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      features: ['Semua e-wallet', 'Mobile banking', 'Instant payment'],
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      description: 'LinkAja, GoPay, OVO, Dana, dan lainnya',
      icon: Smartphone,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      features: ['Instant', 'Cashback available', 'Easy refund'],
    },
    {
      id: 'transfer',
      name: 'Transfer Bank',
      description: 'Transfer manual ke rekening UMKM',
      icon: Building2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      features: ['BCA, BNI, Mandiri', 'Manual transfer', 'Konfirmasi manual'],
    },
    {
      id: 'cod',
      name: 'Bayar di Tempat',
      description: 'Bayar ketika pesanan diterima (Cash/QRIS)',
      icon: CreditCard,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
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
          <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-8">
            <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Session Expired
            </CardTitle>
            <Button asChild className="bg-green-500 hover:bg-green-600">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            asChild
            variant="outline"
            size="icon"
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300"
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
              Pilih metode pembayaran untuk pesanan
              <span className="font-mono font-bold ml-2">
                #{order.order_number}
              </span>
            </p>
          </div>
          {selectedMethod && !isSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 px-3 py-2 rounded-lg border border-amber-200"
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">
                {formatTime(countdown)}
              </span>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-3 bg-green-50 dark:bg-green-900/30 border border-green-200 rounded-xl p-4">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Pembayaran 100% Aman & Terenkripsi
              </span>
            </div>

            {/* Payment Methods */}
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Pilih Metode Pembayaran
                </CardTitle>
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
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300'
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
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedMethod === method.id
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
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

            {/* Instructions & Actions */}
            <AnimatePresence>
              {selectedMethod && selectedMethodData && !isSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="glass-card border border-green-200 dark:border-green-800">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        {selectedMethod === 'qris' && showQR && (
                          <div className="bg-white p-4 inline-block rounded-xl border-2 border-dashed border-green-300">
                            <QrCode className="w-32 h-32 text-gray-900" />
                            <p className="text-xs text-gray-500 mt-2">
                              Scan untuk bayar
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">
                            Total Tagihan
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            Rp {order.total_amount.toLocaleString()}
                          </span>
                        </div>

                        <Button
                          onClick={handlePaymentSubmit}
                          disabled={isProcessing}
                          className="w-full h-12 text-lg font-bold bg-green-500 hover:bg-green-600"
                        >
                          {isProcessing ? 'Memproses...' : 'Saya Sudah Bayar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Animation */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Pembayaran Berhasil! 🎉
                  </h3>
                  <p className="text-gray-600">
                    Mengarahkan ke detail pesanan...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">
                    Rp {order.total_amount.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
