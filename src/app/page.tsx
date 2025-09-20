import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  site_name: z.string().optional(),
});

const resolver = zodResolver(schema);


import { CategoryIcons } from "@/components/category-icons";
import { FlashSale } from "@/components/flash-sale";
import { ProductGrid } from "@/components/product-grid";
import { FeaturedBrands } from "@/components/featured-brands";
import { ProductCarouselSection } from "@/components/product-carousel-section";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { UsedProductsSection } from "@/components/used-products-section"; // Import new component
import { getFlashSaleProducts, getProducts, getProductsByCategory } from "@/lib/supabase/products";

export default async function Home() {
  const products = await getProducts();
  const flashSaleProducts = await getFlashSaleProducts();
  const gadgetProducts = await getProductsByCategory("handphone-tablet");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <HeroBannerCarousel />
      <CategoryIcons />
      <ProductCarouselSection />
      <FlashSale initialProducts={flashSaleProducts} />
      <UsedProductsSection /> {/* Add the new section here */}
      {gadgetProducts.length > 0 && (
        <ProductGrid 
          products={gadgetProducts} 
          title="Handphone & Tablet Populer" 
        />
      )}
      <FeaturedBrands />
      <ProductGrid products={products} title="Produk Pilihan Untukmu" />
    </div>
  );
}