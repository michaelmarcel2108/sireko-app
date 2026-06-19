import { supabase } from './supabase';

export async function getKeragaanData() {
  const { data, error } = await supabase.from('keragaan_koperasi').select('*').order('nama_koperasi');
  if (error) console.error('Error fetching keragaan:', error);
  return data || [];
}

export async function getKesehatanData() {
  const { data, error } = await supabase.from('kesehatan_koperasi').select('*').order('nama_koperasi');
  if (error) console.error('Error fetching kesehatan:', error);
  return data || [];
}

export async function getPelatihanData() {
  const { data, error } = await supabase.from('pelatihan_koperasi').select('*').order('tanggal_pelatihan', { ascending: false });
  if (error) console.error('Error fetching pelatihan:', error);
  return data || [];
}

export async function getLegalitasData() {
  const { data, error } = await supabase.from('legalitas_koperasi').select('*').order('nama_koperasi');
  if (error) console.error('Error fetching legalitas:', error);
  return data || [];
}