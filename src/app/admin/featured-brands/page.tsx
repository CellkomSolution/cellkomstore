"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, PlusCircle, Loader2 } from "lucide-react";
import { getFeaturedBrands, createFeaturedBrand, updateFeaturedBrand, deleteFeaturedBrand, FeaturedBrand } from "@/lib/supabase/featured-brands";
import { getAppSettings, updateAppSettings } from "@/lib/supabase/app-settings";
import { FeaturedBrandForm, FeaturedBrandFormValues } from "@/components/featured-brand-form"; // Import komponen form baru
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedBrandsAdminPage() {
  const [brands, setBrands] = useState<FeaturedBrand[]>([]);
  const [editingBrand, setEditingBrand] = useState<FeaturedBrand | null>(null);
  const [featuredBrandsTitle, setFeaturedBrandsTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchBrandsAndTitle();
  }, []);

  const fetchBrandsAndTitle = async () => {
    setLoading(true);
    const brandsData = await getFeaturedBrands();
    setBrands(brandsData);

    const settingsData = await getAppSettings();
    if (settingsData) {
      setFeaturedBrandsTitle(settingsData.featured_brands_title || "Brand Pilihan");
    } else {
      toast.error("Gagal mengambil pengaturan aplikasi.");
    }
    setLoading(false);
  };

  const handleFormSubmit = async (values: FeaturedBrandFormValues) => {
    setIsSubmittingForm(true);
    try {
      if (editingBrand) {
        const updated = await updateFeaturedBrand(editingBrand.id, values);
        if (updated) {
          setBrands(brands.map((b) => (b.id === updated.id ? updated : b)));
          setEditingBrand(null);
          toast.success("Merek berhasil diperbarui.");
        }
      } else {
        const newBrand = await createFeaturedBrand({ ...values, order: brands.length });
        if (newBrand) {
          setBrands([...brands, newBrand]);
          toast.success("Merek berhasil ditambahkan.");
        }
      }
    } catch (error: any) {
      toast.error("Gagal menyimpan merek: " + error.message);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteFeaturedBrand(id);
      setBrands(brands.filter((b) => b.id !== id));
      toast.success("Merek berhasil dihapus.");
    } catch (error: any) {
      toast.error("Gagal menghapus merek: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateTitle = async () => {
    setIsSubmittingForm(true); // Menggunakan state yang sama untuk indikator loading
    try {
      await updateAppSettings({ featured_brands_title: featuredBrandsTitle });
      toast.success("Judul merek unggulan berhasil diperbarui.");
    } catch (error: any) {
      toast.error("Gagal memperbarui judul: " + error.message);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
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
            <Button onClick={handleUpdateTitle} disabled={isSubmittingForm}>
              {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Judul
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingBrand ? "Edit Merek Unggulan" : "Tambah Merek Unggulan Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          <FeaturedBrandForm
            initialData={editingBrand}
            onSubmit={handleFormSubmit}
            loading={isSubmittingForm}
          />
          {editingBrand && (
            <Button variant="outline" onClick={() => setEditingBrand(null)} className="mt-4">
              Batal Edit
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Merek Unggulan</CardTitle>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada merek unggulan. Tambahkan satu di atas!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>URL Tautan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => setEditingBrand(brand)} disabled={isDeleting}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" disabled={isDeleting}>
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">Hapus</span>
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
                              <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBrand(brand.id)} disabled={isDeleting}>
                                {isDeleting ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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