"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, PlusCircle, Loader2, Image as ImageIcon, EyeOff } from "lucide-react";
import { getHeroBanners, createHeroBanner, updateHeroBanner, deleteHeroBanner, HeroBanner as HeroBannerType } from "@/lib/supabase/hero-banners";
import { HeroBannerForm, HeroBannerFormValues } from "@/components/hero-banner-form";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function HeroBannersAdminPage() {
  const [banners, setBanners] = useState<HeroBannerType[]>([]);
  const [editingBanner, setEditingBanner] = useState<HeroBannerType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const bannersData = await getHeroBanners(false); // Fetch all banners, including inactive
    setBanners(bannersData);
    setLoading(false);
  };

  const handleFormSubmit = async (values: HeroBannerFormValues) => {
    setIsSubmittingForm(true);
    try {
      if (editingBanner) {
        const updated = await updateHeroBanner(editingBanner.id, values);
        if (updated) {
          setBanners(banners.map((b) => (b.id === updated.id ? updated : b)));
          setEditingBanner(null);
          toast.success("Banner hero berhasil diperbarui.");
        }
      } else {
        const newBanner = await createHeroBanner(values);
        if (newBanner) {
          setBanners([...banners, newBanner]);
          toast.success("Banner hero berhasil ditambahkan.");
        }
      }
    } catch (error: any) {
      toast.error("Gagal menyimpan banner hero: " + error.message);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteHeroBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
      toast.success("Banner hero berhasil dihapus.");
    } catch (error: any) {
      toast.error("Gagal menghapus banner hero: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-1/2" />
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
      <h1 className="text-3xl font-bold mb-6">Kelola Banner Hero</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingBanner ? "Edit Banner Hero" : "Tambah Banner Hero Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroBannerForm
            initialData={editingBanner}
            onSubmit={handleFormSubmit}
            loading={isSubmittingForm}
          />
          {editingBanner && (
            <Button variant="outline" onClick={() => setEditingBanner(null)} className="mt-4">
              Batal Edit
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Banner Hero</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">Belum ada banner hero. Tambahkan satu di atas!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Gambar</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tautan</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      {banner.image_url ? (
                        <Image src={banner.image_url} alt={banner.title} width={80} height={45} className="object-cover rounded" />
                      ) : (
                        <div className="w-20 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          No Img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>
                      {banner.link_url ? (
                        <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {banner.link_text || "Lihat"}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{banner.order}</TableCell>
                    <TableCell>
                      <Badge variant={banner.is_active ? "success" : "secondary"}>
                        {banner.is_active ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => setEditingBanner(banner)} disabled={isDeleting}>
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
                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus banner hero{" "}
                                <span className="font-semibold">{banner.title}</span>{" "}
                                secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBanner(banner.id)} disabled={isDeleting}>
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