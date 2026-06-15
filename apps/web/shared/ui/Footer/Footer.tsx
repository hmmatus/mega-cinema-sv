export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#F8FAFC] py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-[#0F172A]">Megacinema</span>
          <div className="flex gap-6 text-sm text-[#64748B]">
            <a href="/nosotros" className="hover:text-[#0047AB] transition-colors">Nosotros</a>
            <a href="/contacto" className="hover:text-[#0047AB] transition-colors">Contacto</a>
            <a href="/terminos" className="hover:text-[#0047AB] transition-colors">Términos</a>
            <a href="/privacidad" className="hover:text-[#0047AB] transition-colors">Privacidad</a>
          </div>
          <span className="text-xs text-[#94A3B8]">© 2025 Megacinema SV</span>
        </div>
      </div>
    </footer>
  );
}
