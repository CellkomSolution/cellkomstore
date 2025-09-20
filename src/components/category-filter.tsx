"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories, Category } from "@/lib/supabase/categories";
import { Loader2 } from "lucide-react";

interface CategoryFilterProps {
  onCategoryChange: (categorySlug: string | null) => void;
  defaultValue?: string | null;
}

export function CategoryFilter({ onCategoryChange, defaultValue = null }: CategoryFilterProps) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setIsLoading(false);
    }
    fetchCategories();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Kategori:</span>
      <Select
        onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
        defaultValue={defaultValue || "all"}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={isLoading ? "Memuat kategori..." : "Semua Kategori"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.slug} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}