import { SidebarNav } from './SidebarNav';
import { SidebarUserInfo } from './SidebarUserInfo';

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#111827]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          M
        </div>
        <span className="text-sm font-semibold text-white">MegacinemaSV</span>
      </div>

      {/* Role-gated navigation */}
      <SidebarNav />

      {/* User info + logout */}
      <SidebarUserInfo />
    </aside>
  );
}
