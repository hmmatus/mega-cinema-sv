import { AuthProvider } from '@/src/features/auth/context/auth-context';
import { Sidebar } from '@/src/features/dashboard/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-100 text-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
