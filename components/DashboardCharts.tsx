"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface ChartProps {
  lineData: { name: string; Aset: number }[];
  donutData: { name: string; value: number; color: string }[];
}

export default function DashboardCharts({ lineData, donutData }: ChartProps) {
  // Fungsi untuk memformat angka menjadi Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      
      {/* KURVA GARIS (Perkembangan Aset) */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Perkembangan Aset per Kecamatan</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              {/* YAxis dipersingkat menjadi Milyar (M) agar tidak terlalu panjang */}
              <YAxis tickFormatter={(value) => `Rp ${value / 1000000000}M`} tick={{ fontSize: 12 }} />
              
              {/* PERBAIKAN ERROR TYPESCRIPT VERCEL (value: any) */}
              <Tooltip formatter={(value: any) => [formatRupiah(Number(value)), "Total Aset"]} />
              
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Aset" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#2563eb" }} 
                activeDot={{ r: 6 }} 
                name="Total Aset Koperasi"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KURVA DONAT (Kesehatan Koperasi) */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Predikat Kesehatan</h3>
        <div className="h-[300px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={70} // Membuat lubang di tengah agar berbentuk donat
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Teks total angka di tengah Donat */}
          <div className="absolute text-center pointer-events-none">
            <span className="block text-3xl font-bold text-gray-800">
              {donutData.reduce((acc, curr) => acc + curr.value, 0)}
            </span>
            <span className="block text-xs text-gray-500 uppercase tracking-wider">Dinilai</span>
          </div>
        </div>
      </div>

    </div>
  );
}