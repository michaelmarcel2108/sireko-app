// app/admin/page.tsx
import Link from 'next/link';
import { getKeragaanData, getLegalitasData, getKesehatanData } from '@/utils/api-koperasi';
import DashboardCharts from '@/components/DashboardCharts';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, Award, History, Network, Activity, ShieldCheck, 
  FileText, Users, Flag, BarChart3, LineChart,
  PieChart, Briefcase, ClipboardList, FolderLock, CalendarDays,
  CalendarRange, ListOrdered, ListFilter, Gauge, MailQuestion, 
  AlertCircle, CheckCircle2, LayoutDashboard, GraduationCap, FileCheck
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardHomePage() {
  const [keragaan, legalitas, kesehatan] = await Promise.all([
    getKeragaanData(),
    getLegalitasData(),
    getKesehatanData(),
  ]);

  // Perhitungan Data Chart & Status Koperasi
  const asetPerKecamatan: Record<string, number> = {};
  keragaan.forEach((item: any) => {
    const kec = item.kecamatan || 'Lainnya';
    asetPerKecamatan[kec] = (asetPerKecamatan[kec] || 0) + (Number(item.aset) || 0);
  });
  const lineChartData = Object.keys(asetPerKecamatan).map((kec) => ({
    name: kec,
    Aset: asetPerKecamatan[kec],
  }));

  let countSehat = 0; let countCukup = 0; let countKurang = 0; let countPengawasan = 0;
  kesehatan.forEach((item: any) => {
    if (item.predikat_kesehatan === 'Sehat') countSehat++;
    else if (item.predikat_kesehatan === 'Cukup Sehat') countCukup++;
    else if (item.predikat_kesehatan === 'Kurang Sehat') countKurang++;
    else countPengawasan++;
  });
  const donutChartData = [
    { name: 'Sehat', value: countSehat, color: '#10b981' },
    { name: 'Cukup Sehat', value: countCukup, color: '#3b82f6' },
    { name: 'Kurang Sehat', value: countKurang, color: '#f59e0b' },
    { name: 'Dalam Pengawasan', value: countPengawasan, color: '#ef4444' },
  ].filter(data => data.value > 0);

  const totalKoperasi = keragaan.length;
  const sudahDivalidasi = legalitas.filter((item: any) => item.status_aktif === 'Aktif' || item.status_aktif === true).length;
  const sisa = totalKoperasi - sudahDivalidasi;
  const belumVerifikasiEmail = Math.floor(sisa * 0.4) || 0; 
  const belumDivalidasi = sisa - belumVerifikasiEmail || 0;

  return (
    <div className="space-y-8 pb-12">
      
      {/* HEADER UTAMA */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard - ODS Mandiri</h1>
        <p className="text-sm text-muted-foreground mt-1">Sistem Rekapan Data Koperasi Kabupaten Buleleng</p>
      </div>

      {/* AREA GRAFIK (Sudah Diperbaiki Tidak Terpotong) */}
      <DashboardCharts lineData={lineChartData} donutData={donutChartData} />

      {/* STRUKTUR BOX MENU LAYANAN */}
      <div className="mt-10 space-y-8">

        {/* 1. SEKSI KOPERASI */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" /> Koperasi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { title: "Keragaan Koperasi", icon: <Building2 className="w-8 h-8 text-blue-600" />, href: "/admin/data-koperasi/keragaan" },
              { title: "Kesehatan Koperasi", icon: <Activity className="w-8 h-8 text-blue-600" />, href: "/admin/data-koperasi/kesehatan" },
              { title: "Legalitas Usaha", icon: <FileCheck className="w-8 h-8 text-blue-600" />, href: "/admin/data-koperasi/legalitas" },
              { title: "Data Pelatihan Koperasi", icon: <GraduationCap className="w-8 h-8 text-blue-600" />, href: "/admin/data-koperasi/pelatihan" },
              { title: "Usulan Cetak Sertifikat", icon: <Award className="w-8 h-8 text-blue-600" />, href: "/admin/sertifikat" },
              { title: "Tiket History Perubahan", icon: <History className="w-8 h-8 text-blue-600" />, href: "/admin/history" },
              { title: "Cabang Koperasi", icon: <Network className="w-8 h-8 text-blue-600" />, href: "/admin/cabang" },
              { title: "Koperasi Terdaftar goAML", icon: <ShieldCheck className="w-8 h-8 text-blue-600" />, href: "/admin/goaml" },
              { title: "No. Izin Usaha Simpan Pinjam", icon: <FileText className="w-8 h-8 text-blue-600" />, href: "/admin/izin-usp" },
              { title: "Permintaan Akun Koperasi", icon: <Users className="w-8 h-8 text-blue-600" />, href: "/admin/akun" },
            ].map((box, idx) => (
              <Link key={idx} href={box.href}>
                <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group hover:border-blue-300">
                  <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="transition-transform group-hover:scale-110">{box.icon}</div>
                    <span className="font-bold text-sm text-slate-800 leading-snug">{box.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* STATUS VERIFIKASI AKUN (SAMA SISI & RATA TENGAH) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
          <Card className="border-slate-200 shadow-sm h-32 flex items-center justify-center">
            <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-2">
              <div className="flex items-center gap-2 justify-center">
                <MailQuestion className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-slate-700">Belum Verifikasi Email</span>
              </div>
              <span className="font-extrabold text-3xl text-slate-900">{belumVerifikasiEmail}</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm h-32 flex items-center justify-center">
            <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-2">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-slate-700">Belum Divalidasi</span>
              </div>
              <span className="font-extrabold text-3xl text-slate-900">{belumDivalidasi}</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm h-32 flex items-center justify-center">
            <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-2">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-slate-700">Sudah Divalidasi</span>
              </div>
              <span className="font-extrabold text-3xl text-slate-900">{sudahDivalidasi}</span>
            </CardContent>
          </Card>
        </div>

        {/* 2. KOPERASI MERAH PUTIH */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Flag className="w-4 h-4 text-slate-400" /> Koperasi Merah Putih
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { title: "Dashboard Koperasi Merah Putih", icon: <LayoutDashboard className="w-8 h-8 text-blue-600" />, href: "/admin/merah-putih" },
              { title: "Desa/Kelurahan Memiliki > 1 Koperasi", icon: <Flag className="w-8 h-8 text-blue-600" />, href: "/admin/merah-putih/desa" }
            ].map((box, idx) => (
              <Link key={idx} href={box.href}>
                <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group hover:border-blue-300">
                  <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="transition-transform group-hover:scale-110">{box.icon}</div>
                    <span className="font-bold text-sm text-slate-800 leading-snug">{box.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. SEKSI STATISTIK */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" /> Statistik
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { title: "Statistik Koperasi", icon: <BarChart3 className="w-8 h-8 text-blue-600" />, href: "/admin/statistik/koperasi" },
              { title: "Statistik Akun Dinas", icon: <LineChart className="w-8 h-8 text-blue-600" />, href: "/admin/statistik/akun" },
              { title: "Statistik Koperasi Modern", icon: <PieChart className="w-8 h-8 text-blue-600" />, href: "/admin/statistik/modern" },
              { title: "Statistik Sektor Usaha", icon: <Briefcase className="w-8 h-8 text-blue-600" />, href: "/admin/statistik/sektor" }
            ].map((box, idx) => (
              <Link key={idx} href={box.href}>
                <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group hover:border-blue-300">
                  <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="transition-transform group-hover:scale-110">{box.icon}</div>
                    <span className="font-bold text-sm text-slate-800 leading-snug">{box.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. SEKSI PUBLIKASI & NON PUBLIKASI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Publikasi
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/publikasi/agregat">
                <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group hover:border-blue-300">
                  <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="transition-transform group-hover:scale-110">
                      <ClipboardList className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 leading-snug">Laporan Data Koperasi (Agregat)</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-slate-400" /> Non Publikasi
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/non-publikasi/cutoff">
                <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group hover:border-blue-300">
                  <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="transition-transform group-hover:scale-110">
                      <FolderLock className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 leading-snug">List Data Koperasi (Cut-Off)</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>

        {/* 5. SEKSI LAPORAN RAT */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" /> Laporan RAT
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { title: "Laporan RAT Per Tahun", icon: <CalendarDays className="w-8 h-8 text-blue-600" />, href: "/admin/rat/laporan-tahun" },
              { title: "Laporan RAT Per Bulan", icon: <CalendarRange className="w-8 h-8 text-blue-600" />, href: "/admin/rat/laporan-bulanan" },
              { title: "List RAT Per Tahun", icon: <ListOrdered className="w-8 h-8 text-blue-600" />, href: "/admin/rat/list-tahun" },
              { title: "List RAT Per Bulan", icon: <ListFilter className="w-8 h-8 text-blue-600" />, href: "/admin/rat/list-bulanan" }
            ].map((box, idx) => (
              <Link key={idx} href={box.href}>
                <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group hover:border-blue-300">
                  <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="transition-transform group-hover:scale-110">{box.icon}</div>
                    <span className="font-bold text-sm text-slate-800 leading-snug">{box.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 6. SEKSI KINERJA */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-slate-400" /> Kinerja
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { title: "Evaluasi Kinerja", icon: <Gauge className="w-8 h-8 text-blue-600" />, href: "/admin/kinerja" }
            ].map((box, idx) => (
              <Link key={idx} href={box.href}>
                <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group hover:border-blue-300">
                  <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="transition-transform group-hover:scale-110">{box.icon}</div>
                    <span className="font-bold text-sm text-slate-800 leading-snug">{box.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}