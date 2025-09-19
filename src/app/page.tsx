import { CategoryIcons } from "@/components/category-icons";
import { FlashSale } from "@/components/flash-sale";
import { ProductGrid } from "@/components/product-grid";
import { FeaturedBrands } from "@/components/featured-brands";
import { ProductCarouselSection } from "@/components/product-carousel-section";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { UsedProductsSection } from "@/components/used-products-section";
import { ProductCardCarousel } from "@/components/product-card-carousel"; // Import ProductCardCarousel
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
      <UsedProductsSection />
      {gadgetProducts.length > 0 && (
        <ProductGrid 
          products={gadgetProducts} 
          title="Handphone & Tablet Populer" 
        />
      )}
      <FeaturedBrands />
      {/* Mengganti ProductGrid dengan ProductCardCarousel untuk 'Produk Pilihan Untukmu' */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Produk Pilihan Untukmu</h2>
        <ProductCardCarousel
          products={products}
          autoplayDelay={3500}
          showPagination={true}
          showNavigation={true}
          options={{
            slidesToScroll: 1,
            breakpoints: {
              '(min-width: 640px)': { slidesToScroll: 2 },
              '(min-width: 768px)': { slidesToScroll: 3 },
              '(min-width: 1024px)': { slidesToScroll: 4 },
              '(min-width: 1280px)': { slidesToScroll: 5 },
            }
          }}
        />
      </section>
    </div>
  );
}