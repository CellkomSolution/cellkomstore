export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  location: string;
  rating: number;
  soldCount: string;
  category: string;
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Xiaomi Redmi Note 13 Pro 5G 12/512GB",
    price: 4599000,
    originalPrice: 4999000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=Redmi+Note+13",
    location: "Jakarta Pusat",
    rating: 4.9,
    soldCount: "1rb+",
    category: "handphone-tablet",
  },
  {
    id: 2,
    name: "Apple MacBook Air M1 Chip 2020 8GB/256GB",
    price: 12499000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=MacBook+Air",
    location: "Surabaya",
    rating: 5.0,
    soldCount: "500+",
    category: "komputer-laptop",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: 4750000,
    originalPrice: 5500000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=Sony+XM5",
    location: "Bandung",
    rating: 4.8,
    soldCount: "750+",
    category: "komputer-laptop",
  },
  {
    id: 4,
    name: "Samsung Galaxy Watch 6 Classic 47mm",
    price: 5499000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=Galaxy+Watch",
    location: "Medan",
    rating: 4.9,
    soldCount: "200+",
    category: "handphone-tablet",
  },
  {
    id: 5,
    name: "Erigo T-Shirt Basic Cotton Combed Black",
    price: 89000,
    originalPrice: 150000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=Erigo+T-Shirt",
    location: "Jakarta Selatan",
    rating: 4.7,
    soldCount: "10rb+",
    category: "pakaian-pria",
  },
  {
    id: 6,
    name: "Logitech MX Master 3S Performance Wireless Mouse",
    price: 1689000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=MX+Master+3S",
    location: "Yogyakarta",
    rating: 5.0,
    soldCount: "1rb+",
    category: "komputer-laptop",
  },
];

export const flashSaleProducts: Product[] = [
    {
    id: 5,
    name: "Erigo T-Shirt Basic Cotton Combed Black",
    price: 69000,
    originalPrice: 150000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=Erigo+T-Shirt",
    location: "Jakarta Selatan",
    rating: 4.7,
    soldCount: "10rb+",
    category: "pakaian-pria",
  },
  {
    id: 1,
    name: "Xiaomi Redmi Note 13 Pro 5G 12/512GB",
    price: 4399000,
    originalPrice: 4999000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=Redmi+Note+13",
    location: "Jakarta Pusat",
    rating: 4.9,
    soldCount: "1rb+",
    category: "handphone-tablet",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: 4500000,
    originalPrice: 5500000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=Sony+XM5",
    location: "Bandung",
    rating: 4.8,
    soldCount: "750+",
    category: "komputer-laptop",
  },
    {
    id: 4,
    name: "Samsung Galaxy Watch 6 Classic 47mm",
    price: 4999000,
    originalPrice: 5499000,
    imageUrl: "https://placehold.co/300x300/e2e8f0/334155?text=Galaxy+Watch",
    location: "Medan",
    rating: 4.9,
    soldCount: "200+",
    category: "handphone-tablet",
  },
];