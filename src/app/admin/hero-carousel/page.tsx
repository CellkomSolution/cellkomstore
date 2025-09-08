"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getHeroCarouselSlides, deleteHeroCarouselSlide, HeroCarouselSlide } from "@/lib/supabase-queries";
import { Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
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
import { supabase } from "@/integrations/supabase/client"; // Import ini ditambahkan
import { Badge } from "@/components/ui/badge";

export default function AdminHeroCarouselPage() {
  const [slides, setSlides] = React.useState<HeroCarouselSlide[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [slideToDelete, setSlideToDelete] = React.useState<HeroCarouselSlide | null>(null);

  React.useEffect(() => {
    async function fetchSlides() {
      setIsLoading(true);
      const fetchedSlides = await getHeroCarouselSlides();
      setSlides(fetchedSlides);
      setIsLoading(false);
    }
    fetchSlides();
  }, []);

  const handleDeleteSlide = async () => {
    if (!slideToDelete) return;

    setIsDeleting(true);
    try {
      // Delete images from storage first
      const imageUrlsToDelete: string[] = [];
      if (slideToDelete.product_image_url) imageUrlsToDelete.push(slideToDelete.product_image_url);
      if (slideToDelete.logo_url) imageUrlsToDelete.push(slideToDelete.logo_url);
      if (slideToDelete.left_peek_image_url) imageUrlsToDelete.push(slideToDelete.left_peek_image_url);
      if (slideToDelete.right_peek_image_url) imageUrlsToDelete.push(slideToDelete.right_peek_image_url);
      if (slideToDelete.right_peek_logo_url) imageUrlsToDelete.push(slideToDelete.right_peek_logo_url);

      if (imageUrlsToDelete.length > 0) {
        const fileNames = imageUrlsToDelete.map(url => url.split('/').pop()!).filter(Boolean);
        const { error: storageError } = await supabase.storage
          .from('carousel-images')
          .remove(fileNames);

        if (storageError) {
          console.warn("Failed to delete carousel images from storage:", storageError.message);
          // Don't throw error here, proceed with slide deletion even if image deletion fails
        }
      }

      // Delete slide from database
      await deleteHeroCarouselSlide(slideToDelete.id);

      setSlides((prevSlides) =>
        prevSlides.filter((slide) => slide.id !== slideToDelete.id)
      );
      toast.success("Slide carousel berhasil dihapus!");
    } catch (error: any) {
      toast.error("Gagal menghapus slide carousel: " + error.message);
    } finally {
      setIsDeleting(false);
      setSlideToDelete(null);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manajemen Hero Carousel</h2>
        <Button asChild>
          <Link href="/admin/hero-carousel/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Slide Baru
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Slide Carousel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Gambar</TableHead>
                  <TableHead>Judul/Alt Text</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : slides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada slide carousel yang ditambahkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  slides.map((slide) => (
                    <TableRow key={slide.id}>
                      <TableCell>
                        {slide.product_image_url ? (
                          <Image
                            src={slide.product_image_url}
                            alt={slide.alt}
                            width={48}
                            height={48}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                            No Img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{slide.product_name || slide.alt}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {slide.type === 'full-banner' ? 'Full Banner' : 'Three-Part'}
                        </Badge>
                      </TableCell>
                      <TableCell>{slide.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/hero-carousel/edit/${slide.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setSlideToDelete(slide)}
                                disabled={isDeleting}
                              >
                                {isDeleting && slideToDelete?.id === slide.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </AlertDialogTrigger>
                            {slideToDelete?.id === slide.id && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus slide{" "}
                                    <span className="font-semibold">{slideToDelete.product_name || slideToDelete.alt}</span>{" "}
                                    secara permanen dari database Anda.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteSlide}
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