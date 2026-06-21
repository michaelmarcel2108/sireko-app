// app/koperasi/keragaan/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Building2, UploadCloud, FileSpreadsheet } from "lucide-react";

export default function KoperasiEditKeragaanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState({ type: "", text: "" });
  const [file, setFile] = useState<File | null>(null);

  // State untuk menampilkan data saat ini (Current Data)
  const [formData, setFormData] = useState({
    nama_koperasi: "",
    kecamatan: "",
    jumlah_anggota: 0,
    aset: 0,
    volume_usaha: 0,
    shu: 0,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("keragaan_koperasi")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setFormData({
          nama_koperasi: data.nama_koperasi || "",
          kecamatan: data.kecamatan || "",
          jumlah_anggota: data.jumlah_anggota || 0,
          aset: data.aset || 0,
          volume_usaha: data.volume_usaha || 0,
          shu: data.shu || 0,
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [router, supabase]);

  // Fungsi untuk memproses file CSV
  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setPesan({ type: "error", text: "Pilih file CSV terlebih dahulu brok!" });
      return;
    }

    setSaving(true);
    setPesan({ type: "", text: "" });

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        // Pisahkan teks berdasarkan baris baru
        const rows = text.split('\n').filter(row => row.trim().length > 0);
        
        if (rows.length < 2) {
          throw new Error("File CSV kosong atau tidak memiliki baris data.");
        }

        // Ambil header dari baris pertama dan data dari baris kedua
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const values = rows[1].split(',').map(v => v.trim());

        const getVal = (colName: string) => {
          const idx = headers.indexOf(colName);
          return idx !== -1 ? values[idx] : "";
        };

        // Rangkai data baru yang diambil dari CSV
        const newData = {
          nama_koperasi: getVal("nama_koperasi") || formData.nama_koperasi,
          kecamatan: getVal("kecamatan") || formData.kecamatan,
          jumlah_anggota: Number(getVal("jumlah_anggota")) || 0,
          aset: Number(getVal("aset")) || 0,
          volume_usaha: Number(getVal("volume_usaha")) || 0,
          shu: Number(getVal("shu")) || 0,
        };

        // Simpan langsung ke database Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase
          .from("keragaan_koperasi")
          .update(newData)
          .eq("user_id", session?.user.id); // <-- Kunci proteksi

        if (error) throw error;

        setFormData(newData as any);
        setPesan({ type: "success", text: "Data berhasil ditarik dari CSV dan tersimpan!" });
        
        setTimeout(() => {
          router.push("/koperasi/dashboard");
          router.refresh();
        }, 1500);

      } catch (err: any) {
        setPesan({ type: "error", text: "Gagal memproses CSV: " + err.message });
      } finally {
        setSaving(false);
      }
    };
    
    // Mulai membaca file
    reader.readAsText(file);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
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
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Upload Data Keragaan (CSV)</CardTitle>
            <CardDescription>
              Perbarui metrik koperasi Anda dengan mengunggah file .csv langsung dari Excel.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {pesan.text && (
              <div className={`p-4 mb-6 rounded-md text-sm font-bold ${
                pesan.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {pesan.text}
              </div>
            )}

            {/* PREVIEW DATA SAAT INI */}
            <div className="bg-slate-100 rounded-lg p-4 mb-6 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Data Terkini Anda</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Anggota</p>
                  <p className="font-bold text-slate-900">{formData.jumlah_anggota}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Aset</p>
                  <p className="font-bold text-slate-900">{formatRupiah(formData.aset)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Volume Usaha</p>
                  <p className="font-bold text-slate-900">{formatRupiah(formData.volume_usaha)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">SHU</p>
                  <p className="font-bold text-slate-900 text-green-600">{formatRupiah(formData.shu)}</p>
                </div>
              </div>
            </div>

            {/* FORM UPLOAD CSV */}
            <form onSubmit={handleCsvUpload} className="space-y-6">
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <UploadCloud className="w-10 h-10 text-blue-500 mb-3" />
                <p className="text-sm font-semibold text-slate-700 mb-1">Pilih atau letakkan file CSV di sini</p>
                <p className="text-xs text-slate-500 mb-4 text-center">Pastikan format kolom Excel sesuai: <br/> <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">nama_koperasi, kecamatan, jumlah_anggota, aset, volume_usaha, shu</code></p>
                
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full max-w-xs text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving || !file} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]">
                  {saving ? "Memproses Data..." : <><Save className="w-4 h-4 mr-2" /> Upload & Simpan</>}
                </Button>
              </div>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}