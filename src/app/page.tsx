import { CategoryIcons } from "@/components/category-icons";
import { HeroCarousel } from "@/components/hero-carousel";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <HeroCarousel />
      <CategoryIcons />
      <div className="bg-gray-200 h-96 w-full rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Product Grid Placeholder</p>
      </div>
      <MadeWithDyad />
    </div>
  );
}