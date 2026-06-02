"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat Dashboard...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard SIREKO</h1>
        <Button onClick={() => router.push("/admin/laporan-baru")}>
          + Input Laporan Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Anggota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalAnggota}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Simpanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {data?.totalSimpanan?.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pinjaman Berjalan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              Rp {data?.pinjamanBerjalan?.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SHU Akumulasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {data?.totalSHU?.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tampilan Riwayat / Komposisi */}
      <Card>
        <CardHeader>
          <CardTitle>Komposisi Simpanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span>Simpanan Pokok</span>
            <span className="font-semibold">Rp {data?.komposisiSimpanan?.pokok?.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>Simpanan Wajib</span>
            <span className="font-semibold">Rp {data?.komposisiSimpanan?.wajib?.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>Simpanan Sukarela</span>
            <span className="font-semibold">Rp {data?.komposisiSimpanan?.sukarela?.toLocaleString("id-ID")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}