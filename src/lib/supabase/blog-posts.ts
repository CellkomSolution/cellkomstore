import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./profiles"; // Import Profile interface

export interface BlogPost {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  content: string;
  author_id: string | null;
  image_url: string | null;
  is_published: boolean;
  author?: Profile; // Joined author profile
}

export async function getBlogPosts(includeUnpublished: boolean = false): Promise<BlogPost[]> {
  let query = supabase
    .from("blog_posts")
    .select(`
      *,
      author:profiles!author_id(id, first_name, last_name, avatar_url, email)
    `)
    .order("created_at", { ascending: false });

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching blog posts:", error.message || error);
    return [];
  }

  return data.map(post => ({
    ...post,
    author: post.author as Profile | undefined,
  })) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string, includeUnpublished: boolean = false): Promise<BlogPost | null> {
  let query = supabase
    .from("blog_posts")
    .select(`
      *,
      author:profiles!author_id(id, first_name, last_name, avatar_url, email)
    `)
    .eq("slug", slug);

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error.message || error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    author: data.author as Profile | undefined,
  } as BlogPost;
}

export async function getBlogPostById(id: string, includeUnpublished: boolean = false): Promise<BlogPost | null> {
  let query = supabase
    .from("blog_posts")
    .select(`
      *,
      author:profiles!author_id(id, first_name, last_name, avatar_url, email)
    `)
    .eq("id", id);

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error(`Error fetching blog post with ID ${id}:`, error.message || error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    author: data.author as Profile | undefined,
  } as BlogPost;
}

export async function createBlogPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'author'>): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(postData)
    .select(`
      *,
      author:profiles!author_id(id, first_name, last_name, avatar_url, email)
    `)
    .single();

  if (error) {
    console.error("Error creating blog post:", error.message || error);
    throw error;
  }
  return {
    ...data,
    author: data.author as Profile | undefined,
  } as BlogPost;
}

export async function updateBlogPost(id: string, postData: Partial<Omit<BlogPost, 'id' | 'created_at' | 'author'>>): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ ...postData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(`
      *,
      author:profiles!author_id(id, first_name, last_name, avatar_url, email)
    `)
    .single();

  if (error) {
    console.error(`Error updating blog post with ID ${id}:`, error.message || error);
    throw error;
  }
  return {
    ...data,
    author: data.author as Profile | undefined,
  } as BlogPost;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting blog post with ID ${id}:`, error.message || error);
    throw error;
  }
}