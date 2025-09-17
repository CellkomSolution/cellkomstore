import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Image as ImageIcon,
  LayoutGrid,
  ShoppingBag,
  CreditCard,
  BookOpen,
  MessageSquare,
  // ImageStack, // Removed icon for carousel
} from "lucide-react";

export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pesanan",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Produk",
    href: "/admin/products",
    icon: Package,
  },
  // Removed Hero Carousel entry
  {
    title: "Kategori",
    href: "/admin/categories",
    icon: LayoutGrid,
  },
  {
    title: "Merek Unggulan",
    href: "/admin/featured-brands",
    icon: ImageIcon,
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: BookOpen,
  },
  {
    title: "Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Metode Pembayaran",
    href: "/admin/payment-methods",
    icon: CreditCard,
  },
  {
    title: "Chat Admin",
    href: "/chats",
    icon: MessageSquare,
  },
  {
    title: "Pengaturan",
    href: "/admin/settings",
    icon: Settings,
  },
];