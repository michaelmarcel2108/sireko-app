"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function KelolaPeriodePage() {
  const router = useRouter();
  const [periodes, setPeriodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPeriodes = () => {
    fetch("/api/periodes")
      .then((res) => res.json())
      .then((data) => {
        setPeriodes(data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Gagal memuat data periode");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPeriodes();
  }, []);

  const handleDelete = async (id: number, namaPeriode: string) => {
    if (!confirm(`Yakin ingin menghapus periode ${namaPeriode}? Data laporan yang terikat mungkin akan ikut terhapus.`)) return;

    const res = await fetch(`/api/periodes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Periode berhasil dihapus.");
      loadPeriodes();
    } else {
      toast.error("Gagal menghapus periode.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Kelola Periode</h2>
          <p className="text-sm text-gray-500 mt-1">Daftar periode pelaporan koperasi</p>
        </div>
        <Button 
          onClick={() => router.push("/admin/periode-baru")} 
          className="bg-teal-700 hover:bg-teal-800 flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Periode
        </Button>
      </div>

      {/* Tabel Data */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-600">Tahun</TableHead>
                <TableHead className="font-semibold text-gray-600">Bulan</TableHead>
                <TableHead className="font-semibold text-gray-600">Keterangan</TableHead>
                <TableHead className="text-right font-semibold text-gray-600 w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : periodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Belum ada periode yang terdaftar.
                  </TableCell>
                </TableRow>
              ) : (
                periodes.map((item) => (
                  <TableRow key={item.id} className="hover:bg-teal-50/50 transition-colors group">
                    <TableCell className="font-medium text-gray-800">{item.tahun}</TableCell>
                    <TableCell className="text-gray-600">{item.bulan}</TableCell>
                    <TableCell className="text-gray-500">{item.keterangan || "-"}</TableCell>
                    <TableCell className="text-right">
                      <button 
                        onClick={() => handleDelete(item.id, `${item.bulan} ${item.tahun}`)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-md hover:bg-red-100 inline-flex items-center justify-center"
                        title="Hapus Periode"
                        >
                        <Trash2 size={18} />
                        </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}