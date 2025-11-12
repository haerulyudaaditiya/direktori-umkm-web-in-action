// src/utils/umkmTypes.js

export const getUMKMType = (kategori) => {
  const foodTypes = ['Kuliner', 'Minuman', 'Cemilan', 'Makanan Berat'];
  const serviceTypes = ['Jasa', 'Industri'];
  const retailTypes = ['Retail', 'Pertanian'];

  if (foodTypes.includes(kategori)) return 'food';
  if (serviceTypes.includes(kategori)) return 'service';
  if (retailTypes.includes(kategori)) return 'retail';
  return 'service';
};

export const hasMenu = (umkm) => umkm.menu && umkm.menu.length > 0;
export const hasLayanan = (umkm) => umkm.layanan && umkm.layanan.length > 0;
export const hasProduk = (umkm) => umkm.produk && umkm.produk.length > 0;
