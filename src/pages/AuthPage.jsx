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
        const { error } = await signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              role: 'customer',
            },
          },
        });
        if (error) throw error;
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
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email atau password salah.'
          : err.message === 'User already registered'
          ? 'Email sudah terdaftar. Silakan login.'
          : 'Terjadi kesalahan. Silakan coba lagi.'
      );
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

  const stats = [
    { number: '500+', label: 'UMKM Terdaftar', icon: Store },
    { number: '4.8', label: 'Rating Pengguna', icon: Star },
    { number: '98%', label: 'Kepuasan Pelanggan', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-950">
      {/* LEFT SIDE: Branding Section */}
      <div className="hidden lg:flex w-1/2 bg-green-600 relative overflow-hidden items-center justify-center p-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center text-white max-w-lg"
        >
          {/* Logo & Brand */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30"
          >
            <Wheat className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl font-bold mb-4">KarawangMart</h1>

          <p className="text-lg text-green-100 mb-8 leading-relaxed">
            Platform terpercaya untuk menjelajahi dan mendukung UMKM lokal
            Karawang. Dari kuliner autentik hingga jasa terbaik, semua dalam
            genggaman Anda.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold mb-1">{stat.number}</div>
                  <div className="text-green-100 text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30"
          >
            <Shield className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              100% Aman & Terpercaya
            </span>
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
