import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { data, error } = await supabase
    .from('laporan_keuangan')
    .select('*, periodes(bulan, tahun)')
    .eq('id', resolvedParams.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    
    const totalSimpanan = Number(body.simpananPokok) + Number(body.simpananWajib) + Number(body.simpananSukarela);

    const { error } = await supabase
      .from('laporan_keuangan')
      .update({
        total_anggota: parseInt(body.totalAnggota),
        simpanan_pokok: Number(body.simpananPokok),
        simpanan_wajib: Number(body.simpananWajib),
        simpanan_sukarela: Number(body.simpanan_sukarela),
        total_simpanan: totalSimpanan,
        pinjaman_berjalan: Number(body.pinjamanBerjalan),
        shu_bersih: Number(body.shuBersih)
      })
      .eq('id', resolvedParams.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { error } = await supabase
    .from('laporan_keuangan')
    .delete()
    .eq('id', resolvedParams.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}