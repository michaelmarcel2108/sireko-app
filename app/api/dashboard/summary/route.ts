import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  // Ambil semua data laporan, diurutkan dari yang terbaru
  const { data: allLaporan, error } = await supabase
    .from('laporan_keuangan')
    .select('*, periodes(bulan, tahun)') // Join table untuk mendapat nama bulan
    .order('id', { ascending: false });

  if (error) {
    return NextResponse.json({ message: "Gagal mengambil data", error: error.message }, { status: 500 });
  }

  // Jika belum ada data sama sekali
  if (!allLaporan || allLaporan.length === 0) {
    return NextResponse.json({
      totalAnggota: 0,
      totalSimpanan: 0,
      pinjamanBerjalan: 0,
      totalSHU: 0,
      riwayat: [],
      komposisiSimpanan: { pokok: 0, wajib: 0, sukarela: 0 }
    });
  }

  const latest = allLaporan[0];
  
  // Kalkulasi total SHU dari semua periode
  const totalSHU = allLaporan.reduce((acc, curr) => acc + Number(curr.shu_bersih), 0);

  return NextResponse.json({
    totalAnggota: latest.total_anggota,
    totalSimpanan: latest.total_simpanan,
    pinjamanBerjalan: latest.pinjaman_berjalan,
    totalSHU,
    riwayat: allLaporan,
    komposisiSimpanan: {
      pokok: latest.simpanan_pokok,
      wajib: latest.simpanan_wajib,
      sukarela: latest.simpanan_sukarela,
    }
  });
}