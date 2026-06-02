import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Mengambil 1 laporan spesifik untuk form Edit
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('laporan_keuangan')
    .select('*, periodes(bulan, tahun)')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Memperbarui laporan (Edit)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    // Kalkulasi ulang total simpanan
    const totalSimpanan = Number(body.simpananPokok) + Number(body.simpananWajib) + Number(body.simpananSukarela);

    const { error } = await supabase
      .from('laporan_keuangan')
      .update({
        total_anggota: parseInt(body.totalAnggota),
        simpanan_pokok: Number(body.simpananPokok),
        simpanan_wajib: Number(body.simpananWajib),
        simpanan_sukarela: Number(body.simpananSukarela),
        total_simpanan: totalSimpanan,
        pinjaman_berjalan: Number(body.pinjamanBerjalan),
        shu_bersih: Number(body.shuBersih)
      })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Menghapus laporan
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from('laporan_keuangan')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}