import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function DetailPage() {
  const { slug } = useParams();
  const [umkm, setUmkm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/data.json')
      .then((response) => response.json())
      .then((data) => {
        const foundUmkm = data.find((item) => item.slug === slug);
        setUmkm(foundUmkm);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Gagal mengambil data:', error);
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="w-full h-64 rounded-lg col-span-2" />
            <Skeleton className="w-full h-40 rounded-lg" />
            <Skeleton className="w-full h-40 rounded-lg" />
          </div>
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-10 w-3/4 mb-3" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="md:col-span-2 h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center text-center p-4">
        <Card className="max-w-lg p-8">
          <CardTitle className="text-3xl mb-4">
            404 - UMKM Tidak Ditemukan
          </CardTitle>
          <CardDescription className="text-lg mb-8">
            Maaf, kami tidak bisa menemukan data untuk "{slug}".
          </CardDescription>
          <Button asChild>
            <Link to="/direktori">Kembali ke Direktori</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/direktori">&larr; Kembali ke Direktori</Link>
        </Button>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <img
            src={umkm.foto[0]}
            alt={umkm.nama}
            className="w-full h-64 object-cover rounded-lg shadow-md col-span-2"
          />
          {umkm.foto.slice(1).map((fotoUrl, index) => (
            <img
              key={index}
              src={fotoUrl}
              alt={`${umkm.nama} ${index + 2}`}
              className="w-full h-40 object-cover rounded-lg shadow-md"
            />
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-4xl">{umkm.nama}</CardTitle>
            <CardDescription className="text-lg pt-1">
              {umkm.alamat}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="text-sm">
                {umkm.kategori}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {umkm.rating} ★
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {umkm.rentang_harga}
              </Badge>
              {umkm.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Cerita Singkat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {umkm.cerita}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Lokasi & Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold mb-1">Jam Buka:</p>
              <p className="text-muted-foreground mb-4">{umkm.jam_buka}</p>
              <p className="text-sm font-semibold mb-2">Peta Lokasi:</p>
              <div
                className="w-full h-64 rounded-lg overflow-hidden border"
                dangerouslySetInnerHTML={{ __html: umkm.lokasi_map }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
