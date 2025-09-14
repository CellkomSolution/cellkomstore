"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBlogPosts, deleteBlogPost, BlogPost } from "@/lib/supabase/blog-posts";
import { Edit, Trash2, PlusCircle, Loader2, BookOpen } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminBlogPage() {
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [postToDelete, setPostToDelete] = React.useState<BlogPost | null>(null);

  React.useEffect(() => {
    async function fetchBlogPosts() {
      setIsLoading(true);
      const fetchedPosts = await getBlogPosts(true); // Fetch all posts, including unpublished
      setBlogPosts(fetchedPosts);
      setIsLoading(false);
    }
    fetchBlogPosts();
  }, []);

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      // Delete image from storage first if it exists
      if (postToDelete.image_url) {
        const imageUrlParts = postToDelete.image_url.split('/');
        const fileName = imageUrlParts[imageUrlParts.length - 1];
        const { error: storageError } = await supabase.storage
          .from('blog-images')
          .remove([fileName]);

        if (storageError) {
          console.warn("Failed to delete blog post image from storage:", storageError.message);
          // Don't throw error here, proceed with post deletion even if image deletion fails
        }
      }

      // Delete post from database
      await deleteBlogPost(postToDelete.id);

      setBlogPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postToDelete.id)
      );
      toast.success("Postingan blog berhasil dihapus!");
    } catch (error: any) {
      toast.error("Gagal menghapus postingan blog: " + error.message);
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manajemen Blog</h2>
        <Button asChild>
          <Link href="/admin/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Postingan Baru
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Postingan Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Gambar</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-12 w-12 rounded-md" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : blogPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada postingan blog yang ditambahkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  blogPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        {post.image_url ? (
                          <Image
                            src={post.image_url}
                            alt={post.title}
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
                      <TableCell className="font-medium">
                        <Link href={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </TableCell>
                      <TableCell>{post.author?.first_name || "Admin"}</TableCell>
                      <TableCell>{format(new Date(post.created_at), "dd MMM yyyy", { locale: id })}</TableCell>
                      <TableCell>
                        <Badge variant={post.is_published ? "success" : "secondary"}>
                          {post.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/blog/edit/${post.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setPostToDelete(post)}
                                disabled={isDeleting}
                              >
                                {isDeleting && postToDelete?.id === post.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </AlertDialogTrigger>
                            {postToDelete?.id === post.id && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus postingan blog{" "}
                                    <span className="font-semibold">{postToDelete.title}</span>{" "}
                                    secara permanen dari database Anda.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeletePost}
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