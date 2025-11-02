import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Zap, MapPin, Heart } from 'lucide-react';

function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Logika "Advance Search"
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      navigate('/direktori');
    } else {
      navigate(`/direktori?search=${searchTerm}`);
    }
  };

  return (
    // 'Fragment' <>...</> digunakan karena layout di-handle oleh SharedLayout
    <>
      {/* BAGIAN 1: HERO SECTION */}
      {/* Layout ini (flex-1) dirancang untuk 'pas' di dalam <main> dari SharedLayout,
        mengisi sisa ruang vertikal antara Navbar dan Footer.
      */}
      <section className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950">
        <div className="container max-w-4xl py-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Temukan Jagoan UMKM Lokal.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Dari kopi tersembunyi, warteg legendaris, hingga laundry kilat. Kami
            bantu kamu menemukan yang terbaik di sekitarmu.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-lg mx-auto flex items-center space-x-2 mb-4"
          >
            <Input
              type="text"
              placeholder="Cari 'Seblak', 'Kopi', atau 'Laundry'..."
              className="h-12 text-lg flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" size="lg">
              Cari
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Atau,{' '}
            <Link
              to="/direktori"
              className="text-primary underline hover:opacity-80 font-medium"
            >
              lihat semua direktori
            </Link>
            .
          </p>
        </div>
      </section>

      {/* BAGIAN 2: FEATURES SECTION */}
      <section className="container mx-auto py-24 px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          Kenapa Pakai <span className="text-primary">Kantong Aman</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Filter Cerdas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bukan cuma kategori. Cari berdasarkan "Ada WiFi", "Colokan
                Banyak", atau "Buka 24 Jam". Filter yang benar-benar kamu
                butuhkan.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Temukan Permata</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Temukan "hidden gems" yang tidak ada di peta mainstream. Kami
                kurasi khusus untuk Sobat Mahasiswa.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Dukung Lokal</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bantu usaha kecil di sekitarmu agar tetap bertahan dan
                berkembang. Setiap kunjunganmu sangat berarti.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
