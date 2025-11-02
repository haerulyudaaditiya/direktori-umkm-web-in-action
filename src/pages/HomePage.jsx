import React, { useState, useEffect, useMemo } from "react"; // Tambahkan useMemo
import { Link } from "react-router-dom";

function HomePage() {
  const [umkmList, setUmkmList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // --- 1. STATE BARU ---
  // Kita akan simpan tag yang dipilih dalam sebuah array
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        setUmkmList(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data:", error);
        setIsLoading(false);
      });
  }, []);

  // --- 2. LOGIKA BARU (Mengambil Kategori & Tag Unik) ---
  // Kita gunakan 'useMemo' agar kalkulasi ini tidak diulang-ulang
  const { allCategories, allTags } = useMemo(() => {
    const categories = new Set(["Semua"]);
    const tags = new Set();

    umkmList.forEach((item) => {
      categories.add(item.kategori);
      item.tags.forEach((tag) => tags.add(tag));
    });

    return {
      allCategories: Array.from(categories),
      allTags: Array.from(tags),
    };
  }, [umkmList]); // Hanya dijalankan ulang jika umkmList berubah

  // --- 3. LOGIKA BARU (Fungsi Toggle Tag) ---
  const handleTagToggle = (tag) => {
    setSelectedTags((prevTags) => {
      // Jika tag sudah ada di array, kita hapus (filter)
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      }
      // Jika tag belum ada, kita tambahkan
      else {
        return [...prevTags, tag];
      }
    });
  };

  // --- 4. LOGIKA BARU (Update Filter Utama) ---
  const filteredUMKM = useMemo(() => {
    return umkmList.filter((umkm) => {
      const categoryMatch =
        selectedCategory === "Semua" || umkm.kategori === selectedCategory;

      const searchMatch = umkm.nama
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Cek apakah SEMUA tag yang dipilih ada di dalam 'umkm.tags'
      const tagMatch =
        selectedTags.length === 0 || // Jika tidak ada tag dipilih, loloskan semua
        selectedTags.every((tag) => umkm.tags.includes(tag)); // 'every' = 'semua'

      return categoryMatch && searchMatch && tagMatch;
    });
  }, [umkmList, searchTerm, selectedCategory, selectedTags]); // Filter ini akan jalan ulang jika salah satu state ini berubah

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold">Memuat data UMKM...</h1>
      </div>
    );
  }

  return (
    // Kita buat padding default untuk mobile (p-4)
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        {" "}
        {/* p-4 (mobile), md:p-8 (desktop) */}
        <h1 className="text-4xl font-bold mb-2">Kantong Aman</h1>
        <p className="text-xl text-gray-600 mb-8">Direktori Sobat Mahasiswa</p>
        {/* --- AREA INTERAKTIF --- */}
        <div className="mb-8 p-4 md:p-6 bg-white rounded-lg shadow-md">
          {/* Search & Kategori */}
          {/* Di mobile (default): 1 kolom. Di desktop (md:): 3 kolom */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Cari nama warung..."
              className="md:col-span-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              {allCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* --- RENDER TOMBOL TAG (X-FACTOR!) --- */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Filter Cepat:
            </h3>
            {/* 'flex-wrap' adalah kunci mobile-first. Tombol akan otomatis turun baris jika tidak muat */}
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    // Ganti style berdasarkan 'isActive'
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }
                    `}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* --- Kumpulan Kartu UMKM --- */}
        {filteredUMKM.length > 0 ? (
          // Default: 1 kolom (mobile-first). md: 2 kolom. lg: 3 kolom.
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUMKM.map((umkm) => (
              <Link to={`/umkm/${umkm.slug}`} key={umkm.id}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="h-48 bg-gray-200">
                    <img
                      src={umkm.foto[0]}
                      alt={umkm.nama}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {umkm.kategori}
                    </span>
                    <h2 className="text-2xl font-bold my-2">{umkm.nama}</h2>
                    <p className="text-gray-700 mb-4 text-sm">
                      {umkm.cerita.substring(0, 100)}...
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {umkm.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-200 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center p-10 md:p-16 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">Yah, tidak ditemukan</h2>
            <p className="text-gray-600">
              Coba ganti kata kunci pencarian atau filternya.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
