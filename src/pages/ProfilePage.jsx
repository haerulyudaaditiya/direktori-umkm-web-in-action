import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  LogOut,
  Save,
  Loader2,
  ShoppingBag,
  Store,
  ShieldCheck,
  Camera,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import AddressBook from '@/components/profile/AddressBook';
import { supabase } from '@/lib/supabaseClient';
import ReactDOM from 'react-dom'; 

const ProfilePage = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Ref untuk trigger input file

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // State khusus upload
  const [successMsg, setSuccessMsg] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const LogoutModalPortal = ({ children }) => {
    return ReactDOM.createPortal(
      children,
      document.body
    );
  };

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (profile && user) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: user.email || '',
      });
      setAvatarUrl(user.user_metadata?.avatar_url);
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccessMsg('');
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];

      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar! Maksimal 2MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl); // Update tampilan lokal langsung
      setSuccessMsg('Foto profil berhasil diperbarui!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal mengupload foto. Pastikan koneksi lancar.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    if (formData.phone.length < 10) {
      alert('Nomor WhatsApp tidak valid (minimal 10 digit).');
      setLoading(false);
      return;
    }

    if (formData.full_name.trim().length < 3) {
      alert('Nama lengkap terlalu pendek.');
      setLoading(false);
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      });

      if (authError) throw authError;

      setSuccessMsg('Profil berhasil diperbarui!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Update error:', error.message);
      alert('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            asChild
            variant="outline"
            size="icon"
            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-200 transition-colors"
          >
            <Link to="/direktori">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profil Saya
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Kelola informasi akun dan preferensi Anda
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="glass-card border border-green-200 dark:border-green-800 text-center overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <div className="-mt-12 mb-4 flex justify-center relative group">
                {/* Input File Tersembunyi */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />

                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg cursor-pointer hover:opacity-90 transition-opacity bg-white">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-bold">
                      {getInitials(formData.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Tombol Kamera (Trigger) */}
                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full border border-gray-200 dark:border-gray-600 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors z-10"
                    title="Ganti Foto Profil"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <CardContent className="pb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {formData.full_name || 'Pengguna'}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{formData.email}</p>

                <div className="flex justify-center gap-2">
                  {profile?.role === 'merchant' ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 py-1 px-3">
                      <Store className="w-3 h-3" /> Mitra UMKM
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-600 gap-1 py-1 px-3"
                    >
                      <User className="w-3 h-3" /> Customer
                    </Badge>
                  )}
                  {user?.email_confirmed_at && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Menu */}
            <nav className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-gray-200 text-stone-600 dark:text-stone-300 dark:border-gray-800 hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors"
                asChild
              >
                <Link to="/history">
                  <ShoppingBag className="w-5 h-5 mr-3" /> Riwayat Pesanan
                </Link>
              </Button>

              {profile?.role !== 'merchant' && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 text-stone-600 dark:text-stone-300 dark:border-gray-800 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors"
                  onClick={() => navigate('/merchant-registration')}
                >
                  <Store className="w-5 h-5 mr-3" /> Daftar Jadi Mitra
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors"
                onClick={() => setLogoutConfirm(true)}
              >
                <LogOut className="w-5 h-5 mr-3" /> Keluar
              </Button>
            </nav>
          </motion.div>

          {/* Right Column - Edit Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader>
                <CardTitle>Edit Informasi</CardTitle>
                <CardDescription>
                  Perbarui data diri Anda di sini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nama Lengkap
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="pl-10 h-11 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        placeholder="Nama Lengkap"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nomor WhatsApp
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        className="pl-10 h-11 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        placeholder="08..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        value={formData.email}
                        disabled
                        className="pl-10 h-11 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed border-dashed border-green-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Email tidak dapat diubah demi keamanan.
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 h-11 font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                        </>
                      )}
                    </Button>

                    {successMsg && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-green-600 dark:text-green-400 font-medium text-sm"
                      >
                        {successMsg}
                      </motion.span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8">
              <AddressBook userId={user.id} />
            </div>

            <AnimatePresence>
              {logoutConfirm && (
                <LogoutModalPortal>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-green-200 dark:border-green-800 shadow-xl"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                          <LogOut className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Keluar Akun?
                        </h3>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Anda akan keluar dari akun:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">
                        {formData.full_name || 'Pengguna'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {formData.email}
                      </p>

                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setLogoutConfirm(false)}
                          className="border-green-200 text-stone-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-stone-300 dark:hover:bg-green-900/20 transition-colors"
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleLogout}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Ya, Keluar
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                </LogoutModalPortal>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
