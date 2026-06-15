import Link from 'next/link';
import type { NavbarProps } from './types';

export function Navbar({ className = '' }: NavbarProps) {
  return (
    <header className={`sticky top-0 z-50 bg-white border-b border-[#E5E7EB] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-bold text-[#0047AB] tracking-tight">
              Megacinema
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/cartelera"
                className="text-sm font-medium text-[#334155] hover:text-[#0047AB] transition-colors"
              >
                Cartelera
              </Link>
              <Link
                href="/cines"
                className="text-sm font-medium text-[#334155] hover:text-[#0047AB] transition-colors"
              >
                Cines
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#334155] hover:text-[#0047AB] transition-colors px-4 py-2 rounded-lg hover:bg-[#F1F5F9]"
            >
              Ingresar
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium text-white bg-[#0047AB] hover:bg-[#003A8C] transition-colors px-4 py-2 rounded-lg"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
