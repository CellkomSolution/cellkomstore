import { Smartphone, Laptop, Shirt, Gem, Heart, MoreHorizontal } from "lucide-react";

const categories = [
  { name: "Handphone & Tablet", icon: Smartphone },
  { name: "Komputer & Laptop", icon: Laptop },
  { name: "Pakaian Pria", icon: Shirt },
  { name: "Perhiasan & Logam", icon: Gem },
  { name: "Kesehatan & Kecantikan", icon: Heart },
  { name: "Lihat Semua", icon: MoreHorizontal },
];

export function CategoryIcons() {
  return (
    <div className="bg-card p-4 rounded-lg border">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
        {categories.map((category) => (
          <a
            href="#"
            key={category.name}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-800">
              <category.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-foreground">{category.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}