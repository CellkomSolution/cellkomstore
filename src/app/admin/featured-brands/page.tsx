"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUploader } from "@/components/image-uploader";
import { supabase } from "@/integrations/supabase/client"; // Masih perlu untuk app_settings
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit } from "lucide-react";
import { getFeaturedBrands, createFeaturedBrand, updateFeaturedBrand, deleteFeaturedBrand, FeaturedBrand } from "@/lib/supabase/featured-brands"; // Import dari utilitas baru

export default function FeaturedBrandsAdminPage() {
  const [brands, setBrands] = useState<FeaturedBrand[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newLinkUrl, setNewLinkUrl] = useState<string>("");
  const [editingBrand, setEditingBrand] = useState<FeaturedBrand | null>(null);
  const [featuredBrandsTitle, setFeaturedBrandsTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBrandsAndTitle();
  }, []);

  const fetchBrandsAndTitle = async () => {
    setLoading(true);
    const brandsData = await getFeaturedBrands(); // Menggunakan fungsi utilitas baru
    setBrands(brandsData);

    const { data: settingsData, error: settingsError } = await supabase
      .from("app_settings")
      .select("featured_brands_title")
      .single();

    if (settingsError) {
      toast.error("Gagal mengambil judul merek unggulan: " + settingsError.message);
    } else {
      setFeaturedBrandsTitle(settingsData?.featured_brands_title || "Brand Pilihan");
    }
    setLoading(false);
  };

  const handleAddBrand = async () => {
    if (!newImageUrl) {
      toast.error("URL gambar diperlukan.");
      return;
    }

    try {
      const data = await createFeaturedBrand({ image_url: newImageUrl, link_url: newLinkUrl, order: brands.length }); // Menggunakan fungsi utilitas baru
      if (data) {
        setBrands([...brands, data]);
        setNewImageUrl("");
        setNewLinkUrl("");
        toast.success("Merek berhasil ditambahkan.");
      }
    } catch (error: any) {
      toast.error("Gagal menambahkan merek: " + error.message);
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand || !editingBrand.image_url) {
      toast.error("URL gambar diperlukan.");
      return;
    }

    try {
      const data = await updateFeaturedBrand(editingBrand.id, { image_url: editingBrand.image_url, link_url: editingBrand.link_url }); // Menggunakan fungsi utilitas baru
      if (data) {
        setBrands(brands.map((b) => (b.id === data.id ? data : b)));
        setEditingBrand(null);
        toast.success("Merek berhasil diperbarui.");
      }
    } catch (error: any) {
      toast.error("Gagal memperbarui merek: " + error.message);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    const brandToDelete = brands.find(b => b.id === id);
    if (brandToDelete && brandToDelete.image_url) {
      const imageUrlParts = brandToDelete.image_url.split('/');
      const fileName = imageUrlParts[imageUrlParts.length - 1];
      const { error: storageError } = await supabase.storage
        .from('featured-brand-images')
        .remove([fileName]);

      if (storageError) {
        console.warn("Failed to delete brand image from storage:", storageError.message);
      }
    }

    try {
      await deleteFeaturedBrand(id); // Menggunakan fungsi utilitas baru
      setBrands(brands.filter((b) => b.id !== id));
      toast.success("Merek berhasil dihapus.");
    } catch (error: any) {
      toast.error("Gagal menghapus merek: " + error.message);
    }
  };

  const handleUpdateTitle = async () => {
    const { error } = await supabase
      .from("app_settings")
      .update({ featured_brands_title: featuredBrandsTitle })
      .eq("id", "00000000-0000-0000-0000-000000000001");

    if (error) {
      toast.error("Gagal memperbarui judul: " + error.message);
    } else {
      toast.success("Judul merek unggulan berhasil diperbarui.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Memuat...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Kelola Merek Unggulan</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Atur Judul Merek Unggulan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-2">
            <div className="grid gap-2 flex-grow">
              <Label htmlFor="featuredBrandsTitle">Judul</Label>
              <Input
                id="featuredBrandsTitle"
                value={featuredBrandsTitle}
                onChange={(e) => setFeaturedBrandsTitle(e.target.value)}
                placeholder="Misalnya: Brand Pilihan Kami"
              />
            </div>
            <Button onClick={handleUpdateTitle}>Simpan Judul</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingBrand ? "Edit Merek Unggulan" : "Tambah Merek Unggulan Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="image-uploader">Gambar Merek</Label>
              <ImageUploader
                bucketName="featured-brand-images"
                currentImageUrl={editingBrand ? editingBrand.image_url : newImageUrl}
                onUploadSuccess={(url) => {
                  if (editingBrand) {
                    setEditingBrand({ ...editingBrand, image_url: url });
                  } else {
                    setNewImageUrl(url);
                  }
                }}
                onRemove={() => {
                  if (editingBrand) {
                    setEditingBrand({ ...editingBrand, image_url: "" });
                  } else {
                    setNewImageUrl("");
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="link-url">URL Tautan</Label>
              <Input
                id="link-url"
                value={editingBrand ? editingBrand.link_url || "" : newLinkUrl}
                onChange={(e) => {
                  if (editingBrand) {
                    setEditingBrand({ ...editingBrand, link_url: e.target.value });
                  } else {
                    setNewLinkUrl(e.target.value);
                  }
                }}
                placeholder="https://example.com/brand"
              />
            </div>
            {editingBrand ? (
              <div className="flex space-x-2">
                <Button onClick={handleUpdateBrand}>Perbarui Merek</Button>
                <Button variant="outline" onClick={() => setEditingBrand(null)}>Batal</Button>
              </div>
            ) : (
              <Button onClick={handleAddBrand}>Tambah Merek</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Merek Unggulan</CardTitle>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <p>Belum ada merek unggulan. Tambahkan satu di atas!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>URL Tautan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <img src={brand.image_url} alt="Brand" className="w-16 h-16 object-contain rounded" />
                    </TableCell>
                    <TableCell>
                      <a href={brand.link_url || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {brand.link_url || "N/A"}
                      </a>
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => setEditingBrand(brand)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus merek unggulan ini secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBrand(brand.id)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}