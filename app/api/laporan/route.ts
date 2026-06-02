import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      periodeId, totalAnggota, simpananPokok, simpananWajib,
      simpananSukarela, pinjamanBerjalan, shuBersih
    } = body;

    // Kalkulasi Otomatis Total Simpanan dari logic sebelumnya
    const totalSimpanan = Number(simpananPokok) + Number(simpananWajib) + Number(simpananSukarela);

    const { data, error } = await supabase
      .from('laporan_keuangan')
      .insert([{
        periode_id: parseInt(periodeId),
        total_anggota: parseInt(totalAnggota),
        simpanan_pokok: Number(simpananPokok),
        simpanan_wajib: Number(simpananWajib),
        simpanan_sukarela: Number(simpananSukarela),
        total_simpanan: totalSimpanan,
        pinjaman_berjalan: Number(pinjamanBerjalan),
        shu_bersih: Number(shuBersih)
      }])
      .select();

    if (error) throw error;
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal menginput laporan baru", error: error.message }, { status: 500 });
  }
}