import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Tampilkan Loading Spinner saat cek session Supabase
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm animate-pulse">
            Memeriksa akses...
          </p>
        </div>
      </div>
    );
  }

  // 2. Jika tidak ada user, lempar ke Login
  // PENTING: Kita kirim 'state: { from: location }' agar setelah login bisa balik lagi kesini
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 3. Jika ada user, izinkan masuk
  return children;
};

export default ProtectedRoute;
