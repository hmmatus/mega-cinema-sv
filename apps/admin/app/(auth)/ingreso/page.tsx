import type { Metadata } from 'next';
import { AdminBrandPanel } from '@/app/components/AdminBrandPanel';
import { AdminLoginForm } from '@/app/components/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Ingreso',
};

export default function IngresoPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: brand panel — hidden on mobile, visible md+ */}
      <AdminBrandPanel className="hidden md:flex md:w-[45%] lg:w-1/2 flex-col" />

      {/* Right: login form — always visible */}
      <AdminLoginForm redirectTo="/" />
    </div>
  );
}
