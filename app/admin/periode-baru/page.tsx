"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PeriodeBaru() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bulan: "",
    tahun: new Date().getFullYear().toString(),
    keterangan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/periodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      toast.success("Periode baru berhasil ditambahkan!");
      router.push("/admin/laporan-baru"); // Langsung arahkan ke form laporan
    } else {
      toast.error("Gagal menambahkan periode.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Buka Periode Laporan Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bulan</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={formData.bulan}
                onChange={(e) => setFormData({...formData, bulan: e.target.value})}
                required
              >
                <option value="">-- Pilih Bulan --</option>
                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(bln => (
                  <option key={bln} value={bln}>{bln}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tahun</label>
              <Input
                type="number"
                value={formData.tahun}
                onChange={(e) => setFormData({...formData, tahun: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keterangan (Opsional)</label>
              <Input
                type="text"
                placeholder="Contoh: Tutup buku akhir tahun"
                value={formData.keterangan}
                onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
              />
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full">
                Simpan Periode
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}