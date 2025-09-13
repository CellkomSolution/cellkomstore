"use client";

import * as React from "react";
import Link from "next/link";
import { getBlogPosts, BlogPost } from "@/lib/supabase/blog-posts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import locale for Indonesian date formatting

export default function BlogListPage() {
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBlogPosts() {
      setIsLoading(true);
      const posts = await getBlogPosts(); // Fetches only published posts by default
      setBlogPosts(posts);
      setIsLoading(false);
    }
    fetchBlogPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Blog Kami</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-48 w-full rounded-md mb-4" />
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
        <p className="text-center text-muted-foreground text-lg">Belum ada postingan blog yang diterbitkan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.id}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-md"
                  />
                )}
                <CardHeader className="flex-grow">
                  <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {format(new Date(post.created_at), "dd MMMM yyyy", { locale: id })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.content.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}