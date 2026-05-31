export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-lg font-bold">Cinema Admin</h1>
        </div>
        <nav className="mt-2 px-3">
          <a
            href="/"
            className="block rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Dashboard
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
