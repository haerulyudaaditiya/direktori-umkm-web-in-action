import React, { useState, useEffect } from "react";

function App() {
  const [umkmList, setUmkmList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

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

  const allCategories = [
    "Semua",
    ...new Set(umkmList.map((item) => item.kategori)),
  ];

  const filteredUMKM = umkmList.filter((umkm) => {
    // 1. Cek Kategori
    const categoryMatch =
      selectedCategory === "Semua" || umkm.kategori === selectedCategory;

    // 2. Cek Search Term
    const searchMatch = umkm.nama
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return categoryMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Memuat data UMKM...</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-8">
        {/* --- Judul --- */}
        <h1 className="text-4xl font-bold mb-2">Kantong Aman</h1>
        <p className="text-xl text-gray-600 mb-8">
          Direktori Sobat Mahasiswa di Sekitar Kampus
        </p>

        {/* --- AREA INTERAKTIF BARU --- */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Search Bar */}
            <input
              type="text"
              placeholder="Cari nama warung kopi atau warteg..."
              className="md:col-span-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            {/* 2. Filter Kategori (Dropdown) */}
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
        </div>

        {/* --- Kumpulan Kartu UMKM --- */}
        {filteredUMKM.length > 0 ? (
          // Jika ada hasil
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kita map dari "filteredUMKM", bukan "umkmList" lagi */}
            {filteredUMKM.map((umkm) => (
              <div
                key={umkm.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
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
                  <p className="text-gray-700 mb-4">
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
            ))}
          </div>
        ) : (
          // Jika tidak ada hasil (Empty State) - Ini poin X-Factor!
          <div className="text-center p-16 bg-white rounded-lg shadow-md">
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

export default App;
