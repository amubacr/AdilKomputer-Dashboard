import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PageHeader from '@/components/layout/PageHeader';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const formatRupiah = (n) => n == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Habis</span>;
  if (stock <= 5) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Hampir Habis</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Ready</span>;
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const limit = 20;

  const fetchProducts = useCallback(async (s = search, cat = selectedCat, p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit };
      if (s) params.cari = s;
      if (cat) params.kategori = cat;
      const [prodRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/products`, { params }),
        axios.get(`${API}/api/stats`),
      ]);
      setProducts(prodRes.data.data || []);
      setTotalPages(prodRes.data.total_pages || 1);
      setTotalData(prodRes.data.total_data || 0);
      setStats(statsRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    axios.get(`${API}/api/categories`).then(r => setCategories(r.data.data || []));
    fetchProducts('', '', 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(search, selectedCat, 1);
  };

  const handleCatChange = (cat) => {
    setSelectedCat(cat);
    setPage(1);
    fetchProducts(search, cat, 1);
  };

  const handlePage = (p) => {
    setPage(p);
    fetchProducts(search, selectedCat, p);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Product — Adil Komputer" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Produk Tersedia', value: stats?.tersedia, color: 'text-green-600', sub: 'Synchronized' },
            { label: 'Hampir Habis', value: stats?.hampir_habis, color: 'text-yellow-600', sub: '≤ 5 pcs' },
            { label: 'Produk Habis', value: stats?.stok_habis, color: 'text-red-600', sub: 'Ask for Stock / Pre-Order' },
            { label: 'Total Produk', value: stats?.total_produk, color: 'text-blue-600', sub: '300 Products Ready' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? '-'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">Cari</button>
              </form>
              <select
                value={selectedCat} onChange={e => handleCatChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Kode/SKU</th>
                  <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Nama</th>
                  <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Kategori</th>
                  <th className="text-right px-3 py-3 text-xs text-gray-500 font-medium">Harga Jual</th>
                  <th className="text-right px-3 py-3 text-xs text-gray-500 font-medium">Stok</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center"><div className="w-6 h-6 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">Tidak ada produk ditemukan</td></tr>
                ) : products.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">{p.sku}</td>
                    <td className="px-3 py-3 text-xs text-gray-800 max-w-[200px] truncate" title={p.name}>{p.name}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{typeof p.category === 'object' ? p.category?.name : p.category}</td>
                    <td className="px-3 py-3 text-xs text-right text-gray-800 font-medium">{formatRupiah(p.price)}</td>
                    <td className="px-3 py-3 text-xs text-right text-gray-600">{p.stock}</td>
                    <td className="px-5 py-3 text-right"><StockBadge stock={p.stock} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {totalData} data</p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePage(Math.max(1, page - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-xs text-gray-600">{page} / {totalPages}</span>
              <button onClick={() => handlePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
