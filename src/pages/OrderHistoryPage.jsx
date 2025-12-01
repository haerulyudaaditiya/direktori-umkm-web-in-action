import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Calendar,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        // Fetch orders for current user, ordered by newest first
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Helper untuk warna status
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto max-w-3xl px-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto max-w-3xl px-4">
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
            <Link to="/direktori">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Riwayat Pesanan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Daftar transaksi Anda
            </p>
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {orders.length === 0 ? (
            <Card className="text-center p-12 glass-card border-dashed border-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Belum ada pesanan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Yuk mulai belanja di KarawangMart!
              </p>
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Link to="/direktori">Mulai Belanja</Link>
              </Button>
            </Card>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/order-confirmation/${order.id}`}>
                  <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500 overflow-hidden cursor-pointer bg-white dark:bg-gray-800">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={`${getStatusColor(
                                order.order_status
                              )} border-0`}
                            >
                              {getStatusLabel(order.order_status)}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.created_at).toLocaleDateString(
                                'id-ID',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {order.order_number ||
                              `Order #${order.id.slice(0, 6)}`}
                          </h3>
                        </div>
                        <ChevronRight className="text-gray-400" />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                          <ShoppingBag className="w-3 h-3" />
                          <span>{order.order_items?.length || 1} Item</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                          <Receipt className="w-3 h-3" />
                          <span>
                            Rp{' '}
                            {Number(order.total_amount).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Preview Items (Max 2) */}
                      <div className="space-y-1">
                        {order.order_items?.slice(0, 2).map((item) => (
                          <p
                            key={item.id}
                            className="text-xs text-gray-500 truncate"
                          >
                            • {item.quantity}x {item.product_name}
                          </p>
                        ))}
                        {order.order_items?.length > 2 && (
                          <p className="text-xs text-gray-400 italic">
                            + {order.order_items.length - 2} item lainnya...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
