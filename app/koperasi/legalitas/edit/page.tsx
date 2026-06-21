"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FileCheck, UploadCloud } from "lucide-react";

export default function KoperasiEditLegalitasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState({ type: "", text: "" });
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nama_koperasi: "",
    no_badan_hukum: "",
    nik: "",
    status_aktif: "Aktif",
    sertifikat: "Belum Bersertifikat",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data } = await supabase.from("legalitas_koperasi").select("*").eq("user_id", session.user.id).single();
      if (data) {
        setFormData({
          nama_koperasi: data.nama_koperasi || "",
          no_badan_hukum: data.no_badan_hukum || "",
          nik: data.nik || "",
          status_aktif: data.status_aktif === true ? "Aktif" : (data.status_aktif || "Aktif"),
          sertifikat: data.sertifikat || "Belum Bersertifikat",
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
    const { error } = await supabase.from("legalitas_koperasi").update(newData || formData).eq("user_id", session?.user.id);
    if (error) setPesan({ type: "error", text: "Gagal menyimpan: " + error.message });
    else {
      setPesan({ type: "success", text: "Data legalitas tersimpan!" });
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
          no_badan_hukum: getVal("no_badan_hukum") || formData.no_badan_hukum,
          nik: getVal("nik") || formData.nik,
          status_aktif: getVal("status_aktif") || formData.status_aktif,
          sertifikat: getVal("sertifikat") || formData.sertifikat,
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/koperasi/dashboard" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-2 w-fit font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-white pb-6">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4"><FileCheck className="w-6 h-6" /></div>
            <CardTitle className="text-2xl font-bold">Update Berkas Legalitas</CardTitle>
            <CardDescription>Nomor Induk Koperasi (NIK) dan status operasional.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {pesan.text && <div className={`p-4 mb-6 rounded-md text-sm font-bold ${pesan.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{pesan.text}</div>}
            
            <form onSubmit={handleCsvUpload} className="mb-8 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
              <p className="text-sm font-semibold text-center mb-2">Upload CSV Cepat</p>
              <p className="text-xs text-slate-500 text-center mb-4"><code className="bg-slate-200 px-1 py-0.5 rounded">nama_koperasi, no_badan_hukum, nik, status_aktif, sertifikat</code></p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-xs text-slate-500 file:py-1.5 file:px-3 file:rounded-md file:bg-blue-50 cursor-pointer" />
                <Button type="submit" disabled={saving || !file} size="sm" className="bg-blue-600">Upload</Button>
              </div>
            </form>

            <form onSubmit={(e) => handleSave(e)} className="space-y-6 border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">No. Badan Hukum</label>
                  <input type="text" value={formData.no_badan_hukum} onChange={(e) => setFormData({...formData, no_badan_hukum: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nomor NIK Koperasi</label>
                  <input type="text" value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="flex justify-end"><Button type="submit" disabled={saving} className="bg-blue-600"><Save className="w-4 h-4 mr-2" /> Simpan Manual</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}