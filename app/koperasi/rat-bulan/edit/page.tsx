// app/koperasi/rat-bulan/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, UploadCloud, Download, CalendarRange } from "lucide-react";

export default function KoperasiEditRatBulanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState({ type: "", text: "" });
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nama_koperasi: "",
    bulan: "Januari",
    tahun: new Date().getFullYear().toString(),
    status_laporan: "Selesai",
    tanggal_lapor: "",
    keterangan: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      // Ambil keragaan untuk default nama koperasi
      const { data: keragaan } = await supabase.from("keragaan_koperasi").select("nama_koperasi").eq("user_id", session.user.id).single();
      
      // Ambil laporan bulan terbaru
      const { data: ratData } = await supabase.from("rat_bulanan_koperasi")
        .select("*").eq("user_id", session.user.id)
        .order("created_at", { ascending: false }).limit(1).single();

      if (ratData) {
        setFormData({
          nama_koperasi: ratData.nama_koperasi || keragaan?.nama_koperasi || "",
          bulan: ratData.bulan || "Januari",
          tahun: ratData.tahun || new Date().getFullYear().toString(),
          status_laporan: ratData.status_laporan || "Selesai",
          tanggal_lapor: ratData.tanggal_lapor || "",
          keterangan: ratData.keterangan || "",
        });
      } else if (keragaan) {
        setFormData(prev => ({ ...prev, nama_koperasi: keragaan.nama_koperasi }));
      }
      setLoading(false);
    }
    fetchData();
  }, [router, supabase]);

  const handleSave = async (e?: React.FormEvent, newData?: any) => {
    if (e) e.preventDefault();
    setSaving(true);
    setPesan({ type: "", text: "" });

    const { data: { session } } = await supabase.auth.getSession();
    const payload = { ...(newData || formData), user_id: session?.user.id };

    // Cek apakah bulan & tahun yang sama sudah ada datanya
    const { data: existingData } = await supabase.from("rat_bulanan_koperasi")
      .select("id").eq("user_id", session?.user.id)
      .eq("bulan", payload.bulan).eq("tahun", payload.tahun).maybeSingle();

    let dbError;
    if (existingData) {
      const { error } = await supabase.from("rat_bulanan_koperasi").update(payload).eq("id", existingData.id);
      dbError = error;
    } else {
      const { error } = await supabase.from("rat_bulanan_koperasi").insert([payload]);
      dbError = error;
    }

    if (dbError) setPesan({ type: "error", text: "Gagal menyimpan: " + dbError.message });
    else {
      setPesan({ type: "success", text: "Laporan Bulanan berhasil diupdate!" });
      setTimeout(() => { router.push("/koperasi/dashboard"); router.refresh(); }, 1500);
    }
    setSaving(false);
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setPesan({ type: "error", text: "Pilih file CSV dulu!" });
    setSaving(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim().length > 0);
        if (rows.length < 2) throw new Error("CSV kosong.");
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const values = rows[1].split(',').map(v => v.trim());
        const getVal = (col: string) => headers.indexOf(col) !== -1 ? values[headers.indexOf(col)] : "";

        const newData = {
          nama_koperasi: getVal("nama_koperasi") || formData.nama_koperasi,
          bulan: getVal("bulan") || formData.bulan,
          tahun: getVal("tahun") || formData.tahun,
          status_laporan: getVal("status_laporan") || formData.status_laporan,
          tanggal_lapor: getVal("tanggal_lapor") || formData.tanggal_lapor,
          keterangan: getVal("keterangan") || formData.keterangan,
        };
        setFormData(newData);
        await handleSave(undefined, newData);
      } catch (err: any) {
        setPesan({ type: "error", text: err.message });
        setSaving(false);
      }
    };
    reader.readAsText(file);
  };

  // FUNGSI EKSPOR CSV
  const handleExportCsv = () => {
    const headers = ["nama_koperasi", "bulan", "tahun", "status_laporan", "tanggal_lapor", "keterangan"];
    const row = [
      formData.nama_koperasi, 
      formData.bulan, 
      formData.tahun, 
      formData.status_laporan, 
      formData.tanggal_lapor, 
      formData.keterangan
    ];
    
    // Gabungkan dengan format CSV standar
    const csvContent = headers.join(",") + "\n" + row.join(",");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Bulanan_${formData.bulan}_${formData.tahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/koperasi/dashboard" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-2 w-fit font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-white pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <CalendarRange className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Laporan Bulanan RAT</CardTitle>
                <CardDescription>Catat progres bulanan koperasi menuju Rapat Anggota Tahunan.</CardDescription>
              </div>
              <Button onClick={handleExportCsv} variant="outline" className="text-slate-700 border-slate-300">
                <Download className="w-4 h-4 mr-2" /> Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {pesan.text && <div className={`p-4 mb-6 rounded-md text-sm font-bold ${pesan.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{pesan.text}</div>}
            
            <form onSubmit={handleCsvUpload} className="mb-8 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
              <p className="text-sm font-semibold text-center mb-2">Upload CSV Laporan</p>
              <p className="text-xs text-slate-500 text-center mb-4"><code className="bg-slate-200 px-1 py-0.5 rounded">nama_koperasi, bulan, tahun, status_laporan, tanggal_lapor, keterangan</code></p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-xs text-slate-500 file:py-1.5 file:px-3 file:rounded-md file:bg-blue-50 cursor-pointer" />
                <Button type="submit" disabled={saving || !file} size="sm" className="bg-blue-600">Upload CSV</Button>
              </div>
            </form>

            <form onSubmit={(e) => handleSave(e)} className="space-y-6 border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Bulan Pelaporan</label>
                  <select value={formData.bulan} onChange={(e) => setFormData({...formData, bulan: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tahun</label>
                  <input type="text" value={formData.tahun} onChange={(e) => setFormData({...formData, tahun: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Status Pelaksanaan</label>
                  <select value={formData.status_laporan} onChange={(e) => setFormData({...formData, status_laporan: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="Selesai">Selesai</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Belum Mulai">Belum Mulai</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tanggal Lapor (Jika Ada)</label>
                  <input type="date" value={formData.tanggal_lapor} onChange={(e) => setFormData({...formData, tanggal_lapor: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold">Keterangan / Kendala</label>
                  <textarea value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-md" placeholder="Tuliskan progres atau kendala bulan ini..."></textarea>
                </div>
              </div>
              <div className="flex justify-end"><Button type="submit" disabled={saving} className="bg-blue-600"><Save className="w-4 h-4 mr-2" /> Simpan Data Bulanan</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}