export type NavIconName =
  | 'dashboard'
  | 'movies'
  | 'banners'
  | 'branches'
  | 'schedule'
  | 'purchases'
  | 'audit'
  | 'qr'
  | 'changes';

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
}

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Películas', href: '/dashboard/movies', icon: 'movies' },
  { label: 'Banners', href: '#', icon: 'banners' },
  { label: 'Sucursales', href: '#', icon: 'branches' },
  { label: 'Salas y horarios', href: '#', icon: 'schedule' },
  { label: 'Compras', href: '#', icon: 'purchases' },
  { label: 'Auditoría', href: '#', icon: 'audit' },
];

export const EMPLOYEE_NAV: NavItem[] = [
  { label: 'Inicio', href: '/dashboard', icon: 'dashboard' },
  { label: 'Escanear QR', href: '#', icon: 'qr' },
  { label: 'Reprogramar horarios', href: '#', icon: 'schedule' },
  { label: 'Mis cambios', href: '#', icon: 'changes' },
];
