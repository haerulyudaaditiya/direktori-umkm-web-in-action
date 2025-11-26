// src/components/MigrateData.jsx
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MigrateData = () => {
  const [status, setStatus] = useState('Idle');
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog((prev) => [...prev, msg]);

  const handleMigrate = async () => {
    setStatus('Processing...');
    addLog('Memulai migrasi...');

    try {
      // 1. Fetch data JSON lokal
      const response = await fetch('/data.json');
      const rawData = await response.json();
      addLog(`Ditemukan ${rawData.length} data UMKM di JSON.`);

      for (const umkm of rawData) {
        // 2. Insert ke tabel UMKM
        const { data: umkmData, error: umkmError } = await supabase
          .from('umkms')
          .insert([
            {
              nama: umkm.nama,
              slug: umkm.slug,
              kontak: umkm.kontak,
              kategori: umkm.kategori,
              alamat: umkm.alamat,
              cerita: umkm.cerita,
              foto: umkm.foto,
              lokasi_map: umkm.lokasi_map,
              lat: umkm.lat,
              lng: umkm.lng,
              jam_buka: umkm.jam_buka,
              rentang_harga: umkm.rentang_harga,
              rating: umkm.rating,
              tags: umkm.tags,
            },
          ])
          .select()
          .single(); // Ambil data balik untuk dapat ID baru

        if (umkmError) {
          addLog(`Gagal insert UMKM ${umkm.nama}: ${umkmError.message}`);
          continue;
        }

        addLog(`Sukses insert UMKM: ${umkm.nama} (ID: ${umkmData.id})`);

        // 3. Siapkan data Produk/Menu/Layanan
        // Kita gabungkan array menu, produk, dan layanan dari JSON jadi satu array
        const rawProducts = [
          ...(umkm.menu || []),
          ...(umkm.produk || []),
          ...(umkm.layanan || []),
        ];

        if (rawProducts.length > 0) {
          const productsToInsert = rawProducts.map((item) => ({
            umkm_id: umkmData.id, // Relasi Foreign Key ke ID UMKM yang baru dibuat
            nama: item.nama,
            harga: item.harga,
            deskripsi: item.deskripsi,
            gambar: Array.isArray(item.gambar) ? item.gambar[0] : item.gambar, // Ambil string URL saja
            rating: item.rating || 0,
            waktu_masak: item.waktuMasak || null,
            satuan: item.satuan || 'pcs',
            kategori_produk: item.kategori || 'umum',
          }));

          const { error: prodError } = await supabase
            .from('products')
            .insert(productsToInsert);

          if (prodError) {
            addLog(
              `Gagal insert produk untuk ${umkm.nama}: ${prodError.message}`
            );
          } else {
            addLog(
              `Sukses insert ${productsToInsert.length} produk/menu.`
            );
          }
        }
      }

      setStatus('Completed');
      addLog('Migrasi Selesai!');
    } catch (error) {
      console.error(error);
      addLog(`Critical Error: ${error.message}`);
      setStatus('Error');
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Database Migration Tool</h1>
      <p className="mb-4 text-gray-600">
        Tools ini akan memindahkan data dari <code>/public/data.json</code> ke
        Supabase PostgreSQL.
      </p>

      <button
        onClick={handleMigrate}
        disabled={status === 'Processing...'}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {status === 'Processing...'
          ? 'Sedang Memproses...'
          : 'Mulai Migrasi Data'}
      </button>

      <div className="mt-6 bg-black text-green-400 p-4 rounded h-96 overflow-y-auto">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        {log.length === 0 && (
          <div className="text-gray-500">Menunggu perintah...</div>
        )}
      </div>
    </div>
  );
};

export default MigrateData;
