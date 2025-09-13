import { supabase } from "@/integrations/supabase/client";

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
}

export async function getBlogPosts(isAdmin: boolean = false): Promise<BlogPost[]> {
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching blog posts:", error.message || error);
    return [];
  }
  return data;
}

export async function getBlogPostBySlug(slug: string, isAdmin: boolean = false): Promise<BlogPost | null> {
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!isAdmin) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error.message || error);
    return null;
  }
  return data;
}

export async function createBlogPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.error("Error creating blog post:", error.message || error);
    throw error;
  }
  return data;
}

export async function updateBlogPost(id: string, postData: Partial<Omit<BlogPost, 'id' | 'created_at'>>): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .update(postData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating blog post with ID ${id}:`, error.message || error);
    throw error;
  }
  return data;
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