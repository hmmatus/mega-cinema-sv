import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../shared/ui/Navbar';
import { Footer } from '../shared/ui/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | MegaCinemaSV',
    default: 'MegaCinemaSV',
  },
  description: 'Compra tus entradas de cine en línea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-[#0F172A] antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
