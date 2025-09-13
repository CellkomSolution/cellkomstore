"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, BlogPost } from "@/lib/supabase/blog-posts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import locale for Indonesian date formatting

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const unwrappedParams = React.use(params);
  const { slug } = unwrappedParams;

  const [blogPost, setBlogPost] = React.useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBlogPost() {
      setIsLoading(true);
      const post = await getBlogPostBySlug(slug);
      if (!post) {
        notFound();
        return;
      }
      setBlogPost(post);
      setIsLoading(false);
    }
    fetchBlogPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full rounded-md mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!blogPost) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        {blogPost.image_url && (
          <img
            src={blogPost.image_url}
            alt={blogPost.title}
            className="w-full h-64 object-cover rounded-t-lg"
          />
        )}
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{blogPost.title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Dipublikasikan pada {format(new Date(blogPost.created_at), "dd MMMM yyyy", { locale: id })}
          </CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>{blogPost.content}</p>
        </CardContent>
      </Card>
    </div>
  );
}