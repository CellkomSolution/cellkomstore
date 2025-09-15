"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image
import { icons, Tag } from "lucide-react"; // Import icons dan Tag

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { getCategories, Category } from "@/lib/supabase/categories"; // Import getCategories
import { supabase } from "@/integrations/supabase/client";

// Helper component for category icon
function CategoryIcon({ name }: { name: string | null }) {
  const Icon = icons[name as keyof typeof icons] || Tag;
  return <Icon className="h-5 w-5 text-muted-foreground" />;
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<typeof Link> & {
    title: string;
    categoryIconName?: string | null;
    categoryImageUrl?: string | null;
  }
>(({ className, title, children, href, categoryIconName, categoryImageUrl, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href || "#"}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center">
            {categoryImageUrl ? (
              <div className="relative h-6 w-6 mr-2 rounded-sm overflow-hidden">
                <Image src={categoryImageUrl} alt={title} fill style={{ objectFit: 'cover' }} sizes="24px" />
              </div>
            ) : (
              <div className="mr-2">
                <CategoryIcon name={categoryIconName} />
              </div>
            )}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function MainNav() {
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      // Menggunakan fungsi getCategories yang sudah diperbarui untuk menyertakan gambar
      const data = await getCategories();
      setCategories(data);
    };

    fetchCategories();
  }, []);

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" className={navigationMenuTriggerStyle()}>
            Beranda
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Kategori</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  href={`/category/${category.slug}`}
                  title={category.name}
                  categoryIconName={category.icon_name}
                  categoryImageUrl={category.latest_product_image_url}
                >
                  Lihat semua produk di {category.name}.
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/blog" className={navigationMenuTriggerStyle()}>
            Blog
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/services" className={navigationMenuTriggerStyle()}>
            Layanan Servis
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/contact" className={navigationMenuTriggerStyle()}>
            Kontak
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}