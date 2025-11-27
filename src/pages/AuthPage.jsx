import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wheat,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Store,
  Shield,
  CheckCircle,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState({
    email: false,
    password: false,
    fullName: false,
    phone: false,
  });

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/direktori';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormTouched((prev) => ({ ...prev, [name]: true }));
    setError('');
  };
  
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect kembali ke halaman website ini setelah login di Google sukses
          redirectTo: `${window.location.origin}/direktori`,
        },
      });
      if (error) throw error;
      // Catatan: User akan diarahkan keluar ke halaman Google, jadi tidak perlu navigate manual di sini.
    } catch (err) {
      console.error('Google Login Error:', err);
      setError('Gagal login dengan Google. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }

    if (!isLogin) {
      if (!formData.fullName) {
        errors.fullName = 'Nama lengkap wajib diisi';
      }

      if (!formData.phone) {
        errors.phone = 'Nomor WhatsApp wajib diisi';
      } else if (formData.phone.length < 10) {
        errors.phone = 'Nomor WhatsApp minimal 10 digit';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    setFormTouched({
      email: true,
      password: true,
      fullName: true,
      phone: true,
    });

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError('Harap perbaiki data yang masih salah');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate(from, { replace: true });
      } else {
        const { data, error } = await signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              role: 'customer',
            },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          throw new Error('User already registered');
        }

        setSuccessMessage(
          'Registrasi berhasil! Silakan cek email untuk verifikasi.'
        );
        setIsLogin(true);
        setFormData({ email: '', password: '', fullName: '', phone: '' });
        setFormTouched({
          email: false,
          password: false,
          fullName: false,
          phone: false,
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = 'Terjadi kesalahan. Silakan coba lagi.';

      if (err.message.includes('Invalid login credentials')) {
        msg = 'Email atau password salah.';
      } else if (
        err.message.includes('User already registered') ||
        err.message.includes('already registered')
      ) {
        msg = 'Email ini sudah terdaftar. Silakan Login dengan Google.';
        setIsLogin(true);
      } else if (err.message.includes('rate limit')) {
        msg = 'Terlalu banyak percobaan. Tunggu sebentar.';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    const errors = validateForm();
    return formTouched[fieldName] ? errors[fieldName] : '';
  };

  const isFieldValid = (fieldName) => {
    return (
      formTouched[fieldName] && !getFieldError(fieldName) && formData[fieldName]
    );
  };

//   const stats = [
//     { number: '500+', label: 'UMKM Terdaftar', icon: Store },
//     { number: '4.8', label: 'Rating Pengguna', icon: Star },
//     { number: '98%', label: 'Kepuasan Pelanggan', icon: CheckCircle },
//   ];

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-950">
      {/* LEFT SIDE: Branding Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-yellow-500 relative overflow-hidden items-center justify-center p-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-emerald-400/30 rounded-full blur-lg animate-bounce"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center text-white max-w-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/30"
          >
            <Wheat className="h-4 w-4" />
            <span>Platform Resmi UMKM Karawang</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="block leading-[1.1]">Temukan Keberagaman</span>
            <span className="block text-amber-200 leading-[1.2]">
              UMKM Karawang
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-green-100 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Jelajahi 500+ usaha lokal terbaik di jantung lumbung padi Indonesia
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-green-100"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>100% UMKM Terverifikasi</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Aman & Terpercaya</span>
            </div>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span>Update Real-time</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-8 pl-0 hover:bg-transparent hover:text-green-600 text-gray-500 dark:text-gray-400 group transition-all"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Button>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Wheat className="w-8 h-8 text-white" />
              </motion.div>

              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLogin ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                {isLogin
                  ? 'Lanjutkan petualangan kuliner dan belanja Anda'
                  : 'Bergabunglah dengan komunitas pencinta UMKM Karawang'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="register-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Full Name Field */}
                      <div className="space-y-2">
                        <div className="relative">
                          <User
                            className={`absolute left-3 top-3 h-5 w-5 transition-colors ${
                              isFieldValid('fullName')
                                ? 'text-green-600'
                                : getFieldError('fullName')
                                ? 'text-red-500'
                                : 'text-gray-400'
                            }`}
                          />
                          <Input
                            name="fullName"
                            placeholder="Nama Lengkap"
                            className={`pl-10 h-12 transition-all ${
                              isFieldValid('fullName')
                                ? 'border-green-500 focus-visible:ring-green-500'
                                : getFieldError('fullName')
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : 'focus-visible:ring-green-500'
                            }`}
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        {getFieldError('fullName') && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm"
                          >
                            {getFieldError('fullName')}
                          </motion.p>
                        )}
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Phone
                            className={`absolute left-3 top-3 h-5 w-5 transition-colors ${
                              isFieldValid('phone')
                                ? 'text-green-600'
                                : getFieldError('phone')
                                ? 'text-red-500'
                                : 'text-gray-400'
                            }`}
                          />
                          <Input
                            name="phone"
                            placeholder="Nomor WhatsApp"
                            className={`pl-10 h-12 transition-all ${
                              isFieldValid('phone')
                                ? 'border-green-500 focus-visible:ring-green-500'
                                : getFieldError('phone')
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : 'focus-visible:ring-green-500'
                            }`}
                            value={formData.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setFormData((prev) => ({ ...prev, phone: val }));
                              setFormTouched((prev) => ({
                                ...prev,
                                phone: true,
                              }));
                            }}
                            required
                          />
                        </div>
                        {getFieldError('phone') && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm"
                          >
                            {getFieldError('phone')}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div className="space-y-2">
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-3 h-5 w-5 transition-colors ${
                        isFieldValid('email')
                          ? 'text-green-600'
                          : getFieldError('email')
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Alamat Email"
                      className={`pl-10 h-12 transition-all ${
                        isFieldValid('email')
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : getFieldError('email')
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'focus-visible:ring-green-500'
                      }`}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {getFieldError('email') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {getFieldError('email')}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-3 h-5 w-5 transition-colors ${
                        isFieldValid('password')
                          ? 'text-green-600'
                          : getFieldError('password')
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Kata Sandi"
                      className={`pl-10 pr-10 h-12 transition-all ${
                        isFieldValid('password')
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : getFieldError('password')
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'focus-visible:ring-green-500'
                      }`}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {getFieldError('password') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {getFieldError('password')}
                    </motion.p>
                  )}
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm border border-red-200 dark:border-red-800"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 text-sm border border-green-200 dark:border-green-800 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {successMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isLogin ? 'Masuk...' : 'Mendaftar...'}
                      </>
                    ) : isLogin ? (
                      'Masuk Sekarang'
                    ) : (
                      'Daftar Akun Baru'
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Social Login Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-gray-900 px-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Atau lanjutkan dengan
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                variant="outline"
                type="button"
                className="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-semibold text-gray-700 dark:text-gray-200 transition-all duration-200 group"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {loading ? 'Memproses...' : 'Lanjutkan dengan Google'}
                  </span>
                </div>
              </Button>

              {/* Toggle Auth Mode */}
              <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-700 pt-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setSuccessMessage('');
                      setFormTouched({
                        email: false,
                        password: false,
                        fullName: false,
                        phone: false,
                      });
                    }}
                    className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                  >
                    {isLogin ? 'Daftar disini' : 'Masuk disini'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
