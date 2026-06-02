"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DataAnggota() {
  const [anggota, setAnggota] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [namaBaru, setNamaBaru] = useState("");
  
  // State untuk Modal Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const loadAnggota = () => {
    fetch("/api/anggota")
      .then(res => res.json())
      .then(data => {
        setAnggota(data || []);
        setLoading(false);
      });
  };

  useEffect(() => { loadAnggota(); }, []);

  const handleTambahAnggota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBaru.trim()) return;
    
    const res = await fetch("/api/anggota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: namaBaru }),
    });

    if (res.ok) {
      toast.success("Anggota berhasil ditambahkan!");
      setNamaBaru("");
      loadAnggota();
    }
  };

  const handleHapusAnggota = async (id: number, nama: string) => {
    if (!confirm(`Hapus anggota ${nama}? Data tabungan dan pinjamannya akan ikut terhapus.`)) return;
    const res = await fetch(`/api/anggota/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Anggota dihapus.");
      loadAnggota();
    }
  };

  const handleSimpanEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/anggota/${editData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    if (res.ok) {
      toast.success("Data anggota diperbarui!");
      setIsEditOpen(false);
      loadAnggota();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Buku Besar Anggota</h2>
      </div>

      {/* Form Tambah Anggota */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleTambahAnggota} className="flex gap-3 items-end">
            <div className="flex-1 max-w-sm">
              <label className="block text-sm font-medium mb-1">Nama Anggota Baru</label>
              <Input value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} placeholder="Masukkan nama..." required />
            </div>
            <Button type="submit" className="bg-teal-700 hover:bg-teal-800">Tambah Anggota</Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabel Data Anggota */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Nama Anggota</TableHead>
                <TableHead className="text-right">Total Simpanan</TableHead>
                <TableHead className="text-right">Pinjaman Berjalan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Memuat data...</TableCell></TableRow>
              ) : anggota.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Belum ada anggota.</TableCell></TableRow>
              ) : (
                anggota.map((item) => {
                  const totalSimpanan = Number(item.simpanan_pokok) + Number(item.simpanan_wajib) + Number(item.simpanan_sukarela);
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-800">{item.nama}</TableCell>
                      <TableCell className="text-right text-teal-600 font-semibold">Rp {totalSimpanan.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right text-amber-600">Rp {Number(item.pinjaman).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => { setEditData(item); setIsEditOpen(true); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit Rekening</button>
                          <button onClick={() => handleHapusAnggota(item.id, item.nama)} className="text-red-500 hover:text-red-700 text-sm font-medium">Hapus</button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Edit Pop-up */}
      {isEditOpen && editData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">Edit Data: {editData.nama}</h3>
            </div>
            <form onSubmit={handleSimpanEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Anggota</label>
                <Input value={editData.nama} onChange={(e) => setEditData({...editData, nama: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="col-span-2 text-sm font-semibold text-gray-500 uppercase">Buku Simpanan (Rp)</div>
                <div>
                  <label className="block text-xs mb-1">Simpanan Pokok</label>
                  <Input type="number" value={editData.simpanan_pokok} onChange={(e) => setEditData({...editData, simpanan_pokok: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Simpanan Wajib</label>
                  <Input type="number" value={editData.simpanan_wajib} onChange={(e) => setEditData({...editData, simpanan_wajib: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Simpanan Sukarela</label>
                  <Input type="number" value={editData.simpanan_sukarela} onChange={(e) => setEditData({...editData, simpanan_sukarela: e.target.value})} />
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="text-sm font-semibold text-gray-500 uppercase mb-2">Buku Pinjaman (Rp)</div>
                <label className="block text-xs mb-1">Total Pinjaman Berjalan</label>
                <Input type="number" value={editData.pinjaman} onChange={(e) => setEditData({...editData, pinjaman: e.target.value})} />
              </div>
              <div className="flex gap-3 justify-end pt-4 mt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-teal-700 hover:bg-teal-800">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}