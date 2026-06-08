import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '@/components/layout/PageHeader';

const API = import.meta.env.VITE_API_URL;

const COLORS = ['#7f1d1d', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#e5e7eb', '#d1d5db'];

export default function CategoriesPage() {
  const [distribution, setDistribution] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/categories/distribution`),
      axios.get(`${API}/api/categories`),
    ]).then(([distRes, catRes]) => {
      setDistribution(distRes.data.data || []);
      setCategories(catRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const distMap = Object.fromEntries(distribution.map(d => [d.name, parseInt(d.count)]));

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Category — Adil Komputer" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Category by Charts</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={distribution.slice(0, 10)} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0}
                tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [v, 'Produk']} labelStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Grid */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Semua Kategori</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-200 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{cat.name}</p>
                </div>
                <span className="ml-2 flex-shrink-0 text-sm font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-lg">
                  {distMap[cat.name] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
