// src/components/FloatingCart.jsx
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2, Utensils } from 'lucide-react';
import { useOrder } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const FloatingCart = () => {
  const { state, dispatch } = useOrder();
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  const totalPrice = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id, quantity: newQuantity },
      });
    }
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  // Safe fallback icon function
  const getFallbackIcon = () => {
    // Default fallback jika tidak ada kategori
    return <Utensils className="w-5 h-5 text-white" />;
  };

  if (state.cartCount === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-green-600 transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {state.cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {state.cartCount}
            </motion.span>
          )}
        </div>
      </motion.button>

      {/* Expanded Cart Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70 z-50 flex items-end justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-green-200 dark:border-green-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-green-200 dark:border-green-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Keranjang Pesanan
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="overflow-y-auto max-h-96 p-4">
                {state.cart.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Keranjang kosong
                  </div>
                ) : (
                  state.cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 py-3 border-b border-green-200 dark:border-green-800 last:border-b-0"
                    >
                      {/* Image dengan safe fallback */}
                      {!item.image || imageErrors[item.id] ? (
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getFallbackIcon()}
                        </div>
                      ) : (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={() =>
                            setImageErrors((prev) => ({
                              ...prev,
                              [item.id]: true,
                            }))
                          }
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                          {item.name}
                        </h4>
                        {item.umkm && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 line-clamp-1">
                            {item.umkm}
                          </p>
                        )}
                        <p className="text-green-600 dark:text-green-400 font-bold text-sm mt-1">
                          Rp {item.price.toLocaleString()}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-400 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="text-sm font-medium w-8 text-center text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-400 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {state.cart.length > 0 && (
                <div className="p-4 border-t border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      Rp {totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 h-12 font-bold text-white transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Link to="/checkout">
                      Pesan Sekarang ({state.cartCount} items)
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCart;
