import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton" 

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function HomePage() {
  const [umkmList, setUmkmList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
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
  }, [umkmList]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const filteredUMKM = useMemo(() => {
    return umkmList.filter((umkm) => {
      const categoryMatch =
        selectedCategory === "Semua" || umkm.kategori === selectedCategory;
      const searchMatch = umkm.nama
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => umkm.tags.includes(tag));

      return categoryMatch && searchMatch && tagMatch;
    });
  }, [umkmList, searchTerm, selectedCategory, selectedTags]);

  if (isLoading) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto p-4 md:p-8">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-8" />

          <Card className="mb-8 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Skeleton className="h-10 md:col-span-2" /> 
              <Skeleton className="h-10" /> 
            </div>
            <div className="border-t border-border pt-4">
              <Skeleton className="h-4 w-1/4 mb-3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="w-full flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {" "}
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold mb-2">Kantong Aman</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {" "}
          Direktori Sobat Mahasiswa
        </p>

        <Card className="mb-8 p-4 md:p-6">
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Cari nama warung kopi atau warteg..."
              className="md:col-span-2"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />

            <Select
              onValueChange={handleCategoryChange}
              value={selectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-border pt-4">
            {" "}
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {" "}
              Filter Cepat:
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    variant={isActive ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>
          </div>
        </Card>

        {filteredUMKM.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUMKM.map((umkm) => (
              <Link to={`/umkm/${umkm.slug}`} key={umkm.id} className="flex">
                <Card className="w-full flex flex-col hover:border-primary transition-colors duration-200">
                  {" "}
                  <CardHeader>
                    <CardTitle className="text-2xl">{umkm.nama}</CardTitle>
                    <CardDescription>
                      <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {" "}
                        {umkm.kategori}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="h-48 bg-muted rounded-md overflow-hidden mb-4">
                      <img
                        src={umkm.foto[0]}
                        alt={umkm.nama}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {umkm.cerita.substring(0, 100)}...
                    </p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex flex-wrap gap-2">
                      {umkm.tags.slice(0, 3).map(
                        (
                          tag 
                        ) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center p-10 md:p-16">
            <h2 className="text-2xl font-bold mb-2">Yah, tidak ditemukan</h2>
            <p className="text-muted-foreground">
              Coba ganti kata kunci pencarian atau filternya.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default HomePage;
