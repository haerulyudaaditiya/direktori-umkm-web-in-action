import React, { createContext, useContext, useReducer } from 'react';

const OrderContext = createContext();

const orderReducer = (state, action) => {
  switch (action.type) {
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
    }

    case 'REMOVE_FROM_CART': {
      const itemToRemove = state.cart.find(
        (item) => item.id === action.payload
      );
      const quantityToRemove = itemToRemove ? itemToRemove.quantity : 0;

      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
        cartCount: state.cartCount - quantityToRemove,
      };
    }

    case 'UPDATE_QUANTITY': {
      const oldItem = state.cart.find((item) => item.id === action.payload.id);
      const oldQuantity = oldItem ? oldItem.quantity : 0;
      const newQuantity = action.payload.quantity;

      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: newQuantity }
            : item
        ),
        cartCount: state.cartCount - oldQuantity + newQuantity,
      };
    }

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
