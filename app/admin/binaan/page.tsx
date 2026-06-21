// app/admin/binaan/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UploadCloud, Database, Search, Building2, Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminKoperasiBinaanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAllData = async () => {
    setLoading(true);
    const { data: binaanData } = await supabase
      .from("koperasi_binaan")
      .select("*")
      .order("nama_koperasi", { ascending: true });
    if (binaanData) setData(binaanData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [supabase]);

  // Reset ke halaman 1 setiap kali search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Logic Filtering & Pagination
  const filteredData = data.filter(item => 
    (item.nama_koperasi?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (item.kecamatan?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Fungsi Import CSV
  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Pilih file CSV dulu!");
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim().length > 0);
        
        const parseCsvLine = (line: string) => {
          const result = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if ((char === ',' || char === ';') && !inQuotes) {
              result.push(cur.trim().replace(/^"|"$/g, ''));
              cur = '';
            } else cur += char;
          }
          result.push(cur.trim().replace(/^"|"$/g, ''));
          return result;
        };

        const headers = parseCsvLine(rows[0]);
        const payload = [];
        for (let i = 1; i < rows.length; i++) {
          const values = parseCsvLine(rows[i]);
          const getVal = (colName: string) => {
            const idx = headers.findIndex(h => h.trim().toLowerCase() === colName.toLowerCase());
            return idx !== -1 ? values[idx] : "";
          };

          const namaKop = getVal("Nama Koperasi");
          if (!namaKop) continue; 

          payload.push({
            nik: getVal("Nomor Induk Koperasi"),
            nama_koperasi: namaKop,
            no_badan_hukum: getVal("Nomor Badan Hukum"),
            bentuk_koperasi: getVal("Bentuk Koperasi"),
            jenis_koperasi: getVal("Jenis Koperasi"),
            status_koperasi: getVal("Status Koperasi"),
            sektor_usaha: getVal("Sektor Usaha"),
            kecamatan: getVal("Kecamatan"),
            desa: getVal("Desa"),
            alamat: getVal("Alamat"),
            grade: getVal("Grade")
          });
        }

        if (payload.length > 0) {
          const { error } = await supabase.from("koperasi_binaan").insert(payload);
          if (error) throw error;
          alert(`Sukses! ${payload.length} koperasi diimport.`);
          fetchAllData();
        }
      } catch (err: any) {
        console.error("Gagal Import:", err);
        alert("Error: " + err.message);
      } finally {
        setUploading(false);
        setFile(null);
      }
    };
    reader.readAsText(file);
  };

  // Fungsi Export CSV
  const handleExportCsv = () => {
    const headers = ["NIK", "Nama Koperasi", "No Badan Hukum", "Bentuk Koperasi", "Jenis Koperasi", "Status Koperasi", "Sektor Usaha", "Kecamatan", "Desa", "Alamat", "Grade"];
    const csvRows = filteredData.map(item => [
      `"${item.nik || ""}"`,
      `"${item.nama_koperasi || ""}"`,
      `"${item.no_badan_hukum || ""}"`,
      `"${item.bentuk_koperasi || ""}"`,
      `"${item.jenis_koperasi || ""}"`,
      `"${item.status_koperasi || ""}"`,
      `"${item.sektor_usaha || ""}"`,
      `"${item.kecamatan || ""}"`,
      `"${item.desa || ""}"`,
      `"${item.alamat || ""}"`,
      `"${item.grade || ""}"`
    ].join(","));

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Data_Koperasi_Binaan.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-slate-900 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard Admin
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" /> Master Data Koperasi Binaan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Daftar induk seluruh koperasi wilayah Buleleng.</p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Sinkronisasi Data</h3>
                <p className="text-xs text-slate-500">Import file CSV atau Export data master.</p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                className="block w-full text-sm text-slate-500 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-700 cursor-pointer border border-slate-200 rounded-md" 
              />
              <Button onClick={handleCsvUpload} disabled={uploading || !file} className="bg-blue-600 hover:bg-blue-700">
                {uploading ? "..." : "Import"}
              </Button>
              <Button onClick={handleExportCsv} variant="outline" className="gap-2 border-blue-600 text-blue-600">
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Daftar Koperasi</CardTitle>
              <CardDescription>Total {filteredData.length} koperasi ditemukan.</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari koperasi..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-10 text-sm">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Nama Koperasi</TableHead>
                    <TableHead>NIK / Badan Hukum</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-bold text-slate-900">{item.nama_koperasi}</p>
                          <p className="text-xs text-slate-500">{item.sektor_usaha}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs">{item.nik}</p>
                          <p className="text-xs font-semibold">{item.no_badan_hukum}</p>
                        </TableCell>
                        <TableCell>{item.kecamatan}, {item.desa}</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {item.status_koperasi}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-slate-500">Tidak ada data ditemukan.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button 
                  variant="outline" size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}