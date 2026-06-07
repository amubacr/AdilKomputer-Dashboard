import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '@/components/layout/PageHeader';
import { Package, AlertTriangle, XCircle, Clock, ChevronRight, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const formatRupiah = (n) => n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const StatusBadge = ({ status }) => {
  const map = {
    'READY': 'bg-green-100 text-green-700',
    'HAMPIR HABIS': 'bg-yellow-100 text-yellow-700',
    'HABIS': 'bg-red-100 text-red-700',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const StatCard = ({ label, value, sub, icon: Icon, iconColor, subColor }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value ?? '-'}</p>
    {sub && <p className={`text-xs ${subColor || 'text-gray-400'}`}>{sub}</p>}
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [syncLog, setSyncLog] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchAll = async () => {
    try {
      const [statsRes, productsRes, syncRes, distRes] = await Promise.all([
        axios.get(`${API}/api/stats`),
        axios.get(`${API}/api/products?limit=8`),
        axios.get(`${API}/api/sync/log?limit=5`),
        axios.get(`${API}/api/categories/distribution`),
      ]);
      setStats(statsRes.data.data);
      setProducts(productsRes.data.data || []);
      setSyncLog(syncRes.data.data || []);
      setDistribution(distRes.data.data?.slice(0, 7) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post(`${API}/api/sync/trigger`);
      setTimeout(fetchAll, 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSyncing(false), 3000);
    }
  };

  const getStatus = (stock) => {
    if (stock === 0) return 'HABIS';
    if (stock <= 5) return 'HAMPIR HABIS';
    return 'READY';
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Dashboard — Adil Komputer" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Product" value={stats?.total_produk} sub={`${stats?.tersedia} Produk Ready`} icon={Package} iconColor="bg-blue-500" subColor="text-blue-500" />
          <StatCard label="Out of Stock" value={stats?.stok_habis} sub="Ask for Stock / Pre-Order" icon={XCircle} iconColor="bg-red-500" subColor="text-red-500" />
          <StatCard label="Almost Out" value={stats?.hampir_habis} sub="≤ 5 PCS" icon={AlertTriangle} iconColor="bg-yellow-500" subColor="text-yellow-500" />
          <StatCard label="Sync Interval" value="15 MIN" sub="Cron Active" icon={Clock} iconColor="bg-green-500" subColor="text-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Product List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Latest Product List — Adil Komputer</h2>
              <a href="/products" className="text-xs text-red-700 hover:underline flex items-center gap-1">Show All <ChevronRight className="w-3 h-3" /></a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">SKU</th>
                    <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Nama</th>
                    <th className="text-right px-3 py-3 text-xs text-gray-500 font-medium">Stok</th>
                    <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-xs text-gray-500 font-mono">{p.sku}</td>
                      <td className="px-3 py-3 text-xs text-gray-800 max-w-[200px] truncate">{p.name}</td>
                      <td className="px-3 py-3 text-xs text-right text-gray-600">{p.stock}</td>
                      <td className="px-5 py-3 text-right"><StatusBadge status={getStatus(p.stock)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sync Log */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Kledo Sync Log</h2>
              <button onClick={handleSync} disabled={syncing}
                className="flex items-center gap-1 text-xs text-red-700 hover:underline disabled:opacity-50">
                <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500">Sinkronisasi dengan database Kledo Adil Komputer</p>
              {stats?.last_sync && (
                <p className="text-xs text-gray-400 mt-1">Last sync: {new Date(stats.last_sync).toLocaleString('id-ID')}</p>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {syncLog.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-xs text-gray-400">Belum ada log sync</p>
                </div>
              ) : syncLog.map((log, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{log.time}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{log.description || `${log.items_updated} produk diperbarui`}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Distribution Per Category</h2>
            <a href="/categories" className="text-xs text-red-700 hover:underline flex items-center gap-1">Show All <ChevronRight className="w-3 h-3" /></a>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickFormatter={v => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [v, 'Produk']} labelStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#7f1d1d' : i === 1 ? '#b91c1c' : '#e5e7eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
