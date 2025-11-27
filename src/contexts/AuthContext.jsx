import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // State baru untuk menyimpan data role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuthFlow = async () => {
    // Fungsi helper untuk mengambil data profil dari tabel 'profiles'
    const fetchProfile = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Gagal mengambil profil:', error.message);
          // Fallback jika profil belum terbuat (walaupun harusnya otomatis via trigger)
          return null;
        }
        setProfile(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    const initAuth = async () => {
      try {
        // 1. Cek sesi saat aplikasi dimuat
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // 2. Jika user login, ambil profil lengkap (termasuk role)
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    // 3. Dengarkan perubahan status (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // User baru login, ambil profilnya
        await fetchProfile(session.user.id);
      } else {
        // User logout, bersihkan profil
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    };

    initAuthFlow();
  }, []);

  const value = {
    session,
    user,
    profile, // Data lengkap dari tabel profiles (nama, hp, role)
    role: profile?.role || 'guest', // Helper cepat untuk cek role
    loading,
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signUp: (data) => supabase.auth.signUp(data),
    signOut: async () => {
        setProfile(null); // Bersihkan state lokal agar UI langsung update
        return await supabase.auth.signOut();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};