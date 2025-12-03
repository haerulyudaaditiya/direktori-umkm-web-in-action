import React, { useEffect, useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Search,
  PackageOpen,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch'; // Pastikan sudah install switch
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const ProductPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState(null);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  const initialForm = {
    nama: '',
    harga: '',
    kategori_produk: 'makanan',
    deskripsi: '',
    gambar: '',
    stok: 100,
    is_available: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // 1. Fetch Data
  useEffect(() => {
    const initData = async () => {
      if (!user) return;
      try {
        // Get Shop ID first
        const { data: shop } = await supabase
          .from('umkms')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        if (shop) {
          setShopId(shop.id);
          // Get Products
          const { data: prods } = await supabase
            .from('products')
            .select('*')
            .eq('umkm_id', shop.id)
            .order('created_at', { ascending: false });
          setProducts(prods || []);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [user]);

  // 2. Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File terlalu besar (Max 2MB)');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${shopId}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, gambar: data.publicUrl }));
      setPreviewImage(data.publicUrl);
    } catch (error) {
      alert('Gagal upload gambar: ' + error.message);
    }
  };

  // 3. Save Logic (Create/Update)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        umkm_id: shopId,
        harga: parseInt(formData.harga),
        stok: parseInt(formData.stok),
      };

      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...payload } : p
          )
        );
      } else {
        // Insert
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;

        setProducts((prev) => [data, ...prev]);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan produk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Gagal menghapus');
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingProduct(null);
    setPreviewImage(null);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nama: product.nama,
      harga: product.harga,
      kategori_produk: product.kategori_produk || 'makanan',
      deskripsi: product.deskripsi || '',
      gambar: product.gambar,
      stok: product.stok,
      is_available: product.is_available,
    });
    setPreviewImage(product.gambar);
    setIsDialogOpen(true);
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manajemen Menu
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Atur produk dan layanan toko Anda
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Tambah Menu Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Menu' : 'Tambah Menu Baru'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSave} className="space-y-4 py-4">
                {/* Image Upload */}
                <div className="flex justify-center">
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors overflow-hidden relative"
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Klik untuk upload foto
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Menu</label>
                  <Input
                    required
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    placeholder="Cth: Soto Mie Spesial"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Harga (Rp)</label>
                    <Input
                      required
                      type="number"
                      value={formData.harga}
                      onChange={(e) =>
                        setFormData({ ...formData, harga: e.target.value })
                      }
                      placeholder="15000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <Select
                      value={formData.kategori_produk}
                      onValueChange={(val) =>
                        setFormData({ ...formData, kategori_produk: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="makanan">Makanan</SelectItem>
                        <SelectItem value="minuman">Minuman</SelectItem>
                        <SelectItem value="jasa">Jasa/Layanan</SelectItem>
                        <SelectItem value="retail">Retail/Barang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Textarea
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    placeholder="Jelaskan detail menu..."
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <span className="text-sm font-medium">Status Tersedia</span>
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(val) =>
                      setFormData({ ...formData, is_available: val })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Simpan Produk'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200">
            <PackageOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="font-bold text-lg">Belum ada menu</h3>
            <p className="text-gray-500">
              Mulai tambahkan produk untuk toko Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-md transition-shadow relative group"
              >
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={
                      item.gambar ||
                      'https://placehold.co/400x300?text=No+Image'
                    }
                    alt={item.nama}
                    className={`w-full h-full object-cover ${
                      !item.is_available && 'grayscale'
                    }`}
                  />
                  {!item.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Habis / Tidak Tersedia
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-1">
                      {item.nama}
                    </h3>
                    <p className="text-green-600 font-bold">
                      Rp {item.harga.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {item.deskripsi || 'Tidak ada deskripsi'}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
