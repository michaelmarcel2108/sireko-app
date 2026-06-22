// app/admin/merah-putih/desa/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Building2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDesaKoperasiPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } 
          catch (error) {}
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Tarik data keragaan yang memiliki info kecamatan dan desa
  const { data: koperasiData } = await supabase
    .from('keragaan_koperasi')
    .select('nama_koperasi, kecamatan, desa');

  // Logika Grouping di sisi Server
  const desaMap = new Map<string, { kecamatan: string, desa: string, count: number, koperasiNames: string[] }>();

  koperasiData?.forEach((item) => {
    // Gunakan fallback ke kecamatan jika desa kosong (sesuaikan dengan struktur database)
    const namaDesa = item.desa || 'Tidak Diketahui';
    const namaKecamatan = item.kecamatan || 'Tidak Diketahui';
    const keyId = `${namaKecamatan}-${namaDesa}`.toLowerCase();

    if (!desaMap.has(keyId)) {
      desaMap.set(keyId, { kecamatan: namaKecamatan, desa: namaDesa, count: 0, koperasiNames: [] });
    }
    
    const entry = desaMap.get(keyId)!;
    entry.count += 1;
    if (item.nama_koperasi) entry.koperasiNames.push(item.nama_koperasi);
  });

  // Filter hanya desa yang memiliki > 1 koperasi, lalu urutkan dari yang terbanyak
  const filteredDesa = Array.from(desaMap.values())
    .filter(item => item.count > 1 && item.desa !== 'Tidak Diketahui')
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-red-600" /> Pemetaan Padat Koperasi
          </h1>
          <p className="text-sm text-slate-500 font-medium">Daftar desa atau kelurahan yang memiliki lebih dari satu koperasi.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Agregasi Wilayah</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Total terdata: <span className="text-slate-700 font-bold">{filteredDesa.length}</span> desa/kelurahan padat
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="w-[50px] font-bold text-slate-500 text-center">No</TableHead>
                  <TableHead className="font-bold text-slate-500">Kecamatan</TableHead>
                  <TableHead className="font-bold text-slate-500">Desa / Kelurahan</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Jumlah Koperasi</TableHead>
                  <TableHead className="font-bold text-slate-500">Daftar Koperasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesa.length > 0 ? (
                  filteredDesa.map((item, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/50 border-b border-slate-100">
                      <td className="text-center font-medium text-sm text-slate-500 py-3.5">{index + 1}</td>
                      <td className="font-bold text-sm text-slate-700 py-3.5">{item.kecamatan}</td>
                      <td className="font-bold text-sm text-slate-900 py-3.5">{item.desa}</td>
                      <td className="text-center py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          <Building2 className="w-3.5 h-3.5" /> {item.count} Unit
                        </span>
                      </td>
                      <td className="text-sm font-medium text-slate-500 py-3.5">
                        <ul className="list-disc list-inside space-y-1">
                          {item.koperasiNames.map((nama, idx) => (
                            <li key={idx} className="truncate max-w-[250px] md:max-w-xs">{nama}</li>
                          ))}
                        </ul>
                      </td>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">Belum ada desa yang memiliki lebih dari satu koperasi terdata.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}