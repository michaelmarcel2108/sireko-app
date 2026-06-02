"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { use } from "react";

export default function EditLaporanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [periodeLabel, setPeriodeLabel] = useState("");
  
  const [formData, setFormData] = useState({
    totalAnggota: "",
    simpananPokok: "",
    simpananWajib: "",
    simpananSukarela: "",
    pinjamanBerjalan: "",
    shuBersih: "",
  });

  useEffect(() => {
    // Ambil data laporan saat ini
    fetch(`/api/laporan/${id}`)
      .then(res => res.json())
      .then(data => {
        setPeriodeLabel(`${data.periodes?.bulan} ${data.periodes?.tahun}`);
        setFormData({
          totalAnggota: String(data.total_anggota),
          simpananPokok: String(data.simpanan_pokok),
          simpananWajib: String(data.simpanan_wajib),
          simpananSukarela: String(data.simpanan_sukarela),
          pinjamanBerjalan: String(data.pinjaman_berjalan),
          shuBersih: String(data.shu_bersih),
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Gagal memuat data laporan.");
        setLoading(false);
      });
  }, [id]);

  const totalSimpananOtomatis =
    Number(formData.simpananPokok || 0) + Number(formData.simpananWajib || 0) + Number(formData.simpananSukarela || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/laporan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success("Perubahan laporan berhasil disimpan!");
      router.push("/admin/laporan");
    } else {
      toast.error("Gagal menyimpan perubahan.");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat data...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="border-b bg-gray-50/50 mb-4">
          <CardTitle className="text-xl">Edit Laporan: {periodeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Keanggotaan */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Keanggotaan</h3>
              <div className="max-w-xs">
                <label className="block text-sm font-medium mb-1">Total Anggota Aktif</label>
                <Input
                  type="number"
                  value={formData.totalAnggota}
                  onChange={(e) => setFormData({...formData, totalAnggota: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Simpanan */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Simpanan (Rp)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Pokok</label>
                  <Input type="number" value={formData.simpananPokok} onChange={(e) => setFormData({...formData, simpananPokok: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Wajib</label>
                  <Input type="number" value={formData.simpananWajib} onChange={(e) => setFormData({...formData, simpananWajib: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Sukarela</label>
                  <Input type="number" value={formData.simpananSukarela} onChange={(e) => setFormData({...formData, simpananSukarela: e.target.value})} required />
                </div>
              </div>
              <div className="mt-4 bg-teal-50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-teal-700 font-medium">Total Akumulasi Simpanan</span>
                <span className="text-teal-800 font-bold">Rp {totalSimpananOtomatis.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Pinjaman & SHU */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Pinjaman & Hasil Usaha (Rp)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pinjaman Berjalan</label>
                  <Input type="number" value={formData.pinjamanBerjalan} onChange={(e) => setFormData({...formData, pinjamanBerjalan: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SHU Bersih</label>
                  <Input type="number" value={formData.shuBersih} onChange={(e) => setFormData({...formData, shuBersih: e.target.value})} required />
                </div>
              </div>
            </div>

            {/* Aksi */}
            <div className="flex gap-3 justify-end pt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/laporan")}>
                Batal
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}