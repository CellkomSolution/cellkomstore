"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCarouselBanners, createCarouselBanner, updateCarouselBanner, deleteCarouselBanner, CarouselBanner } from "@/lib/supabase/carousel-banners";
import { ImageUploader } from "@/components/image-uploader";
import { CarouselBannerForm, CarouselBannerFormValues } from "@/components/carousel-banner-form";
import { Edit, Trash2, PlusCircle, Loader2, Link as LinkIcon } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

export default function AdminHeroCarouselPage() {
  const [banners, setBanners] = React.useState<CarouselBanner[]>([]);
  const [editingBanner, setEditingBanner] = React.useState<CarouselBanner | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [bannerToDelete, setBannerToDelete] = React.useState<CarouselBanner | null>(null);

  React.useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    const fetchedBanners = await getCarouselBanners();
    setBanners(fetchedBanners);
    setIsLoading(false);
  };

  const handleFormSubmit = async (values: CarouselBannerFormValues) => {
    setIsSubmittingForm(true);
    try {
      if (editingBanner) {
        const updated = await updateCarouselBanner(editingBanner.id, values);
        if (updated) {
          setBanners(banners.map((b) => (b.id === updated.id ? updated : b)));
          setEditingBanner(null);
          toast.success("Banner berhasil diperbarui.");
        }
      } else {
        const newBanner = await createCarouselBanner(values);
        if (newBanner) {
          setBanners([...banners, newBanner]);
          toast.success("Banner berhasil ditambahkan.");
        }
      }
      form.reset(); // Reset form after successful submission
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
      await deleteCarouselBanner(bannerToDelete.id);
      setBanners(banners.filter((b) => b.id !== bannerToDelete.id));
      toast.success("Banner berhasil dihapus!");
    } catch (error: any) {
      toast.error("Gagal menghapus banner: " + error.message);
    } finally {
      setIsDeleting(false);
      setBannerToDelete(null);
    }
  };

  const form = React.useRef<any>(null); // Ref to access form methods

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manajemen Hero Carousel</h2>
        <Button onClick={() => { setEditingBanner(null); form.current?.reset(); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Banner Baru
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingBanner ? "Edit Banner Carousel" : "Tambah Banner Carousel Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          <CarouselBannerForm
            initialData={editingBanner}
            onSubmit={handleFormSubmit}
            loading={isSubmittingForm}
            ref={form}
          />
          {editingBanner && (
            <Button variant="outline" onClick={() => { setEditingBanner(null); form.current?.reset(); }} className="mt-4">
              Batal Edit
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Banner Carousel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Gambar</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Tautan</TableHead>
                  <TableHead>Urutan</TableHead>
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada banner carousel yang ditambahkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        {banner.image_url ? (
                          <Image
                            src={banner.image_url}
                            alt={banner.title || "Banner Image"}
                            width={96}
                            height={64}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-16 w-24 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                            No Img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{banner.title || "N/A"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">{banner.description || "N/A"}</TableCell>
                      <TableCell>
                        {banner.link_url ? (
                          <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" /> Link
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{banner.order}</TableCell>
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
                                    <span className="font-semibold">{bannerToDelete.title || "ini"}</span>{" "}
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