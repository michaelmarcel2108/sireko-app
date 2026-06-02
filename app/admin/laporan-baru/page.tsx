"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LaporanBaru() {
  const router = useRouter();
  const [periodes, setPeriodes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    periodeId: "",
    totalAnggota: "",
    simpananPokok: "",
    simpananWajib: "",
    simpananSukarela: "",
    pinjamanBerjalan: "",
    shuBersih: "",
  });

  const totalSimpananOtomatis =
    Number(formData.simpananPokok || 0) +
    Number(formData.simpananWajib || 0) +
    Number(formData.simpananSukarela || 0);

  useEffect(() => {
    fetch("/api/periodes")
      .then((res) => res.json())
      .then((data) => setPeriodes(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.periodeId) {
      toast.error("Pilih periode terlebih dahulu!");
      return;
    }

    const response = await fetch("/api/laporan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      toast.success("Seluruh data laporan berhasil disimpan!"); 
      router.push("/admin/laporan");
    } else {
      toast.error("Terjadi kesalahan saat menyimpan data.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Input Laporan Keuangan Multi-Menu SIREKO</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium mb-1">Periode Laporan</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={formData.periodeId}
                onChange={(e) => setFormData({...formData, periodeId: e.target.value})}
              >
                <option value="">-- Pilih Bulan/Periode --</option>
                {periodes.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.bulan} {p.tahun}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Anggota Aktif</label>
              <Input
                type="number"
                placeholder="Contoh: 255"
                value={formData.totalAnggota}
                onChange={(e) => setFormData({...formData, totalAnggota: e.target.value})}
                required
              />
            </div>

            <div className="border p-4 rounded-md space-y-3 bg-muted/30">
              <h3 className="font-semibold text-sm text-primary">Komposisi Input Simpanan</h3>
              <div>
                <label className="block text-xs font-medium mb-1">Simpanan Pokok (Rp)</label>
                <Input
                  type="number"
                  value={formData.simpananPokok}
                  onChange={(e) => setFormData({...formData, simpananPokok: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Simpanan Wajib (Rp)</label>
                <Input
                  type="number"
                  value={formData.simpananWajib}
                  onChange={(e) => setFormData({...formData, simpananWajib: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Simpanan Sukarela (Rp)</label>
                <Input
                  type="number"
                  value={formData.simpananSukarela}
                  onChange={(e) => setFormData({...formData, simpananSukarela: e.target.value})}
                  required
                />
              </div>
              <div className="pt-2 text-right text-xs font-bold text-muted-foreground">
                Total Akumulasi Simpanan: Rp {totalSimpananOtomatis.toLocaleString("id-ID")}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Pinjaman Berjalan (Rp)</label>
              <Input
                type="number"
                value={formData.pinjamanBerjalan}
                onChange={(e) => setFormData({...formData, pinjamanBerjalan: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SHU Bersih Periode Ini (Rp)</label>
              <Input
                type="number"
                value={formData.shuBersih}
                onChange={(e) => setFormData({...formData, shuBersih: e.target.value})}
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/laporan")}>
                Batal
              </Button>
              <Button type="submit">
                Simpan & Update Transparansi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}