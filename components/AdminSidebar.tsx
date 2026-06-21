// components/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, FileText, ChevronRight, ChevronDown, 
  LayoutDashboard, Flag, BarChart3, LineChart, 
  FolderLock, CalendarDays, X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  // State untuk mengatur menu mana yang terbuka/tertutup accordion-nya
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    koperasi: true, // Default terbuka
  });

  const toggleMenu = (menuKey: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  // DAFTAR MENU LENGKAP KEMENKOP
  const menuGroups = [
    {
      key: "koperasi",
      title: "Koperasi",
      icon: <Building2 className="w-5 h-5" />,
      items: [
        { label: "Daftar Koperasi Binaan", href: "/admin/data-koperasi" },
        { label: "Usulan Cetak Sertifikat", href: "/admin/sertifikat" },
        { label: "Tiket History Perubahan", href: "/admin/history" },
        { label: "Cabang Koperasi", href: "/admin/cabang" },
        { label: "Kesehatan Koperasi", href: "/admin/data-koperasi?tab=kesehatan" },
        { label: "Koperasi Terdaftar goAML", href: "/admin/goaml" },
        { label: "No. Izin Usaha Simpan Pinjam", href: "/admin/izin-usp" },
        { label: "Permintaan Akun Koperasi", href: "/admin/akun" },
      ]
    },
    {
      key: "merah_putih",
      title: "Koperasi Merah Putih",
      icon: <Flag className="w-5 h-5" />,
      items: [
        { label: "Dashboard Koperasi Merah Putih", href: "/admin/merah-putih" },
        { label: "Desa/Kel Lebih Dari 1 Koperasi", href: "/admin/merah-putih/desa" },
      ]
    },
    {
      key: "statistik",
      title: "Statistik",
      icon: <BarChart3 className="w-5 h-5" />,
      items: [
        { label: "Statistik Koperasi", href: "/admin/statistik/koperasi" },
        { label: "Statistik Akun Dinas", href: "/admin/statistik/akun" },
        { label: "Statistik Koperasi Modern", href: "/admin/statistik/modern" },
        { label: "Statistik Sektor Usaha", href: "/admin/statistik/sektor" },
      ]
    },
    {
      key: "publikasi",
      title: "Publikasi",
      icon: <FileText className="w-5 h-5" />,
      items: [
        { label: "Laporan Data Koperasi (Agregat)", href: "/admin/publikasi/agregat" },
      ]
    },
    {
      key: "non_publikasi",
      title: "Non Publikasi",
      icon: <FolderLock className="w-5 h-5" />,
      items: [
        { label: "List Data Koperasi (Cut-Off)", href: "/admin/non-publikasi/cutoff" },
      ]
    },
    {
      key: "rat",
      title: "Laporan RAT",
      icon: <CalendarDays className="w-5 h-5" />,
      items: [
        { label: "Laporan RAT Per Tahun", href: "/admin/rat/laporan-tahun" },
        { label: "Laporan RAT Per Bulan", href: "/admin/rat/laporan-bulan" },
        { label: "List RAT Per Tahun", href: "/admin/rat/list-tahun" },
        { label: "List RAT Per Bulan", href: "/admin/rat/list-bulan" },
      ]
    },
    {
      key: "kinerja",
      title: "Kinerja",
      icon: <LineChart className="w-5 h-5" />,
      items: [
        { label: "Evaluasi Kinerja", href: "/admin/kinerja" },
      ]
    }
  ];

  return (
    <>
      {/* Latar Belakang Gelap (Backdrop) saat menu terbuka */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel Sidebar Meluncur (Drawer) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Header Sidebar & Tombol Close */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shrink-0">
              K
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Dashboard ODS</h2>
              <p className="text-[10px] text-slate-400">Pusat Data Koperasi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Area Menu (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 bg-slate-900 custom-scrollbar">
          
          <Link href="/admin" onClick={onClose}>
            <div className={`px-4 py-3 flex items-center gap-3 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer ${pathname === '/admin' ? 'bg-blue-600 text-white' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard Utama</span>
            </div>
          </Link>

          {menuGroups.map((group) => (
            <div key={group.key} className="mt-1">
              {/* Tombol Grup (Parent) */}
              <div 
                onClick={() => toggleMenu(group.key)}
                className="px-4 py-3 flex items-center justify-between hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {group.icon}
                  <span className="text-sm font-medium">{group.title}</span>
                </div>
                {openMenus[group.key] ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </div>

              {/* Sub-menu (Children) */}
              {openMenus[group.key] && (
                <div className="bg-slate-950/40 py-1">
                  {group.items.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      // onClick={onClose} akan langsung menutup drawer saat sub-menu diklik
                      <Link key={index} href={item.href} onClick={onClose}>
                        <div className={`pl-12 pr-4 py-2.5 text-xs flex items-center hover:text-white hover:bg-slate-800 transition-colors ${
                          isActive ? 'text-blue-400 font-semibold border-r-2 border-blue-500 bg-slate-800/50' : 'text-slate-400'
                        }`}>
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}