import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let authSubscription;

    const fetchProfile = async (userId) => {
      if (!isMounted) return null;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, full_name, phone')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            // Skip "not found" errors
            console.error('Failed to fetch profile:', error.message);
          }
          return null;
        }
        return data;
      } catch (err) {
        console.error('Profile fetch error:', err);
        return null;
      }
    };

    const initAuth = async () => {
      if (!isMounted) return;

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
          return;
        }

        if (session?.user) {
          setSession(session);
          setUser(session.user);

          // Fetch profile in background without blocking
          fetchProfile(session.user.id).then((profileData) => {
            if (isMounted && profileData) {
              setProfile(profileData);
            }
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    authSubscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id).then((profileData) => {
            if (isMounted) {
              setProfile(profileData);
            }
          });
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authSubscription?.subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    role: profile?.role || 'guest',
    loading,
    error,
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signUp: (data) => supabase.auth.signUp(data),
    signOut: async () => {
      setProfile(null);
      setUser(null);
      setSession(null);
      return await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
