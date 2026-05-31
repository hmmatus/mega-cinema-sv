interface AdminBrandPanelProps {
  className?: string;
}

export function AdminBrandPanel({ className = '' }: AdminBrandPanelProps) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-[#0047AB] p-8 text-white ${className}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M9 1L16 5.5V12.5L9 17L2 12.5V5.5L9 1Z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">
          Megacinema<span className="text-[#C7E1FF]">SV</span>
        </span>
      </div>

      {/* Main copy */}
      <div className="mt-auto">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#C7E1FF]">
          Panel de Administración
        </p>
        <h2 className="mb-4 text-3xl font-bold leading-tight">
          Gestioná películas, salas, horarios y compras en un solo lugar.
        </h2>
        <p className="text-sm leading-relaxed text-white/75">
          Acceso restringido al personal autorizado de MegaCinemaSV. Cada acción queda registrada
          en la auditoría del sistema.
        </p>
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-white/40">v1.0 · 2026 · MegaCinemaSV S.A. de C.V.</p>

      {/* Decorative circles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/5"
      />
    </div>
  );
}
