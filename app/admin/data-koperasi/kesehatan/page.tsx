import Link from 'next/link';
import { getKesehatanData } from '@/utils/api-koperasi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function AdminKesehatanPage() {
  const data = await getKesehatanData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <span>/</span>
        <span>Kesehatan Koperasi</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Penilaian Kesehatan Koperasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Pencatatan skor berkala dan predikat klinis laporan keuangan koperasi.</p>
        </div>
        <Link href="/admin/data-koperasi/kesehatan/tambah">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Tambah Skor
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Predikat Kesehatan</CardTitle>
          <CardDescription>Total rekap data klastering kesehatan: {data.length} baris.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Koperasi</TableHead>
                <TableHead>Tahun Buku</TableHead>
                <TableHead>Skor Kesehatan</TableHead>
                <TableHead>Predikat</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900">{item.nama_koperasi}</TableCell>
                  <TableCell>{item.tahun || '-'}</TableCell>
                  <TableCell className="font-mono font-semibold">{item.skor_kesehatan || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.predikat_kesehatan === 'Sehat' ? 'bg-green-100 text-green-800' :
                      item.predikat_kesehatan === 'Cukup Sehat' ? 'bg-blue-100 text-blue-800' :
                      item.predikat_kesehatan === 'Kurang Sehat' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.predikat_kesehatan || 'Dalam Pengawasan'}
                    </span>
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