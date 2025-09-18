"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getHeroBanners, deleteHeroBanner, HeroBanner } from "@/lib/supabase/hero-banners";
import { Edit, Trash2, PlusCircle, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { HeroBannerForm, HeroBannerFormValues } from "@/components/hero-banner-form";
import { createHeroBanner, updateHeroBanner } from "@/lib/supabase/hero-banners";

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = React.useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [bannerToDelete, setBannerToDelete] = React.useState<HeroBanner | null>(null);
  const [editingBanner, setEditingBanner] = React.useState<HeroBanner | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = React.useState(false);

  React.useEffect(() => {
    async function fetchBanners() {
      setIsLoading(true);
      const fetchedBanners = await getHeroBanners(false); // Fetch all, including inactive
      setBanners(fetchedBanners);
      setIsLoading(false);
    }
    fetchBanners();
  }, []);

  const handleFormSubmit = async (values: HeroBannerFormValues) => {
    setIsSubmittingForm(true);
    try {
      if (editingBanner) {
        const updated = await updateHeroBanner(editingBanner.id, values);
        if (updated) {
          setBanners(banners.map((b) => (b.id === updated.id ? updated : b)));
          setEditingBanner(null);
          toast.success("Banner berhasil diperbarui.");
        }
      } else {
        const newBanner = await createHeroBanner(values);
        if (newBanner) {
          setBanners([...banners, newBanner]);
          toast.success("Banner berhasil ditambahkan.");
        }
      }
    } catch (error: any) {
      toast.error("Gagal menyimpan banner: " + error.message);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;

    setIsDeleting(true);
    try {
      await deleteHeroBanner(bannerToDelete.id);
      setBanners(banners.filter((b) => b.id !== bannerToDelete.id));
      toast.success("Banner berhasil dihapus!");
    } catch (error: any) {
      toast.error("Gagal menghapus banner: " + error.message);
    } finally {
      setIsDeleting(false);
      setBannerToDelete(null);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Manajemen Hero Banner</h2>
      <p className="text-muted-foreground">
        Kelola banner yang ditampilkan di bagian atas halaman beranda.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingBanner ? "Edit Hero Banner" : "Tambah Hero Banner Baru"}</CardTitle>
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
          <CardTitle>Daftar Hero Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Gambar</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Teks Tombol</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-16 w-24 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[70px]" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada hero banner yang ditambahkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="relative w-24 h-16 rounded-md overflow-hidden">
                          <Image
                            src={banner.image_url}
                            alt={banner.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{banner.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground line-clamp-2">{banner.description || "N/A"}</TableCell>
                      <TableCell>{banner.button_text || "N/A"}</TableCell>
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
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setBannerToDelete(banner)}
                                disabled={isDeleting}
                              >
                                {isDeleting && bannerToDelete?.id === banner.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </AlertDialogTrigger>
                            {bannerToDelete?.id === banner.id && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus banner{" "}
                                    <span className="font-semibold">{bannerToDelete.title}</span>{" "}
                                    secara permanen dari database Anda.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteBanner}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            )}
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}