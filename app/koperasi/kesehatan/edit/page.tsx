// app/koperasi/kesehatan/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Activity, UploadCloud } from "lucide-react";

export default function KoperasiEditKesehatanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState({ type: "", text: "" });
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nama_koperasi: "",
    tahun: new Date().getFullYear().toString(),
    skor_kesehatan: 0,
    predikat_kesehatan: "Belum Dinilai",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data } = await supabase
        .from("kesehatan_koperasi")
        .select("*")
        .eq("user_id", session.user.id)
        .order("tahun", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setFormData({
          nama_koperasi: data.nama_koperasi || "",
          tahun: data.tahun || new Date().getFullYear().toString(),
          skor_kesehatan: data.skor_kesehatan || 0,
          predikat_kesehatan: data.predikat_kesehatan || "Belum Dinilai",
        });
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
    const userId = session?.user.id;
    
    // Siapkan data dengan user_id
    const payload = { ...(newData || formData), user_id: userId };

    // PERBAIKAN: Cek apakah tahun ini sudah ada datanya
    const { data: existingData } = await supabase
      .from("kesehatan_koperasi")
      .select("id")
      .eq("user_id", userId)
      .eq("tahun", payload.tahun)
      .maybeSingle();

    let dbError;

    if (existingData) {
      // Jika sudah ada tahun yang sama, UPDATE baris tersebut
      const { error } = await supabase.from("kesehatan_koperasi").update(payload).eq("id", existingData.id);
      dbError = error;
    } else {
      // Jika belum ada, BUAT BARU (Insert)
      const { error } = await supabase.from("kesehatan_koperasi").insert([payload]);
      dbError = error;
    }

    if (dbError) {
      setPesan({ type: "error", text: "Gagal menyimpan data: " + dbError.message });
    } else {
      setPesan({ type: "success", text: "Data kesehatan berhasil tersimpan!" });
      setTimeout(() => {
        router.push("/koperasi/dashboard");
        router.refresh();
      }, 1500);
    }
    setSaving(false);
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setPesan({ type: "error", text: "Pilih file CSV terlebih dahulu!" });
    
    setSaving(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim().length > 0);
        if (rows.length < 2) throw new Error("File CSV kosong.");

        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const values = rows[1].split(',').map(v => v.trim());
        const getVal = (col: string) => headers.indexOf(col) !== -1 ? values[headers.indexOf(col)] : "";

        const newData = {
          nama_koperasi: getVal("nama_koperasi") || formData.nama_koperasi,
          tahun: getVal("tahun") || formData.tahun,
          skor_kesehatan: Number(getVal("skor_kesehatan")) || 0,
          predikat_kesehatan: getVal("predikat_kesehatan") || formData.predikat_kesehatan,
        };

        setFormData(newData);
        await handleSave(undefined, newData);
      } catch (err: any) {
        setPesan({ type: "error", text: "Gagal memproses CSV: " + err.message });
        setSaving(false);
      }
    };
    reader.readAsText(file);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/koperasi/dashboard" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-2 w-fit font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-white pb-6">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Input Berkas Kesehatan</CardTitle>
            <CardDescription>Pembaruan berkala skor klinis dan predikat kesehatan Koperasi.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {pesan.text && (
              <div className={`p-4 mb-6 rounded-md text-sm font-bold ${pesan.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{pesan.text}</div>
            )}

            <form onSubmit={handleCsvUpload} className="mb-8 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100">
              <UploadCloud className="w-8 h-8 text-blue-500 mb-2 mx-auto" />
              <p className="text-sm font-semibold text-center mb-1">Upload CSV Cepat</p>
              <p className="text-xs text-slate-500 text-center mb-4">Format: <code className="bg-slate-200 px-1 py-0.5 rounded">nama_koperasi, tahun, skor_kesehatan, predikat_kesehatan</code></p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-xs text-slate-500 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer" />
                <Button type="submit" disabled={saving || !file} size="sm" className="bg-blue-600">Upload</Button>
              </div>
            </form>

            <form onSubmit={(e) => handleSave(e)} className="space-y-6 border-t pt-6">
              <h3 className="text-sm font-bold text-slate-800">Atau Edit Manual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tahun Buku</label>
                  <input type="text" value={formData.tahun} onChange={(e) => setFormData({...formData, tahun: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Skor Kesehatan</label>
                  <input type="number" step="0.01" value={formData.skor_kesehatan} onChange={(e) => setFormData({...formData, skor_kesehatan: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Predikat Kesehatan</label>
                  <select value={formData.predikat_kesehatan} onChange={(e) => setFormData({...formData, predikat_kesehatan: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="Sehat">Sehat</option>
                    <option value="Cukup Sehat">Cukup Sehat</option>
                    <option value="Kurang Sehat">Kurang Sehat</option>
                    <option value="Dalam Pengawasan">Dalam Pengawasan</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end"><Button type="submit" disabled={saving} className="bg-blue-600 w-full md:w-auto"><Save className="w-4 h-4 mr-2" /> Simpan Manual</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}