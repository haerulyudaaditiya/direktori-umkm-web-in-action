// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Store,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Bell,
  Loader2,
  ArrowLeft,
  Users,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Wheat,
  User,
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
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Pisahkan Header menjadi komponen terpisah di luar DashboardPage
// Pisahkan Header menjadi komponen terpisah di luar DashboardPage
const MerchantHeader = React.memo(
  ({ myShop, user, loading, toggleStoreStatus }) => {
    const getInitials = (name) => {
      if (!name) return 'M';
      return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    };

    // Tampilkan skeleton jika loading
    if (loading || !myShop) {
      return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-green-200 dark:border-green-800 shadow-lg">
          <div className="container mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-green-200 dark:border-green-800 shadow-lg"
      >
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Brand - Mobile: hanya logo, Desktop: logo + nama */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <Wheat className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-bold text-gray-900 dark:text-white hidden sm:inline">
                  {myShop.nama}
                </span>
                <span className="font-bold text-gray-900 dark:text-white sm:hidden text-sm">
                  {myShop.nama.length > 12 
                    ? `${myShop.nama.substring(0, 10)}...` 
                    : myShop.nama}
                </span>
              </Link>
              
              {/* Badge Status untuk Mobile */}
              <Badge
                className={`${myShop.status_buka ? 'bg-green-500' : 'bg-red-500'} sm:hidden`}
              >
                {myShop.status_buka ? 'BUKA' : 'TUTUP'}
              </Badge>
            </div>

            {/* Right: Actions - Mobile: hanya avatar, Desktop: semua tombol */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Tombol Lihat Toko - Desktop only */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300 hidden sm:flex"
              >
                <Link to={`/umkm/${myShop.slug}`} target="_blank">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">Lihat Toko</span>
                  <span className="lg:hidden">Toko</span>
                </Link>
              </Button>

              {/* Toggle Status - Desktop only */}
              <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">
                <Badge
                  className={myShop.status_buka ? 'bg-green-500' : 'bg-red-500'}
                >
                  {myShop.status_buka ? 'BUKA' : 'TUTUP'}
                </Badge>
                <Switch
                  checked={myShop.status_buka}
                  onCheckedChange={toggleStoreStatus}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Icon Lihat Toko untuk Mobile */}
              <Link
                to={`/umkm/${myShop.slug}`}
                target="_blank"
                className="sm:hidden p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="Lihat Toko"
              >
                <Eye className="w-4 h-4" />
              </Link>

              {/* Toggle Switch untuk Mobile (simplified) */}
              <button
                onClick={toggleStoreStatus}
                className="sm:hidden p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="Buka/Tutup Toko"
              >
                {myShop.status_buka ? (
                  <div className="relative">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </button>

              {/* User Avatar */}
              <Avatar className="h-8 w-8 border-2 border-green-200 dark:border-green-800">
                <AvatarFallback className="bg-green-600 text-white text-xs font-bold">
                  {getInitials(user?.user_metadata?.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [myShop, setMyShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    count: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });

  // eslint-disable-next-line no-unused-vars
  const getInitials = (name) => {
    if (!name) return 'M';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // 1. Load Data Toko & Pesanan
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // A. Ambil Data Toko Milik User Ini
        const { data: shop, error: shopError } = await supabase
          .from('umkms')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (shopError) throw shopError;
        setMyShop(shop);

        // B. Ambil Pesanan yang Masuk ke Toko Ini
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*, orders(*)')
          .eq('umkm_id', shop.id)
          .order('id', { ascending: false });

        if (itemsError) throw itemsError;

        // Grouping items by Order ID
        const orderMap = new Map();

        items.forEach((item) => {
          const orderData = item.orders;
          if (!orderMap.has(orderData.id)) {
            orderMap.set(orderData.id, {
              ...orderData,
              items: [],
            });
          }
          orderMap.get(orderData.id).items.push(item);
        });

        const orderList = Array.from(orderMap.values());
        setOrders(orderList);

        // Hitung Statistik
        const revenue = orderList
          .filter((o) => o.payment_status === 'paid')
          .reduce((sum, o) => sum + o.total_amount, 0);

        // Hitung pesanan hari ini
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orderList.filter(
          (o) => new Date(o.created_at).toISOString().split('T')[0] === today
        ).length;

        // Hitung pesanan pending
        const pendingOrders = orderList.filter(
          (o) => o.order_status === 'new' || o.order_status === 'processing'
        ).length;

        setStats({
          revenue,
          count: orderList.length,
          todayOrders,
          pendingOrders,
        });
      } catch (err) {
        console.error('Dashboard Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // 2. Handle Update Status Pesanan
  const updateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update UI Lokal
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, order_status: newStatus } : o
        )
      );

      // Update stats jika status berubah menjadi completed
      if (newStatus === 'completed') {
        const updatedOrder = orders.find((o) => o.id === orderId);
        if (updatedOrder && updatedOrder.payment_status === 'paid') {
          setStats((prev) => ({
            ...prev,
            revenue: prev.revenue + updatedOrder.total_amount,
          }));
        }
      }
    } catch {
      alert('Gagal update status');
    }
  };

  // 3. Handle Buka/Tutup Toko
  const toggleStoreStatus = async () => {
    if (!myShop) return;
    const newStatus = !myShop.status_buka;

    try {
      const { error } = await supabase
        .from('umkms')
        .update({ status_buka: newStatus })
        .eq('id', myShop.id);

      if (error) throw error;
      setMyShop((prev) => ({ ...prev, status_buka: newStatus }));
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah status toko');
    }
  };

  // Format waktu
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Warna status
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'ready':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return 'Menunggu Konfirmasi';
      case 'processing':
        return 'Sedang Diproses';
      case 'ready':
        return 'Siap Diambil/Diantar';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  if (loading && !myShop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <Skeleton className="h-10 w-48 mb-8 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !myShop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Belum Memiliki Toko
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Anda belum memiliki toko UMKM. Daftarkan toko Anda sekarang!
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/merchant-registration">Daftarkan Toko Sekarang</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* --- HEADER DASHBOARD --- */}
      <MerchantHeader
        myShop={myShop}
        stats={stats}
        user={user}
        loading={loading}
        toggleStoreStatus={toggleStoreStatus}
      />

      {/* --- STATS CARDS --- */}
      <div className={loading ? 'pt-0' : 'pt-16'}>
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Pendapatan
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      Rp {stats.revenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Pesanan
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pesanan Hari Ini
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.todayOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Menunggu Diproses
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.pendingOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* --- ORDER MANAGEMENT --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                Pesanan Masuk
              </h2>
              <Badge
                variant="outline"
                className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-300"
              >
                {orders.length} Pesanan
              </Badge>
            </div>

            {orders.length === 0 ? (
              <Card className="glass-card border border-green-200 dark:border-green-800 text-center p-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Belum ada pesanan
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Tunggu pesanan pertama masuk ke toko Anda. Pastikan toko Anda
                  dalam status "BUKA".
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <Package className="w-5 h-5" />#
                              {order.order_number ||
                                `ORD-${order.id.slice(0, 8)}`}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4" />
                              {formatTime(order.created_at)}
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                •{' '}
                                {order.delivery_method === 'delivery'
                                  ? 'Diantar'
                                  : 'Ambil Sendiri'}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              className={`${getStatusColor(
                                order.order_status
                              )} border-0`}
                            >
                              {getStatusLabel(order.order_status)}
                            </Badge>
                            <Badge
                              variant={
                                order.payment_status === 'paid'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {order.payment_status === 'paid'
                                ? 'LUNAS'
                                : 'BELUM BAYAR'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-6 space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <User className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Nama Pelanggan
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {order.customer_name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Phone className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  WhatsApp
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {order.customer_phone}
                                </p>
                              </div>
                            </div>
                            {order.customer_address && (
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Alamat Pengiriman
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    {order.customer_address}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Order Items */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ShoppingBag className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Detail Pesanan
                                </p>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {item.quantity}x {item.product_name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          @Rp{' '}
                                          {item.price_at_purchase.toLocaleString()}
                                        </p>
                                      </div>
                                      <p className="font-bold text-green-600 dark:text-green-400">
                                        Rp{' '}
                                        {(
                                          item.quantity * item.price_at_purchase
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    Total
                                  </span>
                                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                    Rp {order.total_amount.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {order.customer_notes && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                  Catatan Pelanggan:
                                </p>
                                <p className="text-amber-700 dark:text-amber-200">
                                  {order.customer_notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                          {order.order_status === 'new' && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() =>
                                  updateStatus(order.id, 'processing')
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <ChefHat className="w-4 h-4 mr-2" />
                                Proses Pesanan
                              </Button>
                            </motion.div>
                          )}
                          {order.order_status === 'processing' && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() => updateStatus(order.id, 'ready')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Siap Diambil/Diantar
                              </Button>
                            </motion.div>
                          )}
                          {order.order_status === 'ready' && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() =>
                                  updateStatus(order.id, 'completed')
                                }
                                variant="outline"
                                className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-300"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Selesaikan Pesanan
                              </Button>
                            </motion.div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <Card className="glass-card border border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Akses Cepat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 flex-col items-center justify-center gap-2 border-green-200 text-stone-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <Link to={`/umkm/${myShop.slug}`} className="text-center">
                      <Eye className="w-6 h-6 mb-2" />
                      <span className="font-semibold">Lihat Toko</span>
                      <span className="text-xs text-gray-500">
                        Pratinjau toko Anda
                      </span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 flex-col items-center justify-center gap-2 border-green-200 text-stone-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <Link to={`/menu/${myShop.slug}`} className="text-center">
                      <ChefHat className="w-6 h-6 mb-2" />
                      <span className="font-semibold">Kelola Menu</span>
                      <span className="text-xs text-gray-500">
                        Tambah/edit produk
                      </span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 flex-col items-center justify-center gap-2 border-green-200 text-stone-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <Link to="/profile" className="text-center">
                      <Store className="w-6 h-6 mb-2" />
                      <span className="font-semibold">Edit Profil Toko</span>
                      <span className="text-xs text-gray-500">
                        Perbarui informasi
                      </span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
