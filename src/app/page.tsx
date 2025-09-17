import { CategoryIcons } from "@/components/category-icons";
import { FlashSale } from "@/components/flash-sale";
import { ProductGrid } from "@/components/product-grid";
// import { LogoCarouselSection } from "@/components/logo-carousel-section"; // Removed
import { FeaturedBrands } from "@/components/featured-brands";
import { getFlashSaleProducts, getProducts, getProductsByCategory } from "@/lib/supabase/products"; // Import dari modul products

export default async function Home() {
  const products = await getProducts();
  const flashSaleProducts = await getFlashSaleProducts();
  const gadgetProducts = await getProductsByCategory("handphone-tablet");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* HeroCarousel removed */}
      {/* <FeatureBadges /> Removed FeatureBadges */}
      {/* <LogoCarouselSection /> Removed */}
      <CategoryIcons />
      <FlashSale initialProducts={flashSaleProducts} />
      {gadgetProducts.length > 0 && (
        <ProductGrid 
          products={gadgetProducts} 
          title="Handphone & Tablet Populer" 
        />
      )}
      <FeaturedBrands /> {/* Moved FeaturedBrands to below ProductGrid */}
      <ProductGrid products={products} title="Produk Pilihan Untukmu" />
    </div>
  );
}