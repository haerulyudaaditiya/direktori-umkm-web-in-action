// src/utils/categoryConstants.js

/**
 * Kamus Kata Kunci untuk Pengelompokan Kategori UMKM
 * Digunakan untuk mendeteksi jenis produk secara otomatis.
 */

export const SERVICE_KEYWORDS = [
  'jasa',
  'layanan',
  'print',
  'fotocopy',
  'jilid',
  'laundry',
  'cuci',
  'setrika',
  'bengkel',
  'servis',
  'service',
  'reparasi',
  'potong rambut',
  'barbershop',
  'pijat',
  'salon',
];

export const RETAIL_KEYWORDS = [
  'retail',
  'sembako',
  'buah',
  'sayur mentah',
  'toko',
  'warung',
  'barang',
  'kelontong',
  'atk',
  'fashion',
  'baju',
  'celana',
  'aksesoris',
];

// Helper function untuk mengecek kategori
export const checkCategoryMatch = (categoryString, keywordsArray) => {
  const cleanCategory = (categoryString || '').toLowerCase();
  return keywordsArray.some((keyword) => cleanCategory.includes(keyword));
};
