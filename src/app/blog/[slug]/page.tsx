"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getBlogPostBySlug, BlogPost } from "@/lib/supabase/blog-posts";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, CalendarDays, User as UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton"; // Reusing skeleton

interface BlogPostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostDetailPage({ params }: BlogPostDetailPageProps) {
  const unwrappedParams = React.use(params);
  const { slug } = unwrappedParams;

  const [blogPost, setBlogPost] = React.useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBlogPost() {
      setIsLoading(true);
      const post = await getBlogPostBySlug(slug);
      if (post) {
        setBlogPost(post);
      } else {
        notFound();
      }
      setIsLoading(false);
    }
    fetchBlogPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductDetailPageSkeleton /> {/* Reusing a general skeleton */}
      </div>
    );
  }

  if (!blogPost) {
    return null; // notFound() handles this
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="space-y-8">
        {blogPost.image_url && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={blogPost.image_url}
              alt={blogPost.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-center">
          {blogPost.title}
        </h1>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <UserIcon className="h-4 w-4" />
            <span>Oleh {blogPost.author?.first_name || "Admin"}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>{format(new Date(blogPost.created_at), "dd MMMM yyyy", { locale: id })}</span>
          </div>
        </div>

        <Separator />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Render content as HTML. Be careful with untrusted content. */}
          <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
        </div>
      </article>
    </div>
  );
}