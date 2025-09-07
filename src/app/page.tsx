import { MadeWithDyad } from "@/components/made-with-dyad";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-200 h-64 w-full rounded-lg flex items-center justify-center mb-8">
        <p className="text-gray-500">Hero Carousel Placeholder</p>
      </div>
      <div className="bg-gray-200 h-40 w-full rounded-lg flex items-center justify-center mb-8">
        <p className="text-gray-500">Category Icons Placeholder</p>
      </div>
      <div className="bg-gray-200 h-96 w-full rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Product Grid Placeholder</p>
      </div>
      <MadeWithDyad />
    </div>
  );
}