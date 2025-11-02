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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/direktori?search=${query}` : '/direktori');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950">
        <div className="container max-w-4xl py-20 px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Temukan Jagoan UMKM Lokal.
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Dari kopi tersembunyi, warteg legendaris, hingga laundry kilat —
            kami bantu kamu menemukan yang terbaik di sekitarmu.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center justify-center gap-2 max-w-lg mx-auto mb-4"
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
            Atau{' '}
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

      {/* Features Section */}
      <section className="container mx-auto py-24 px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          Kenapa Pakai <span className="text-primary">Kantong Aman</span>?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Filter Cerdas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cari berdasarkan kategori, WiFi, colokan, hingga jam buka.
                Filter yang benar-benar kamu butuhkan.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Temukan Permata</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Jelajahi hidden gems yang belum masuk peta mainstream. Khusus
                buat Sobat Mahasiswa.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Dukung Lokal</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bantu usaha kecil di sekitarmu agar tetap tumbuh dan berkembang.
                Setiap kunjunganmu berarti banyak.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
