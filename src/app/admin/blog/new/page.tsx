"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogPostForm, BlogPostFormValues } from "@/components/blog-post-form";
import { toast } from "sonner";
import { createBlogPost } from "@/lib/supabase/blog-posts";
import { useSession } from "@/context/session-context";

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user } = useSession();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (values: BlogPostFormValues) => {
    setLoading(true);
    try {
      if (!user) {
        toast.error("Anda harus login untuk membuat postingan blog.");
        router.push("/auth");
        return;
      }

      const postData = {
        title: values.title,
        slug: values.slug,
        content: values.content,
        author_id: user.id, // Set current user as author
        image_url: values.image_url ?? null, // Ensure it's string | null
        is_published: values.is_published ?? false, // Ensure it's always boolean
      };

      await createBlogPost(postData);

      toast.success("Postingan blog berhasil ditambahkan!");
      router.push("/admin/blog");
    } catch (error: any) {
      toast.error("Gagal menambah postingan blog: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Tambah Postingan Blog Baru</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Postingan Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostForm onSubmit={onSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}