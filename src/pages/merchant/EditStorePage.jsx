import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Store,
  MapPin,
  Phone,
  Save,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const EditStorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    slug: '', // Read only
    kategori: '',
    kontak: '',
    alamat: '',
    cerita: '',
    jam_buka: '',
    rentang_harga: '',
    foto: [], // Array text
  });

  // 1. Fetch Data Toko Saat Ini
  useEffect(() => {
    const fetchShop = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('umkms')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setShopId(data.id);
          setFormData({
            nama: data.nama,
            slug: data.slug,
            kategori: data.kategori,
            kontak: data.kontak,
            alamat: data.alamat,
            cerita: data.cerita || '',
            jam_buka: data.jam_buka || '08:00 - 21:00',
            rentang_harga: data.rentang_harga || '$',
            foto: data.foto || [],
          });
          // Set preview image pertama jika ada
          if (data.foto && data.foto.length > 0) {
            setPreviewImage(data.foto[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching shop:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [user]);

  // 2. Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${shopId}-${Date.now()}.${fileExt}`;

      // Upload ke Bucket 'umkm-covers'
      const { error: uploadError } = await supabase.storage
        .from('umkm-covers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('umkm-covers')
        .getPublicUrl(fileName);

      const newImageUrl = urlData.publicUrl;

      // Update state preview
      setPreviewImage(newImageUrl);
      // Update state form (timpa foto lama untuk MVP, atau push array untuk multiple)
      setFormData((prev) => ({ ...prev, foto: [newImageUrl] })); // Single cover mode
    } catch (error) {
      alert('Gagal upload gambar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. Handle Save Text Data
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('umkms')
        .update({
          nama: formData.nama,
          // slug tidak diupdate untuk menjaga SEO & Link
          kategori: formData.kategori,
          kontak: formData.kontak,
          alamat: formData.alamat,
          cerita: formData.cerita,
          jam_buka: formData.jam_buka,
          rentang_harga: formData.rentang_harga,
          foto: formData.foto, // Simpan array URL foto
        })
        .eq('id', shopId);

      if (error) throw error;

      alert('Perubahan berhasil disimpan!');
      navigate('/merchant/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/merchant/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pengaturan Toko
            </h1>
            <p className="text-gray-500 text-sm">
              Perbarui informasi bisnis Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Visual Toko */}
          <Card className="border-green-100 dark:border-green-900 overflow-hidden">
            <div
              className="relative h-48 bg-gray-200 dark:bg-gray-800 group cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Cover Toko"
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span>Upload Foto Sampul Toko</span>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Ganti Foto
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 text-center">
                Klik gambar untuk mengganti foto sampul toko.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Informasi Dasar */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Usaha</label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(val) =>
                      setFormData({ ...formData, kategori: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kuliner">Kuliner</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Retail">Retail/Sembako</SelectItem>
                      <SelectItem value="Jasa">Jasa/Layanan</SelectItem>
                      <SelectItem value="Pertanian">Pertanian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Admin</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-9"
                      value={formData.kontak}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kontak: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alamat Lengkap</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    className="pl-9 min-h-[80px]"
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cerita / Deskripsi Toko
                </label>
                <Textarea
                  className="min-h-[100px]"
                  value={formData.cerita}
                  onChange={(e) =>
                    setFormData({ ...formData, cerita: e.target.value })
                  }
                  placeholder="Ceritakan keunikan tokomu..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Detail Operasional */}
          <Card>
            <CardHeader>
              <CardTitle>Operasional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jam Operasional</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-9"
                      value={formData.jam_buka}
                      onChange={(e) =>
                        setFormData({ ...formData, jam_buka: e.target.value })
                      }
                      placeholder="Cth: 08:00 - 22:00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rentang Harga</label>
                  <Select
                    value={formData.rentang_harga}
                    onValueChange={(val) =>
                      setFormData({ ...formData, rentang_harga: val })
                    }
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Pilih..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$">Murah ($)</SelectItem>
                      <SelectItem value="$$">Menengah ($$)</SelectItem>
                      <SelectItem value="$$$">Mahal ($$$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/merchant/dashboard')}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStorePage;
