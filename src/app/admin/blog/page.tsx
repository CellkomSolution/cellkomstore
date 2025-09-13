"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUploader } from "@/components/image-uploader";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit } from "lucide-react";
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, BlogPost } from "@/lib/supabase/blog-posts";
import { supabase } from "@/integrations/supabase/client"; // For storage operations
import { useAuth } from "@/hooks/use-auth"; // To get current user's ID for author_id

export default function BlogAdminPage() {
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    setLoading(true);
    // Fetch all posts, including unpublished ones, for admin view
    const posts = await getBlogPosts(true);
    setBlogPosts(posts);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setImageUrl("");
    setIsPublished(false);
    setEditingPost(null);
  };

  const handleAddOrUpdatePost = async () => {
    if (!title || !slug || !content) {
      toast.error("Judul, slug, dan konten diperlukan.");
      return;
    }

    const postData = {
      title,
      slug,
      content,
      image_url: imageUrl,
      is_published: isPublished,
      author_id: user?.id || null, // Assign current user as author
    };

    try {
      if (editingPost) {
        const updated = await updateBlogPost(editingPost.id, postData);
        if (updated) {
          setBlogPosts(blogPosts.map((p) => (p.id === updated.id ? updated : p)));
          toast.success("Postingan blog berhasil diperbarui.");
        }
      } else {
        const newPost = await createBlogPost(postData);
        if (newPost) {
          setBlogPosts([...blogPosts, newPost]);
          toast.success("Postingan blog berhasil ditambahkan.");
        }
      }
      resetForm();
    } catch (error: any) {
      toast.error("Gagal menyimpan postingan blog: " + error.message);
    }
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setImageUrl(post.image_url || "");
    setIsPublished(post.is_published);
  };

  const handleDeletePost = async (id: string) => {
    const postToDelete = blogPosts.find(p => p.id === id);
    if (postToDelete && postToDelete.image_url) {
      const imageUrlParts = postToDelete.image_url.split('/');
      const fileName = imageUrlParts[imageUrlParts.length - 1];
      const { error: storageError } = await supabase.storage
        .from('blog-images') // Use the correct bucket name
        .remove([fileName]);

      if (storageError) {
        console.warn("Failed to delete blog image from storage:", storageError.message);
      }
    }

    try {
      await deleteBlogPost(id);
      setBlogPosts(blogPosts.filter((p) => p.id !== id));
      toast.success("Postingan blog berhasil dihapus.");
    } catch (error: any) {
      toast.error("Gagal menghapus postingan blog: " + error.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Memuat...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Kelola Postingan Blog</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingPost ? "Edit Postingan Blog" : "Buat Postingan Blog Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul Postingan Blog Anda"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL Friendly)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, ''))}
                placeholder="judul-postingan-blog-anda"
              />
            </div>
            <div>
              <Label htmlFor="content">Konten</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis konten blog Anda di sini..."
                rows={10}
              />
            </div>
            <div>
              <Label htmlFor="image-uploader">Gambar Unggulan</Label>
              <ImageUploader
                bucketName="blog-images"
                currentImageUrl={imageUrl}
                onUploadSuccess={setImageUrl}
                onRemove={() => setImageUrl("")}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-published"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked as boolean)}
              />
              <Label htmlFor="is-published">Terbitkan Postingan</Label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddOrUpdatePost}>
                {editingPost ? "Perbarui Postingan" : "Buat Postingan"}
              </Button>
              {editingPost && (
                <Button variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Postingan Blog</CardTitle>
        </CardHeader>
        <CardContent>
          {blogPosts.length === 0 ? (
            <p>Belum ada postingan blog. Buat satu di atas!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Diterbitkan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-muted flex items-center justify-center rounded text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.slug}</TableCell>
                    <TableCell>{post.is_published ? "Ya" : "Tidak"}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(post)}>
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
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus postingan blog ini secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Hapus</AlertDialogAction>
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