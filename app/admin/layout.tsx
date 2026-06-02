"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  PlusCircle, 
  LogOut 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/anggota", label: "Kelola Anggota", icon: Users },
    { href: "/admin/periodes", label: "Kelola Periode", icon: Calendar },
    { href: "/admin/laporan", label: "Kelola Laporan", icon: FileText },
    { href: "/admin/laporan-baru", label: "Input Laporan Baru", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Kiri) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex shrink-0 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-teal-700 tracking-tight">SIREKO Admin</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">Sistem Rekapan Koperasi</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/admin/laporan' && pathname.includes('/edit'));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-teal-700 text-white shadow-md"
                    : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex justify-between items-center shadow-sm z-10">
            <h1 className="text-lg font-bold text-teal-700">SIREKO</h1>
            <button onClick={() => router.push("/")} className="text-red-500">
              <LogOut size={20} />
            </button>
        </header>
        
        {/* Konten Halaman Dinamis */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}