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
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      
      {/* KURVA GARIS */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Perkembangan Aset per Kecamatan</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* Margin diperbesar agar teks tidak terpotong tepi layar */}
            <LineChart data={lineData} margin={{ top: 10, right: 30, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              {/* tickMargin memberi jarak antara teks dan garis sumbu bawah */}
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={10} />
              {/* width={80} memastikan teks "Rp ...M" punya ruang luas dan tidak terpotong di kiri */}
              <YAxis tickFormatter={(value) => `Rp ${value / 1000000000}M`} tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={(value: any) => [formatRupiah(Number(value)), "Total Aset"]} />
              <Legend wrapperStyle={{ paddingTop: "15px" }} />
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

      {/* KURVA DONAT */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Predikat Kesehatan</h3>
        <div className="h-[300px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={70}
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
          
          <div className="absolute text-center pointer-events-none pb-6">
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