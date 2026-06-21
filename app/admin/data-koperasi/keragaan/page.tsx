import Link from 'next/link';
import { getKeragaanData } from '@/utils/api-koperasi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function AdminKeragaanPage() {
  const data = await getKeragaanData();

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <span>/</span>
        <span>Keragaan Koperasi</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Keragaan Koperasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Manajemen data ekonomi, jumlah anggota, aset, usaha, dan SHU.</p>
        </div>
        <Link href="/admin/data-koperasi/keragaan/tambah">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Tambah Keragaan
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Keragaan Koperasi</CardTitle>
          <CardDescription>Total data aktif di database: {data.length} baris.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Koperasi</TableHead>
                <TableHead>Kecamatan</TableHead>
                <TableHead className="text-right">Anggota</TableHead>
                <TableHead className="text-right">Aset</TableHead>
                <TableHead className="text-right">Volume Usaha</TableHead>
                <TableHead className="text-right">SHU</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900">{item.nama_koperasi}</TableCell>
                  <TableCell>{item.kecamatan || '-'}</TableCell>
                  <TableCell className="text-right">{item.jumlah_anggota || 0}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.aset)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.volume_usaha)}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">{formatCurrency(item.shu)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}