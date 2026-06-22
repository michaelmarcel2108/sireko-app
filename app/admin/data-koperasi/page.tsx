// app/admin/data-koperasi/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminSearch from '@/components/AdminSearch';
import AdminCsvActions from '@/components/AdminCsvActions';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminDataKoperasiPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  
  // Konfigurasi Supabase Client dengan standar getAll & setAll terbaru
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

  // Proteksi rute cek session admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Konfigurasi Kueri & Pagination (25 Item)
  const searchQuery = resolvedSearchParams.q || '';
  const currentPage = parseInt(resolvedSearchParams.page || '1') || 1;
  const itemsPerPage = 25;
  const fromIndex = (currentPage - 1) * itemsPerPage;
  const toIndex = fromIndex + itemsPerPage - 1;

  // Jalankan query pencarian ke database Supabase
  let dbQuery = supabase
    .from('keragaan_koperasi')
    .select('*', { count: 'exact' })
    .order('nama_koperasi', { ascending: true });

  if (searchQuery) {
    dbQuery = dbQuery.or(`nama_koperasi.ilike.%${searchQuery}%,kecamatan.ilike.%${searchQuery}%`);
  }

  const { data: koperasiList, count } = await dbQuery.range(fromIndex, toIndex);
  
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // Format rupiah utilitas internal
  const formatRupiah = (value?: number) => {
    if (!value) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Database Seluruh Koperasi
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Kelola, filter, eksport, dan monitoring berkas keragaan koperasi terdaftar.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Daftar Koperasi</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Total terdata: <span className="text-slate-700 font-bold">{totalCount}</span> koperasi
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminSearch />
            <AdminCsvActions dataToExport={koperasiList || []} />
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
                  <TableHead className="font-bold text-slate-500 text-center">Tahun Buku</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Anggota</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Total Aset</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Volume Usaha</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">SHU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {koperasiList && koperasiList.length > 0 ? (
                  koperasiList.map((item, index) => (
                    <TableRow key={item.id || index} className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors">
                      <td className="text-center font-medium text-sm text-slate-500 py-3.5">
                        {fromIndex + index + 1}
                      </td>
                      <td className="font-bold text-sm text-slate-900 py-3.5">
                        {item.nama_koperasi}
                      </td>
                      <td className="text-sm font-medium text-slate-600 py-3.5">
                        {item.kecamatan || '-'}
                      </td>
                      <td className="text-sm font-semibold text-slate-600 text-center py-3.5">
                        {item.tahun}
                      </td>
                      <td className="text-sm font-medium text-slate-800 text-center py-3.5">
                        {(item.jumlah_anggota || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="text-sm font-bold text-slate-900 text-right py-3.5">
                        {formatRupiah(item.aset)}
                      </td>
                      <td className="text-sm font-semibold text-slate-700 text-right py-3.5">
                        {formatRupiah(item.volume_usaha)}
                      </td>
                      <td className="text-sm font-bold text-emerald-600 text-right py-3.5">
                        {formatRupiah(item.shu)}
                      </td>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                      Data koperasi tidak ditemukan atau basis data kosong.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Navigasi Kontrol Kontainer Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/40">
              <span className="text-xs font-semibold text-slate-500">
                Halaman <span className="text-slate-800 font-bold">{currentPage}</span> dari <span className="text-slate-800 font-bold">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`?q=${searchQuery}&page=${Math.max(1, currentPage - 1)}`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold transition-all shadow-sm ${
                    currentPage === 1
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                </Link>
                <Link
                  href={`?q=${searchQuery}&page=${Math.min(totalPages, currentPage + 1)}`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold transition-all shadow-sm ${
                    currentPage === totalPages
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}