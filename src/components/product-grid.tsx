import { mockProducts } from "@/lib/mock-data";
import { ProductCard } from "./product-card";

export function ProductGrid() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Produk Pilihan Untukmu</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}