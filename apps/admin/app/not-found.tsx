import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-6 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0047AB]">404</p>
      <h1 className="mb-3 text-3xl font-bold text-gray-900">Página no encontrada</h1>
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        La ruta que buscás no existe o fue movida.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-[#0047AB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003380]"
      >
        Ir al dashboard
      </Link>
    </div>
  );
}
