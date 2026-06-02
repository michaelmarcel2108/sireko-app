"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DaftarLaporan() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((data) => {
        setLaporan(data.riwayat || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number, namaPeriode: string) => {
    if (!confirm(`Hapus laporan untuk periode ${namaPeriode}? Tindakan ini tidak dapat dibatalkan.`)) return;
    
    const res = await fetch(`/api/laporan/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Laporan berhasil dihapus.");
      loadData(); // Refresh tabel
    } else {
      toast.error("Gagal menghapus laporan.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Laporan Koperasi</h2>
        <Button onClick={() => router.push("/admin/laporan-baru")} className="bg-teal-700 hover:bg-teal-800">
          + Input Laporan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Anggota</TableHead>
                  <TableHead className="text-right">Total Simpanan</TableHead>
                  <TableHead className="text-right">Pinjaman Berjalan</TableHead>
                  <TableHead className="text-right">SHU Bersih</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laporan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada laporan.
                    </TableCell>
                  </TableRow>
                ) : (
                  laporan.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-800">
                        {item.periodes?.bulan} {item.periodes?.tahun}
                      </TableCell>
                      <TableCell className="text-right">{item.total_anggota}</TableCell>
                      <TableCell className="text-right">Rp {Number(item.total_simpanan).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">Rp {Number(item.pinjaman_berjalan).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${Number(item.shu_bersih) >= 0 ? "text-teal-600" : "text-red-500"}`}>
                          Rp {Number(item.shu_bersih).toLocaleString("id-ID")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/admin/laporan/${item.id}/edit`} className="text-teal-600 hover:text-teal-800 text-sm font-medium">
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(item.id, `${item.periodes?.bulan} ${item.periodes?.tahun}`)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                            Hapus
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}