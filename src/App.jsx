import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SharedLayout from './components/layout/SharedLayout';
import LandingPage from './pages/LandingPage';
import DirectoryPage from './pages/DirectoryPage';
import DetailPage from './pages/DetailPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SharedLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="direktori" element={<DirectoryPage />} />
        <Route path="umkm/:slug" element={<DetailPage />} />
        <Route path="menu/:slug" element={<MenuPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route
          path="order-confirmation/:orderId"
          element={<OrderConfirmation />}
        />
      </Route>
    </Routes>
  );
}

export default App;
