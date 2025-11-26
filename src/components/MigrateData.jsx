import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MigrateData = () => {
  const [status, setStatus] = useState('Idle');
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog((prev) => [...prev, msg]);

  const handleMigrate = async () => {
    setStatus('Processing...');
    addLog('Starting data migration sequence...');

    try {
      // 1. Fetch local JSON data
      const response = await fetch('/data.json');
      const rawData = await response.json();
      addLog(`Found ${rawData.length} records in source file.`);

      for (const umkm of rawData) {
        // 2. Insert into 'umkms' table
        // Note: ID will be auto-generated as UUID by Supabase
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
          .single();

        if (umkmError) {
          addLog(
            `[ERROR] Failed to insert UMKM ${umkm.nama}: ${umkmError.message}`
          );
          continue;
        }

        addLog(`[SUCCESS] Inserted UMKM: ${umkm.nama} (UUID: ${umkmData.id})`);

        // 3. Prepare Products/Services data
        const rawProducts = [
          ...(umkm.menu || []),
          ...(umkm.produk || []),
          ...(umkm.layanan || []),
        ];

        if (rawProducts.length > 0) {
          const productsToInsert = rawProducts.map((item) => ({
            umkm_id: umkmData.id, // References the new UUID
            nama: item.nama,
            harga: item.harga,
            deskripsi: item.deskripsi,
            gambar: Array.isArray(item.gambar) ? item.gambar[0] : item.gambar,
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
              `[ERROR] Failed to insert products for ${umkm.nama}: ${prodError.message}`
            );
          } else {
            addLog(
              `[INFO] Successfully inserted ${productsToInsert.length} related items.`
            );
          }
        }
      }

      setStatus('Completed');
      addLog('Migration sequence completed successfully.');
    } catch (error) {
      console.error(error);
      addLog(`[CRITICAL] Execution failed: ${error.message}`);
      setStatus('Error');
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">System Database Migration</h1>
      <p className="mb-4 text-gray-600">
        Transferring data from local JSON to Supabase PostgreSQL (UUID Schema).
      </p>

      <button
        onClick={handleMigrate}
        disabled={status === 'Processing...'}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {status === 'Processing...' ? 'Processing...' : 'Execute Migration'}
      </button>

      <div className="mt-6 bg-black text-green-400 p-4 rounded h-96 overflow-y-auto">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        {log.length === 0 && (
          <div className="text-gray-500">Ready to start...</div>
        )}
      </div>
    </div>
  );
};

export default MigrateData;
