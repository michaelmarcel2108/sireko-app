// app/admin/data-koperasi/keragaan/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ArrowLeft, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminSearch from '@/components/AdminSearch';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminKeragaanPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  
  // Konfigurasi Supabase Client bebas warning
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Abaikan error di Server Component
          }
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Konfigurasi Pagination
  const searchQuery = resolvedSearchParams.q || '';
  const currentPage = parseInt(resolvedSearchParams.page || '1') || 1;
  const itemsPerPage = 25;
  const fromIndex = (currentPage - 1) * itemsPerPage;
  const toIndex = fromIndex + itemsPerPage - 1;

  // Query Database dengan Search
  let dbQuery = supabase
    .from('keragaan_koperasi')
    .select('*', { count: 'exact' })
    .order('tahun', { ascending: false })
    .order('nama_koperasi', { ascending: true });

  if (searchQuery) {
    dbQuery = dbQuery.or(`nama_koperasi.ilike.%${searchQuery}%,kecamatan.ilike.%${searchQuery}%`);
  }

  const { data: keragaanList, count } = await dbQuery.range(fromIndex, toIndex);
  
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-2">
        <Link href="/admin" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-800">Keragaan Koperasi</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Keragaan Koperasi
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manajemen data ekonomi, jumlah anggota, aset, usaha, dan SHU.
          </p>
        </div>
        <Link href="/admin/data-koperasi/keragaan/tambah">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm font-medium">
            <PlusCircle className="w-4 h-4" /> Tambah Keragaan
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Daftar Keragaan Koperasi</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Total terdata: <span className="text-slate-700 font-bold">{totalCount}</span> baris keragaan
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Memasukkan komponen pencarian yang sudah debounced */}
            <AdminSearch />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="w-[50px] font-bold text-slate-500 text-center">No</TableHead>
                  <TableHead className="font-bold text-slate-500">Nama Koperasi</TableHead>
                  <TableHead className="font-bold text-slate-500">Kecamatan</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Tahun</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Anggota</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Aset</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Volume Usaha</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">SHU</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keragaanList && keragaanList.length > 0 ? (
                  keragaanList.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                      <td className="text-center font-medium text-sm text-slate-500 py-3.5">
                        {fromIndex + index + 1}
                      </td>
                      <TableCell className="font-bold text-sm text-slate-900 py-3.5">{item.nama_koperasi}</TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">{item.kecamatan || '-'}</TableCell>
                      <TableCell className="text-center text-sm font-semibold text-slate-600">{item.tahun || '-'}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-slate-800">{(item.jumlah_anggota || 0).toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-right text-sm font-bold text-slate-900">{formatCurrency(item.aset)}</TableCell>
                      <TableCell className="text-right text-sm font-semibold text-slate-700">{formatCurrency(item.volume_usaha)}</TableCell>
                      <TableCell className="text-right text-sm font-bold text-emerald-600">{formatCurrency(item.shu)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {/* Tombol Aksi (Siap dihubungkan dengan halaman Edit/Delete nantinya) */}
                          <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:border-blue-200">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-slate-400 font-medium">
                      Data keragaan tidak ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Navigasi Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/40">
            <span className="text-xs font-semibold text-slate-500">
              Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`?q=${searchQuery}&page=${Math.max(1, currentPage - 1)}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold transition-all shadow-sm ${
                  currentPage <= 1
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
              </Link>
              <Link
                href={`?q=${searchQuery}&page=${Math.min(totalPages, currentPage + 1)}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold transition-all shadow-sm ${
                  currentPage >= totalPages
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}