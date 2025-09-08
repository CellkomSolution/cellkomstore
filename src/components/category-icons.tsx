import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  Gem, 
  Heart, 
  MoreHorizontal, 
  Gamepad2, 
  Baby, 
  Home, 
  Bike, 
  Car, 
  Ticket, 
  ChevronRight 
} from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Handphone & Tablet", icon: Smartphone, slug: "handphone-tablet" },
  { name: "Komputer & Laptop", icon: Laptop, slug: "komputer-laptop" },
  { name: "Pakaian Pria", icon: Shirt, slug: "pakaian-pria" },
  { name: "Perhiasan & Logam", icon: Gem, slug: "perhiasan-logam" },
  { name: "Kesehatan & Kecantikan", icon: Heart, slug: "kesehatan-kecantikan" },
  { name: "Mainan & Hobi", icon: Gamepad2, slug: "mainan-hobi" },
  { name: "Ibu & Anak", icon: Baby, slug: "ibu-anak" },
  { name: "Rumah Tangga", icon: Home, slug: "rumah-tangga" },
  { name: "Olahraga", icon: Bike, slug: "olahraga" },
  { name: "Otomotif", icon: Car, slug: "otomotif" },
  { name: "Tiket & Voucher", icon: Ticket, slug: "tiket-voucher" },
  { name: "Lihat Semua", icon: MoreHorizontal, slug: "/" },
];

export function CategoryIcons() {
  return (
    <div 
      className="bg-card p-4 rounded-lg border"
      style={{
        backgroundImage: 'radial-gradient(hsl(var(--border)) 0.5px, transparent 0.5px)',
        backgroundSize: '10px 10px',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Kategori Pilihan</h2>
        <Link href="/" className="text-sm font-semibold text-primary hover:underline flex items-center">
          Lihat Semua <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4 text-center">
        {categories.map((category) => (
          <Link
            href={category.slug === "/" ? "/" : `/category/${category.slug}`}
            key={category.name}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors group"
          >
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/10 border">
              <category.icon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground leading-tight">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}