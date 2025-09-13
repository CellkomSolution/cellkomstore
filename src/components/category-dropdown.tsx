"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the type for a category based on your Supabase schema
interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  latest_product_image_url: string | null;
}

export function CategoryDropdown() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_categories_with_latest_product_image'); // Using the RPC function

      if (error) {
        console.error("Error fetching categories:", error);
        toast.error("Gagal memuat kategori.");
      } else {
        setCategories(data || []);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
          <LayoutGrid className="h-5 w-5" />
          <span>Kategori</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {loading ? (
          <DropdownMenuItem disabled>Memuat kategori...</DropdownMenuItem>
        ) : categories.length === 0 ? (
          <DropdownMenuItem disabled>Tidak ada kategori ditemukan.</DropdownMenuItem>
        ) : (
          categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link href={`/categories/${category.slug}`}>
                {category.name}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}