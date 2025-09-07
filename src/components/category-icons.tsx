import { Smartphone, Laptop, Shirt, Gem, Heart, MoreHorizontal } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Handphone & Tablet", icon: Smartphone, slug: "handphone-tablet" },
  { name: "Komputer & Laptop", icon: Laptop, slug: "komputer-laptop" },
  { name: "Pakaian Pria", icon: Shirt, slug: "pakaian-pria" },
  { name: "Perhiasan & Logam", icon: Gem, slug: "perhiasan-logam" },
  { name: "Kesehatan & Kecantikan", icon: Heart, slug: "kesehatan-kecantikan" },
  { name: "Lihat Semua", icon: MoreHorizontal, slug: "/" },
];

export function CategoryIcons() {
  return (
    <div className="bg-card p-4 rounded-lg border">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
        {categories.map((category) => (
          <Link
            href={category.slug === "/" ? "/" : `/category/${category.slug}`}
            key={category.name}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors group"
          >
            <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 dark:group-hover:bg-primary/30">
              <category.icon className="h-6 w-6 text-primary dark:text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}