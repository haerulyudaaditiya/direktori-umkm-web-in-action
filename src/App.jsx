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
import MigrateData from './components/MigrateData';
import AuthPage from './pages/AuthPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<SharedLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="direktori" element={<DirectoryPage />} />
        <Route path="umkm/:slug" element={<DetailPage />} />
        <Route path="menu/:slug" element={<MenuPage />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="history"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-confirmation/:orderId"
          element={<OrderConfirmation />}
        />
      </Route>
      <Route path="/migrate" element={<MigrateData />} />
    </Routes>
  );
}

export default App;
