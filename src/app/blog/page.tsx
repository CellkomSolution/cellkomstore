"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogPosts, BlogPost } from "@/lib/supabase/blog-posts";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBlogPosts() {
      setIsLoading(true);
      const posts = await getBlogPosts();
      setBlogPosts(posts);
      setIsLoading(false);
    }
    fetchBlogPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Blog Kami</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Temukan artikel terbaru, tips, dan berita menarik seputar teknologi, gaya hidup, dan produk-produk pilihan kami.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="w-full h-48 rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">Belum ada postingan blog.</h2>
          <p className="text-muted-foreground">
            Nantikan artikel-artikel menarik dari kami!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              <Link href={`/blog/${post.slug}`} className="block">
                {post.image_url && (
                  <div className="relative w-full h-48">
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
              </Link>
              <CardHeader className="flex-grow">
                <CardTitle className="text-xl font-semibold line-clamp-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Oleh {post.author?.first_name || "Admin"} pada {format(new Date(post.created_at), "dd MMMM yyyy", { locale: id })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/blog/${post.slug}`} className="text-primary hover:underline text-sm font-medium">
                  Baca Selengkapnya &rarr;
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}