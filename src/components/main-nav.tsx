"use client";

import * as React from "react";
import Link from "next/link"; // Pastikan Link diimpor

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
import { Category } from "@/lib/supabase/categories";
import { supabase } from "@/integrations/supabase/client";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<typeof Link> // Mengubah tipe props agar sesuai dengan Link
>(({ className, title, children, href, ...props }, ref) => { // Destrukturisasi href
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link // Mengganti <a> dengan Link
          href={href || "#"} // Menggunakan href yang didestrukturisasi
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
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
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error.message);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" className={navigationMenuTriggerStyle()}> {/* Menghapus legacyBehavior dan passHref */}
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
                >
                  Lihat semua produk di {category.name}.
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/blog" className={navigationMenuTriggerStyle()}> {/* Menghapus legacyBehavior dan passHref */}
            Blog
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/services" className={navigationMenuTriggerStyle()}>
            Layanan Servis
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/contact" className={navigationMenuTriggerStyle()}> {/* Menghapus legacyBehavior dan passHref */}
            Kontak
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}