import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Cinema Admin',
    default: 'Cinema Admin',
  },
  description: 'Cinema Manager — Administration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          <aside className="w-64 bg-gray-900 text-white">
            <div className="p-6">
              <h1 className="text-lg font-bold">Cinema Admin</h1>
            </div>
            <nav className="mt-2 px-3">
              <a
                href="/dashboard"
                className="block rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Dashboard
              </a>
            </nav>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
