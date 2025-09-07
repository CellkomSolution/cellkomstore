import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:underline">
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
          {/* Blibli Column */}
          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">blibli</h2>
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
              <FooterLink href="#">Blibli Ticket</FooterLink>
              <FooterLink href="#">Hubungi Kami</FooterLink>
            </div>
          </div>

          {/* Jelajahi Blibli */}
          <div>
            <FooterTitle>Jelajahi Blibli</FooterTitle>
            <div className="flex flex-col space-y-2">
              <FooterLink href="#">Tentang Blibli</FooterLink>
              <FooterLink href="#">Karir</FooterLink>
              <FooterLink href="#">Blog Blibli</FooterLink>
              <FooterLink href="#">Blibli Official Store</FooterLink>
            </div>
          </div>

          {/* Kerjasama */}
          <div>
            <FooterTitle>Kerjasama</FooterTitle>
            <div className="flex flex-col space-y-2">
              <FooterLink href="#">Jual di Blibli</FooterLink>
              <FooterLink href="#">Affiliate Program</FooterLink>
            </div>
          </div>

          {/* Ikuti Kami */}
          <div>
            <FooterTitle>Ikuti Kami</FooterTitle>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600"><Facebook size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-blue-600"><Twitter size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-blue-600"><Instagram size={20} /></a>
              <a href="#" className="text-gray-500 hover:text-blue-600"><Youtube size={20} /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Blibli Kloningan. Dibuat dengan ❤️.</p>
        </div>
      </div>
    </footer>
  );
}