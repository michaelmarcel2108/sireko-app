// app/admin/rat/laporan-bulan/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CalendarRange, Trash2, Search } from "lucide-react";

export default function AdminRatBulananPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchAllData() {
      const { data: ratData, error } = await supabase
        .from("rat_bulanan_koperasi")
        .select("*")
        .order("created_at", { ascending: false });

      if (ratData) {
        setData(ratData);
      }
      setLoading(false);
    }
    fetchAllData();
  }, [supabase]);

  // Fungsi Export CSV Semua Data
  const handleExportCsv = () => {
    if (data.length === 0) {
      alert("Belum ada data untuk diekspor!");
      return;
    }

    const headers = ["Nama Koperasi", "Bulan", "Tahun", "Status Laporan", "Tanggal Lapor", "Keterangan", "Waktu Input Sistem"];
    
    const csvRows = data.map(row => {
      return [
        `"${row.nama_koperasi || '-'}"`,
        `"${row.bulan || '-'}"`,
        `"${row.tahun || '-'}"`,
        `"${row.status_laporan || '-'}"`,
        `"${row.tanggal_lapor || '-'}"`,
        `"${row.keterangan || '-'}"`,
        `"${new Date(row.created_at).toLocaleString('id-ID')}"`
      ].join(",");
    });

    const csvContent = headers.join(",") + "\n" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rekap_RAT_Bulanan_Admin_${new Date().toLocaleDateString('id-ID')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(item => 
    (item.nama_koperasi?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (item.bulan?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-slate-900 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard Admin
        </Link>
        <span>/</span>
        <span>Laporan RAT Bulanan</span>
      </div>

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-blue-600" /> Rekap Laporan Bulanan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pemantauan progres kesiapan Rapat Anggota Tahunan dari seluruh koperasi.
          </p>
        </div>
        <Button onClick={handleExportCsv} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV (Unduh Semua)
        </Button>
      </div>

      {/* Tabel Data Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Daftar Progres Koperasi</CardTitle>
              <CardDescription>Menampilkan {filteredData.length} laporan masuk.</CardDescription>
            </div>
            
            {/* Search Bar Lokal */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari koperasi atau bulan..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-slate-500 text-sm">Memuat rekapan data...</div>
          ) : (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Nama Koperasi</TableHead>
                    <TableHead className="font-bold text-slate-700">Bulan / Tahun</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Tanggal Lapor</TableHead>
                    <TableHead className="font-bold text-slate-700 max-w-[200px]">Keterangan / Kendala</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900">{item.nama_koperasi}</TableCell>
                        <TableCell>
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded text-xs font-semibold border border-blue-100">
                            {item.bulan} {item.tahun}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.status_laporan === 'Selesai' ? 'bg-green-100 text-green-800' : 
                            item.status_laporan === 'Dalam Proses' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status_laporan || 'Belum Mulai'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {item.tanggal_lapor ? new Date(item.tanggal_lapor).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 max-w-[200px] truncate" title={item.keterangan}>
                          {item.keterangan || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                        Tidak ada laporan yang ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}