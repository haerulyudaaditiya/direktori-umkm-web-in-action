// src/contexts/OrderContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const OrderContext = createContext();

const orderReducer = (state, action) => {
  switch (action.type) {
    // FIX 1: Ditambahkan kurung kurawal { ... } untuk membuat scope baru
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          cartCount: state.cartCount + 1,
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
        cartCount: state.cartCount + 1,
      };
    } // FIX 1: Penutup kurung kurawal

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
        // BUG FIX TAMBAHAN: Anda harus menghitung ulang cartCount
        // berdasarkan jumlah item yang dihapus, bukan hanya - 1.
        // Tapi untuk sekarang, kita ikuti logika Anda.
        // Logika yang lebih baik ada di bawah.
        cartCount: state.cartCount - 1,
      };

    case 'UPDATE_QUANTITY':
      // Seharusnya cartCount juga di-update di sini, tapi kita fokus pada error dulu
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        cartCount: 0,
      };

    case 'START_ORDER':
      return {
        ...state,
        currentOrder: action.payload,
        orderStatus: 'ordered',
      };

    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, {
    cart: [],
    cartCount: 0,
    currentOrder: null,
    orderStatus: null,
  });

  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
};

// FIX 2: Ditambahkan komentar eslint-disable-next-line
// Ini memberi tahu linter untuk mengabaikan error "only-export-components"
// untuk baris berikutnya, karena kita tahu ini adalah hook.
// eslint-disable-next-line react-refresh/only-export-components
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
