import type { Metadata } from 'next';
import { QueryProvider } from '@/src/lib/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Cinema Admin',
    default: 'Cinema Admin',
  },
  description: 'Cinema Manager — Administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
