"use client";

import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:underline">
    {children}
  </a>
);

const FooterTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">{children}</h3>
);

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Cellkom Store Column */}
          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold text-primary mb-4">Cellkom Store</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pilihan tepat untuk belanja online.
            </p>
          </div>

          {/* Layanan Pelanggan */}
          <div>
            <FooterTitle>Layanan Pelanggan</FooterTitle>
            <div className="flex flex-col space-y-2">
              <FooterLink href="#">Bantuan</FooterLink>
              <FooterLink href="#">Metode Pembayaran</FooterLink>
              <FooterLink href="#">Cellkom Ticket</FooterLink>
              <FooterLink href="#">Hubungi Kami</FooterLink>
            </div>
          </div>

          {/* Jelajahi Cellkom Store */}
          <div>
            <FooterTitle>Jelajahi Cellkom Store</FooterTitle>
            <div className="flex flex-col space-y-2">
              <FooterLink href="#">Tentang Cellkom Store</FooterLink>
              <FooterLink href="#">Karir</FooterLink>
              <FooterLink href="#">Blog Cellkom Store</FooterLink>
              <FooterLink href="#">Cellkom Official Store</FooterLink>
            </div>
          </div>

          {/* Kerjasama */}
          <div>
            <FooterTitle>Kerjasama</FooterTItle>
            <div className="flex flex-col space-y-2">
              <FooterLink href="#">Jual di Cellkom Store</FooterLink>
              <FooterLink href="#">Affiliate Program</FooterLink>
            </div>
          </div>

          {/* Ikuti Kami */}
          <div>
            <FooterTitle>Ikuti Kami</FooterTitle>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary"><Facebook size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-primary"><Twitter size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-primary"><Instagram size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-primary"><Youtube size={20} /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Cellkom Store. Dibuat dengan ❤️.</p>
        </div>
      </div>
    </footer>
  );
}