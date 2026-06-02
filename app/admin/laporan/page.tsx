"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    // Kita bisa menggunakan API summary yang sudah kita buat sebelumnya
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((data) => {
        setLaporan(data.riwayat || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Riwayat Laporan Keuangan</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push("/")}>
            Kembali ke Dashboard
          </Button>
          <Button onClick={() => router.push("/admin/periode-baru")}>
            + Periode Baru
          </Button>
          <Button onClick={() => router.push("/admin/laporan-baru")}>
            + Input Laporan
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead>Total Anggota</TableHead>
                  <TableHead>Total Simpanan</TableHead>
                  <TableHead>Pinjaman Berjalan</TableHead>
                  <TableHead>SHU Bersih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laporan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada data laporan. Silakan tambah periode dan input laporan baru.
                    </TableCell>
                  </TableRow>
                ) : (
                  laporan.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.periodes?.bulan} {item.periodes?.tahun}
                      </TableCell>
                      <TableCell>{item.total_anggota} Orang</TableCell>
                      <TableCell>Rp {Number(item.total_simpanan).toLocaleString("id-ID")}</TableCell>
                      <TableCell>Rp {Number(item.pinjaman_berjalan).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        Rp {Number(item.shu_bersih).toLocaleString("id-ID")}
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