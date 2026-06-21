import Link from 'next/link';
import { getLegalitasData } from '@/utils/api-koperasi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function AdminLegalitasPage() {
  const data = await getLegalitasData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <span>/</span>
        <span>Legalitas Usaha</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Legalitas Usaha</h1>
          <p className="text-sm text-muted-foreground mt-1">Verifikasi berkas, Nomor Badan Hukum, NIK, dan Validitas Sertifikat.</p>
        </div>
        <Link href="/admin/data-koperasi/legalitas/tambah">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Tambah Berkas
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Dokumen Hukum & Sertifikasi</CardTitle>
          <CardDescription>Total entri legalitas terbit: {data.length} baris.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Koperasi</TableHead>
                <TableHead>No. Badan Hukum</TableHead>
                <TableHead>Nomor NIK</TableHead>
                <TableHead>Status Operasional</TableHead>
                <TableHead>Sertifikasi NIK</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900">{item.nama_koperasi}</TableCell>
                  <TableCell className="font-mono text-xs">{item.no_badan_hukum || '-'}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{item.nik || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      item.status_aktif === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status_aktif || 'Tidak Aktif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      item.sertifikat === 'Sudah Bersertifikat' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {item.sertifikat || 'Belum Bersertifikat'}
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