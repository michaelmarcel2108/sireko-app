import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    
    const resolvedParams = await params; 

    const { error } = await supabase.from('anggota').update({
      nama: body.nama,
      simpanan_pokok: Number(body.simpanan_pokok),
      simpanan_wajib: Number(body.simpanan_wajib),
      simpanan_sukarela: Number(body.simpanan_sukarela),
      pinjaman: Number(body.pinjaman)
    }).eq('id', resolvedParams.id);
    
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  
  const resolvedParams = await params;
  
  const { error } = await supabase.from('anggota').delete().eq('id', resolvedParams.id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}