import { CategoryIcons } from "@/components/category-icons";
import { HeroCarousel } from "@/components/hero-carousel";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ProductGrid } from "@/components/product-grid";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <HeroCarousel />
      <CategoryIcons />
      <ProductGrid />
      <MadeWithDyad />
    </div>
  );
}