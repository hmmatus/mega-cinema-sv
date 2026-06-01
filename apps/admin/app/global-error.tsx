'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-6 text-center antialiased">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-500">
          Error crítico
        </p>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">Algo salió mal</h1>
        <p className="mb-6 max-w-sm text-sm text-gray-500">
          Ocurrió un error inesperado. Intentá de nuevo.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[#0047AB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003380]"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
