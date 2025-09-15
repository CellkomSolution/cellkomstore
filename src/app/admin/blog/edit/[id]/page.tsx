"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogPostForm, BlogPostFormValues } from "@/components/blog-post-form";
import { toast } from "sonner";
import { getBlogPostById, updateBlogPost, BlogPost } from "@/lib/supabase/blog-posts";
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton"; // Reusing skeleton
import { useSession } from "@/context/session-context";

interface EditBlogPostPageProps {
  params: { id: string }; // Mengubah tipe params menjadi objek langsung
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = params; // Mengakses id langsung dari params
  const router = useRouter();
  const { user } = useSession();

  const [initialData, setInitialData] = React.useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchBlogPost() {
      setIsLoading(true);
      const post = await getBlogPostById(id, true); // Fetch including unpublished for admin
      if (post) {
        setInitialData(post);
      } else {
        toast.error("Postingan blog tidak ditemukan.");
        router.push("/admin/blog");
      }
      setIsLoading(false);
    }
    fetchBlogPost();
  }, [id, router]);

  const onSubmit = async (values: BlogPostFormValues) => {
    setIsSubmitting(true);
    try {
      if (!initialData) {
        toast.error("Data postingan blog tidak tersedia untuk diperbarui.");
        return;
      }
      if (!user) {
        toast.error("Anda harus login untuk mengedit postingan blog.");
        router.push("/auth");
        return;
      }

      const postData = {
        title: values.title,
        slug: values.slug,
        content: values.content,
        image_url: values.image_url,
        is_published: values.is_published,
        // author_id is not updated here, it remains the original author
      };

      await updateBlogPost(id, postData);

      toast.success("Postingan blog berhasil diperbarui!");
      router.push("/admin/blog");
    } catch (error: any) {
      toast.error("Gagal memperbarui postingan blog: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Memuat Postingan Blog...</h2>
        <ProductDetailPageSkeleton />
      </div>
    );
  }

  if (!initialData) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Edit Postingan Blog: {initialData.title}</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Postingan Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostForm initialData={initialData} onSubmit={onSubmit} loading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}