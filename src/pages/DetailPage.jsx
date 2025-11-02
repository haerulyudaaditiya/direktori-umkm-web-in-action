import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // <-- 1. Import hook baru!

function DetailPage() {
  // 2. Gunakan "useParams" untuk menangkap parameter :slug dari URL
  // "slug" ini adalah nama variabel yang kita definisikan di App.jsx (<Route path="/umkm/:slug" ... />)
  const { slug } = useParams();

  // 3. Kita butuh state untuk menyimpan data UMKM yang kita temukan
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 4. Kita fetch data JSON, sama seperti di HomePage
  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        // 5. CARI UMKM yang benar
        // Kita gunakan .find() untuk mencari satu data yang slug-nya == slug dari URL
        const foundUmkm = data.find((item) => item.slug === slug);

        setUmkm(foundUmkm); // Simpan data yang ditemukan ke state
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data:", error);
        setIsLoading(false);
      });
  }, [slug]); // 6. useEffect ini akan dijalankan ulang jika 'slug' di URL berubah

  // 7. Tampilkan Loading...
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Memuat data UMKM...</h1>
      </div>
    );
  }

  // 8. Tampilkan jika UMKM tidak ditemukan
  if (!umkm) {
    return (
      <div className="flex h-screen items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            404 - UMKM Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-8">
            Maaf, kami tidak bisa menemukan data untuk "{slug}".
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    );
  }

  // 9. Tampilkan Halaman Detail JIKA UMKM DITEMUKAN!
  // Ini adalah UI yang diminta juri
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        {/* --- Tombol Kembali --- */}
        <Link
          to="/"
          className="text-blue-600 font-semibold hover:underline mb-6 inline-block"
        >
          &larr; Kembali ke Daftar
        </Link>

        {/* --- Galeri Foto --- */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <img
            src={umkm.foto[0]}
            alt={umkm.nama}
            className="w-full h-64 object-cover rounded-lg shadow-md col-span-2" // Foto pertama besar
          />
          {/* Tampilkan foto sisa jika ada */}
          {umkm.foto.slice(1).map((fotoUrl, index) => (
            <img
              key={index}
              src={fotoUrl}
              alt={`${umkm.nama} ${index + 2}`}
              className="w-full h-40 object-cover rounded-lg shadow-md"
            />
          ))}
        </div>

        {/* --- Judul dan Info Utama --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-4xl font-bold mb-2">{umkm.nama}</h1>
          <p className="text-lg text-gray-700 mb-4">{umkm.alamat}</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-semibold">
              {umkm.kategori}
            </span>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full font-semibold">
              {umkm.rating} ★
            </span>
            <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full font-semibold">
              {umkm.rentang_harga}
            </span>
            {umkm.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* --- Cerita dan Peta (2 Kolom) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kolom Kiri: Cerita */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Cerita Singkat</h2>
            <p className="text-gray-700 leading-relaxed">{umkm.cerita}</p>
          </div>

          {/* Kolom Kanan: Peta & Jam Buka */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Lokasi</h2>
            <p className="text-gray-700 font-semibold mb-2">Jam Buka:</p>
            <p className="text-gray-700 mb-4">{umkm.jam_buka}</p>

            {/* INI UNTUK EMBED PETA */}
            <div
              className="w-full h-64 rounded-lg overflow-hidden border"
              dangerouslySetInnerHTML={{ __html: umkm.lokasi_map }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
