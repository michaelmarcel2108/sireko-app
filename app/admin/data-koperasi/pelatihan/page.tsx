import Link from 'next/link';
import { getPelatihanData } from '@/utils/api-koperasi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPelatihanPage() {
  const data = await getPelatihanData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <span>/</span>
        <span>Data Pelatihan</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Riwayat Pelatihan</h1>
          <p className="text-sm text-muted-foreground mt-1">Pencatatan peningkatan kapasitas SDM pengurus dan pengawas koperasi.</p>
        </div>
        <Link href="/admin/data-koperasi/pelatihan/tambah">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Tambah Pelatihan
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Kegiatan Diklat / Workshop</CardTitle>
          <CardDescription>Total log logistik pelatihan: {data.length} baris.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Koperasi</TableHead>
                <TableHead>Nama Program Pelatihan</TableHead>
                <TableHead>Penyelenggara</TableHead>
                <TableHead>Tanggal Pelaksanaan</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900">{item.nama_koperasi}</TableCell>
                  <TableCell className="text-slate-700 font-medium">{item.nama_pelatihan}</TableCell>
                  <TableCell>{item.penyelenggara || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.tanggal_pelatihan ? new Date(item.tanggal_pelatihan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </TableCell>
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