// src/components/FloatingCart.jsx
import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
// Benar: Mengimpor dari file context di mana hook itu dibuat
import { useOrder } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';

const FloatingCart = () => {
  const { state, dispatch } = useOrder();
  const [isExpanded, setIsExpanded] = useState(false);

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
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold">Keranjang Pesanan</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="overflow-y-auto max-h-96 p-4">
                {state.cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
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
                      className="flex items-center gap-3 py-3 border-b"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <p className="text-green-600 font-bold">
                          Rp {item.price.toLocaleString()}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {state.cart.length > 0 && (
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      Rp {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <Button className="w-full bg-green-500 hover:bg-green-600 h-12 font-bold">
                    Pesan Sekarang ({state.cartCount} items)
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
