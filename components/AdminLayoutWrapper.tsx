// components/AdminLayoutWrapper.tsx
"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Menu, Search, Bell } from "lucide-react";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* NAVBAR ATAS */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
        
        {/* Kiri: Tombol Burger & Judul */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shrink-0 shadow-sm">
              K
            </div>
            <h1 className="font-bold text-slate-800 hidden md:block tracking-tight text-lg">
              Dashboard ODS
            </h1>
          </div>
        </div>

        {/* Kanan: Search Bar & Profil */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          
          {/* Search Bar Pintar */}
          <div className="relative w-full max-w-md hidden lg:block">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari koperasi, nomor NIK, atau pengurus..." 
              className="w-full pl-11 pr-4 py-2 bg-slate-100 border border-transparent rounded-full text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          {/* Ikon Notifikasi & Profil */}
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 relative lg:hidden">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 ml-1 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 leading-none">Admin Dinas</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Buleleng</p>
            </div>
            <div className="w-9 h-9 bg-blue-100 text-blue-700 border border-blue-200 rounded-full flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </div>

      </header>

      {/* Komponen Sidebar yang Dipanggil (Drawer) */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}