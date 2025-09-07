import { CategoryIcons } from "@/components/category-icons";
import { FlashSale } from "@/components/flash-sale";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductGrid } from "@/components/product-grid";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <HeroCarousel />
      <CategoryIcons />
      <FlashSale />
      <ProductGrid />
    </div>
  );
}