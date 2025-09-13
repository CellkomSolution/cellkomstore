"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Loader2, Tag, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoriesWithLatestProductImage, Category } from "@/lib/supabase/categories";
import * as LucideIcons from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

function CategoryIcon({ name }: { name: string | null }) {
  const Icon = (LucideIcons as any)[name as keyof typeof LucideIcons] || Tag;
  return <Icon className="h-6 w-6 text-muted-foreground" />;
}

export function CategorySheet() {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      async function fetchCategories() {
        setIsLoading(true);
        const fetchedCategories = await getCategoriesWithLatestProductImage();
        setCategories(fetchedCategories);
        setIsLoading(false);
      }
      fetchCategories();
    }
  }, [open]);

  const Content = (
    <>
      <SheetHeader className="px-6 pb-4 border-b">
        <SheetTitle className="flex items-center gap-2">
          <LayoutGrid className="h-6 w-6" />
          Semua Kategori
        </SheetTitle>
      </SheetHeader>
      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Tidak ada kategori yang ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center justify-start space-y-2 text-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => setOpen(false)} // Close sheet on click
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted relative overflow-hidden">
                  {category.latest_product_image_url ? (
                    <Image
                      src={category.latest_product_image_url}
                      alt={category.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 10vw, 5vw"
                    />
                  ) : (
                    <CategoryIcon name={category.icon_name} />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="flex md:hidden items-center gap-2 text-sm text-gray-500 hover:text-primary">
            <LayoutGrid className="h-5 w-5" />
            <span>Kategori</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[80vh] flex flex-col">
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
          <LayoutGrid className="h-5 w-5" />
          <span>Kategori</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-full sm:max-w-md p-0">
        {Content}
      </SheetContent>
    </Sheet>
  );
}